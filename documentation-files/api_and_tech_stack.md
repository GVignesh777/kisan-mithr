# Kisan Mithr — Complete API List & Tech Stack

---

## 🛠️ Languages & Technologies Used

### Frontend
| Technology | Purpose |
|---|---|
| **JavaScript (JSX)** | Primary language |
| **React 19** | UI framework (via `react-scripts` / CRA) |
| **TailwindCSS 3** | Styling framework |
| **Zustand** | Global state management |
| **React Router DOM 7** | Client-side routing |
| **Framer Motion** | Animations |
| **Axios** | HTTP client for API calls |
| **Leaflet + React Leaflet** | Interactive maps |
| **Recharts** | Data visualization / charts |
| **React Markdown** | Rendering markdown content |
| **Lucide React + React Icons** | Icon libraries |
| **React Toastify** | Toast notifications |
| **Yup + React Hook Form** | Form validation |
| **franc-min** | Language detection |
| **EmailJS** | Client-side email sending |
| **@react-oauth/google** | Google OAuth login |

### Backend
| Technology | Purpose |
|---|---|
| **JavaScript (Node.js)** | Primary language |
| **Express 5** | Web server framework |
| **MongoDB + Mongoose 9** | Database & ODM |
| **JWT (jsonwebtoken)** | Authentication tokens |
| **bcrypt / bcryptjs** | Password hashing |
| **Google Generative AI** | AI responses (Gemini) |
| **Groq SDK** | AI responses (Groq/LLaMA) |
| **ElevenLabs** | Text-to-Speech |
| **Edge TTS** | Text-to-Speech (fallback) |
| **Google TTS API** | Text-to-Speech (fallback) |
| **Cloudinary** | Image upload & storage |
| **Multer** | File upload handling |
| **Sharp** | Image processing |
| **Nodemailer + Resend** | Email sending (OTP, password reset) |
| **Passport + Google OAuth 2.0** | Google authentication |
| **Socket.IO** | Real-time communication |
| **Cheerio** | Web scraping |
| **node-cron** | Scheduled tasks (market price sync) |
| **Axios + node-fetch** | External API calls |
| **natural + compromise** | NLP / text processing |
| **franc** | Language detection |
| **cookie-parser** | Cookie management |
| **CORS** | Cross-origin resource sharing |

### Database
| Technology | Purpose |
|---|---|
| **MongoDB** | Primary database (via Mongoose) |

### Deployment
| Technology | Purpose |
|---|---|
| **Vercel** | Frontend hosting (vercel.json present) |

---

## 📡 Complete API List (One by One)

### 1. User / Authentication APIs
> Base path: `/api`

| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 1 | `POST` | `/api/register` | Register a new user | ❌ |
| 2 | `POST` | `/api/verifyOtp` | Verify OTP during registration | ❌ |
| 3 | `POST` | `/api/login` | Login with email & password | ❌ |
| 4 | `POST` | `/api/google-login` | Login via Google OAuth | ❌ |
| 5 | `POST` | `/api/selectRole` | Select user role (farmer/expert) | ✅ |
| 6 | `GET` | `/api/logout` | Logout user | ❌ |
| 7 | `POST` | `/api/forgotPassword` | Request password reset email | ❌ |
| 8 | `POST` | `/api/resetPassword/:token` | Reset password with token | ❌ |
| 9 | `PUT` | `/api/updateProfile` | Update user profile (with image upload) | ✅ |
| 10 | `GET` | `/api/check-auth` | Check if user is authenticated | ✅ |
| 11 | `GET` | `/api/allUsers` | Get all registered users | ✅ |

---

### 2. AI / Voice Assistant APIs
> Base path: `/api`

| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 12 | `POST` | `/api/ask-ai` | Send query to AI and get response | ❌ |
| 13 | `POST` | `/api/speak` | Generate audio from text (TTS) | ❌ |
| 14 | `POST` | `/api/transcript` | Transcribe audio file to text (STT) | ❌ |
| 15 | `POST` | `/api/tts` | Generate speech via Gemini TTS | ❌ |

---

### 3. Conversation / Chat History APIs
> Base path: `/api`

| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 16 | `POST` | `/api/create` | Create a new conversation | ❌ |
| 17 | `POST` | `/api/addMessage` | Add message to a conversation | ❌ |
| 18 | `GET` | `/api/user/:userId` | Get all conversations for a user | ❌ |

---

### 4. Chat Management APIs
> Base path: `/api/chats`

| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 19 | `GET` | `/api/chats/:userId` | Get all chats for a user | ❌ |
| 20 | `POST` | `/api/chats/save` | Save or update a chat | ❌ |
| 21 | `DELETE` | `/api/chats/:chatId` | Delete a chat | ❌ |

---

### 5. Market Price APIs
> Base path: `/api/market`

| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 22 | `GET` | `/api/market/locations` | Get unique market locations | ❌ |
| 23 | `GET` | `/api/market/update-auto` | Auto-fetch prices from external API | ❌ |
| 24 | `PUT` | `/api/market/update-manual/:id` | Manually update a market price | ❌ |
| 25 | `GET` | `/api/market/prices` | Get market prices (with query filters) | ❌ |
| 26 | `GET` | `/api/market/ratings/:cropId` | Get ratings for a crop | ❌ |
| 27 | `POST` | `/api/market/ratings` | Submit a crop rating | ❌ |

