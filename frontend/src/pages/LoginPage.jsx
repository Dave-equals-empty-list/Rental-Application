import { useEffect, useState } from "react";
import { Link, Navigate, useNavigate } from "react-router-dom";
import Logo from "../components/Logo";
import RentalIllustration from "../components/RentalIllustration";
import { HOME_BY_ROLE, useAuth } from "../auth/useAuth";
import "./LoginPage.css";

const SLIDES = [
  {
    title: "Every application in one place.",
    body: "Tenants apply once, and landlords see every applicant, job and rental history together.",
  },
  {
    title: "See who needs a home soonest.",
    body: "Applications are ranked by how close each applicant's current lease is to ending.",
  },
  {
    title: "Reviews you can trust.",
    body: "Anonymous ratings build a reputation for tenants, landlords and agents alike.",
  },
];

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/* ── Icons ─────────────────────────────────────────────────────────────── */
const MailIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="2.5" y="4.5" width="15" height="11" rx="2" /><path d="m3 5.5 7 5.2 7-5.2" /></svg>
);
const LockIcon = () => (
  <svg viewBox="0 0 20 20" aria-hidden="true"><rect x="4" y="9" width="12" height="8.5" rx="2" /><path d="M6.8 9V6.5a3.2 3.2 0 0 1 6.4 0V9" /><path d="M10 12.4v2" /></svg>
);
const EyeIcon = ({ crossed }) => (
  <svg viewBox="0 0 20 20" aria-hidden="true">
    <path d="M2 10s3-5.5 8-5.5S18 10 18 10s-3 5.5-8 5.5S2 10 2 10Z" />
    <circle cx="10" cy="10" r="2.5" />
    {crossed && <path d="m3.5 3.5 13 13" />}
  </svg>
);

export default function LoginPage() {
  const { user, login } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [remember, setRemember] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [slide, setSlide] = useState(0);

  // Rotate the showcase captions; restarts whenever someone picks a slide.
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const id = setInterval(() => setSlide((s) => (s + 1) % SLIDES.length), 6000);
    return () => clearInterval(id);
  }, [slide]);

  if (user) return <Navigate to={HOME_BY_ROLE[user.role] ?? "/properties"} replace />;

  function showUnavailable(feature) {
    setError("");
    setNotice(`${feature} isn't available yet.`);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setNotice("");

    if (!EMAIL_PATTERN.test(email.trim())) {
      setError("Enter the email address you used to create your account.");
      return;
    }
    if (!password) {
      setError("Enter your password.");
      return;
    }

    setSubmitting(true);
    try {
      // NOTE: the backend has no password check yet, so only the email is verified.
      const found = await login(email, { remember });
      navigate(HOME_BY_ROLE[found.role] ?? "/properties", { replace: true });
    } catch (err) {
      setError(
        err.code === "NOT_FOUND"
          ? "No account uses that email. Check the spelling, or create an account."
          : "Can't reach the Investorgate server. Start the backend on localhost:5120, then try again."
      );
      setSubmitting(false);
    }
  }

  const current = SLIDES[slide];

  return (
    <main className="login-shell">
      <div className="login-card">
        {/* ── Form panel ─────────────────────────────────────────────── */}
        <section className="login-panel" aria-labelledby="login-title">
          <div className="login-panel__inner">
            <Logo />

            <h1 id="login-title" className="login-title">Log in to your account</h1>
            <p className="login-lede">Welcome back. Log in with your email and password.</p>

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              {(error || notice) && (
                <p className={error ? "form-alert form-alert--error" : "form-alert"} role={error ? "alert" : "status"}>
                  {error || notice}
                </p>
              )}

              <label className="field">
                <span className="visually-hidden">Email</span>
                <MailIcon />
                <input
                  type="email"
                  name="email"
                  autoComplete="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  aria-invalid={error.startsWith("Enter the email") || undefined}
                />
              </label>

              <div className="field">
                <label htmlFor="password" className="visually-hidden">Password</label>
                <LockIcon />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  name="password"
                  autoComplete="current-password"
                  placeholder="Password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  aria-invalid={error === "Enter your password." || undefined}
                />
                <button
                  type="button"
                  className="field__toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  aria-pressed={showPassword}
                >
                  <EyeIcon crossed={!showPassword} />
                </button>
              </div>

              <div className="form-row">
                <label className="remember">
                  <input type="checkbox" checked={remember} onChange={(e) => setRemember(e.target.checked)} />
                  Remember me
                </label>
                <button type="button" className="text-link" onClick={() => showUnavailable("Password reset")}>
                  Forgot password?
                </button>
              </div>

              <button type="submit" className="btn-primary" disabled={submitting}>
                {submitting && <span className="spinner" aria-hidden="true" />}
                {submitting ? "Logging in" : "Log in"}
              </button>
            </form>

            <p className="login-footer">
              Don't have an account? <Link to="/signup" className="text-link">Create an account</Link>
            </p>
          </div>
        </section>

        {/* ── Showcase panel ─────────────────────────────────────────── */}
        <aside className="showcase" aria-label="About Investorgate">
          <RentalIllustration />
          <div className="showcase__caption" key={slide} aria-live="polite">
            <h2>{current.title}</h2>
            <p>{current.body}</p>
          </div>
          <div className="showcase__dots">
            {SLIDES.map((s, i) => (
              <button
                key={s.title}
                type="button"
                className="dot"
                aria-label={`Show slide ${i + 1} of ${SLIDES.length}`}
                aria-current={i === slide || undefined}
                onClick={() => setSlide(i)}
              />
            ))}
          </div>
        </aside>
      </div>
    </main>
  );
}
