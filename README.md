# CivicTrust — "Resolved, Allegedly" (PS-D04)

> **"Resolved should mean resolved."**  
> An independent civic-tech platform for verified civic grievance resolution, SLA tracking, before/after photo verification, and citizen re-verification.

---

## 🚀 Quick Start (Running Locally)

### 1. Start Backend Server
```bash
cd server
npm install
node server.js
```
*Backend runs on `http://localhost:5000` with automatic MongoDB connection and high-performance in-memory fallback.*

### 2. Start Frontend Client
```bash
cd client
npm install
npm run dev
```
*Frontend runs on `http://localhost:5173` with full API proxying.*

---

## 🔑 Demo & Evaluator Accounts (1-Click Switcher Available in UI)

| Role | Email | Password | Pre-loaded Context |
| :--- | :--- | :--- | :--- |
| **Citizen** | `citizen@civictrust.org` | `Citizen@123` | Aarav Sharma (Ward 4 - Green Park) |
| **Municipal Reviewer (Admin)** | `admin@civictrust.org` | `Admin@123` | Review Officer (All Wards) |

*Note: You can click the "Demo: Citizen" or "Demo: Reviewer" button in the top navigation bar at any time for instant 1-click evaluation!*

---

## 📋 Hackathon Demo Flow (End-to-End Walkthrough)

1. **Citizen reports an issue**:
   - Navigate to `/citizen/report`
   - Select **Garbage Dump** (starts 12-hour SLA)
   - Capture photo and GPS coordinates on the interactive Leaflet map
   - Submit grievance
2. **SLA Countdown starts**:
   - View live ticking countdown bar on `/citizen/dashboard` or `/citizen/complaints/:id`
3. **Admin claims resolution**:
   - Log in as Reviewer (via top bar demo switcher)
   - On `/admin/complaints`, click **Resolve** on the complaint
   - Select *"⚠️ Simulate Suspicious"* or upload custom after-photo
   - Click **Trigger Photo Verification**
4. **Automated Vision Verification flags suspicious**:
   - The engine flags: `⚠️ RESOLUTION UNVERIFIED / SUSPICIOUS (Confidence 78%)`
   - Reason: *"The reported garbage dump still appears visible in the after image."*
5. **Citizen Re-verifies & Reopens**:
   - Switch back to Citizen
   - On the complaint page, view the alert *"The resolution could not be confidently verified."*
   - Click **[Re-verify & Reopen Complaint]**
   - Provide explanation and rebuttal photo evidence
   - Complaint status transitions to `REOPENED`
6. **Analytics & Hotspots update dynamically**:
   - View updated KPI counters on `/admin/dashboard`
   - Inspect risk clusters on `/admin/hotspots`
   - View SLA adherence charts and ward scorecard on `/admin/analytics`

---

## 🛡️ Safety & PS-D04 Compliance Notice

- Independent prototype developed for PS-D04.
- Does not scrape or interact with live municipal backend systems.
- Automated verification flags cases for human review without automated penalties.
- All pre-seeded datasets are clearly identified as synthetic benchmarking data.
