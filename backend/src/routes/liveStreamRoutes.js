import express from 'express';
import {
  createLiveStream,
  getLiveStreams,
  getStreamById,
  startStream,
  endStream,
  joinStream,
  leaveStream,
  sendChatMessage,
  getMyStreams,
} from '../controllers/liveStreamController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', getLiveStreams);
router.get('/:id', getStreamById);

router.use(protect);

// Protected routes
router.post('/', createLiveStream);
router.get('/me/streams', getMyStreams);
router.post('/:id/start', startStream);
router.post('/:id/end', endStream);
router.post('/:id/join', joinStream);
router.post('/:id/leave', leaveStream);
router.post('/:id/chat', sendChatMessage);

export default router;
