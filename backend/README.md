# SINEFIX Backend API

Backend API for SINEFIX streaming platform built with Node.js, Express, and MongoDB.

## Features

- 🔐 **Authentication & Authorization**
  - JWT-based authentication
  - OAuth (Google, Facebook, Twitter)
  - Email verification
  - Password reset
  - Role-based access control

- 👤 **User Management**
  - User profiles with avatars
  - Multi-profile support (family accounts)
  - Customizable settings
  - Follow/unfollow users

- ⭐ **Content Features**
  - Ratings and reviews
  - Watchlist management
  - Watch history tracking
  - Collections and playlists
  - Comments and replies

- 🔔 **Real-time Features**
  - WebSocket notifications
  - Live chat support
  - Activity feed

- 💎 **Premium Features**
  - Stripe subscription integration
  - Multiple subscription tiers
  - Payment management

- 📊 **Analytics**
  - User engagement metrics
  - Content popularity tracking
  - Revenue analytics

- 🛡️ **Security**
  - Rate limiting
  - XSS protection
  - SQL injection prevention
  - Account lockout on failed attempts
  - CORS configuration

## Tech Stack

- **Runtime**: Node.js 18+
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose
- **Cache**: Redis
- **Authentication**: JWT, Passport.js
- **Payment**: Stripe
- **Email**: Nodemailer
- **Real-time**: Socket.IO
- **File Upload**: Multer, Cloudinary
- **Validation**: express-validator, Joi
- **Logging**: Winston
- **Testing**: Jest, Supertest

## Installation

1. Clone the repository
```bash
cd backend
```

2. Install dependencies
```bash
npm install
```

3. Configure environment variables
```bash
cp .env.example .env
# Edit .env with your configuration
```

4. Start MongoDB
```bash
# Using Docker
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Or install MongoDB locally
```

5. Start Redis (optional)
```bash
# Using Docker
docker run -d -p 6379:6379 --name redis redis:latest
```

6. Run the server
```bash
# Development
npm run dev

# Production
npm start
```

## Environment Variables

See `.env.example` for all required environment variables.

Key variables:
- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - Secret for JWT tokens
- `STRIPE_SECRET_KEY` - Stripe API key
- `EMAIL_HOST`, `EMAIL_USER`, `EMAIL_PASSWORD` - Email configuration
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth
- `REDIS_HOST`, `REDIS_PORT` - Redis configuration

## API Endpoints

### Authentication
```
POST   /api/auth/register       - Register new user
POST   /api/auth/login          - Login user
POST   /api/auth/logout         - Logout user
GET    /api/auth/me             - Get current user
POST   /api/auth/forgot-password - Request password reset
PUT    /api/auth/reset-password/:token - Reset password
GET    /api/auth/verify-email/:token - Verify email
PUT    /api/auth/update-password - Update password
```

### Users (Coming Soon)
```
GET    /api/users               - Get all users
GET    /api/users/:id           - Get user by ID
PUT    /api/users/:id           - Update user
DELETE /api/users/:id           - Delete user
POST   /api/users/:id/follow    - Follow user
POST   /api/users/:id/unfollow  - Unfollow user
```

### Reviews (Coming Soon)
```
GET    /api/reviews             - Get reviews
POST   /api/reviews             - Create review
GET    /api/reviews/:id         - Get review by ID
PUT    /api/reviews/:id         - Update review
DELETE /api/reviews/:id         - Delete review
POST   /api/reviews/:id/like    - Like review
POST   /api/reviews/:id/dislike - Dislike review
```

### Watchlist (Coming Soon)
```
GET    /api/watchlist           - Get user watchlist
POST   /api/watchlist/favorite  - Add to favorites
DELETE /api/watchlist/favorite/:id - Remove from favorites
POST   /api/watchlist/watch-later - Add to watch later
DELETE /api/watchlist/watch-later/:id - Remove from watch later
GET    /api/watchlist/history   - Get watch history
POST   /api/watchlist/history   - Add to history
```

### Collections (Coming Soon)
```
GET    /api/collections         - Get collections
POST   /api/collections         - Create collection
GET    /api/collections/:id     - Get collection by ID
PUT    /api/collections/:id     - Update collection
DELETE /api/collections/:id     - Delete collection
```

## Database Models

- **User** - User accounts and profiles
- **Review** - User reviews and ratings
- **Watchlist** - Favorites, watch later, history
- **Collection** - Custom content collections
- **Activity** - User activity feed
- **Notification** - User notifications
- **Comment** - Comments on content
- **ChatMessage** - Live chat messages
- **Conversation** - Chat conversations
- **Analytics** - Platform analytics

## Scripts

```bash
npm start          # Start production server
npm run dev        # Start development server with nodemon
npm test           # Run tests
npm run test:watch # Run tests in watch mode
npm run lint       # Lint code
npm run seed       # Seed database
```

## Development

### Code Structure

```
/backend
  /src
    /config       - Configuration files
    /controllers  - Request handlers
    /models       - Database models
    /routes       - API routes
    /middleware   - Custom middleware
    /services     - Business logic
    /utils        - Helper functions
    /validators   - Input validation
  /tests          - Test files
  /logs           - Log files
  /uploads        - Uploaded files
```

### Adding New Features

1. Create model in `/models`
2. Create controller in `/controllers`
3. Add validation in `/middleware/validator.js`
4. Create routes in `/routes`
5. Import routes in `server.js`
6. Write tests in `/tests`

## Testing

```bash
# Run all tests
npm test

# Run with coverage
npm run test:coverage

# Run specific test file
npm test -- auth.test.js
```

## Deployment

### Using PM2
```bash
npm install -g pm2
pm2 start src/server.js --name sinefix-api
pm2 save
pm2 startup
```

### Using Docker
```bash
docker build -t sinefix-api .
docker run -p 5000:5000 sinefix-api
```

## License

MIT

## Support

For support, email support@sinefix.com
