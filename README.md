# 🎬 SINEFIX - Enterprise Movie & TV Streaming Platform

⚠️ This project was developed with AI assistance.

SINEFIX is a **full-stack enterprise-grade streaming platform** built with **React 18, Node.js, Express, MongoDB**, and the **TMDB API**. It features user authentication, social interactions, premium subscriptions, real-time notifications, and comprehensive admin tools.

---

## 🌟 Features

### 🎥 **Content & Streaming**
- **Extensive Catalog**: 1,000,000+ movies & TV shows via TMDB API
- **Multiple Streaming Providers**: VidSrc, VidFast, 2Embed, SuperEmbed with fallback support
- **Advanced Video Player**: Quality selection, subtitles, playback speed control, Picture-in-Picture
- **Episode Tracking**: Continue watching with progress tracking
- **Trailer Integration**: YouTube trailer playback

### 🔐 **Authentication & Users**
- **JWT Authentication**: Secure token-based auth with refresh tokens
- **Social Login**: Google, Facebook, Twitter OAuth integration
- **Email Verification**: Account activation via email
- **Password Reset**: Secure password recovery flow
- **Multi-Profile Support**: Family accounts with individual profiles
- **Role-Based Access**: User, Moderator, Admin roles

### 👥 **Social Features**
- **Follow System**: Follow/unfollow users
- **Activity Feed**: See what friends are watching
- **Reviews & Ratings**: Rate and review content
- **Comments**: Discuss movies and shows
- **User Profiles**: Customizable profiles with avatars
- **Watchlist Sharing**: Share your collections

### 💎 **Premium Features**
- **Subscription Tiers**: Free, Basic, Premium, Family plans
- **Stripe Integration**: Secure payment processing
- **Subscription Management**: Upgrade, downgrade, cancel
- **Parental Controls**: Age rating filters and PIN protection

### 🔔 **Real-time Features**
- **WebSocket Notifications**: Instant updates
- **Live Chat Support**: Customer support system
- **Push Notifications**: PWA push support
- **Email Notifications**: Customizable alerts

### 📊 **Analytics & Admin**
- **Admin Dashboard**: Content and user management
- **Analytics**: User engagement, viewing stats, revenue metrics
- **Moderation Tools**: Content and user moderation
- **System Logs**: Comprehensive logging

### 🎨 **UI/UX**
- **Dark/Light Theme**: Full theme support with auto detection
- **Multi-language (i18n)**: Turkish, English, German, French, Spanish
- **Responsive Design**: Mobile, tablet, desktop optimized
- **Smooth Animations**: Framer Motion powered animations
- **Modern UI**: TailwindCSS with glassmorphism effects

### 🔍 **Advanced Search & Discovery**
- **Multi-criteria Search**: Filter by genre, year, rating, language
- **Smart Recommendations**: AI-powered content suggestions
- **Content Calendar**: Upcoming releases calendar
- **Trending Section**: Weekly trending content
- **Collections**: Custom user collections and playlists

### ⚡ **Performance & SEO**
- **Code Splitting**: Optimized bundle sizes
- **Lazy Loading**: Images and components
- **PWA Support**: Installable with offline capabilities
- **SEO Optimized**: Meta tags, structured data
- **Caching Strategy**: Redis caching for API responses

---

## 🏗️ Architecture

### **Frontend**
```
React 18 + Vite + TailwindCSS + Zustand + React Query + Socket.IO Client
```

### **Backend**
```
Node.js + Express + MongoDB + Redis + Socket.IO + Stripe + Cloudinary
```

### **Project Structure**
```
/filmdiziapp
├── /backend                 # Backend API
│   ├── /src
│   │   ├── /config         # Configuration files
│   │   ├── /controllers    # Request handlers
│   │   ├── /models         # Database models
│   │   ├── /routes         # API routes
│   │   ├── /middleware     # Auth, validation, error handling
│   │   ├── /services       # Business logic
│   │   └── server.js       # Express server
│   ├── package.json
│   └── .env
│
├── /src                     # Frontend React app
│   ├── /api                # API client services
│   ├── /components         # React components
│   │   ├── /Auth          # Login, Register
│   │   ├── /Profile       # User profiles
│   │   ├── /Social        # Social features
│   │   ├── /Admin         # Admin dashboard
│   │   └── /UI            # Reusable UI components
│   ├── /stores            # Zustand state management
│   ├── /i18n              # Internationalization
│   ├── /hooks             # Custom React hooks
│   ├── /pages             # Page components
│   ├── /services          # Frontend services
│   └── main.jsx           # Entry point
│
├── package.json
└── README.md
```

---

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library with hooks
- **Vite 7** - Build tool and dev server
- **TailwindCSS 3** - Utility-first CSS
- **Zustand** - State management
- **React Query** - Server state management
- **React Router v6** - Routing
- **Framer Motion** - Animations
- **Socket.IO Client** - Real-time communication
- **i18next** - Internationalization
- **Axios** - HTTP client

