import express from 'express';
import {
  createQuiz,
  getQuizzes,
  getQuizById,
  submitQuizAttempt,
  getMyAttempts,
  deleteQuiz,
} from '../controllers/quizController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/', getQuizzes);
router.get('/:id', getQuizById);

router.use(protect);

router.post('/', createQuiz);
router.post('/:id/submit', submitQuizAttempt);
router.get('/me/attempts', getMyAttempts);
router.delete('/:id', deleteQuiz);

export default router;
