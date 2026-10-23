import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react"
import {
  AlertCircle,
  CalendarDays,
  Check,
  Lightbulb,
  MessageCircle,
  Moon,
  Sun,
  UsersRound,
} from "lucide-react"
import { clubs } from "./data/clubs"

type Category = "Event" | "Management" | "Workshop" | "Other"
type FormErrors = Partial<Record<"clubName" | "category" | "message", string>>

const API_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "")

const categories: Array<{
  value: Category
  label: string
  hint: string
  Icon: typeof CalendarDays
}> = [
  {
    value: "Event",
    label: "Events",
    hint: "Fests and meet-ups",
    Icon: CalendarDays,
  },
  {
    value: "Management",
    label: "Organisation & communication",
    hint: "How the club is run",
    Icon: UsersRound,
  },
  {
    value: "Workshop",
    label: "Workshops & sessions",
    hint: "Talks and hands-on learning",
    Icon: Lightbulb,
  },
  {
    value: "Other",
    label: "Something else",
    hint: "Another club thought",
    Icon: MessageCircle,
  },
]

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="ClubPulse, back to top">
      <span>ClubPulse</span>
    </a>
  )
}

type Theme = "dark" | "light"

function Header({ theme, onToggleTheme }: { theme: Theme; onToggleTheme: () => void }) {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav className="header-actions" aria-label="Primary navigation">
          <a className="how-link" href="#thoughts">
            Thoughts
          </a>
          <a className="nav-cta" href="#feedback">
            Share a thought
          </a>
          <button
            className="theme-toggle"
            type="button"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
            title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
          >
            {theme === "dark" ? <Sun size={18} aria-hidden="true" /> : <Moon size={18} aria-hidden="true" />}
            <span>{theme === "dark" ? "Light" : "Dark"}</span>
          </button>
        </nav>
      </div>
    </header>
  )
}

interface FieldErrorProps {
  id: string
  children: string
}

function FieldError({ id, children }: FieldErrorProps) {
  return (
    <p className="field-error" id={id} role="status" aria-live="polite">
      <AlertCircle size={15} strokeWidth={2} aria-hidden="true" />
      {children}
    </p>
  )
}

function SuccessPanel({ onReset }: { onReset: () => void }) {
  return (
    <div
      className="success-panel"
      role="status"
      aria-live="polite"
      tabIndex={-1}
    >
      <p className="success-kicker">Sent</p>
      <h2>Thanks for sharing.</h2>
      <p>Your note has been received.</p>
      <div className="success-actions">
        <button className="primary-button" type="button" onClick={onReset}>
          Send another
        </button>
      </div>
    </div>
  )
}

