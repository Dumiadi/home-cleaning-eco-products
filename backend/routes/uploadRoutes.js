const express = require('express');
const router = express.Router();
const upload = require('../middleware/upload');

router.post('/', upload.single('image'), (req, res) => {
  if (!req.file || !req.file.path) {
    return res.status(400).json({ message: 'Upload eșuat' });
  }

  res.status(200).json({ imageUrl: req.file.path });
});

module.exports = router;
