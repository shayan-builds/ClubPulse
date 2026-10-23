# ClubPulse

ClubPulse is a college club feedback platform that allows students to share feedback about clubs, events, management, and workshops through a simple, anonymous-style feedback form.

## Features

- Submit feedback for college clubs.
- Choose a feedback category: Event, Management, Workshop, or Other.
- Form validation and clear error messages.
- Loading and success states during submission.
- Responsive React frontend.
- Express REST API for processing feedback.
- MongoDB Atlas integration for storing feedback.
- Feedback records include creation and update timestamps.

## Tech Stack

**Frontend**
- React
- TypeScript
- Vite

**Backend**
- Node.js
- Express.js
- Mongoose

**Database**
- MongoDB Atlas

## Project Structure

```text
ClubPulse/
├── client/       # React frontend
├── server/       # Express backend
├── .gitignore
└── README.md
```

## Prerequisites

- Node.js and npm
- A MongoDB Atlas account or MongoDB instance
- Git

## Local Setup

### 1. Clone the repository

```bash
git clone YOUR_GITHUB_REPOSITORY_URL
cd ClubPulse
```

Replace `YOUR_GITHUB_REPOSITORY_URL` with your actual repository URL.

### 2. Set up the backend

```bash
cd server
npm install
```

Create a `.env` file inside the `server` folder:

```env
MONGODB_URI=YOUR_MONGODB_CONNECTION_STRING
PORT=5000
```

Replace the placeholder with your MongoDB connection string. Never commit this file to GitHub.

Start the backend:

```bash
node server.js
```

### 3. Set up the frontend

Open a second terminal:

```bash
cd client
npm install
```

Create a `.env.local` file inside `client`:

```env
VITE_API_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open the local URL displayed by Vite in your browser.

## API

### Submit Feedback

`POST /api/feedback`

Example JSON request:

```json
{
  "clubName": "Coding Club",
  "category": "Workshop",
  "message": "The workshop was informative and engaging."
}
```

A successful submission returns HTTP `201` and saves the feedback in MongoDB.

## Privacy

The form does not ask students to provide their names or email addresses. However, this does not guarantee complete anonymity at the infrastructure level.

## Deployment

The frontend can be deployed on Vercel, and the Express backend can be deployed on Render. MongoDB Atlas stores the feedback data. Configure production environment variables and CORS settings before deployment.

## Future Improvements

- Feedback dashboard for authorized club administrators.
- Feedback filtering and analytics.
- Spam prevention and rate limiting.
- Additional privacy and security controls.

## Author

Developed as a college project.