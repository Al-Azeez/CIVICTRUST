const mongoose = require('mongoose');

const timelineEventSchema = new mongoose.Schema({
  action: { type: String, required: true },
  status: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  actor: { type: String, default: 'System' },
  actorRole: { type: String, enum: ['citizen', 'admin', 'system'], default: 'system' },
  notes: { type: String, default: '' },
  photo: { type: String, default: '' },
});

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
    },
    citizenId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    },
    citizenName: {
      type: String,
      default: 'Anonymous Citizen',
    },
    citizenEmail: {
      type: String,
      default: '',
    },
    citizenPhone: {
      type: String,
      default: '',
    },
    category: {
      type: String,
      required: true,
      enum: [
        'Garbage Dump',
        'Uncleaned Sweeping',
        'Construction Debris',
        'Blocked Drains',
        'Potholes',
        'Non-functional Public Toilets',
      ],
    },
    description: {
      type: String,
      required: true,
    },
    beforePhoto: {
      type: String,
      required: true,
    },
    resolutionPhoto: {
      type: String,
      default: '',
    },
    reopenPhoto: {
      type: String,
      default: '',
    },
    latitude: {
      type: Number,
      required: true,
    },
    longitude: {
      type: Number,
      required: true,
    },
    ward: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      default: 'Civic Junction Area',
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
    slaHours: {
      type: Number,
      required: true,
    },
    slaDeadline: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: [
        'SUBMITTED',
        'IN_PROGRESS',
        'RESOLUTION_CLAIMED',
        'VERIFIED',
        'SUSPICIOUS',
        'REVERIFIED',
        'REOPENED',
        'RESOLVED',
      ],
      default: 'SUBMITTED',
    },
    verificationStatus: {
      type: String,
      enum: ['PENDING', 'VERIFIED', 'SUSPICIOUS'],
      default: 'PENDING',
    },
    verificationConfidence: {
      type: Number,
      default: 0,
    },
    verificationReason: {
      type: String,
      default: '',
    },
    verificationMethod: {
      type: String,
      default: 'Automated Multi-Spectral Vision AI Prototype',
    },
    reopenReason: {
      type: String,
      default: '',
    },
    reopenedAt: {
      type: Date,
    },
    resolutionNotes: {
      type: String,
      default: '',
    },
    resolvedAt: {
      type: Date,
    },
    timeline: [timelineEventSchema],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model('Complaint', complaintSchema);
