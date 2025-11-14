import Playlist from '../models/Playlist.js';

// Create playlist
export const createPlaylist = async (req, res) => {
  try {
    const { name, description, isPublic, category, tags, coverImage } = req.body;

    const playlist = await Playlist.create({
      user: req.user._id,
      name,
      description,
      isPublic,
      category,
      tags,
      coverImage,
    });

    res.status(201).json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user playlists
export const getUserPlaylists = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const query = { user: userId };
    if (userId !== req.user._id.toString()) {
      query.isPublic = true;
    }

    const playlists = await Playlist.find(query)
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ updatedAt: -1 });

    const count = await Playlist.countDocuments(query);

    res.json({
      success: true,
      data: playlists,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get playlist by ID
export const getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id).populate('user', 'username avatar');

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    if (!playlist.isPublic && playlist.user._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Access denied' });
    }

    res.json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Add item to playlist
export const addItemToPlaylist = async (req, res) => {
  try {
    const { contentType, contentId, title, posterPath, note } = req.body;

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    const existingItem = playlist.items.find(
      item => item.contentType === contentType && item.contentId === contentId
    );

    if (existingItem) {
      return res.status(400).json({ success: false, message: 'Item already in playlist' });
    }

    playlist.items.push({ contentType, contentId, title, posterPath, note });
    playlist.totalItems += 1;

    await playlist.save();
    res.json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Remove item from playlist
export const removeItemFromPlaylist = async (req, res) => {
  try {
    const { itemId } = req.params;

    const playlist = await Playlist.findOne({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    playlist.items = playlist.items.filter(item => item._id.toString() !== itemId);
    playlist.totalItems = playlist.items.length;

    await playlist.save();
    res.json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Follow playlist
export const followPlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id);

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    const isFollowing = playlist.followers.some(
      f => f.user.toString() === req.user._id.toString()
    );

    if (isFollowing) {
      playlist.followers = playlist.followers.filter(
        f => f.user.toString() !== req.user._id.toString()
      );
      playlist.followersCount -= 1;
    } else {
      playlist.followers.push({ user: req.user._id });
      playlist.followersCount += 1;
    }

    await playlist.save();
    res.json({ success: true, data: playlist });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete playlist
export const deletePlaylist = async (req, res) => {
  try {
    const playlist = await Playlist.findOneAndDelete({
      _id: req.params.id,
      user: req.user._id,
    });

    if (!playlist) {
      return res.status(404).json({ success: false, message: 'Playlist not found' });
    }

    res.json({ success: true, message: 'Playlist deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get public playlists
export const getPublicPlaylists = async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const query = { isPublic: true };
    if (category) query.category = category;

    const playlists = await Playlist.find(query)
      .populate('user', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ followersCount: -1 });

    const count = await Playlist.countDocuments(query);

    res.json({
      success: true,
      data: playlists,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
