import express from 'express';
import {
  createForum,
  getForums,
  createForumPost,
  getForumPosts,
  createGroup,
  getGroups,
  joinGroup,
  createEvent,
  getEvents,
  attendEvent,
  createWatchParty,
  getWatchParties,
  joinWatchParty,
} from '../controllers/communityController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/forums', getForums);
router.get('/forums/:forumId/posts', getForumPosts);
router.get('/groups', getGroups);
router.get('/events', getEvents);
router.get('/watch-parties', getWatchParties);

router.use(protect);

// Forums
router.post('/forums', createForum);
router.post('/forums/posts', createForumPost);

// Groups
router.post('/groups', createGroup);
router.post('/groups/:groupId/join', joinGroup);

// Events
router.post('/events', createEvent);
router.post('/events/:eventId/attend', attendEvent);

// Watch Parties
router.post('/watch-parties', createWatchParty);
router.post('/watch-parties/:partyId/join', joinWatchParty);

export default router;