function FeedbackForm() {
  const [clubName, setClubName] = useState("")
  const [clubQuery, setClubQuery] = useState("")
  const [category, setCategory] = useState<Category | "">("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const clubInputRef = useRef<HTMLInputElement>(null)
  const submissionInProgressRef = useRef(false)
  const matchingClubs = clubs.filter((club) =>
    club.toLowerCase().includes(clubQuery.trim().toLowerCase()),
  )
  const isCustomClub =
    clubQuery.trim().length > 0 &&
    !clubs.some((club) => club.toLowerCase() === clubQuery.trim().toLowerCase())
  const clubOptions = [
    ...matchingClubs,
    ...(isCustomClub ? [clubQuery.trim()] : []),
  ]

  const validate = () => {
    const nextErrors: FormErrors = {}
    if (!clubName.trim()) nextErrors.clubName = "Choose a club or add its name."
    if (!category) nextErrors.category = "Choose a topic."
    if (message.trim().length < 12) {
      nextErrors.message = "Add a little more detail (at least 12 characters)."
    } else if (message.length > 1000) {
      nextErrors.message = "Feedback can't exceed 1000 characters."
    }
    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  const submit = async (event?: FormEvent) => {
    event?.preventDefault()
    if (submissionInProgressRef.current) return
    setSubmitError(null)
    if (!validate()) return
    submissionInProgressRef.current = true
    setIsSubmitting(true)

    try {
      const response = await fetch(`${API_URL}/api/feedback`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          clubName: clubName.trim(),
          category,
          message: message.trim(),
        }),
      })

      if (response.status !== 201) {
        const responseBody: unknown = await response.json().catch(() => null)
        const serverMessage =
          typeof responseBody === "object" &&
          responseBody !== null &&
          "message" in responseBody &&
          typeof responseBody.message === "string"
            ? responseBody.message
            : null

        if (response.status === 400 || response.status === 422) {
          setSubmitError(
            serverMessage || "Please check your feedback and try again.",
          )
        } else if (response.status >= 500) {
          setSubmitError(
            serverMessage ||
              "The feedback service is temporarily unavailable. Please try again.",
          )
        } else {
          setSubmitError(
            serverMessage ||
              "The feedback couldn't be accepted. Please review it and try again.",
          )
        }
        return
      }

      setIsSuccess(true)
    } catch {
      setSubmitError(
        "Couldn't send your feedback. Check your connection and try again.",
      )
    } finally {
      submissionInProgressRef.current = false
      setIsSubmitting(false)
    }
  }

  const reset = () => {
    setClubName("")
    setClubQuery("")
    setCategory("")
    setMessage("")
    setErrors({})
    setSubmitError(null)
    setIsSuccess(false)
    window.setTimeout(() => clubInputRef.current?.focus(), 50)
  }

  const selectClub = (name: string) => {
    setClubName(name)
    if (errors.clubName) setErrors({ ...errors, clubName: undefined })
  }

  const clearClub = () => {
    setClubName("")
    setClubQuery("")
    if (errors.clubName) setErrors({ ...errors, clubName: undefined })
    window.setTimeout(() => clubInputRef.current?.focus(), 0)
  }

  const moveClubSelection = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (
      !clubOptions.length ||
      !["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)
    )
      return
    event.preventDefault()
    const direction =
      event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1
    const nextIndex =
      (index + direction + clubOptions.length) % clubOptions.length
    selectClub(clubOptions[nextIndex])
    document.getElementById(`club-option-${nextIndex}`)?.focus()
  }

  const chooseCategoryWithKeyboard = (
    event: KeyboardEvent<HTMLButtonElement>,
    index: number,
  ) => {
    if (
      !["ArrowRight", "ArrowLeft", "ArrowDown", "ArrowUp"].includes(event.key)
    )
      return
    event.preventDefault()
    const direction =
      event.key === "ArrowRight" || event.key === "ArrowDown" ? 1 : -1
    const nextIndex =
      (index + direction + categories.length) % categories.length
    setCategory(categories[nextIndex].value)
    if (errors.category) setErrors({ ...errors, category: undefined })
    document.getElementById(`category-${nextIndex}`)?.focus()
  }

  if (isSuccess) return <SuccessPanel onReset={reset} />

  const counterTone =
    message.length >= 1000
      ? "limit"
      : message.length >= 900
        ? "warning"
        : "normal"

  return (
    <form className="feedback-form" onSubmit={submit} noValidate>
      <div className="form-heading">
        <div>
          <p className="form-eyebrow">Your note</p>
          <h2 className={!clubName ? "club-prompt" : undefined}>
            {clubName ? `Feedback for ${clubName}` : "Choose a club first"}
          </h2>
          <p>Pick a topic, then tell us what you think.</p>
        </div>
      </div>

      <div className="field-group">
        <label htmlFor="club-name">Find or enter a club</label>
        <input
          ref={clubInputRef}
          id="club-name"
          type="text"
          value={clubQuery}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.clubName)}
          aria-describedby={
            errors.clubName
              ? "club-name-error club-name-hint"
              : "club-name-hint"
          }
          aria-controls="club-options"
          placeholder="Search clubs or type a name"
          onChange={(event) => {
            setClubQuery(event.target.value)
            setClubName("")
            if (errors.clubName) setErrors({ ...errors, clubName: undefined })
          }}
          onKeyDown={(event) => {
            if (event.key === "ArrowDown" && clubOptions.length) {
              event.preventDefault()
              document.getElementById("club-option-0")?.focus()
            }
          }}
        />
        <p className="field-hint" id="club-name-hint">
          Choose one below, or use your own club name.
        </p>
        {errors.clubName && (
          <FieldError id="club-name-error">{errors.clubName}</FieldError>
        )}
        {clubOptions.length > 0 && (
          <div
            className="club-options"
            id="club-options"
            role="radiogroup"
            aria-label="Matching clubs"
          >
            {clubOptions.map((option, index) => (
              <button
                id={`club-option-${index}`}
                className={
                  clubName === option
                    ? "club-option is-selected"
                    : "club-option"
                }
                type="button"
                role="radio"
                aria-checked={clubName === option}
                tabIndex={
                  clubName === option || (!clubName && index === 0) ? 0 : -1
                }
                disabled={isSubmitting}
                key={`${option}-${index}`}
                onKeyDown={(event) => moveClubSelection(event, index)}
                onClick={() => selectClub(option)}
              >
                {option}
                {isCustomClub && index === clubOptions.length - 1 && (
                  <span className="custom-club-label">Use this name</span>
                )}
              </button>
            ))}
          </div>
        )}
        {clubName && (
          <div className="selected-club">
            <span>
              Feedback for <strong>{clubName}</strong>
            </span>
            <button
              type="button"
              className="clear-selection"
              onClick={clearClub}
              disabled={isSubmitting}
              aria-label={`Clear ${clubName} selection`}
            >
              Clear
            </button>
          </div>
        )}
      </div>

      <fieldset className="field-group">
        <legend>Choose a topic</legend>
        <div
          className="category-grid"
          role="radiogroup"
          aria-invalid={Boolean(errors.category)}
          aria-describedby={errors.category ? "category-error" : undefined}
        >
          {categories.map(({ value, label, hint, Icon }, index) => {
            const selected = category === value
            return (
              <button
                id={`category-${index}`}
                className={
                  selected ? "category-card is-selected" : "category-card"
                }
                type="button"
                role="radio"
                aria-checked={selected}
                tabIndex={selected || (!category && index === 0) ? 0 : -1}
                disabled={isSubmitting}
                key={value}
                onKeyDown={(event) => chooseCategoryWithKeyboard(event, index)}
                onClick={() => {
                  setCategory(value)
                  setErrors({ ...errors, category: undefined })
                }}
              >
                <Icon
                  className="category-icon"
                  size={20}
                  strokeWidth={1.75}
                  aria-hidden="true"
                />
                <span className="category-copy">
                  <strong>{label}</strong>
                  <small>{hint}</small>
                </span>
                {selected && (
                  <span className="category-check">
                    <Check size={13} strokeWidth={2.5} aria-hidden="true" />
                  </span>
                )}
              </button>
            )
          })}
        </div>
        {errors.category && (
          <FieldError id="category-error">{errors.category}</FieldError>
        )}
      </fieldset>

      <div className="field-group">
        <label htmlFor="feedback-message">Your feedback</label>
        <div className="textarea-wrap">
          <textarea
            id="feedback-message"
            rows={6}
            maxLength={1000}
            value={message}
            disabled={isSubmitting}
            aria-invalid={Boolean(errors.message)}
            aria-describedby={
              errors.message
                ? "message-error character-count"
                : "character-count"
            }
            placeholder="What happened, and what would make it better?"
            onChange={(event) => {
              setMessage(event.target.value)
              if (errors.message) setErrors({ ...errors, message: undefined })
            }}
          />
          <span
            id="character-count"
            className={`character-count ${counterTone}`}
          >
            {message.length} / 1000
          </span>
        </div>
        {errors.message && (
          <FieldError id="message-error">{errors.message}</FieldError>
        )}
      </div>

      {submitError && (
        <div className="error-banner" role="status" aria-live="polite">
          <AlertCircle size={19} strokeWidth={2} aria-hidden="true" />
          <span>{submitError}</span>
          <button type="button" onClick={() => submit()}>
            Retry
          </button>
        </div>
      )}

      <button
        className="primary-button send-button"
        type="submit"
        disabled={isSubmitting}
      >
        {isSubmitting ? (
          <>
            <span className="spinner" aria-hidden="true" />
            Sending...
          </>
        ) : (
          <>{clubName ? `Send feedback to ${clubName}` : "Send feedback"}</>
        )}
      </button>
      <p className="privacy-note">No account or name needed.</p>
    </form>
  )
}

