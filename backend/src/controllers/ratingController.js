import Rating from '../models/Rating.js';

// Create or update rating
export const createOrUpdateRating = async (req, res) => {
  try {
    const { contentType, contentId, rating, categories, reviewText, pros, cons, spoiler } = req.body;

    let existingRating = await Rating.findOne({
      user: req.user._id,
      contentType,
      contentId,
    });

    if (existingRating) {
      existingRating.rating = rating;
      existingRating.categories = categories || existingRating.categories;
      existingRating.reviewText = reviewText || existingRating.reviewText;
      existingRating.pros = pros || existingRating.pros;
      existingRating.cons = cons || existingRating.cons;
      existingRating.spoiler = spoiler !== undefined ? spoiler : existingRating.spoiler;
      await existingRating.save();
      return res.json({ success: true, data: existingRating });
    }

    const newRating = await Rating.create({
      user: req.user._id,
      contentType,
      contentId,
      rating,
      categories,
      reviewText,
      pros,
      cons,
      spoiler,
    });

    res.status(201).json({ success: true, data: newRating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get ratings for content
export const getRatingsForContent = async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const { page = 1, limit = 20, sortBy = 'createdAt' } = req.query;

    const ratings = await Rating.find({ contentType, contentId })
      .populate('user', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ [sortBy]: -1 });

    const count = await Rating.countDocuments({ contentType, contentId });
    const avgRating = await Rating.aggregate([
      { $match: { contentType, contentId: parseInt(contentId) } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } },
    ]);

    res.json({
      success: true,
      data: ratings,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      averageRating: avgRating[0]?.avgRating || 0,
      totalRatings: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's rating
export const getMyRating = async (req, res) => {
  try {
    const { contentType, contentId } = req.params;
    const rating = await Rating.findOne({
      user: req.user._id,
      contentType,
      contentId,
    });
    res.json({ success: true, data: rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete rating
export const deleteRating = async (req, res) => {
  try {
    const { id } = req.params;
    const rating = await Rating.findOneAndDelete({
      _id: id,
      user: req.user._id,
    });

    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    res.json({ success: true, message: 'Rating deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Mark rating as helpful
export const markHelpful = async (req, res) => {
  try {
    const { id } = req.params;
    const { value } = req.body; // 1 or -1

    const rating = await Rating.findById(id);
    if (!rating) {
      return res.status(404).json({ success: false, message: 'Rating not found' });
    }

    const existingIndex = rating.helpful.findIndex(
      (h) => h.user.toString() === req.user._id.toString()
    );

    if (existingIndex > -1) {
      rating.helpful[existingIndex].value = value;
    } else {
      rating.helpful.push({ user: req.user._id, value });
    }

    rating.helpfulCount = rating.helpful.reduce((sum, h) => sum + h.value, 0);
    await rating.save();

    res.json({ success: true, data: rating });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get top rated content
export const getTopRated = async (req, res) => {
  try {
    const { contentType, limit = 10 } = req.query;

    const topRated = await Rating.aggregate([
      ...(contentType ? [{ $match: { contentType } }] : []),
      {
        $group: {
          _id: { contentType: '$contentType', contentId: '$contentId' },
          avgRating: { $avg: '$rating' },
          count: { $sum: 1 },
        },
      },
      { $match: { count: { $gte: 5 } } },
      { $sort: { avgRating: -1 } },
      { $limit: parseInt(limit) },
    ]);

    res.json({ success: true, data: topRated });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
