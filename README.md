# 📚 Academia - Student-Teacher-HOD Management System

A complete MERN stack application for managing students, teachers, and HOD (Head of Department) with document approval workflows, resume building, real-time notifications, and analytics.

## 🎯 Features

### 1️⃣ **Authentication & Authorization**
- ✅ Role-based registration (Student, Teacher, HOD)
- ✅ Email domain validation per role
- ✅ JWT authentication (7-day tokens)
- ✅ Secure password hashing (bcrypt)
- ✅ Session management

### 2️⃣ **Student Module**
- 📋 Profile management
- 📄 Document upload (PDF, PPT, Images)
- 🎯 Progress tracking
  - Profile completion
  - Document upload progress
  - Resume completion
  - Overall placement readiness
- 📝 Resume builder with multiple templates
- 🔔 Real-time notifications
- 📊 Progress visualization

### 3️⃣ **Teacher Module**
- 👥 View assigned students
- ✅ Approve/reject student documents
- 📝 Edit student resumes
- 📊 Teacher performance metrics
- 🔔 Send notifications to students
- 📋 Real-time approval updates

### 4️⃣ **HOD Module**
- 🏢 Department dashboard
- 📊 Analytics & insights
  - Student count
  - Teacher count
  - Placement statistics
  - Department placement readiness score
- 📋 Audit logs
- 📢 Broadcast announcements
- 🔍 View all students and teachers

### 5️⃣ **Real-Time Features**
- 🔔 Socket.io notifications
- 📨 Real-time document approvals
- 👥 Live updates across devices

### 6️⃣ **Database**
- MongoDB with soft deletes
- Aggregation pipelines for analytics
- Indexed queries for performance
- Referential integrity validation

## 📁 Project Structure

```
student-hod-system/
├── backend/
│   ├── models/
│   │   ├── User.js
│   │   ├── Document.js
│   │   ├── Resume.js
│   │   ├── Notification.js
│   │   └── AuditLog.js
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── documentController.js
│   │   ├── resumeController.js
│   │   ├── userController.js
│   │   ├── notificationController.js
│   │   └── auditController.js
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── documentRoutes.js
│   │   ├── resumeRoutes.js
│   │   ├── userRoutes.js
│   │   ├── notificationRoutes.js
│   │   └── auditRoutes.js
│   ├── middlewares/
│   │   ├── auth.js
│   │   ├── authorize.js
│   │   ├── validation.js
│   │   └── errorHandler.js
│   ├── utils/
│   │   ├── tokenUtils.js
│   │   ├── validation.js
│   │   ├── progressCalculator.js
│   │   └── cloudinaryConfig.js
│   ├── server.js
│   ├── package.json
│   └── .env.example
│
└── frontend/
    ├── src/
    │   ├── pages/
    │   │   ├── LoginPage.js
    │   │   ├── RegisterPage.js
    │   │   ├── StudentDashboard.js
    │   │   ├── TeacherDashboard.js
    │   │   ├── HODDashboard.js
    │   │   ├── DocumentsPage.js
    │   │   ├── ResumePage.js
    │   │   └── NotificationsPage.js
    │   ├── components/
    │   │   ├── Sidebar.js
    │   │   ├── Card.js
    │   │   ├── Table.js
    │   │   ├── ProgressBar.js
    │   │   └── ProtectedRoute.js
    │   ├── services/
    │   │   ├── api.js
    │   │   └── socket.js
    │   ├── hooks/
    │   │   └── useAuth.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── utils/
    │   │   └── validation.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    ├── public/
    │   └── index.html
    ├── package.json
    └── .env.example
```

## 🚀 Setup Instructions

### Prerequisites
- Node.js 14+ and npm
- MongoDB (Atlas or local)
- Cloudinary account (free tier)

### Backend Setup

1. **Navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure `.env` with your credentials:**
   ```env
   PORT=5000
   NODE_ENV=development
   MONGO_URI=mongodb+srv://user:password@cluster.mongodb.net/student-hod-system
   JWT_SECRET=your-super-secret-key
   CLOUDINARY_CLOUD_NAME=your-cloud-name
   CLOUDINARY_API_KEY=your-api-key
   CLOUDINARY_API_SECRET=your-api-secret
   FRONTEND_URL=http://localhost:3000
   ```

5. **Start backend:**
   ```bash
   npm run dev
   ```
   Server runs on: `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Create `.env` file:**
   ```bash
   cp .env.example .env
   ```

4. **Configure `.env`:**
   ```env
   REACT_APP_API_URL=http://localhost:5000/api
   REACT_APP_SOCKET_URL=http://localhost:5000
   ```

5. **Start frontend:**
   ```bash
   npm start
   ```
   App runs on: `http://localhost:3000`

## Deploy On Render

This repository now includes a Render Blueprint file: `render.yaml`.

### One-click setup

1. Push this project to GitHub.
2. In Render, choose **New +** -> **Blueprint**.
3. Select this repository.
4. Render will create:
   - `academia-sphere-backend` (Node web service)
   - `academia-sphere-frontend` (Static web service)

### Required backend secrets in Render

Set these values in Render before first successful deploy:

- `MONGO_URI`
- `JWT_SECRET`
- `CLOUDINARY_CLOUD_NAME`
- `CLOUDINARY_API_KEY`
- `CLOUDINARY_API_SECRET`
- `FRONTEND_URL` (set to your Render frontend URL, e.g. `https://academia-sphere-frontend.onrender.com`)
- `CORS_ORIGINS` (use the same frontend URL)

