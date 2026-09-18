const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const { getSlaStatus } = require('../services/slaService');
const { getIsMemoryMode, getMemoryStore } = require('../config/db');
const { WARDS } = require('../services/seedData');

const getAllComplaintsData = async () => {
  if (getIsMemoryMode()) {
    const store = getMemoryStore();
    return store.complaints;
  }
  return await Complaint.find({});
};

// @route   GET /api/analytics/kpis
router.get('/kpis', async (req, res) => {
  try {
    const list = await getAllComplaintsData();
    let totalComplaints = list.length;
    let pending = 0;
    let resolved = 0;
    let slaMet = 0;
    let slaBreached = 0;
    let suspiciousClosures = 0;
    let reopenedComplaints = 0;

    list.forEach((c) => {
      const sla = getSlaStatus(c.submittedAt, c.slaDeadline, c.status, c.resolvedAt);
      
      if (c.status === 'SUBMITTED' || c.status === 'IN_PROGRESS') {
        pending++;
      }
      if (c.status === 'RESOLVED' || c.status === 'VERIFIED') {
        resolved++;
      }
      if (c.status === 'SUSPICIOUS') {
        suspiciousClosures++;
      }
      if (c.status === 'REOPENED') {
        reopenedComplaints++;
      }

      if (sla.slaState === 'SLA_BREACHED') {
        slaBreached++;
      } else if (c.status === 'RESOLVED' || c.status === 'VERIFIED') {
        slaMet++;
      }
    });

    res.json({
      kpis: {
        totalComplaints,
        pending,
        resolved,
        slaMet,
        slaBreached,
        suspiciousClosures,
        reopenedComplaints,
        slaAdherenceRate: totalComplaints > 0 ? Math.round((slaMet / (slaMet + slaBreached || 1)) * 100) : 100,
        reopenRate: totalComplaints > 0 ? Math.round((reopenedComplaints / totalComplaints) * 100) : 0,
      },
    });
  } catch (error) {
    console.error('Analytics KPI error:', error);
    res.status(500).json({ message: 'Error computing KPI metrics' });
  }
});

// @route   GET /api/analytics/charts
router.get('/charts', async (req, res) => {
  try {
    const list = await getAllComplaintsData();

    // 1. By Category
    const categoryMap = {};
    // 2. SLA Adherence
    let withinSlaCount = 0;
    let atRiskCount = 0;
    let breachedCount = 0;
    // 3. Verification Results
    let verifiedCount = 0;
    let suspiciousCount = 0;
    let reopenedCount = 0;
    let pendingVerificationCount = 0;

    list.forEach((c) => {
      categoryMap[c.category] = (categoryMap[c.category] || 0) + 1;

      const sla = getSlaStatus(c.submittedAt, c.slaDeadline, c.status, c.resolvedAt);
      if (sla.slaState === 'SLA_BREACHED') breachedCount++;
      else if (sla.slaState === 'SLA_AT_RISK') atRiskCount++;
      else withinSlaCount++;

      if (c.verificationStatus === 'VERIFIED') verifiedCount++;
      else if (c.verificationStatus === 'SUSPICIOUS') suspiciousCount++;
      else if (c.status === 'REOPENED') reopenedCount++;
      else pendingVerificationCount++;
    });

    const categoryData = Object.keys(categoryMap).map((cat) => ({
      name: cat,
      count: categoryMap[cat],
    }));

    const slaData = [
      { name: 'Within SLA', value: withinSlaCount, fill: '#10b981' },
      { name: 'SLA At Risk', value: atRiskCount, fill: '#f59e0b' },
      { name: 'SLA Breached', value: breachedCount, fill: '#ef4444' },
    ];

    const verificationData = [
      { name: 'AI Verified (Passed)', value: verifiedCount, fill: '#059669' },
      { name: 'Flagged Suspicious', value: suspiciousCount, fill: '#dc2626' },
      { name: 'Citizen Reopened', value: reopenedCount, fill: '#f97316' },
      { name: 'Pending Review', value: pendingVerificationCount, fill: '#64748b' },
    ];

    // Trends over 7 simulated timeline buckets
    const timelineData = [
      { day: 'Day -6', submitted: 4, resolved: 3, suspicious: 1 },
      { day: 'Day -5', submitted: 6, resolved: 5, suspicious: 2 },
      { day: 'Day -4', submitted: 8, resolved: 6, suspicious: 1 },
      { day: 'Day -3', submitted: 7, resolved: 7, suspicious: 2 },
      { day: 'Day -2', submitted: 11, resolved: 8, suspicious: 3 },
      { day: 'Yesterday', submitted: 9, resolved: 7, suspicious: 2 },
      { day: 'Today', submitted: list.length, resolved: verifiedCount, suspicious: suspiciousCount },
    ];

    res.json({
      categoryData,
      slaData,
      verificationData,
      timelineData,
    });
  } catch (error) {
    console.error('Analytics charts error:', error);
    res.status(500).json({ message: 'Error computing chart metrics' });
  }
});

