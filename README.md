# trueHabit

**trueHabit** is a personalized habit tracking platform built with the MERN stack. It helps users build and maintain healthy habits through daily tracking, visual progress, and collaborative group features.

## 🗂 Project Structure

```
truehabit/
├── backend/        # Node.js + Express API with MongoDB
├── frontend/       # React frontend using Ant Design
├── shared/         # Shared functions required for both frontend and backend
├── .gitignore
├── README.md
├── CHANGELOG.md    # track versions
```

## 🔑 Key Features

- ✅ Daily habit tracking
- 👥 Group tracking and user invites
- 📊 Progress tracking and visualization
- 🧠 Smart habit scheduling system
- 🔒 JWT-based secure authentication
- ☁️ Cloudinary integration for image uploads
- 📱 Responsive design for all devices

## 🛠️ Tech Stack

| Layer     | Technology            |
|-----------|------------------------|
| Frontend  | React, React Router, Axios, Ant Design, React Hook Form, React Redux |
| Backend   | Node.js, Express, MongoDB, Mongoose |
| Auth      | JSON Web Tokens (JWT), Bcrypt |
| Media     | Cloudinary |
| Dates     | Luxon, Dayjs |
| Others    | dotenv, cors, nodemon |

---

## 🚀 Getting Started

### 1. Clone the Repository

```bash
git clone https://github.com/tusharmotwani1718/truehabit.git
cd truehabit
```

### 2. Install Dependencies

#### Backend
```bash
cd backend
npm install
```

#### Frontend
```bash
cd ../frontend
npm install
```

### 3. Environment Variables

#### Backend `.env` file

```env
PORT=5000
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```

#### Frontend `.env` file

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_API_BASE_URL_GROUPS=http://localhost:5000/api/groups
```

### 4. Run the App

#### Start Backend

```bash
cd backend
npm run dev
```

#### Start Frontend

```bash
cd ../frontend
npm run dev
```

---

## 📸 Screenshots

_Add relevant UI screenshots or GIFs here when available._

---

## 📌 To-Do

- [ ] Add AI based habit scheduling and report system

---





## 🙌 Acknowledgements

- [React](https://reactjs.org/)
- [Ant Design](https://ant.design/)
- [MongoDB](https://www.mongodb.com/)
- [Cloudinary](https://cloudinary.com/)
- [JWT.io](https://jwt.io/)
- [Arcjet](https://arcjet.com)
- [Chai-Code](https://chaicode.com)

