const multer = require('multer');
const path = require('path');
const { v4: uuidv4 } = require('uuid');
const config = require('../config');

// Storage configuration
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, config.upload.dir);
  },
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${uuidv4()}${ext}`);
  },
});

// File filter — allow only CSV for question imports
const csvFilter = (_req, file, cb) => {
  if (
    file.mimetype === 'text/csv' ||
    file.originalname.toLowerCase().endsWith('.csv')
  ) {
    cb(null, true);
  } else {
    cb(new Error('Only CSV files are allowed'), false);
  }
};

// General file filter (images + documents)
const generalFilter = (_req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|pdf|csv|xlsx/;
  const ext = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mime = allowedTypes.test(file.mimetype);

  if (ext || mime) {
    cb(null, true);
  } else {
    cb(new Error('Unsupported file type'), false);
  }
};

// Multer instances
const uploadCSV = multer({
  storage,
  fileFilter: csvFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

const uploadGeneral = multer({
  storage,
  fileFilter: generalFilter,
  limits: { fileSize: config.upload.maxFileSize },
});

module.exports = { uploadCSV, uploadGeneral };
