import { FormEvent, KeyboardEvent, useRef, useState } from "react"
import {
  AlertCircle,
  CalendarDays,
  Check,
  CheckCircle2,
  Lightbulb,
  LockKeyhole,
  MessageCircle,
  Send,
  ShieldCheck,
  UserRoundX,
  UsersRound,
} from "lucide-react"

type Category = "Event" | "Management" | "Workshop" | "Other"
type FormErrors = Partial<Record<"clubName" | "category" | "message", string>>

const API_URL = (import.meta.env.VITE_API_URL || "http://localhost:5000").replace(
  /\/$/,
  "",
)

const categories: Array<{
  value: Category
  hint: string
  Icon: typeof CalendarDays
}> = [
  { value: "Event", hint: "Fests, meets, competitions", Icon: CalendarDays },
  {
    value: "Management",
    hint: "Leadership, communication, organisation",
    Icon: UsersRound,
  },
  {
    value: "Workshop",
    hint: "Sessions, talks, hands-on learning",
    Icon: Lightbulb,
  },
  { value: "Other", hint: "Anything else on your mind", Icon: MessageCircle },
]

const suggestions = [
  "Coding Club",
  "Rotaract",
  "Dramatics",
  "Debate Society",
  "Music Club",
]

function PulseMark({ success = false }: { success?: boolean }) {
  return (
    <svg
      className={success ? "pulse-mark pulse-mark--success" : "pulse-mark"}
      viewBox="0 0 88 28"
      aria-hidden="true"
    >
      <path
        d={
          success
            ? "M3 15h16l6-8 9 15 9-11 6 5 12-13"
            : "M2 15h19l5-7 8 15 9-20 9 22 7-10h27"
        }
      />
      {success && <path className="success-check" d="m60 13 8 8L85 4" />}
    </svg>
  )
}

function Logo() {
  return (
    <a className="logo" href="#top" aria-label="ClubPulse, back to top">
      <span>ClubPulse</span>
      <PulseMark />
    </a>
  )
}

function Header() {
  return (
    <header className="site-header">
      <div className="header-inner">
        <Logo />
        <nav className="header-actions" aria-label="Primary navigation">
          <a className="how-link" href="#how-it-works">
            How it works
          </a>
          <div className="anonymous-pill">
            <LockKeyhole size={15} strokeWidth={1.75} aria-hidden="true" />
            <span>100% anonymous</span>
          </div>
        </nav>
      </div>
    </header>
  )
}

function FieldError({ id, children }: { id: string; children: string }) {
  return (
    <p className="field-error" id={id} role="alert">
      <AlertCircle size={15} strokeWidth={2} aria-hidden="true" />
      {children}
    </p>
  )
}

function SuccessPanel({ onReset }: { onReset: () => void }) {
  return (
    <div className="success-panel" aria-live="polite">
      <div className="success-icon">
        <PulseMark success />
      </div>
      <p className="success-kicker">Feedback sent</p>
      <h2>Thanks, that was heard.</h2>
      <p>Your feedback was sent anonymously.</p>
      <div className="success-actions">
        <button className="primary-button" type="button" onClick={onReset}>
          <MessageCircle size={19} strokeWidth={1.75} aria-hidden="true" />
          Send another
        </button>
        <a className="text-action" href="#top">
          Back to top
        </a>
      </div>
    </div>
  )
}

