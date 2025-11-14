import express from 'express';
import {
  createPlaylist,
  getUserPlaylists,
  getPlaylistById,
  addItemToPlaylist,
  removeItemFromPlaylist,
  followPlaylist,
  deletePlaylist,
  getPublicPlaylists,
} from '../controllers/playlistController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/public', getPublicPlaylists);

router.use(protect);

router.post('/', createPlaylist);
router.get('/user/:userId', getUserPlaylists);
router.get('/:id', getPlaylistById);
router.post('/:id/items', addItemToPlaylist);
router.delete('/:id/items/:itemId', removeItemFromPlaylist);
router.post('/:id/follow', followPlaylist);
router.delete('/:id', deletePlaylist);

export default router;
