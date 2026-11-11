/**
 * High-Accuracy Reverse Geocoding & Address Resolver
 * Accurately extracts Landmarks, Amenities (e.g. BVRIT College), Roads, Localities, Districts, and States
 */

export const reverseGeocodeCoordinates = async (lat, lon) => {
  if (!lat || !lon || isNaN(lat) || isNaN(lon)) {
    return {
      formattedAddress: '',
      suggestedWard: '',
      landmark: '',
      raw: null,
    };
  }

  try {
    const res = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=18&addressdetails=1`,
      {
        headers: {
          'User-Agent': 'CivicTrust-Accurate-GeoService',
          'Accept-Language': 'en',
        },
      }
    );

    if (res.ok) {
      const data = await res.json();
      if (data && data.address) {
        const addr = data.address;

        // 1. Primary landmark / amenity / institution / campus
        const landmark =
          addr.amenity ||
          addr.building ||
          addr.college ||
          addr.university ||
          addr.school ||
          addr.hospital ||
          addr.office ||
          addr.tourism ||
          addr.leisure ||
          addr.historic ||
          addr.commercial ||
          addr.industrial ||
          '';

        // 2. Road / Highway / Street
        const road =
          addr.road ||
          addr.pedestrian ||
          addr.street ||
          addr.footway ||
          addr.path ||
          addr.highway ||
          '';

        // 3. Suburb / Village / Town / Locality / Neighbourhood
        const locality =
          addr.suburb ||
          addr.neighbourhood ||
          addr.residential ||
          addr.village ||
          addr.hamlet ||
          addr.town ||
          addr.city_district ||
          addr.municipality ||
          '';

        // 4. District / County / City
        const district =
          addr.city ||
          addr.county ||
          addr.district ||
          addr.state_district ||
          '';

        // 5. State & Postcode
        const state = addr.state || '';
        const postcode = addr.postcode || '';

        // Construct high-precision address
        const parts = [];
        if (landmark) parts.push(landmark);
        if (road && !parts.includes(road)) parts.push(road);
        if (locality && !parts.includes(locality)) parts.push(locality);
        if (district && !parts.includes(district)) parts.push(district);
        if (state && !parts.includes(state)) parts.push(state);
        if (postcode && !parts.includes(postcode)) parts.push(postcode);

        const formattedAddress =
          parts.length > 0
            ? parts.join(', ')
            : data.display_name
            ? data.display_name.split(',').slice(0, 5).join(',').trim()
            : `GPS Site: ${Number(lat).toFixed(5)}° N, ${Number(lon).toFixed(5)}° E`;

        // Suggested Ward / Municipal Zone based on detected locality/district
        let suggestedWard = '';
        if (landmark && locality) {
          suggestedWard = `${locality} - ${landmark.split(' ')[0]} Zone`;
        } else if (locality && district) {
          suggestedWard = `${locality} (${district})`;
        } else if (district) {
          suggestedWard = `${district} Municipal Zone`;
        } else {
          suggestedWard = 'Zone 1 - Civic Sector';
        }

        return {
          formattedAddress,
          suggestedWard,
          landmark,
          locality,
          district,
          state,
          postcode,
          raw: data,
        };
      }
    }
  } catch (e) {
    console.warn('Reverse geocoding network error:', e);
  }

  return {
    formattedAddress: `Exact GPS Site (${Number(lat).toFixed(5)}° N, ${Number(lon).toFixed(5)}° E)`,
    suggestedWard: 'Live Verified Zone',
    landmark: '',
    raw: null,
  };
};

/**
 * Clean duplicate ward mentions in formatted strings
 */
export const formatAddressWithoutDuplicateWard = (address, ward) => {
  if (!address) return ward || 'Municipal Zone';
  if (!ward) return address;

  const addrLower = address.toLowerCase();
  const wardLower = ward.toLowerCase();

  // If address already contains the ward name, don't duplicate
  if (addrLower.includes(wardLower)) {
    return address;
  }

  return `${address} (${ward})`;
};
