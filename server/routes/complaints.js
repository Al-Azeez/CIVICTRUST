const express = require('express');
const router = express.Router();
const Complaint = require('../models/Complaint');
const Verification = require('../models/Verification');
const { protect, adminOnly } = require('../middleware/authMiddleware');
const { calculateSlaDeadline, getSlaStatus } = require('../services/slaService');
const { verifyResolutionPhoto } = require('../services/photoVerificationService');
const { getIsMemoryMode, getMemoryStore } = require('../config/db');

// Helper to decorate complaint with live SLA metrics
const decorateComplaint = (c) => {
  const plain = c.toObject ? c.toObject() : { ...c };
  const slaInfo = getSlaStatus(plain.submittedAt, plain.slaDeadline, plain.status, plain.resolvedAt);
  return {
    ...plain,
    slaInfo,
  };
};

// @route   GET /api/complaints
router.get('/', async (req, res) => {
  try {
    const {
      category,
      ward,
      status,
      verificationStatus,
      citizenId,
      search,
      slaStatus,
      limit = 100,
    } = req.query;

    if (getIsMemoryMode()) {
      const store = getMemoryStore();
      let list = [...store.complaints];

      if (category) list = list.filter((c) => c.category === category);
      if (ward) list = list.filter((c) => c.ward === ward);
      if (status) list = list.filter((c) => c.status === status);
      if (verificationStatus) list = list.filter((c) => c.verificationStatus === verificationStatus);
      if (citizenId) list = list.filter((c) => c.citizenId && c.citizenId.toString() === citizenId.toString());
      if (search) {
        const q = search.toLowerCase();
        list = list.filter(
          (c) =>
            c.complaintId.toLowerCase().includes(q) ||
            c.description.toLowerCase().includes(q) ||
            c.address.toLowerCase().includes(q) ||
            c.category.toLowerCase().includes(q)
        );
      }

      let decorated = list.map(decorateComplaint);

      if (slaStatus) {
        decorated = decorated.filter((c) => c.slaInfo.slaState === slaStatus);
      }

      // Sort newest first
      decorated.sort((a, b) => new Date(b.submittedAt) - new Date(a.submittedAt));

      return res.json({
        total: decorated.length,
        complaints: decorated.slice(0, parseInt(limit)),
      });
    }

    // MongoDB Mode
    let query = {};
    if (category) query.category = category;
    if (ward) query.ward = ward;
    if (status) query.status = status;
    if (verificationStatus) query.verificationStatus = verificationStatus;
    if (citizenId) query.citizenId = citizenId;
    if (search) {
      query.$or = [
        { complaintId: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { address: { $regex: search, $options: 'i' } },
      ];
    }

    const rawList = await Complaint.find(query).sort({ submittedAt: -1 }).limit(parseInt(limit));
    let decorated = rawList.map(decorateComplaint);

    if (slaStatus) {
      decorated = decorated.filter((c) => c.slaInfo.slaState === slaStatus);
    }

    res.json({
      total: decorated.length,
      complaints: decorated,
    });
  } catch (error) {
    console.error('Fetch complaints error:', error);
    res.status(500).json({ message: 'Error retrieving complaints' });
  }
});

// @route   GET /api/complaints/:id
router.get('/:id', async (req, res) => {
  try {
    const { id } = req.params;

    if (getIsMemoryMode()) {
      const store = getMemoryStore();
      const complaint = store.complaints.find(
        (c) => c._id.toString() === id || c.complaintId === id
      );
      if (!complaint) {
        return res.status(404).json({ message: 'Civic complaint not found' });
      }
      return res.json({ complaint: decorateComplaint(complaint) });
    }

    let complaint;
    if (id.startsWith('CT-')) {
      complaint = await Complaint.findOne({ complaintId: id });
    } else {
      complaint = await Complaint.findById(id);
    }

    if (!complaint) {
      return res.status(404).json({ message: 'Civic complaint not found' });
    }

    res.json({ complaint: decorateComplaint(complaint) });
  } catch (error) {
    console.error('Get complaint detail error:', error);
    res.status(500).json({ message: 'Error retrieving complaint details' });
  }
});

// @route   POST /api/complaints (Citizen reports an issue)
router.post('/', protect, async (req, res) => {
  try {
    const {
      category,
      description,
      beforePhoto,
      latitude,
      longitude,
      ward,
      address,
    } = req.body;

    if (!category || !description || !beforePhoto || !latitude || !longitude || !ward) {
      return res.status(400).json({
        message: 'Missing required fields: photo, GPS location, category, ward, and description are required.',
      });
    }

    const submittedAt = new Date();
    const { slaHours, slaDeadline } = calculateSlaDeadline(category, submittedAt);
    const complaintId = 'CT-' + new Date().getFullYear() + '-' + Math.floor(1000 + Math.random() * 9000);

    const initialTimeline = [
      {
        action: 'Complaint Submitted',
        status: 'SUBMITTED',
        timestamp: submittedAt,
        actor: req.user.name || 'Citizen',
        actorRole: 'citizen',
        notes: `Initial evidence photo & GPS logged. SLA deadline set to ${slaHours} hours (${category}).`,
        photo: beforePhoto,
      },
    ];

    if (getIsMemoryMode()) {
      const store = getMemoryStore();
      const newComplaint = {
        _id: 'c_' + Date.now(),
        complaintId,
        citizenId: req.user._id,
        citizenName: req.user.name,
        citizenEmail: req.user.email,
        citizenPhone: req.user.phone || '+91 98765 43210',
        category,
        description,
        beforePhoto,
        resolutionPhoto: '',
        reopenPhoto: '',
        latitude: parseFloat(latitude),
        longitude: parseFloat(longitude),
        ward,
        address: address || `${ward}, Civic Location`,
        submittedAt,
        slaHours,
        slaDeadline,
        status: 'SUBMITTED',
        verificationStatus: 'PENDING',
        verificationConfidence: 0,
        verificationReason: '',
        verificationMethod: 'Automated Multi-Spectral Vision AI Prototype',
        reopenReason: '',
        reopenedAt: null,
        resolutionNotes: '',
        resolvedAt: null,
        timeline: initialTimeline,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      store.complaints.unshift(newComplaint);
      return res.status(201).json({
        message: 'Civic complaint registered successfully. SLA clock started.',
        complaint: decorateComplaint(newComplaint),
      });
    }

    // MongoDB Mode
    const complaint = await Complaint.create({
      complaintId,
      citizenId: req.user._id,
      citizenName: req.user.name,
      citizenEmail: req.user.email,
      citizenPhone: req.user.phone || '+91 98765 43210',
      category,
      description,
      beforePhoto,
      latitude: parseFloat(latitude),
      longitude: parseFloat(longitude),
      ward,
      address: address || `${ward}, Civic Location`,
      submittedAt,
      slaHours,
      slaDeadline,
      status: 'SUBMITTED',
      timeline: initialTimeline,
    });

    res.status(201).json({
      message: 'Civic complaint registered successfully. SLA clock started.',
      complaint: decorateComplaint(complaint),
    });
  } catch (error) {
    console.error('Submit complaint error:', error);
    res.status(500).json({ message: 'Error submitting complaint' });
  }
});

// @route   POST /api/complaints/:id/resolve (Admin claims resolution & triggers AI verification)
router.post('/:id/resolve', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const {
      resolutionPhoto,
      resolutionNotes,
      simulationMode = 'AUTO', // 'AUTO' | 'FORCE_VERIFIED' | 'FORCE_SUSPICIOUS'
    } = req.body;

    if (!resolutionPhoto) {
      return res.status(400).json({ message: 'After/resolution photo evidence is required.' });
    }

    let complaint;
    let store;

    if (getIsMemoryMode()) {
      store = getMemoryStore();
      complaint = store.complaints.find(
        (c) => c._id.toString() === id || c.complaintId === id
      );
    } else {
      complaint = id.startsWith('CT-')
        ? await Complaint.findOne({ complaintId: id })
        : await Complaint.findById(id);
    }

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    // Trigger Photo Verification Service
    const verificationResult = await verifyResolutionPhoto({
      category: complaint.category,
      beforePhoto: complaint.beforePhoto,
      resolutionPhoto,
      simulationMode,
      notes: resolutionNotes,
    });

    const isVerified = verificationResult.verificationStatus === 'VERIFIED';
    const now = new Date();
    const newStatus = isVerified ? 'VERIFIED' : 'SUSPICIOUS';

    complaint.resolutionPhoto = resolutionPhoto;
    complaint.resolutionNotes = resolutionNotes || 'Resolution work completed by municipal unit.';
    complaint.resolvedAt = now;
    complaint.verificationStatus = verificationResult.verificationStatus;
    complaint.verificationConfidence = verificationResult.confidence;
    complaint.verificationReason = verificationResult.reason;
    complaint.status = newStatus;

    // Append to timeline
    complaint.timeline.push({
      action: 'Resolution Claimed',
      status: 'RESOLUTION_CLAIMED',
      timestamp: new Date(now.getTime() - 2000),
      actor: req.user.name || 'Municipal Reviewer',
      actorRole: 'admin',
      notes: resolutionNotes || 'Contractor/Municipal team claimed resolution.',
      photo: resolutionPhoto,
    });

    complaint.timeline.push({
      action: isVerified ? 'Resolution Verified (Passed)' : 'Resolution Flagged Suspicious (Review Required)',
      status: newStatus,
      timestamp: now,
      actor: 'Automated Vision Engine',
      actorRole: 'system',
      notes: `Verification outcome: ${verificationResult.verificationStatus} (${verificationResult.confidence}% confidence). ${verificationResult.reason}`,
    });

    if (getIsMemoryMode()) {
      complaint.updatedAt = new Date();
      // Record verification log
      store.verifications.push({
        complaintId: complaint.complaintId,
        beforePhoto: complaint.beforePhoto,
        resolutionPhoto,
        verificationStatus: verificationResult.verificationStatus,
        confidence: verificationResult.confidence,
        reason: verificationResult.reason,
        metrics: verificationResult.metrics,
        timestamp: now,
      });
    } else {
      await complaint.save();
      await Verification.create({
        complaintId: complaint.complaintId,
        beforePhoto: complaint.beforePhoto,
        resolutionPhoto,
        verificationStatus: verificationResult.verificationStatus,
        confidence: verificationResult.confidence,
        reason: verificationResult.reason,
        algorithmBreakdown: {
          structuralSimilarity: verificationResult.metrics.structuralSimilarity,
          colorEntropyDelta: verificationResult.metrics.colorEntropyDelta,
          residualDebrisScore: verificationResult.metrics.residualDebrisScore,
        },
        manualReviewTriggered: !isVerified,
      });
    }

    res.json({
      message: isVerified
        ? 'Resolution verified successfully.'
        : '⚠️ Resolution could not be confidently verified. Flagged as Suspicious for human review.',
      complaint: decorateComplaint(complaint),
      verification: verificationResult,
    });
  } catch (error) {
    console.error('Resolve complaint error:', error);
    res.status(500).json({ message: 'Error processing resolution verification' });
  }
});