### Backend
- **Node.js 18+** - JavaScript runtime
- **Express.js** - Web framework
- **MongoDB** - NoSQL database
- **Mongoose** - ODM
- **Redis** - Caching layer
- **Socket.IO** - WebSocket server
- **Passport.js** - Authentication
- **JWT** - Token-based auth
- **Stripe** - Payment processing
- **Nodemailer** - Email service
- **Cloudinary** - Image hosting
- **Winston** - Logging

### Testing & DevOps
- **Vitest** - Unit testing
- **Jest** - Backend testing
- **Supertest** - API testing
- **PM2** - Process manager
- **Docker** - Containerization

---

## ⚙️ Installation

### Prerequisites
- Node.js 18+ and npm
- MongoDB (local or MongoDB Atlas)
- Redis (optional, for caching)

### 1. Clone Repository
```bash
git clone https://github.com/zersjs/filmdiziapp.git
cd filmdiziapp
```

### 2. Backend Setup
```bash
cd backend
npm install
cp .env.example .env
# Edit .env with your configuration
npm run dev
```

### 3. Frontend Setup
```bash
cd ..
npm install
cp .env.example .env
# Edit .env with your API keys
npm run dev
```

### 4. Database Setup
```bash
# Start MongoDB (if using Docker)
docker run -d -p 27017:27017 --name mongodb mongo:latest

# Start Redis (optional)
docker run -d -p 6379:6379 --name redis redis:latest
```

### 5. Access Application
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:5000
- **API Health Check**: http://localhost:5000/health

---

## 🔑 Environment Variables

### Frontend (.env)
```env
VITE_TMDB_API_KEY=your_tmdb_api_key
VITE_API_URL=http://localhost:5000/api
VITE_SOCKET_URL=http://localhost:5000
```

### Backend (backend/.env)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://localhost:27017/sinefix
JWT_SECRET=your-secret-key
STRIPE_SECRET_KEY=your-stripe-key
# See backend/.env.example for all variables
```

---

## 📚 API Endpoints

### Authentication
```
POST   /api/auth/register          - Register user
POST   /api/auth/login             - Login user
GET    /api/auth/me                - Get current user
POST   /api/auth/logout            - Logout user
POST   /api/auth/forgot-password   - Request password reset
GET    /api/auth/verify-email/:token - Verify email
```

### Users
```
GET    /api/users                  - Get all users
GET    /api/users/:id              - Get user profile
PUT    /api/users/:id              - Update user
POST   /api/users/:id/follow       - Follow user
```

### Content (via TMDB)
```
GET    /discover/movie             - Discover movies
GET    /discover/tv                - Discover TV shows
GET    /movie/:id                  - Get movie details
GET    /tv/:id                     - Get TV show details
GET    /search/multi               - Search all content
```

---

## 🚀 Deployment

### Docker Deployment
```bash
# Build and run with Docker Compose
docker-compose up -d
```

### PM2 Deployment
```bash
# Backend
cd backend
npm install -g pm2
pm2 start src/server.js --name sinefix-api
pm2 save
pm2 startup

# Frontend (build and serve)
cd ..
npm run build
npx serve -s dist -p 3000
```

### Production Build
```bash
# Frontend
npm run build

# Backend
cd backend
npm start
```

---

## 🧪 Testing

```bash
# Frontend tests
npm run test
npm run test:coverage

# Backend tests
cd backend
npm test
npm run test:coverage
```

---

## 📖 Documentation

- **API Documentation**: http://localhost:5000/api-docs (Swagger)
- **Backend README**: [backend/README.md](./backend/README.md)
- **User Guide**: Coming soon
- **Developer Guide**: Coming soon

---

## 🎯 Roadmap

- [x] Backend API with authentication
- [x] Frontend with React 18
- [x] User profiles and social features
- [x] Real-time notifications
- [x] Dark/Light theme
- [x] Multi-language support
- [ ] React Native mobile app (iOS/Android)
- [ ] Content recommendation engine (ML)
- [ ] Offline download feature
- [ ] Live streaming support
- [ ] Admin analytics dashboard
- [ ] Next.js migration for SSR

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📜 License

MIT License - see [LICENSE](LICENSE) file for details

---

## 🙏 Credits & Acknowledgments

- **TMDB** - Movie and TV show data
- **VidSrc** - Primary streaming provider
- **React** - UI library
- **Node.js** - Backend runtime
- **TailwindCSS** - CSS framework
- **MongoDB** - Database
- **Stripe** - Payment processing

---

## 📞 Support

For support, email support@sinefix.com or open an issue on GitHub.

---

## 📸 Screenshots

Coming soon...

---

**Built with ❤️ by the SINEFIX Team**
  
