import React, { useRef, useState } from "react";
import {
  ArrowLeft,
  ArrowRight,
  Check,
  CheckCircle2,
  Eye,
  EyeOff,
  Fingerprint,
  LockKeyhole,
  Mail,
  ShieldCheck,
  Sparkles,
} from "lucide-react";

const API = import.meta.env.VITE_API_URL || "http://localhost:5000/api/auth";

export default function App() {
  const [mode, setMode] = useState("login");
  const [stage, setStage] = useState("credentials");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [otp, setOtp] = useState(Array(6).fill(""));
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [user, setUser] = useState(() => {
    try {
      return JSON.parse(localStorage.getItem("postmark-user"));
    } catch {
      return null;
    }
  });
  const otpRefs = useRef([]);
  const update = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const request = async (path, body) => {
    const response = await fetch(`${API}/${path}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    const data = await response.json().catch(() => ({}));
    if (!response.ok)
      throw new Error(
        data.message || "Something went wrong. Please try again.",
      );
    return data;
  };
  const submitCredentials = async (e) => {
    e.preventDefault();
    setError("");
    setNotice("");
    setBusy(true);
    try {
      if (mode === "register") {
        const data = await request("register", form);
        setNotice(
          data.message || "Your account is ready. Sign in to continue.",
        );
        setMode("login");
        setForm({ ...form, password: "" });
      } else {
        await request("login", { email: form.email, password: form.password });
        setStage("otp");
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const submitOtp = async (e) => {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const data = await request("verify-otp", {
        email: form.email,
        otp: otp.join(""),
      });
      localStorage.setItem("postmark-token", data.token);
      localStorage.setItem("postmark-user", JSON.stringify(data.user));
      setUser(data.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };
  const onOtpChange = (index, value) => {
    const digit = value.replace(/\D/g, "").slice(-1);
    const next = [...otp];
    next[index] = digit;
    setOtp(next);
    if (digit && index < 5) otpRefs.current[index + 1]?.focus();
  };
  const onOtpKey = (index, e) => {
    if (e.key === "Backspace" && !otp[index] && index > 0)
      otpRefs.current[index - 1]?.focus();
  };
  const logout = () => {
    localStorage.removeItem("postmark-token");
    localStorage.removeItem("postmark-user");
    setUser(null);
    setStage("credentials");
    setForm({ name: "", email: "", password: "" });
    setOtp(Array(6).fill(""));
  };
  const changeMode = (next) => {
    setMode(next);
    setError("");
    setNotice("");
    setStage("credentials");
  };

  return (
    <main className="shell">
      <header className="topbar">
        <a className="brand" href="#">
          <span className="brand-icon">
            <Mail size={18} />
          </span>
          postmark<span className="brand-dot">.</span>
        </a>
        <div className="top-note">
          <span className="status-dot" /> Secure access, made simple
        </div>
        <a className="help-link" href="mailto:support@postmark.app">
          Need help?
        </a>
      </header>
      <section className="layout">
        <div className="hero">
          <div className="hero-copy">
            <div className="eyebrow">
              <Sparkles size={14} /> YOUR INBOX, IN SAFE HANDS
            </div>
            <h1>
              A little more
              <br />
              peace of <span>mind.</span>
            </h1>
            <p>
              Good things start with a secure sign in. We’ll send a one time
              code to your email to make sure it’s really you.
            </p>
            <div className="trust-list">
              <div>
                <span className="trust-icon">
                  <ShieldCheck size={17} />
                </span>
                <span>
                  <b>Security that feels effortless</b>
                  <small>Your account is protected at every step.</small>
                </span>
              </div>
              <div>
                <span className="trust-icon">
                  <Fingerprint size={17} />
                </span>
                <span>
                  <b>Just you, every time</b>
                  <small>One time codes keep access personal.</small>
                </span>
              </div>
            </div>
          </div>
          <div className="hero-bottom">
            <div className="avatar-stack">
              <span>J</span>
              <span>M</span>
              <span>A</span>
              <span>+</span>
            </div>
            <p>
              <b>Loved by people who value privacy</b>
              <small>Thoughtful security for everyday life.</small>
            </p>
            <div className="hero-sparkle">✳</div>
          </div>
        </div>
        <div className="form-side">
          <div className="auth-card">
            {user ? (
              <div className="success-state">
                <div className="success-mark">
                  <CheckCircle2 size={31} />
                </div>
                <div className="eyebrow centered">YOU’RE ALL SET</div>
                <h2>Welcome in, {user.name?.split(" ")[0]}.</h2>
                <p>
                  You’ve signed in securely with your email. Your account is
                  ready whenever you are.
                </p>
                <div className="account-chip">
                  <span className="mini-avatar">
                    {user.name?.[0]?.toUpperCase()}
                  </span>
                  <span>
                    <b>{user.name}</b>
                    <small>{user.email}</small>
                  </span>
                  <Check size={17} />
                </div>
                <button className="primary-btn" onClick={logout}>
                  Sign out <ArrowRight size={17} />
                </button>
              </div>
            ) : stage === "otp" ? (
              <>
                <button
                  className="back-button"
                  onClick={() => {
                    setStage("credentials");
                    setError("");
                  }}
                >
                  <ArrowLeft size={16} /> Back
                </button>
                <div className="card-icon">
                  <Mail size={20} />
                </div>
                <div className="eyebrow">ONE LAST STEP</div>
                <h2>Check your inbox.</h2>
                <p className="card-intro">
                  We sent a 6 digit sign in code to <b>{form.email}</b>. It’s
                  valid for 5 minutes.
                </p>
                <form onSubmit={submitOtp}>
                  <div
                    className="otp-row"
                    aria-label="Six digit verification code"
                  >
                    {otp.map((digit, i) => (
                      <input
                        key={i}
                        ref={(el) => (otpRefs.current[i] = el)}
                        inputMode="numeric"
                        autoComplete={i === 0 ? "one-time-code" : "off"}
                        aria-label={`Digit ${i + 1}`}
                        value={digit}
                        onChange={(e) => onOtpChange(i, e.target.value)}
                        onKeyDown={(e) => onOtpKey(i, e)}
                        onPaste={(e) => {
                          const digits = e.clipboardData
                            .getData("text")
                            .replace(/\D/g, "")
                            .slice(0, 6)
                            .split("");
                          if (digits.length) {
                            e.preventDefault();
                            setOtp(
                              Array.from(
                                { length: 6 },
                                (_, j) => digits[j] || "",
                              ),
                            );
                            otpRefs.current[
                              Math.min(digits.length, 5)
                            ]?.focus();
                          }
                        }}
                      />
                    ))}
                  </div>
                  {error && <div className="alert error-alert">{error}</div>}
                  <button
                    className="primary-btn"
                    disabled={busy || otp.join("").length !== 6}
                  >
                    {busy ? (
                      <>
                        <span className="spinner" /> Verifying…
                      </>
                    ) : (
                      <>
                        Verify & sign in <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
                <div className="resend-note">
                  Didn’t get the email?{" "}
                  <button
                    onClick={async () => {
                      setError("");
                      setBusy(true);
                      try {
                        await request("login", {
                          email: form.email,
                          password: form.password,
                        });
                        setNotice("A fresh code is on its way.");
                      } catch (err) {
                        setError(err.message);
                      } finally {
                        setBusy(false);
                      }
                    }}
                  >
                    Send a new code
                  </button>
                </div>
                {notice && <div className="notice">{notice}</div>}
              </>
            ) : (
              <>
                <div className="card-icon">
                  <LockKeyhole size={19} />
                </div>
                <div className="eyebrow">
                  {mode === "login" ? "WELCOME BACK" : "A FRESH START"}
                </div>
                <h2>
                  {mode === "login"
                    ? "Sign in to your space."
                    : "Create your account."}
                </h2>
                <p className="card-intro">
                  {mode === "login"
                    ? "Your inbox is right where you left it."
                    : "A few details and you’re on your way."}
                </p>
                {notice && <div className="notice">{notice}</div>}
                <form onSubmit={submitCredentials} className="auth-form">
                  {mode === "register" && (
                    <label>
                      Your name
                      <div className="input-wrap">
                        <input
                          name="name"
                          type="text"
                          placeholder="e.g. Alex Morgan"
                          value={form.name}
                          onChange={update}
                          autoComplete="name"
                          required
                        />
                        <span className="input-icon">✳</span>
                      </div>
                    </label>
                  )}
                  <label>
                    Email address
                    <div className="input-wrap">
                      <input
                        name="email"
                        type="email"
                        placeholder="you@example.com"
                        value={form.email}
                        onChange={update}
                        autoComplete="email"
                        required
                      />
                      <Mail className="input-icon" size={17} />
                    </div>
                  </label>
                  <label>
                    Password
                    <div className="input-wrap">
                      <input
                        name="password"
                        type={showPassword ? "text" : "password"}
                        placeholder={
                          mode === "register"
                            ? "At least 8 characters"
                            : "Enter your password"
                        }
                        value={form.password}
                        onChange={update}
                        autoComplete={
                          mode === "login" ? "current-password" : "new-password"
                        }
                        minLength={mode === "register" ? 8 : undefined}
                        required
                      />
                      <button
                        type="button"
                        className="input-icon eye-button"
                        aria-label={
                          showPassword ? "Hide password" : "Show password"
                        }
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? (
                          <EyeOff size={17} />
                        ) : (
                          <Eye size={17} />
                        )}
                      </button>
                    </div>
                  </label>
                  {error && <div className="alert error-alert">{error}</div>}
                  <button className="primary-btn" disabled={busy}>
                    {busy ? (
                      <>
                        <span className="spinner" /> Please wait…
                      </>
                    ) : (
                      <>
                        {mode === "login"
                          ? "Continue with email"
                          : "Create account"}{" "}
                        <ArrowRight size={17} />
                      </>
                    )}
                  </button>
                </form>
                <div className="switch-mode">
                  {mode === "login" ? (
                    <>
                      New around here?{" "}
                      <button onClick={() => changeMode("register")}>
                        Create an account
                      </button>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <button onClick={() => changeMode("login")}>
                        Sign in
                      </button>
                    </>
                  )}
                </div>
              </>
            )}
            <div className="card-footer">
              <span>
                <ShieldCheck size={14} /> Your information is encrypted
              </span>
              <span>
                Terms <i>·</i> Privacy
              </span>
            </div>
          </div>
          <div className="under-note">
            <span className="under-icon">✳</span> Made for a calmer kind of
            inbox.
          </div>
        </div>
      </section>
      <footer className="page-footer">
        <span>© 2025 Postmark Studio</span>
        <span>
          Designed with care <b>♥</b>
        </span>
        <span>Built around your privacy</span>
      </footer>
    </main>
  );
}

