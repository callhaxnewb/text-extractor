const mongoose = require('mongoose');

const ExtractedTextSchema = new mongoose.Schema({
  filename: String,
  filePath: String,
  pageCount: Number,
  processedPages: [Number],
  text: String,
  summary: String,
  insights: String,
  user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
  createdAt: { type: Date, default: Date.now },
  language: String,
  enrichmentDepth: String
});

module.exports = mongoose.model('ExtractedText', ExtractedTextSchema);