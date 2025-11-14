import express from 'express';
import {
  createPoll,
  getPolls,
  getPollById,
  voteOnPoll,
  addOption,
  deletePoll,
} from '../controllers/pollController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getPolls);
router.get('/:id', getPollById);

router.use(protect);

router.post('/', createPoll);
router.post('/:id/vote', voteOnPoll);
router.post('/:id/option', addOption);
router.delete('/:id', deletePoll);

export default router;
