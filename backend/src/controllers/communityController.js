import Forum from '../models/Forum.js';
import ForumPost from '../models/ForumPost.js';
import Group from '../models/Group.js';
import Event from '../models/Event.js';
import WatchParty from '../models/WatchParty.js';

// Forums
export const createForum = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;
    const forum = await Forum.create({
      title,
      description,
      category,
      tags,
      createdBy: req.user._id,
    });
    res.status(201).json({ success: true, data: forum });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getForums = async (req, res) => {
  try {
    const { page = 1, limit = 20, category } = req.query;
    const query = {};
    if (category) query.category = category;

    const forums = await Forum.find(query)
      .populate('createdBy', 'username avatar')
      .populate('lastPost.user', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ isPinned: -1, 'lastPost.createdAt': -1 });

    const count = await Forum.countDocuments(query);

    res.json({
      success: true,
      data: forums,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createForumPost = async (req, res) => {
  try {
    const { forumId, content, parentPost, media } = req.body;

    const forumPost = await ForumPost.create({
      forum: forumId,
      author: req.user._id,
      content,
      parentPost,
      media,
    });

    await Forum.findByIdAndUpdate(forumId, {
      $push: { posts: forumPost._id },
      $inc: { postsCount: 1 },
      lastPost: { user: req.user._id, createdAt: new Date() },
    });

    if (parentPost) {
      await ForumPost.findByIdAndUpdate(parentPost, {
        $push: { replies: forumPost._id },
        $inc: { repliesCount: 1 },
      });
    }

    await forumPost.populate('author', 'username avatar');
    res.status(201).json({ success: true, data: forumPost });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getForumPosts = async (req, res) => {
  try {
    const { forumId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    const posts = await ForumPost.find({ forum: forumId, parentPost: null })
      .populate('author', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ createdAt: -1 });

    const count = await ForumPost.countDocuments({ forum: forumId, parentPost: null });

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

// Groups
export const createGroup = async (req, res) => {
  try {
    const { name, description, category, privacy, rules, tags, coverImage } = req.body;

    const group = await Group.create({
      name,
      description,
      category,
      privacy,
      rules,
      tags,
      coverImage,
      createdBy: req.user._id,
      members: [{ user: req.user._id, role: 'owner' }],
    });

    res.status(201).json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getGroups = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, privacy } = req.query;
    const query = { isActive: true };
    if (category) query.category = category;
    if (privacy) query.privacy = privacy;

    const groups = await Group.find(query)
      .populate('createdBy', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ membersCount: -1 });

    const count = await Group.countDocuments(query);

    res.json({
      success: true,
      data: groups,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const joinGroup = async (req, res) => {
  try {
    const { groupId } = req.params;
    const group = await Group.findById(groupId);

    if (!group) {
      return res.status(404).json({ success: false, message: 'Group not found' });
    }

    const isMember = group.members.some(m => m.user.toString() === req.user._id.toString());
    if (isMember) {
      return res.status(400).json({ success: false, message: 'Already a member' });
    }

    if (group.privacy === 'private') {
      group.pendingRequests.push({ user: req.user._id, message: req.body.message });
      await group.save();
      return res.json({ success: true, message: 'Join request sent' });
    }

    group.members.push({ user: req.user._id, role: 'member' });
    group.membersCount += 1;
    await group.save();

    res.json({ success: true, data: group });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Events
export const createEvent = async (req, res) => {
  try {
    const {
      title,
      description,
      eventType,
      relatedContent,
      startDate,
      endDate,
      location,
      capacity,
      isPublic,
      tags,
    } = req.body;

    const event = await Event.create({
      title,
      description,
      eventType,
      organizer: req.user._id,
      relatedContent,
      startDate,
      endDate,
      location,
      capacity,
      isPublic,
      tags,
    });

    res.status(201).json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getEvents = async (req, res) => {
  try {
    const { page = 1, limit = 20, eventType, status } = req.query;
    const query = { isPublic: true };
    if (eventType) query.eventType = eventType;
    if (status) query.status = status;

    const events = await Event.find(query)
      .populate('organizer', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ startDate: 1 });

    const count = await Event.countDocuments(query);

    res.json({
      success: true,
      data: events,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const attendEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { status = 'going' } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Event not found' });
    }

    const attendeeIndex = event.attendees.findIndex(
      a => a.user.toString() === req.user._id.toString()
    );

    if (attendeeIndex > -1) {
      event.attendees[attendeeIndex].status = status;
    } else {
      if (event.capacity && event.attendeesCount >= event.capacity) {
        return res.status(400).json({ success: false, message: 'Event is full' });
      }
      event.attendees.push({ user: req.user._id, status });
      event.attendeesCount += 1;
    }

    await event.save();
    res.json({ success: true, data: event });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Watch Parties
export const createWatchParty = async (req, res) => {
  try {
    const {
      title,
      description,
      content,
      scheduledTime,
      privacy,
      maxParticipants,
      settings,
    } = req.body;

    const watchParty = await WatchParty.create({
      host: req.user._id,
      title,
      description,
      content,
      scheduledTime,
      privacy,
      maxParticipants,
      settings,
      roomId: `party_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    });

    res.status(201).json({ success: true, data: watchParty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getWatchParties = async (req, res) => {
  try {
    const { page = 1, limit = 20, status } = req.query;
    const query = { privacy: 'public' };
    if (status) query.status = status;

    const watchParties = await WatchParty.find(query)
      .populate('host', 'username avatar')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ scheduledTime: 1 });

    const count = await WatchParty.countDocuments(query);

    res.json({
      success: true,
      data: watchParties,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const joinWatchParty = async (req, res) => {
  try {
    const { partyId } = req.params;
    const watchParty = await WatchParty.findById(partyId);

    if (!watchParty) {
      return res.status(404).json({ success: false, message: 'Watch party not found' });
    }

    if (watchParty.participantsCount >= watchParty.maxParticipants) {
      return res.status(400).json({ success: false, message: 'Watch party is full' });
    }

    const isParticipant = watchParty.participants.some(
      p => p.user.toString() === req.user._id.toString()
    );

    if (!isParticipant) {
      watchParty.participants.push({ user: req.user._id });
      watchParty.participantsCount += 1;
      await watchParty.save();
    }

    res.json({ success: true, data: watchParty });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
