import Quiz from '../models/Quiz.js';

// Create quiz
export const createQuiz = async (req, res) => {
  try {
    const { title, description, category, difficulty, questions, timeLimit, tags, coverImage } = req.body;

    const totalPoints = questions.reduce((sum, q) => sum + (q.points || 10), 0);

    const quiz = await Quiz.create({
      title,
      description,
      category,
      difficulty,
      questions,
      totalQuestions: questions.length,
      totalPoints,
      timeLimit,
      tags,
      coverImage,
      createdBy: req.user._id,
    });

    res.status(201).json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get all quizzes
export const getQuizzes = async (req, res) => {
  try {
    const { page = 1, limit = 20, category, difficulty, featured } = req.query;
    const query = { isPublished: true };
    if (category) query.category = category;
    if (difficulty) query.difficulty = difficulty;
    if (featured !== undefined) query.featured = featured === 'true';

    const quizzes = await Quiz.find(query)
      .populate('createdBy', 'username avatar')
      .select('-questions.correctAnswer')
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .sort({ featured: -1, averageScore: -1 });

    const count = await Quiz.countDocuments(query);

    res.json({
      success: true,
      data: quizzes,
      totalPages: Math.ceil(count / limit),
      currentPage: page,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id)
      .populate('createdBy', 'username avatar')
      .select('-questions.correctAnswer');

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    res.json({ success: true, data: quiz });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Submit quiz attempt
export const submitQuizAttempt = async (req, res) => {
  try {
    const { answers, timeTaken } = req.body;
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found' });
    }

    let correctAnswers = 0;
    let score = 0;

    quiz.questions.forEach((question, index) => {
      if (answers[index] === question.correctAnswer) {
        correctAnswers++;
        score += question.points || 10;
      }
    });

    quiz.attempts.push({
      user: req.user._id,
      score,
      totalQuestions: quiz.totalQuestions,
      correctAnswers,
      timeTaken,
    });

    quiz.totalAttempts += 1;
    quiz.averageScore = quiz.attempts.reduce((sum, a) => sum + a.score, 0) / quiz.totalAttempts;

    await quiz.save();

    res.json({
      success: true,
      data: {
        score,
        totalPoints: quiz.totalPoints,
        correctAnswers,
        totalQuestions: quiz.totalQuestions,
        timeTaken,
        percentage: (score / quiz.totalPoints) * 100,
      },
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Get user's quiz attempts
export const getMyAttempts = async (req, res) => {
  try {
    const quizzes = await Quiz.find({ 'attempts.user': req.user._id })
      .populate('createdBy', 'username avatar')
      .select('title category difficulty totalPoints attempts');

    const myAttempts = quizzes.map(quiz => {
      const userAttempts = quiz.attempts.filter(
        a => a.user.toString() === req.user._id.toString()
      );
      return {
        quiz: {
          _id: quiz._id,
          title: quiz.title,
          category: quiz.category,
          difficulty: quiz.difficulty,
          totalPoints: quiz.totalPoints,
        },
        attempts: userAttempts,
        bestScore: Math.max(...userAttempts.map(a => a.score)),
      };
    });

    res.json({ success: true, data: myAttempts });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// Delete quiz
export const deleteQuiz = async (req, res) => {
  try {
    const quiz = await Quiz.findOneAndDelete({
      _id: req.params.id,
      createdBy: req.user._id,
    });

    if (!quiz) {
      return res.status(404).json({ success: false, message: 'Quiz not found or unauthorized' });
    }

    res.json({ success: true, message: 'Quiz deleted successfully' });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
