
import { useState } from "react";
import "./App.css";

function App() {
  const [clubName, setClubName] = useState("");
  const [category, setCategory] = useState("Event");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setStatus("");
    setLoading(true);

    try {
      const response = await fetch(
        "http://localhost:5000/api/feedback",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            clubName,
            category,
            message,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Submission failed.");
      }

      setStatus("Feedback submitted successfully!");
      setClubName("");
      setCategory("Event");
      setMessage("");
    } catch (error) {
      setStatus(
        "Could not submit feedback. Check that the backend is running."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="app">
      <section className="feedback-card">
        <p className="eyebrow">YOUR VOICE MATTERS</p>
        <h1>ClubPulse</h1>
        <p className="subtitle">
          Help make your college clubs better.
          Share your feedback anonymously.
        </p>

        <form onSubmit={handleSubmit}>
          <label htmlFor="clubName">Club name</label>
          <input
            id="clubName"
            value={clubName}
            onChange={(e) => setClubName(e.target.value)}
            placeholder="e.g. Coding Club"
            required
          />

          <label htmlFor="category">Feedback category</label>
          <select
            id="category"
            value={category}
            onChange={(e) => setCategory(e.target.value)}
          >
            <option>Event</option>
            <option>Management</option>
            <option>Workshop</option>
            <option>Other</option>
          </select>

          <label htmlFor="message">Your feedback</label>
          <textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Tell us what went well or what could improve..."
            rows="5"
            maxLength="1000"
            required
          />

          <button type="submit" disabled={loading}>
            {loading ? "Submitting..." : "Submit feedback"}
          </button>
        </form>

        {status && (
          <p role="status" className="status">
            {status}
          </p>
        )}

        <p className="privacy">
          No name or email required.
        </p>
      </section>
    </main>
  );
}

export default App;
