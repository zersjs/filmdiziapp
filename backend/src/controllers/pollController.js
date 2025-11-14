import Poll from '../models/Poll.js';

// Create poll
export const createPoll = async (req, res) => {
  try {
    const { title, description, category, options, allowMultipleVotes, allowNewOptions, endDate, tags } = req.body;

    const poll = await Poll.create({
      title,
      description,
      category,
      options: options.map(opt => ({ text: opt.text, imageUrl: opt.imageUrl })),
      allowMultipleVotes,
      allowNewOptions,
      endDate,
      tags,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: poll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all polls
export const getPolls = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, isActive, featured } = req.query;
    const query = {};
    if (category) query.category = category;
    if (isActive !== undefined) query.isActive = isActive === 'true';
    if (featured !== undefined) query.featured = featured === 'true';

    const polls = await Poll.find(query)
      .populate('createdBy', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ featured: -1, startDate: -1 });

    const count = await Poll.countDocuments(query);

    res.json({
      success: true,
      data: polls,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get poll by ID
export const getPollById = async (req, res) => {
  try {
    const poll = await Poll.findById(req.params.id).populate('createdBy', 'username avatar');
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }
    res.json({ success: true, data: poll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Vote on poll
export const voteOnPoll = async (req, res) => {
  try {
    const { optionIndex } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    if (!poll.isActive) {
      return res.status(400).json({ success: false, message: 'Poll is not active' });
    }

    if (poll.endDate && new Date() > poll.endDate) {
      poll.isActive = false;
      await poll.save();
      return res.status(400).json({ success: false, message: 'Poll has ended' });
    }

    const option = poll.options[optionIndex];
    if (!option) {
      return res.status(400).json({ success: false, message: 'Invalid option' });
    }

    // Check if user already voted
    const hasVoted = poll.options.some(opt =>
      opt.votes.some(vote => vote.user.toString() === req.user._id.toString())
    );

    if (hasVoted && !poll.allowMultipleVotes) {
      return res.status(400).json({ success: false, message: 'You have already voted' });
    }

    option.votes.push({ user: req.user._id });
    option.voteCount = option.votes.length;
    poll.totalVotes = poll.options.reduce((sum, opt) => sum + opt.voteCount, 0);

    await poll.save();

    res.json({ success: true, data: poll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add option to poll
export const addOption = async (req, res) => {
  try {
    const { text, imageUrl } = req.body;
    const poll = await Poll.findById(req.params.id);

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found' });
    }

    if (!poll.allowNewOptions) {
      return res.status(400).json({ success: false, message: 'Adding new options is not allowed' });
    }

    poll.options.push({ text, imageUrl, votes: [], voteCount: 0 });
    await poll.save();

    res.json({ success: true, data: poll });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete poll
export const deletePoll = async (req, res) => {
  try {
    const poll = await Poll.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!poll) {
      return res.status(404).json({ success: false, message: 'Poll not found or unauthorized' });
    }

    res.json({ success: true, message: 'Poll deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
