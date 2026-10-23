# ClubPulse 🎓

**A full-stack college club feedback platform built to make sharing feedback simple and accessible.**

ClubPulse lets students submit feedback about college clubs, events, management, and workshops through a clean, responsive interface. It connects a React frontend to an Express REST API and MongoDB Atlas to store feedback.

**Live Demo:** [ClubPulse](https://club-pulse-roan.vercel.app/)  
**Source Code:** [GitHub Repository](https://github.com/shayan-builds/ClubPulse)

## ✨ Features

- **Club Selection:** Select a college club before submitting feedback.
- **Feedback Categories:** Choose Event, Management, Workshop, or Other.
- **Form Validation:** Clear validation and error messages.
- **Submission Feedback:** Loading and success states during submission.
- **Responsive UI:** Designed to work across desktop and mobile screens.
- **Theme Customization:** Dark and light themes for a more comfortable experience.
- **REST API Integration:** Sends feedback to an Express backend.
- **Database Persistence:** Stores feedback in MongoDB Atlas.
- **Timestamps:** Feedback records include creation and update timestamps.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, TypeScript, Vite |
| Styling | Tailwind CSS |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas |
| ODM | Mongoose |
| Deployment | Vercel (frontend), Render (backend) |

## 📁 Project Structure

```text
ClubPulse/
├── client/          # React frontend
│   └── src/          # UI components, styles and club data
├── server/          # Express backend and API
├── .gitignore
└── README.md
```

## 🚀 Getting Started

Follow these steps to run ClubPulse locally.

### Prerequisites

- [Node.js and npm](https://nodejs.org/)
- [Git](https://git-scm.com/)
- A MongoDB Atlas account or another accessible MongoDB instance

### 1. Clone the repository

```bash
git clone https://github.com/shayan-builds/ClubPulse.git
cd ClubPulse
```

### 2. Configure the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server/` directory:

```env
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
PORT=5000
```

Replace the placeholder with your MongoDB connection string. Keep your credentials private and never commit your `.env` file.

Start the backend:

```bash
node server.js
```

Keep this terminal running.

### 3. Configure the frontend

Open a second terminal from the project root:

```bash
cd client
npm install
```

Create a `.env.local` file inside `client/`:

```env
VITE_API_URL=http://localhost:5000
```

Start the development server:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

**Note:** The frontend environment variable must point to the backend server. If you change the backend port, update the URL accordingly.

## 🔌 API Reference

### Submit Feedback

`POST /api/feedback`

**Example request body:**

```json
{
  "clubName": "Coding Club",
  "category": "Workshop",
  "message": "The workshop was informative and engaging."
}
```

A successful submission returns HTTP `201` and stores the feedback in MongoDB.

The frontend uses the `VITE_API_URL` environment variable to locate the backend API.

## 🌐 Deployment

ClubPulse uses separate deployments for its frontend and backend:

- **Frontend:** [Vercel](https://vercel.com/)
- **Backend:** [Render](https://render.com/)
- **Database:** [MongoDB Atlas](https://www.mongodb.com/atlas)

For deployment, configure the required environment variables in the respective hosting dashboards. Ensure that the backend's CORS configuration permits requests from the production frontend domain.

Never put database credentials or other secrets in frontend environment variables. Variables prefixed with `VITE_` are exposed to the client-side application.

## 🔒 Privacy

The feedback form does not ask students for their names or email addresses. However, this does not guarantee complete anonymity at the infrastructure level. Server logs, hosting providers, and other infrastructure may process technical request information.

## 🗺️ Future Improvements

- An analytics dashboard for authorized club administrators.
- Feedback filtering and reporting.
- Spam prevention and rate limiting.
- Additional privacy and security controls.

## 👨‍💻 Author

Built as a college project to explore full-stack web development, API integration, database persistence, and deployment.

---

If you find ClubPulse interesting, feel free to explore the source code and share feedback.