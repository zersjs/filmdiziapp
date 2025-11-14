import express from 'express';
import {
  createPost,
  getFeed,
  likePost,
  commentOnPost,
  followUser,
  getFollowers,
  getFollowing,
  shareContent,
  getUserPosts,
  deletePost,
} from '../controllers/socialController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// Posts
router.post('/posts', createPost);
router.get('/feed', getFeed);
router.get('/posts/user/:userId', getUserPosts);
router.post('/posts/:id/like', likePost);
router.post('/posts/:id/comment', commentOnPost);
router.delete('/posts/:id', deletePost);

// Follow
router.post('/follow/:userId', followUser);
router.get('/followers/:userId', getFollowers);
router.get('/following/:userId', getFollowing);

// Share
router.post('/share', shareContent);

export default router;