function FeedbackForm() {
  const [clubName, setClubName] = useState("")
  const [category, setCategory] = useState<Category | "">("")
  const [message, setMessage] = useState("")
  const [errors, setErrors] = useState<FormErrors>({})
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const clubInputRef = useRef<HTMLInputElement>(null)
  const submissionInProgressRef = useRef(false)

  const validate = () => {
    const nextErrors: FormErrors = {}
    if (!clubName.trim()) nextErrors.clubName = "Enter the club name."
    if (!category) nextErrors.category = "Pick a category."
    if (message.trim().length < 12) {
      nextErrors.message = "Write at least a sentence of feedback."
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
    setCategory("")
    setMessage("")
    setErrors({})
    setSubmitError(null)
    setIsSuccess(false)
    window.setTimeout(() => clubInputRef.current?.focus(), 50)
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
          <p className="form-eyebrow">A quiet word</p>
          <h2>Share your feedback</h2>
          <p>Your response is anonymous.</p>
        </div>
        <ShieldCheck size={25} strokeWidth={1.5} aria-hidden="true" />
      </div>

      <div className="field-group">
        <label htmlFor="club-name">Club name</label>
        <input
          ref={clubInputRef}
          id="club-name"
          type="text"
          value={clubName}
          disabled={isSubmitting}
          aria-invalid={Boolean(errors.clubName)}
          aria-describedby={errors.clubName ? "club-name-error" : undefined}
          placeholder="e.g. Coding Club, Rotaract, Dramatics"
          onChange={(event) => {
            setClubName(event.target.value)
            if (errors.clubName) setErrors({ ...errors, clubName: undefined })
          }}
        />
        {errors.clubName && (
          <FieldError id="club-name-error">{errors.clubName}</FieldError>
        )}
        <div
          className="suggestions"
          role="group"
          aria-label="Club name suggestions"
        >
          {suggestions.map((suggestion) => (
            <button
              className={
                clubName === suggestion
                  ? "suggestion-chip is-active"
                  : "suggestion-chip"
              }
              type="button"
              key={suggestion}
              disabled={isSubmitting}
              onClick={() => {
                setClubName(suggestion)
                setErrors({ ...errors, clubName: undefined })
              }}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>

      <fieldset className="field-group">
        <legend>What is this about?</legend>
        <div
          className="category-grid"
          role="radiogroup"
          aria-invalid={Boolean(errors.category)}
          aria-describedby={errors.category ? "category-error" : undefined}
        >
          {categories.map(({ value, hint, Icon }, index) => {
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
                  <strong>{value}</strong>
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
            placeholder="What went well? What could be better? Be specific, it helps."
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
        <div className="error-banner" role="alert">
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
            Sending…
          </>
        ) : (
          <>
            Send feedback
            <Send size={19} strokeWidth={1.75} aria-hidden="true" />
          </>
        )}
      </button>
      <p className="privacy-note">
        <LockKeyhole size={14} strokeWidth={1.75} aria-hidden="true" />
        Submitting won't reveal your identity.
      </p>
    </form>
  )
}

function ReassuranceList() {
  const points = [
    { Icon: CheckCircle2, text: "No sign-up needed" },
    { Icon: UserRoundX, text: "We don't ask who you are" },
    { Icon: MessageCircle, text: "Max 1000 characters, say it clearly" },
  ]

  return (
    <div className="reassurances">
      {points.map(({ Icon, text }) => (
        <div className="reassurance" key={text}>
          <Icon size={19} strokeWidth={1.75} aria-hidden="true" />
          <span>{text}</span>
        </div>
      ))}
    </div>
  )
}

function HowItWorks() {
  const steps = [
    [
      "01",
      "Pick a club and category",
      "Start with where your feedback belongs.",
    ],
    [
      "02",
      "Write your honest feedback",
      "Specific, thoughtful words help most.",
    ],
    ["03", "Send it anonymously", "No account, name or profile attached."],
  ]

  return (
    <section className="how-section" id="how-it-works">
      <div className="section-heading">
        <p className="eyebrow">Simple by design</p>
        <h2>Say what matters in a minute.</h2>
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

function WhyAnonymous() {
  const principles = [
    "No accounts, no tracking of who you are",
    "Feedback goes to the club's team to improve",
    "Specific is better than harsh",
  ]

  return (
    <section className="why-section">
      <div>
        <p className="eyebrow">Why anonymous?</p>
        <h2>Honest feedback needs a safe place.</h2>
      </div>
      <div className="principles">
        {principles.map((principle, index) => (
          <div className="principle" key={principle}>
            <span>{String(index + 1).padStart(2, "0")}</span>
            <p>{principle}</p>
          </div>
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
          <p>Built by a student, for students.</p>
        </div>
        <p className="copyright">© 2026 ClubPulse</p>
      </div>
    </footer>
  )
}

export default function App() {
  return (
    <div id="top">
      <Header />
      <main>
        <section className="hero">
          <div className="hero-copy">
            <p className="eyebrow">
              <span aria-hidden="true" />
              Anonymous · Takes 1 minute
            </p>
            <h1>Tell your club what you really think.</h1>
            <p className="hero-description">
              Share honest feedback about events, workshops or how a club is
              run. No account. No name. Just your words.
            </p>
            <div className="hero-pulse">
              <PulseMark />
            </div>
            <ReassuranceList />
          </div>
          <div className="form-card">
            <FeedbackForm />
          </div>
          <div className="mobile-reassurances">
            <ReassuranceList />
          </div>
        </section>
        <HowItWorks />
        <WhyAnonymous />
      </main>
      <Footer />
    </div>
  )
}