// @route   POST /api/complaints/:id/reverify (Citizen re-verifies and reopens complaint)
router.post('/:id/reverify', protect, async (req, res) => {
  try {
    const { id } = req.params;
    const { reopenReason, reopenPhoto } = req.body;

    if (!reopenReason) {
      return res.status(400).json({ message: 'Please provide a clear reason for reopening the complaint.' });
    }

    let complaint;
    if (getIsMemoryMode()) {
      const store = getMemoryStore();
      complaint = store.complaints.find(
        (c) => c._id.toString() === id || c.complaintId === id
      );
    } else {
      complaint = id.startsWith('CT-')
        ? await Complaint.findOne({ complaintId: id })
        : await Complaint.findById(id);
    }

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const now = new Date();
    complaint.status = 'REOPENED';
    complaint.reopenReason = reopenReason;
    complaint.reopenedAt = now;
    if (reopenPhoto) {
      complaint.reopenPhoto = reopenPhoto;
    }

    complaint.timeline.push({
      action: 'Citizen Re-verification & Reopened',
      status: 'REOPENED',
      timestamp: now,
      actor: req.user.name || 'Citizen',
      actorRole: 'citizen',
      notes: `Citizen rebuttal: "${reopenReason}". Escalated back for priority municipal clearance.`,
      photo: reopenPhoto || '',
    });

    if (getIsMemoryMode()) {
      complaint.updatedAt = now;
    } else {
      await complaint.save();
    }

    res.json({
      message: 'Complaint successfully re-verified and reopened. Escalated to municipal supervisor.',
      complaint: decorateComplaint(complaint),
    });
  } catch (error) {
    console.error('Re-verify complaint error:', error);
    res.status(500).json({ message: 'Error submitting citizen re-verification' });
  }
});