### Required frontend env in Render

- `REACT_APP_BACKEND_URL` (set to your Render backend URL, e.g. `https://academia-sphere-backend.onrender.com`)

### Production env behavior

- Frontend uses `REACT_APP_BACKEND_URL` to build API and socket URLs.
- Backend CORS reads `CORS_ORIGINS` and `FRONTEND_URL`.
- SPA routes are handled by Render rewrite rules and `frontend/public/_redirects`.

## 🔐 Test Credentials

```
Student:  student@student.mes.ac.in  / password: test123
Teacher:  teacher@mes.ac.in          / password: test123
HOD:      hod@mes.ac.in              / password: test123
```

(Change these passwords in production!)

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login
- `GET /api/auth/me` - Get current user
- `PUT /api/auth/profile` - Update profile
- `POST /api/auth/logout` - Logout

### Documents
- `POST /api/documents/upload` - Upload document
- `GET /api/documents/my-documents` - Get student's documents
- `GET /api/documents/pending` - Get pending approvals
- `PUT /api/documents/:id/approve` - Approve document
- `PUT /api/documents/:id/reject` - Reject document

### Resume
- `GET /api/resume/my-resume` - Get student's resume
- `PUT /api/resume/update-section` - Update resume section
- `PUT /api/resume/change-template` - Change template
- `PUT /api/resume/:id/approve/:section` - Approve section

### Users
- `GET /api/users/students` - Get all students
- `GET /api/users/students/:id` - Get student detail
- `GET /api/users/teachers` - Get all teachers
- `GET /api/users/analytics/department` - Get department analytics

### Notifications
- `GET /api/notifications` - Get notifications
- `PUT /api/notifications/:id/read` - Mark as read
- `POST /api/notifications/announcement` - Send announcement

### Audit Logs
- `GET /api/audit-logs` - Get audit logs

## 🔧 Progress Calculation Logic

The progress bar uses deterministic calculations:

```javascript
// Profile Completion (30 points)
- Name: 1 point
- Phone: 1 point
- Profile Image: 1 point
- Bio: 1 point
- CGPA: 1 point

// Document Upload (40 points)
- Each document uploaded: 6% (up to 30%)
- Approval bonus: 10% if all documents approved

// Resume Completion (30 points)
- Personal Info: 1 section
- Summary: 1 section
- Experience: 1 section
- Education: 1 section
- Skills: 1 section
- Projects: 1 section
- Approval bonus: 10% if all sections approved

// Overall Progress = (Profile + Documents + Resume) / 100
```

## 📈 Teacher Performance Score

```javascript
// Performance = (Approvals × 40% + Response Time × 30% + Feedback × 30%)

Approvals Score:
- 1 point per approved document (max 40)

Response Time Score:
- Base 30 points
- Deducted 0.5 per hour of delay

Feedback Score:
- Default 30 points (can be customized)
```

## 🎨 UI Design Philosophy

The UI is designed to look **human-made, not corporate**:
- Minimalist white background
- Light gray cards (#f5f5f5, #fafafa)
- Simple sans-serif fonts
- Standard buttons and inputs
- No gradients or fancy animations
- Basic tables and dropdowns
- Slightly imperfect spacing
- Single accent color (#007bff for links/actions)
- Real engineering student aesthetic

## 🔒 Security Features

- ✅ Password hashing with bcrypt
- ✅ JWT token-based authentication
- ✅ Role-based access control (RBAC)
- ✅ Email domain validation
- ✅ Input validation with express-validator
- ✅ Soft deletes to prevent data loss
- ✅ Audit logs for all actions
- ✅ Error handling middleware

## 📱 Responsive Design

The application is responsive and works on:
- Desktop browsers
- Tablets
- Mobile devices

## 🚢 Deployment

### Backend (Render Free Tier)
1. Connect GitHub repo to Render
2. Set environment variables
3. Deploy from `backend` directory

### Frontend (Vercel)
1. Connect GitHub repo
2. Deploy from `frontend` directory
3. Set `REACT_APP_*` environment variables

### Database (MongoDB Atlas)
1. Create free cluster
2. Configure network access
3. Get connection string

## 📝 Environment Variables Checklist

**Backend (.env)**
- [ ] MongoDB connection URI
- [ ] JWT secret
- [ ] Cloudinary credentials
- [ ] Frontend URL
- [ ] Port number

**Frontend (.env)**
- [ ] API URL
- [ ] Socket.io URL

## 🐛 Troubleshooting

### Connection Issues
- Ensure backend server is running on port 5000
- Check MongoDB connection string
- Verify CORS settings in backend

### File Upload Failures
- Verify Cloudinary credentials
- Check file size (max 10MB)
- Confirm file type (PDF, PPT, images)

### Socket.io Issues
- Check CORS configuration
- Verify socket connection URL in frontend
- Ensure backend socket.io is initialized

## 📚 Learning Resources

- [MongoDB Documentation](https://docs.mongodb.com/)
- [Express.js Guide](https://expressjs.com/)
- [React Documentation](https://react.dev/)
- [Socket.io Guide](https://socket.io/docs/)
- [Cloudinary Upload API](https://cloudinary.com/documentation/upload_api)

## 📄 License

MIT License - Feel free to use for educational purposes

## 🤝 Contributing

Contributions are welcome! Please fork the repository and submit pull requests.

## 📞 Support

For issues or questions, please create an issue in the repository.

---

**Built with ❤️ for academic management**
