const Review = require('../models/reviewModel');

exports.getReviews = async (req, res) => {
  try {
    const reviews = await Review.getAll();
    res.json(reviews);
  } catch (error) {
    console.error('❌ Error getting reviews:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

exports.addReview = async (req, res) => {
  try {
    const result = await Review.add(req.body);
    res.status(201).json({ message: 'Review added successfully' });
  } catch (error) {
    console.error('❌ Error adding review:', error);
    res.status(500).json({ message: 'Server error' });
  }
};