// @route   POST /api/complaints/:id/admin-override (Admin overrides status after manual inspection)
router.post('/:id/admin-override', protect, adminOnly, async (req, res) => {
  try {
    const { id } = req.params;
    const { targetStatus, overrideNotes } = req.body;

    if (!targetStatus) {
      return res.status(400).json({ message: 'Target status is required' });
    }

    let complaint;
    if (getIsMemoryMode()) {
      const store = getMemoryStore();
      complaint = store.complaints.find(
        (c) => c._id.toString() === id || c.complaintId === id
      );
    } else {
      complaint = id.startsWith('CT-')
        ? await Complaint.findOne({ complaintId: id })
        : await Complaint.findById(id);
    }

    if (!complaint) {
      return res.status(404).json({ message: 'Complaint not found' });
    }

    const now = new Date();
    complaint.status = targetStatus;
    if (targetStatus === 'RESOLVED' || targetStatus === 'VERIFIED') {
      complaint.resolvedAt = now;
      complaint.verificationStatus = 'VERIFIED';
    }

    complaint.timeline.push({
      action: `Admin Manual Decision: ${targetStatus}`,
      status: targetStatus,
      timestamp: now,
      actor: req.user.name || 'Municipal Reviewer',
      actorRole: 'admin',
      notes: overrideNotes || `Supervisor manual override applied to state: ${targetStatus}`,
    });

    if (getIsMemoryMode()) {
      complaint.updatedAt = now;
    } else {
      await complaint.save();
    }

    res.json({
      message: `Complaint updated to ${targetStatus} via supervisor review.`,
      complaint: decorateComplaint(complaint),
    });
  } catch (error) {
    console.error('Admin override error:', error);
    res.status(500).json({ message: 'Error processing admin override' });
  }
});

module.exports = router;
