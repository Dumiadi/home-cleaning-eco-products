const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');

// GET toate recenziile
router.get('/', reviewController.getReviews);

// POST adaugă o recenzie
router.post('/', reviewController.addReview); // ✅ fără paranteze!

module.exports = router;
