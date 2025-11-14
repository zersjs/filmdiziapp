import Post from '../models/Post.js';
import Follow from '../models/Follow.js';
import Share from '../models/Share.js';

// Create post
export const createPost = async (req, res) => {
  try {
    const { contentType, title, content, media, relatedContent, tags, visibility, spoiler } = req.body;

    const post = await Post.create({
      author: req.user._id,
      contentType,
      title,
      content,
      media,
      relatedContent,
      tags,
      visibility,
      spoiler,
    });

    await post.populate('author', 'username avatar');
    res.status(201).json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get feed
export const getFeed = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    // Get followed users
    const following = await Follow.find({ follower: req.user._id, status: 'active' });
    const followingIds = following.map(f => f.following);

    const posts = await Post.find({
      $or: [
        { author: { $in: followingIds } },
        { author: req.user._id },
        { visibility: 'public' },
      ],
    })
      .populate('author', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Post.countDocuments({
      $or: [
        { author: { $in: followingIds } },
        { author: req.user._id },
        { visibility: 'public' },
      ],
    });

    res.json({
      success: true,
      data: posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Like post
export const likePost = async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    const likeIndex = post.likes.findIndex(
      like => like.user.toString() === req.user._id.toString()
    );

    if (likeIndex > -1) {
      post.likes.splice(likeIndex, 1);
      post.likesCount = post.likes.length;
    } else {
      post.likes.push({ user: req.user._id });
      post.likesCount = post.likes.length;
    }

    await post.save();
    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Comment on post
export const commentOnPost = async (req, res) => {
  try {
    const { content } = req.body;
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found' });
    }

    post.comments.push({ user: req.user._id, content });
    post.commentsCount = post.comments.length;

    await post.save();
    await post.populate('comments.user', 'username avatar');

    res.json({ success: true, data: post });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Follow user
export const followUser = async (req, res) => {
  try {
    const { userId } = req.params;

    if (userId === req.user._id.toString()) {
      return res.status(400).json({ success: false, message: 'Cannot follow yourself' });
    }

    const existingFollow = await Follow.findOne({
      follower: req.user._id,
      following: userId,
    });

    if (existingFollow) {
      await existingFollow.deleteOne();
      return res.json({ success: true, message: 'Unfollowed successfully' });
    }

    const follow = await Follow.create({
      follower: req.user._id,
      following: userId,
    });

    res.status(201).json({ success: true, data: follow });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get followers
export const getFollowers = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const followers = await Follow.find({ following: userId, status: 'active' })
      .populate('follower', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Follow.countDocuments({ following: userId, status: 'active' });

    res.json({
      success: true,
      data: followers,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get following
export const getFollowing = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const following = await Follow.find({ follower: userId, status: 'active' })
      .populate('following', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Follow.countDocuments({ follower: userId, status: 'active' });

    res.json({
      success: true,
      data: following,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
      total: count,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Share content
export const shareContent = async (req, res) => {
  try {
    const { contentType, contentId, platform, message, recipients } = req.body;

    const share = await Share.create({
      user: req.user._id,
      contentType,
      contentId,
      platform,
      message,
      recipients,
      shareUrl: `${process.env.CLIENT_URL}/shared/${contentType}/${contentId}`,
    });

    res.status(201).json({ success: true, data: share });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user posts
export const getUserPosts = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const posts = await Post.find({ author: userId })
      .populate('author', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await Post.countDocuments({ author: userId });

    res.json({
      success: true,
      data: posts,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete post
export const deletePost = async (req, res) => {
  try {
    const post = await Post.findOneAndDelete({
      _id: req.params.id,
      author: req.user._id,
    });

    if (!post) {
      return res.status(404).json({ success: false, message: 'Post not found or unauthorized' });
    }

    res.json({ success: true, message: 'Post deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