function ThoughtsSection() {
  const steps = [
    [
      "01",
      "Name the moment",
      "A detail about an event, workshop, or meeting gives your note context.",
    ],
    [
      "02",
      "Say what could help",
      "A clear suggestion makes it easier to act on what you noticed.",
    ],
    [
      "03",
      "Keep it yours",
      "Write in your own words. A short, honest note is enough.",
    ],
  ]

  return (
    <section className="thoughts-section" id="thoughts">
      <div className="section-heading">
        <p className="eyebrow">Thoughts worth sharing</p>
        <h2>Make your note clear, kind, and useful.</h2>
      </div>
      <div className="steps">
        {steps.map(([number, title, copy]) => (
          <article className="step" key={number}>
            <span className="step-number">{number}</span>
            <div>
              <h3>{title}</h3>
              <p>{copy}</p>
            </div>
          </article>
        ))}
      </div>
    </section>
  )
}

function Footer() {
  return (
    <footer className="site-footer">
      <div className="footer-inner">
        <div>
          <Logo />
          <p>A place to share campus club feedback.</p>
        </div>
        <p className="copyright">2026 ClubPulse</p>
      </div>
    </footer>
  )
}

export default function App() {
  const [theme, setTheme] = useState<Theme>(() =>
    document.documentElement.dataset.theme === "light" ? "light" : "dark",
  )

  useEffect(() => {
    document.documentElement.dataset.theme = theme
    document.querySelector('meta[name="theme-color"]')?.setAttribute(
      "content",
      theme === "dark" ? "#07111f" : "#f1f5f8",
    )
    try {
      window.localStorage.setItem("clubpulse-theme", theme)
    } catch {
      // The selected theme still applies for this session if storage is unavailable.
    }
  }, [theme])

  return (
    <div id="top">
      <Header theme={theme} onToggleTheme={() => setTheme(theme === "dark" ? "light" : "dark")} />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <div className="hero-copy-main">
              <p className="eyebrow">
                BMSCE clubs / campus feedback
              </p>
              <h1>Your club. <span>Your voice.</span></h1>
              <p className="hero-description">
                Tell your club what worked and what didn't. Pick a club, write
                it down, and help shape what comes next.
              </p>
              <a className="hero-link" href="#feedback">
                Leave a thoughtful note
              </a>
            </div>
          </div>
          <div className="form-card" id="feedback">
            <FeedbackForm />
          </div>
        </section>
        <ThoughtsSection />
      </main>
      <Footer />
    </div>
  )
}
