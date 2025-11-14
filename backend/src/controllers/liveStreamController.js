import LiveStream from '../models/LiveStream.js';

// Create live stream
export const createLiveStream = async (req, res) => {
  try {
    const {
      title,
      description,
      streamType,
      relatedContent,
      scheduledStartTime,
      settings,
      tags,
    } = req.body;

    const streamKey = `stream_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const rtmpUrl = `rtmp://${process.env.STREAM_SERVER || 'localhost'}/live/${streamKey}`;
    const hlsUrl = `https://${process.env.STREAM_SERVER || 'localhost'}/hls/${streamKey}.m3u8`;

    const liveStream = await LiveStream.create({
      streamer: req.user._id,
      title,
      description,
      streamType,
      relatedContent,
      scheduledStartTime,
      settings,
      tags,
      streamKey,
      rtmpUrl,
      hlsUrl,
    });

    res.status(201).json({ success: true, data: liveStream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get live streams
export const getLiveStreams = async (req, res) => {
  try {
    const { page = 1, limit = 20, status = 'live', streamType } = req.query;
    const query = { status };
    if (streamType) query.streamType = streamType;

    const streams = await LiveStream.find(query)
      .populate('streamer', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ currentViewers: -1, actualStartTime: -1 });

    const count = await LiveStream.countDocuments(query);

    res.json({
      success: true,
      data: streams,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get stream by ID
export const getStreamById = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id).populate('streamer', 'username avatar');
    if (!stream) {
      return res.status(404).json({ success: false, message: 'Stream not found' });
    }
    res.json({ success: true, data: stream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Start stream
export const startStream = async (req, res) => {
  try {
    const stream = await LiveStream.findOne({
      _id: req.params.id,
      streamer: req.user._id,
    });

    if (!stream) {
      return res.status(404).json({ success: false, message: 'Stream not found or unauthorized' });
    }

    stream.status = 'live';
    stream.actualStartTime = new Date();
    await stream.save();

    res.json({ success: true, data: stream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// End stream
export const endStream = async (req, res) => {
  try {
    const stream = await LiveStream.findOne({
      _id: req.params.id,
      streamer: req.user._id,
    });

    if (!stream) {
      return res.status(404).json({ success: false, message: 'Stream not found or unauthorized' });
    }

    stream.status = 'ended';
    stream.endTime = new Date();
    await stream.save();

    res.json({ success: true, data: stream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Join stream
export const joinStream = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);

    if (!stream) {
      return res.status(404).json({ success: false, message: 'Stream not found' });
    }

    const isViewer = stream.viewers.some(v => v.user.toString() === req.user._id.toString());

    if (!isViewer) {
      stream.viewers.push({ user: req.user._id });
      stream.currentViewers += 1;
      stream.totalViews += 1;

      if (stream.currentViewers > stream.peakViewers) {
        stream.peakViewers = stream.currentViewers;
      }

      await stream.save();
    }

    res.json({ success: true, data: stream });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Leave stream
export const leaveStream = async (req, res) => {
  try {
    const stream = await LiveStream.findById(req.params.id);

    if (!stream) {
      return res.status(404).json({ success: false, message: 'Stream not found' });
    }

    const viewerIndex = stream.viewers.findIndex(
      v => v.user.toString() === req.user._id.toString() && !v.leftAt
    );

    if (viewerIndex > -1) {
      stream.viewers[viewerIndex].leftAt = new Date();
      stream.currentViewers = Math.max(0, stream.currentViewers - 1);
      await stream.save();
    }

    res.json({ success: true, message: 'Left stream successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Send chat message
export const sendChatMessage = async (req, res) => {
  try {
    const { message } = req.body;
    const stream = await LiveStream.findById(req.params.id);

    if (!stream) {
      return res.status(404).json({ success: false, message: 'Stream not found' });
    }

    if (!stream.settings.allowChat) {
      return res.status(400).json({ success: false, message: 'Chat is disabled' });
    }

    stream.chat.push({ user: req.user._id, message });
    await stream.save();

    // Emit via socket.io
    const io = req.app.get('io');
    io.to(`stream_${stream._id}`).emit('chat_message', {
      user: req.user,
      message,
      timestamp: new Date(),
    });

    res.json({ success: true, message: 'Message sent' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's streams
export const getMyStreams = async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;

    const streams = await LiveStream.find({ streamer: req.user._id })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await LiveStream.countDocuments({ streamer: req.user._id });

    res.json({
      success: true,
      data: streams,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
