const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const multer = require('multer');
require('dotenv').config();
const authRouter = require('./routes/auth');
const extractRouter = require('./routes/extract');

const app = express();
const port = process.env.PORT || 5000;

// Multer configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/')
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname)
  }
});

const upload = multer({ dest: 'uploads/' });

//CORS
app.use(cors({
  origin: 'http://localhost:3000', // Your frontend's URL
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

//Body parsing 
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

//Logging
app.use((req, res, next) => {
  console.log('Incoming request:', {
    method: req.method,
    path: req.path,
    headers: req.headers,
    body: req.body,
    rawBody: req.rawBody
  });
  next();
});

//Route mounting
app.use('/api/auth', authRouter);
app.use('/api', upload.single('file'), extractRouter);

//JSON parse error middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    console.error('JSON Parse Error:', err);
    return res.status(400).send({ message: 'Invalid JSON' }); 
  }
  next();
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ message: 'Route not found' });
});

// General error handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

//MongoDB connection
mongoose.connect(process.env.MONGODB_URI)
  .then(() => console.log('MongoDB connected...'))
  .catch(err => console.log('MongoDB connection error:', err));


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});