---

### 6. Weather APIs
> Base path: `/api/weather`

| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 28 | `GET` | `/api/weather/coords` | Get weather by GPS coordinates | ❌ |
| 29 | `GET` | `/api/weather/:location` | Get weather by city name | ❌ |

---

### 7. Crop Analysis API
> Base path: `/api/analyze-crop`

| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 30 | `POST` | `/api/analyze-crop/` | Upload crop image for disease analysis | ❌ |

---

### 8. Feedback API
> Base path: `/api/feedback`

| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 31 | `POST` | `/api/feedback/` | Submit user feedback | ❌ |

---

### 9. Satellite / NASA APIs
> Base path: `/api/satellite`

| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 32 | `POST` | `/api/satellite/analyze` | Analyze satellite vegetation indices | ❌ |
| 33 | `POST` | `/api/satellite/nasa-imagery` | Get NASA satellite imagery | ❌ |
| 34 | `GET` | `/api/satellite/nasa-apod` | Get NASA Astronomy Picture of the Day | ❌ |
| 35 | `POST` | `/api/satellite/data` | Get satellite data for a location | ❌ |

---

### 10. Admin Authentication APIs
> Base path: `/api/admin/auth`

| # | Method | Endpoint | Description | Auth |
|---|--------|----------|-------------|------|
| 36 | `POST` | `/api/admin/auth/login` | Admin login | ❌ |
| 37 | `GET` | `/api/admin/auth/profile` | Get admin profile | 🔑 Admin |
| 38 | `POST` | `/api/admin/auth/seed` | Seed initial admin account | ❌ |

---

### 11. Admin Dashboard & Management APIs
> Base path: `/api/admin` — **All require Admin auth** 🔑

| # | Method | Endpoint | Description |
|---|--------|----------|-------------|
| 39 | `GET` | `/api/admin/dashboard` | Get dashboard analytics/stats |
| 40 | `GET` | `/api/admin/users` | Get all users |
| 41 | `PUT` | `/api/admin/users/:id/block` | Block a user |
| 42 | `PUT` | `/api/admin/users/:id/unblock` | Unblock a user |
| 43 | `DELETE` | `/api/admin/users/:id` | Delete a user |
| 44 | `GET` | `/api/admin/crop-reports` | Get all crop disease reports |
| 45 | `PUT` | `/api/admin/crop-reports/:id` | Update report status |
| 46 | `DELETE` | `/api/admin/crop-reports/:id` | Delete a report |
| 47 | `GET` | `/api/admin/conversations` | Get all AI conversations |
| 48 | `GET` | `/api/admin/images` | Get all uploaded images |
| 49 | `PUT` | `/api/admin/images/:id` | Update image moderation status |
| 50 | `DELETE` | `/api/admin/images/:id` | Delete an image |
| 51 | `GET` | `/api/admin/market-prices` | Get all market prices |
| 52 | `POST` | `/api/admin/market-prices/sync` | Sync market prices from external API |
| 53 | `POST` | `/api/admin/market-prices` | Add a new market price entry |
| 54 | `PUT` | `/api/admin/market-prices/:id` | Update a market price |
| 55 | `DELETE` | `/api/admin/market-prices/:id` | Delete a market price |
| 56 | `GET` | `/api/admin/notifications/unread-count` | Get unread notification count |
| 57 | `PUT` | `/api/admin/notifications/:id/mark-read` | Mark notification as read |
| 58 | `GET` | `/api/admin/notifications` | Get all notifications |
| 59 | `POST` | `/api/admin/notifications` | Create a notification |
| 60 | `DELETE` | `/api/admin/notifications/:id` | Delete a notification |
| 61 | `GET` | `/api/admin/feedback` | Get all user feedback |
| 62 | `GET` | `/api/admin/health` | Get system health status |
| 63 | `POST` | `/api/admin/ai-chat` | Admin AI chat assistant |

---

## 📊 Summary

| Category | Count |
|---|---|
| **Total APIs** | **63** |
| User / Auth | 11 |
| AI / Voice Assistant | 4 |
| Conversation History | 3 |
| Chat Management | 3 |
| Market Prices | 6 |
| Weather | 2 |
| Crop Analysis | 1 |
| Feedback | 1 |
| Satellite / NASA | 4 |
| Admin Auth | 3 |
| Admin Management | 25 |

### External APIs / Services Consumed
| Service | Purpose |
|---|---|
| **Google Gemini AI** | AI text generation & multimodal analysis |
| **Groq (LLaMA)** | Alternative AI text generation |
| **ElevenLabs** | Premium text-to-speech |
| **Edge TTS / Google TTS** | Fallback text-to-speech |
| **NASA EONET / APOD** | Satellite imagery & data |
| **OpenWeatherMap** (likely) | Weather data |
| **data.gov.in** (likely) | Market commodity prices |
| **Cloudinary** | Image hosting & CDN |
| **Google OAuth 2.0** | Social authentication |
| **Nodemailer / Resend** | Transactional emails |
