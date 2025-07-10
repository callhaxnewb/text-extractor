const express = require('express');
const multer = require('multer');
const { PDFLoader } = require("@langchain/community/document_loaders/fs/pdf");
const ExtractedText = require('../models/ExtractedText');
const { generateText, summarizeText } = require('../llm');
const auth=require('../middleware/auth')
const router = express.Router();
const upload = multer({ dest: 'uploads/', limits: { fileSize: 50 * 1024 * 1024 } }); // 50MB limit
const User=require('../models/User')

// Get a specific extraction by ID
router.get('/extractions/:id', async (req, res) => {
  try {
    const extraction = await ExtractedText.findById(req.params.id);
    if (!extraction) {
      return res.status(404).json({ error: 'Extraction not found' });
    }
    res.json(extraction);
  } catch (error) {
    console.error('Error fetching extraction:', error);
    res.status(500).json({ error: 'Error fetching extraction' });
  } 
});

router.post('/extract', auth, async (req, res) => {
  console.log('Extraction process started');
  try {
    console.log('User object:', req.user);
    if (!req.file) {
      console.log('No file uploaded');
      return res.status(400).json({ error: 'No file uploaded.' });
    }

    console.log('File received:', req.file);
    console.log('Language:', req.body.language);
    console.log('Enrichment Depth:', req.body.enrichmentDepth);

    const loader = new PDFLoader(req.file.path, {
      splitPages: false,
    });
    const docs = await loader.load();
    console.log('PDF loaded, page count:', docs.length);

    const pageCount = docs.length;
    const fileName = req.file.originalname;

    let fullText = docs.map(doc => doc.pageContent).join('\n\n');
    console.log('Full text extracted, length:', fullText.length);

    let summary = await summarizeText(fullText, req.body.language, req.body.enrichmentDepth);
    console.log('Summary generated, length:', summary.length);

    let insights = await generateText(`Based on the following summary, provide key insights:\n\n${summary}`, req.body.language, req.body.enrichmentDepth);
    console.log('Insights generated, length:', insights.length);

    const newExtraction = new ExtractedText({
      filename: fileName,
      text: fullText,
      summary: summary,
      insights: insights,
      pageCount: pageCount,
      processedPages: Array.from({ length: pageCount }, (_, i) => i + 1),
      language: req.body.language,
      enrichmentDepth: req.body.enrichmentDepth,
      user: req.user.id  // Associate with the logged-in user
    });

    console.log('Saving extraction to database');
    await newExtraction.save();
    console.log('Extraction saved, id:', newExtraction._id);

    res.json({ 
      id: newExtraction._id,
      filename: fileName,
      summary: summary,
      insights: insights,
      pageCount: pageCount,
      language: req.body.language,
      enrichmentDepth: req.body.enrichmentDepth
    });
  } catch (error) {
    console.error('Error processing file:', error);
    res.status(500).json({
      error: 'Error processing file',
      message: error.message,
      filename: req.file ? req.file.originalname : 'Unknown'
    });
  }
});

router.get('/extractions', auth, async (req, res) => {
  try {
    const extractions = await ExtractedText.find({ 
      $or: [
        { user: req.user.id },
        { sharedWith: req.user.id }
      ]
    })
    .populate('user', 'email') // Populate user field with email
    .sort({ createdAt: -1 });
    res.json(extractions);
  } catch (error) {
    console.error('Error fetching extractions:', error);
    res.status(500).json({ error: 'Error fetching extractions' });
  }
});

// New route for sharing documents
router.post('/share/:id', auth, async (req, res) => {
  try {
    const { email } = req.body;
    const document = await ExtractedText.findOne({ _id: req.params.id, user: req.user.id });
    if (!document) {
      return res.status(404).json({ error: 'Document not found or you do not have permission to share it.' });
    }
    
    const userToShare = await User.findOne({ email });
    if (!userToShare) {
      return res.status(404).json({ error: 'User not found.' });
    }

    if (document.sharedWith.includes(userToShare._id)) {
      return res.status(400).json({ error: 'Document already shared with this user.' });
    }

    document.sharedWith.push(userToShare._id);
    await document.save();

    res.json({ message: 'Document shared successfully.' });
  } catch (error) {
    console.error('Error sharing document:', error);
    res.status(500).json({ error: 'Error sharing document' });
  }
});

router.delete('/extractions/:id', async (req, res) => {
  try {
    const result = await ExtractedText.findByIdAndDelete(req.params.id);
    if (!result) {
      return res.status(404).json({ message: 'Document not found' });
    }
    res.json({ message: 'Document deleted successfully' });
  } catch (error) {
    console.error('Error deleting document:', error);
    res.status(500).json({ error: 'Error deleting document' });
  }
});

module.exports = router;