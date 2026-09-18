# CivicTrust — System Architecture & Workflow Specifications

**Tagline**: *"Resolved should mean resolved."*  
**Problem Statement Reference**: PS-D04

---

## 1. System Overview

CivicTrust is an independent civic-tech platform designed to eliminate the systemic problem of "alleged" or premature resolution of civic grievances (garbage dumps, uncleaned sweeping, construction debris, blocked drains, potholes, and broken public toilets).

```
Citizen Submits Issue (Photo + GPS + Category + Description)
            │
            ▼
    SLA Clock Initiated (12h, 24h, 48h, 72h)
            │
            ▼
    Municipal Team Claims Resolution (Mandatory After-Photo Upload)
            │
            ▼
    Automated Before/After Vision Verification Engine
       ├── [Passed / Verified] (High Confidence 90%+) ──► Mark Resolved
       │
       └── [Residual Debris / Mismatch] (Confidence 75-85%)
            │
            ▼
        ⚠️ Suspicious / Unverified Flag
            │
            ▼
        Citizen Re-Verification Protocol
        (Fresh Photo Evidence + Dispute Reason)
            │
            ▼
        Reopen Grievance (Re-dispatch to Municipal Supervisor)
```

---

## 2. SLA Timing Rules Engine

In accordance with PS-D04 specifications, the following exact SLA standards are strictly enforced:

| Civic Category | SLA Standard | Status Indicators |
| :--- | :--- | :--- |
| **Garbage Dump** | **12 Hours** | Within SLA / SLA At Risk / SLA Breached |
| **Uncleaned Sweeping** | **24 Hours** | Within SLA / SLA At Risk / SLA Breached |
| **Construction Debris** | **72 Hours** | Within SLA / SLA At Risk / SLA Breached |
| **Blocked Drains** | **24 Hours** | Within SLA / SLA At Risk / SLA Breached |
| **Potholes** | **48 Hours** | Within SLA / SLA At Risk / SLA Breached |
| **Non-functional Public Toilets** | **24 Hours** | Within SLA / SLA At Risk / SLA Breached |

---

## 3. Technology Stack

- **Frontend**: React (v19) + Vite, Tailwind CSS, Lucide React, Recharts, Leaflet + React-Leaflet
- **Backend**: Node.js + Express.js, JWT Authentication, Multer, REST APIs
- **Database**: MongoDB Atlas / Local MongoDB with Mongoose, backed by an In-Memory High-Fidelity Persistence Engine for zero-dependency instant hackathon execution.

---

## 4. Problem Statement Rules & Safety Compliance

1. **No Live Municipal Scraping**: Operates as an independent prototype with synthetic demo data.
2. **No Impersonation**: Distinctly branded as CivicTrust.
3. **No Automated Punishment**: Automated vision results are advisory. Suspicious resolutions are flagged for human review.
4. **Data Privacy**: Only minimal contact details are captured.