// @route   GET /api/analytics/wards
router.get('/wards', async (req, res) => {
  try {
    const list = await getAllComplaintsData();

    const wardStats = WARDS.map((wardName) => {
      const wardComplaints = list.filter((c) => c.ward === wardName);
      let total = wardComplaints.length;
      let breaches = 0;
      let suspicious = 0;
      let reopened = 0;
      let verified = 0;

      wardComplaints.forEach((c) => {
        const sla = getSlaStatus(c.submittedAt, c.slaDeadline, c.status, c.resolvedAt);
        if (sla.slaState === 'SLA_BREACHED') breaches++;
        if (c.verificationStatus === 'SUSPICIOUS') suspicious++;
        if (c.status === 'REOPENED') reopened++;
        if (c.verificationStatus === 'VERIFIED') verified++;
      });

      const adherenceRate = total > 0 ? Math.max(0, Math.round(((total - breaches) / total) * 100)) : 100;

      return {
        ward: wardName,
        totalComplaints: total,
        slaBreaches: breaches,
        suspiciousClosures: suspicious,
        reopenedComplaints: reopened,
        verifiedCount: verified,
        slaAdherenceRate: adherenceRate,
        hotspotScore: suspicious * 3 + reopened * 4 + breaches * 2 + total,
      };
    });

    // Sort by hotspot activity
    wardStats.sort((a, b) => b.hotspotScore - a.hotspotScore);

    res.json({
      wards: wardStats,
      disclaimer: 'Prototype/Sample Data — Not an official municipal ranking.',
    });
  } catch (error) {
    console.error('Ward analytics error:', error);
    res.status(500).json({ message: 'Error computing ward analytics' });
  }
});

// @route   GET /api/analytics/hotspots
router.get('/hotspots', async (req, res) => {
  try {
    const list = await getAllComplaintsData();

    const points = list.map((c) => {
      const sla = getSlaStatus(c.submittedAt, c.slaDeadline, c.status, c.resolvedAt);
      const isSuspiciousOrReopened = c.status === 'SUSPICIOUS' || c.status === 'REOPENED';
      const isBreached = sla.slaState === 'SLA_BREACHED';

      let riskLevel = 'LOW';
      let radius = 18;
      let color = '#3b82f6'; // Blue default

      if (isSuspiciousOrReopened) {
        riskLevel = 'HIGH_SUSPICIOUS';
        radius = 30;
        color = '#ef4444'; // Red
      } else if (isBreached) {
        riskLevel = 'SLA_BREACHED';
        radius = 24;
        color = '#f97316'; // Orange
      } else if (c.status === 'VERIFIED' || c.status === 'RESOLVED') {
        riskLevel = 'RESOLVED';
        radius = 16;
        color = '#10b981'; // Green
      }

      return {
        id: c.complaintId || c._id,
        _id: c._id,
        complaintId: c.complaintId,
        lat: c.latitude,
        lng: c.longitude,
        category: c.category,
        ward: c.ward,
        address: c.address,
        status: c.status,
        verificationStatus: c.verificationStatus,
        verificationConfidence: c.verificationConfidence,
        slaState: sla.slaState,
        riskLevel,
        radius,
        color,
        description: c.description,
      };
    });

    res.json({
      points,
      totalPoints: points.length,
      disclaimer: 'Potential Hotspot — Based on Prototype/Sample Data. Not an official government ranking.',
    });
  } catch (error) {
    console.error('Hotspot analytics error:', error);
    res.status(500).json({ message: 'Error retrieving hotspot data' });
  }
});

module.exports = router;
