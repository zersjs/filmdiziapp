import express from 'express';
import {
  createOrUpdateRating,
  getRatingsForContent,
  getMyRating,
  deleteRating,
  markHelpful,
  getTopRated,
} from '../controllers/ratingController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/top', getTopRated);
router.get('/:contentType/:contentId', getRatingsForContent);

router.use(protect);

router.post('/', createOrUpdateRating);
router.get('/my/:contentType/:contentId', getMyRating);
router.delete('/:id', deleteRating);
router.post('/:id/helpful', markHelpful);

export default router;
