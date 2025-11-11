import { body, param, query, validationResult } from 'express-validator';

// Middleware to check validation results
export const validate = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: 'Validation error',
      errors: errors.array().map((err) => ({
        field: err.path,
        message: err.msg,
      })),
    });
  }

  next();
};

// Auth validators
export const registerValidator = [
  body('username')
    .trim()
    .isLength({ min: 3, max: 30 })
    .withMessage('Username must be between 3 and 30 characters')
    .matches(/^[a-zA-Z0-9_]+$/)
    .withMessage('Username can only contain letters, numbers, and underscores'),
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters'),
  body('fullName')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Full name cannot exceed 100 characters'),
  validate,
];

export const loginValidator = [
  body('email')
    .trim()
    .isEmail()
    .withMessage('Please provide a valid email')
    .normalizeEmail(),
  body('password')
    .notEmpty()
    .withMessage('Password is required'),
  validate,
];

// Review validators
export const reviewValidator = [
  body('contentId')
    .isInt({ min: 1 })
    .withMessage('Content ID must be a positive integer'),
  body('contentType')
    .isIn(['movie', 'tv'])
    .withMessage('Content type must be either movie or tv'),
  body('rating')
    .isFloat({ min: 0.5, max: 10 })
    .withMessage('Rating must be between 0.5 and 10'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 5000 })
    .withMessage('Review must be between 10 and 5000 characters'),
  body('title')
    .optional()
    .trim()
    .isLength({ max: 100 })
    .withMessage('Title cannot exceed 100 characters'),
  body('spoiler')
    .optional()
    .isBoolean()
    .withMessage('Spoiler must be a boolean'),
  validate,
];

// Collection validators
export const collectionValidator = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Collection name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description cannot exceed 500 characters'),
  body('isPublic')
    .optional()
    .isBoolean()
    .withMessage('isPublic must be a boolean'),
  validate,
];

// Comment validators
export const commentValidator = [
  body('contentId')
    .isInt({ min: 1 })
    .withMessage('Content ID must be a positive integer'),
  body('contentType')
    .isIn(['movie', 'tv', 'review', 'collection'])
    .withMessage('Invalid content type'),
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
  body('parentComment')
    .optional()
    .isMongoId()
    .withMessage('Invalid parent comment ID'),
  validate,
];

// Pagination validators
export const paginationValidator = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100'),
  validate,
];

// ID validators
export const mongoIdValidator = [
  param('id')
    .isMongoId()
    .withMessage('Invalid ID'),
  validate,
];

export default {
  validate,
  registerValidator,
  loginValidator,
  reviewValidator,
  collectionValidator,
  commentValidator,
  paginationValidator,
  mongoIdValidator,
};
