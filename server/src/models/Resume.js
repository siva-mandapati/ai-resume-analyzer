import mongoose from 'mongoose';

const resumeSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    required: true,
    ref: 'User',
  },
  filename: {
    type: String,
    required: true,
  },
  fileHash: {
    type: String,
    required: true,
    index: true,
  },
  originalText: {
    type: String,
    required: true,
  },
  targetRole: {
    type: String,
    default: "General",
  },
  jobDescription: {
    type: String,
    default: "",
  },
  matchPercentage: {
    type: Number,
  },
  score: {
    type: Number,
  },
  scoreBreakdown: {
    impact: Number,
    formatting: Number,
    keywords: Number,
    relevance: Number
  },
  sectionCompleteness: {
    Summary: Boolean,
    Experience: Boolean,
    Education: Boolean,
    Skills: Boolean,
    Projects: Boolean,
    Certifications: Boolean
  },
  jdMatchedKeywords: {
    type: [String]
  },
  jdMissingKeywords: {
    type: [String]
  },
  extractedSkills: {
    type: [String],
  },
  missingSkills: {
    type: [String],
  },
  suggestions: [{
    category: String,
    text: String
  }],
  improvedBullets: [{
    original: String,
    improved: String,
    reason: String
  }],
  learningRoadmap: [{
    skill: String,
    steps: [String]
  }]
}, { timestamps: true });

const Resume = mongoose.model('Resume', resumeSchema);
export default Resume;
