import { useState, useEffect, createContext, useContext } from "react";

// ── API ──────────────────────────────────────────────────────────────────────
const API = "http://localhost:8000";

async function apiFetch(path, options = {}, token = null) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;
  const res = await fetch(`${API}${path}`, { ...options, headers });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ detail: "Unknown error" }));
    throw new Error(err.detail || "Request failed");
  }
  return res.json();
}

// ── Auth Context ─────────────────────────────────────────────────────────────
const AuthContext = createContext(null);
function useAuth() {
  return useContext(AuthContext);
}

// ── Icons (SVG inline) ───────────────────────────────────────────────────────
const Icon = {
  Stethoscope: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      width="20"
      height="20"
    >
      <path d="M4.8 2.3A.3.3 0 1 0 5 2H4a2 2 0 0 0-2 2v5a6 6 0 0 0 6 6 6 6 0 0 0 6-6V4a2 2 0 0 0-2-2h-1a.2.2 0 1 0 .3.3" />
      <path d="M8 15v1a6 6 0 0 0 6 6v0a6 6 0 0 0 6-6v-4" />
      <circle cx="20" cy="10" r="2" />
    </svg>
  ),
  Calendar: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      width="20"
      height="20"
    >
      <rect x="3" y="4" width="18" height="18" rx="2" />
      <path d="M16 2v4M8 2v4M3 10h18" />
    </svg>
  ),
  Users: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      width="20"
      height="20"
    >
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" />
    </svg>
  ),
  Logout: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      width="20"
      height="20"
    >
      <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9" />
    </svg>
  ),
  Plus: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="16"
      height="16"
    >
      <path d="M12 5v14M5 12h14" />
    </svg>
  ),
  X: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      width="18"
      height="18"
    >
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  ),
  Check: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      width="16"
      height="16"
    >
      <path d="M20 6 9 17l-5-5" />
    </svg>
  ),
  Clock: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      width="16"
      height="16"
    >
      <circle cx="12" cy="12" r="10" />
      <path d="M12 6v6l4 2" />
    </svg>
  ),
  User: () => (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      width="20"
      height="20"
    >
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20c0-4 3.6-7 8-7s8 3 8 7" />
    </svg>
  ),
};

// ── Styles ───────────────────────────────────────────────────────────────────
const styles = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #080c10;
    --surface: #0e1419;
    --surface2: #151c24;
    --border: #1e2a36;
    --accent: #00d4aa;
    --accent2: #0099ff;
    --danger: #ff4757;
    --warning: #ffa502;
    --text: #e8edf2;
    --muted: #5a6a7a;
    --radius: 12px;
  }

  body { background: var(--bg); color: var(--text); font-family: 'DM Sans', sans-serif; min-height: 100vh; }

  h1, h2, h3, h4 { font-family: 'Syne', sans-serif; }

  .app { min-height: 100vh; }

  /* ── Login ── */
  .login-wrap {
    min-height: 100vh; display: flex; align-items: center; justify-content: center;
    background: radial-gradient(ellipse 80% 60% at 50% -10%, #00d4aa18, transparent),
                radial-gradient(ellipse 60% 40% at 80% 80%, #0099ff10, transparent);
  }
  .login-card {
    background: var(--surface); border: 1px solid var(--border); border-radius: 20px;
    padding: 48px 40px; width: 100%; max-width: 420px;
    box-shadow: 0 40px 80px #00000060;
    animation: fadeUp .5s ease;
  }
  .login-logo { display: flex; align-items: center; gap: 10px; margin-bottom: 36px; }
  .login-logo-icon {
    width: 44px; height: 44px; border-radius: 12px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center; color: #000;
  }
  .login-logo h1 { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; }
  .login-logo span { color: var(--accent); }
  .login-subtitle { color: var(--muted); font-size: 14px; margin-bottom: 32px; }

  /* ── Form ── */
  .field { margin-bottom: 18px; }
  .field label { display: block; font-size: 12px; font-weight: 500; color: var(--muted); margin-bottom: 8px; letter-spacing: .5px; text-transform: uppercase; }
  .field input, .field select {
    width: 100%; padding: 12px 16px; background: var(--surface2);
    border: 1px solid var(--border); border-radius: var(--radius);
    color: var(--text); font-family: 'DM Sans', sans-serif; font-size: 15px;
    transition: border-color .2s;
    appearance: none;
  }
  .field input:focus, .field select:focus { outline: none; border-color: var(--accent); }
  .field select option { background: var(--surface2); }

  .btn {
    display: inline-flex; align-items: center; gap: 8px;
    padding: 12px 20px; border-radius: var(--radius); border: none;
    font-family: 'Syne', sans-serif; font-size: 14px; font-weight: 600;
    cursor: pointer; transition: all .2s; letter-spacing: .3px;
  }
  .btn-primary {
    background: linear-gradient(135deg, var(--accent), #00b894);
    color: #000; width: 100%; justify-content: center; font-size: 15px; padding: 14px;
  }
  .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 8px 24px #00d4aa40; }
  .btn-ghost { background: transparent; color: var(--muted); border: 1px solid var(--border); }
  .btn-ghost:hover { border-color: var(--accent); color: var(--accent); }
  .btn-danger { background: #ff475720; color: var(--danger); border: 1px solid #ff475740; }
  .btn-danger:hover { background: #ff475740; }
  .btn-sm { padding: 7px 12px; font-size: 12px; border-radius: 8px; }
  .btn:disabled { opacity: .5; cursor: not-allowed; transform: none !important; }

  /* ── Layout ── */
  .layout { display: flex; min-height: 100vh; }

  .sidebar {
    width: 240px; min-height: 100vh; background: var(--surface);
    border-right: 1px solid var(--border); display: flex; flex-direction: column;
    padding: 24px 16px; position: fixed; top: 0; left: 0; bottom: 0;
  }
  .sidebar-logo { display: flex; align-items: center; gap: 10px; padding: 8px 12px; margin-bottom: 32px; }
  .sidebar-logo-icon {
    width: 36px; height: 36px; border-radius: 10px;
    background: linear-gradient(135deg, var(--accent), var(--accent2));
    display: flex; align-items: center; justify-content: center; color: #000; flex-shrink: 0;
  }
  .sidebar-logo h2 { font-size: 18px; font-weight: 800; }
  .sidebar-logo span { color: var(--accent); }

  .nav { flex: 1; display: flex; flex-direction: column; gap: 4px; }
  .nav-item {
    display: flex; align-items: center; gap: 12px; padding: 11px 14px;
    border-radius: 10px; cursor: pointer; transition: all .15s;
    color: var(--muted); font-size: 14px; font-weight: 500; border: none;
    background: transparent; width: 100%; text-align: left;
  }
  .nav-item:hover { background: var(--surface2); color: var(--text); }
  .nav-item.active { background: #00d4aa15; color: var(--accent); }
  .nav-item.active svg { stroke: var(--accent); }

  .sidebar-user {
    border-top: 1px solid var(--border); padding-top: 16px; margin-top: 16px;
  }
  .sidebar-user-info { display: flex; align-items: center; gap: 10px; padding: 10px 12px; margin-bottom: 4px; }
  .avatar {
    width: 36px; height: 36px; border-radius: 50%;
    background: linear-gradient(135deg, var(--accent2), var(--accent));
    display: flex; align-items: center; justify-content: center;
    font-family: 'Syne', sans-serif; font-weight: 700; font-size: 14px; color: #fff;
    flex-shrink: 0;
  }
  .sidebar-user-name { font-size: 13px; font-weight: 500; }
  .sidebar-user-role {
    font-size: 11px; color: var(--muted);
    background: var(--surface2); border-radius: 20px;
    padding: 2px 8px; display: inline-block; margin-top: 2px;
    text-transform: capitalize;
  }

  .main { margin-left: 240px; flex: 1; padding: 32px; }

  /* ── Page header ── */
  .page-header { margin-bottom: 28px; }
  .page-header h2 { font-size: 26px; font-weight: 800; letter-spacing: -0.5px; }
  .page-header p { color: var(--muted); font-size: 14px; margin-top: 4px; }

  /* ── Stats ── */
  .stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 16px; margin-bottom: 28px; }
  .stat-card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); padding: 20px 24px;
    animation: fadeUp .4s ease both;
  }
  .stat-label { font-size: 12px; color: var(--muted); text-transform: uppercase; letter-spacing: .5px; margin-bottom: 8px; }
  .stat-value { font-family: 'Syne', sans-serif; font-size: 32px; font-weight: 800; }
  .stat-value.accent { color: var(--accent); }
  .stat-value.blue { color: var(--accent2); }
  .stat-value.warn { color: var(--warning); }
  .stat-value.danger { color: var(--danger); }

  /* ── Table ── */
  .card {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: var(--radius); overflow: hidden;
    animation: fadeUp .5s ease both;
  }
  .card-header {
    display: flex; align-items: center; justify-content: space-between;
    padding: 20px 24px; border-bottom: 1px solid var(--border);
  }
  .card-header h3 { font-size: 16px; font-weight: 700; }

  table { width: 100%; border-collapse: collapse; }
  th {
    text-align: left; padding: 12px 24px; font-size: 11px;
    color: var(--muted); text-transform: uppercase; letter-spacing: .5px;
    border-bottom: 1px solid var(--border); font-family: 'Syne', sans-serif;
  }
  td { padding: 14px 24px; font-size: 14px; border-bottom: 1px solid #0e1419; }
  tr:last-child td { border-bottom: none; }
  tr:hover td { background: #ffffff04; }

  /* ── Badge ── */
  .badge {
    display: inline-flex; align-items: center; gap: 5px;
    padding: 3px 10px; border-radius: 20px; font-size: 12px; font-weight: 500;
  }
  .badge-scheduled { background: #0099ff20; color: var(--accent2); }
  .badge-confirmed { background: #00d4aa20; color: var(--accent); }
  .badge-completed { background: #ffffff15; color: var(--muted); }
  .badge-cancelled { background: #ff475720; color: var(--danger); }
  .badge-doctor { background: #0099ff20; color: var(--accent2); }
  .badge-patient { background: #00d4aa20; color: var(--accent); }
  .badge-admin { background: #ffa50220; color: var(--warning); }

  /* ── Modal ── */
  .overlay {
    position: fixed; inset: 0; background: #00000080; backdrop-filter: blur(4px);
    display: flex; align-items: center; justify-content: center; z-index: 100;
    animation: fadeIn .2s ease;
  }
  .modal {
    background: var(--surface); border: 1px solid var(--border);
    border-radius: 20px; padding: 32px; width: 100%; max-width: 480px;
    box-shadow: 0 40px 80px #00000080;
    animation: fadeUp .3s ease;
  }
  .modal-header { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
  .modal-header h3 { font-size: 20px; font-weight: 800; }
  .modal-actions { display: flex; gap: 10px; margin-top: 24px; justify-content: flex-end; }

  /* ── Error ── */
  .error-box {
    background: #ff475715; border: 1px solid #ff475740;
    border-radius: var(--radius); padding: 12px 16px;
    color: var(--danger); font-size: 13px; margin-bottom: 16px;
    display: flex; align-items: center; gap: 8px;
  }

  .empty { text-align: center; padding: 48px; color: var(--muted); font-size: 14px; }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(16px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes fadeIn {
    from { opacity: 0; } to { opacity: 1; }
  }

  .divider { height: 1px; background: var(--border); margin: 24px 0; }
  .flex { display: flex; }
  .gap-2 { gap: 8px; }
  .mt-auto { margin-top: auto; }

    /* ── Toast ── */
  .toast-wrap {
    position: fixed; top: 24px; right: 24px; z-index: 999;
    display: flex; flex-direction: column; gap: 10px;
  }
  .toast {
    display: flex; align-items: center; gap: 12px;
    padding: 14px 18px; border-radius: 12px; min-width: 280px;
    font-size: 14px; font-weight: 500;
    box-shadow: 0 8px 32px #00000060;
    animation: slideIn .3s ease;
  }
  .toast-success { background: #00d4aa20; border: 1px solid #00d4aa40; color: var(--accent); }
  .toast-error   { background: #ff475720; border: 1px solid #ff475740; color: var(--danger); }
  .toast-info    { background: #0099ff20; border: 1px solid #0099ff40; color: var(--accent2); }

  /* ── Spinner ── */
  .spinner {
    width: 18px; height: 18px; border-radius: 50%;
    border: 2px solid #ffffff30;
    border-top-color: currentColor;
    animation: spin .6s linear infinite;
    flex-shrink: 0;
  }
  .spinner-lg {
    width: 36px; height: 36px;
    border: 3px solid #ffffff15;
    border-top-color: var(--accent);
  }

  /* ── Full page loader ── */
  .page-loader {
    position: fixed; inset: 0; background: var(--bg);
    display: flex; flex-direction: column;
    align-items: center; justify-content: center; gap: 16px;
    z-index: 200;
  }
  .page-loader p { color: var(--muted); font-size: 14px; }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(24px); }
    to   { opacity: 1; transform: translateX(0); }
  }
  @keyframes spin {
    to { transform: rotate(360deg); }
  }
`;

// ── Helpers ──────────────────────────────────────────────────────────────────
function initials(name = "") {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}
function fmtDate(d) {
  return new Date(d).toLocaleString("pt-PT", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}
function StatusBadge({ status }) {
  return <span className={`badge badge-${status}`}>{status}</span>;
}
function RoleBadge({ role }) {
  return <span className={`badge badge-${role}`}>{role}</span>;
}
// ── Toast System ─────────────────────────────────────────────────────────────
const ToastContext = createContext(null);
function useToast() {
  return useContext(ToastContext);
}

function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  function show(message, type = "success") {
    const id = Date.now();
    setToasts((t) => [...t, { id, message, type }]);
    setTimeout(() => setToasts((t) => t.filter((x) => x.id !== id)), 4000);
  }

  return (
    <ToastContext.Provider value={show}>
      {children}
      <div className="toast-wrap">
        {toasts.map((t) => (
          <div key={t.id} className={`toast toast-${t.type}`}>
            <span>
              {t.type === "success" ? "✓" : t.type === "error" ? "✕" : "ℹ"}
            </span>
            {t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

// ── Login ────────────────────────────────────────────────────────────────────
function Login({ onLogin }) {
  const [tab, setTab] = useState("login");
  const [form, setForm] = useState({
    full_name: "",
    email: "",
    password: "",
    role: "patient",
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const toast = useToast();

  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  async function submit() {
    setError("");
    if (tab === "register") {
      if (!form.full_name || !form.email || !form.password || !form.role) {
        setError("All fields are required.");
        return;
      }
      if (!/^[a-zA-ZÀ-ÿ\s]+$/.test(form.full_name)) {
        setError("Full name must contain letters only.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setError("Please enter a valid email address.");
        return;
      }
      if (form.password.length < 6) {
        setError("Password must be at least 6 characters.");
        return;
      }
    } else {
      if (!form.email || !form.password) {
        setError("Email and password are required.");
        return;
      }
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
        setError("Please enter a valid email address.");
        return;
      }
    }
    setLoading(true);
    try {
      if (tab === "login") {
        const data = new URLSearchParams({
          username: form.email,
          password: form.password,
        });
        const res = await fetch(`${API}/auth/login`, {
          method: "POST",
          body: data,
        });
        if (!res.ok) throw new Error("Invalid email or password");
        const { access_token } = await res.json();
        const me = await apiFetch("/users/me", {}, access_token);
        toast("Welcome back, " + me.full_name.split(" ")[0] + "!", "success");
        setTimeout(() => onLogin({ token: access_token, user: me }), 600);
      } else {
        await apiFetch("/users/", {
          method: "POST",
          body: JSON.stringify(form),
        });
        toast("Account created! Please sign in.", "success");
        setTab("login");
        setForm((f) => ({ ...f, full_name: "", password: "" }));
      }
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="login-wrap">
      <div className="login-card">
        <div className="login-logo">
          <div className="login-logo-icon">
            <Icon.Stethoscope />
          </div>
          <h1>
            Tele<span>Clinic</span>
          </h1>
        </div>

        <div className="flex gap-2" style={{ marginBottom: 28 }}>
          {["login", "register"].map((t) => (
            <button
              key={t}
              className={`btn ${tab === t ? "btn-primary" : "btn-ghost"}`}
              style={{ flex: 1, justifyContent: "center" }}
              onClick={() => {
                setTab(t);
                setError("");
              }}
            >
              {t === "login" ? "Sign In" : "Register"}
            </button>
          ))}
        </div>

        {error && <div className="error-box">⚠ {error}</div>}

        {tab === "register" && (
          <div className="field">
            <label>Full Name</label>
            <input
              value={form.full_name}
              onChange={set("full_name")}
              placeholder="Dr. Ana Silva"
            />
          </div>
        )}
        <div className="field">
          <label>Email</label>
          <input
            type="email"
            value={form.email}
            onChange={set("email")}
            placeholder="you@example.com"
          />
        </div>
        <div className="field">
          <label>Password</label>
          <input
            type="password"
            value={form.password}
            onChange={set("password")}
            placeholder="••••••••"
          />
        </div>
        {tab === "register" && (
          <div className="field">
            <label>Role</label>
            <select value={form.role} onChange={set("role")}>
              <option value="patient">Patient</option>
              <option value="doctor">Doctor</option>
            </select>
          </div>
        )}

        <button
          className="btn btn-primary"
          onClick={submit}
          disabled={loading}
          style={{ marginTop: 8 }}
        >
          {loading ? (
            <>
              <span className="spinner"></span>
              {tab === "login" ? "Signing in…" : "Creating account…"}
            </>
          ) : tab === "login" ? (
            "Sign In"
          ) : (
            "Create Account"
          )}
        </button>
      </div>
    </div>
  );
}

// ── Sidebar ──────────────────────────────────────────────────────────────────
function Sidebar({ user, page, setPage, onLogout }) {
  const navItems =
    user.role === "doctor"
      ? [
          { id: "dashboard", label: "Dashboard", icon: <Icon.Stethoscope /> },
          {
            id: "appointments",
            label: "Appointments",
            icon: <Icon.Calendar />,
          },
          { id: "patients", label: "Patients", icon: <Icon.Users /> },
        ]
      : [
          {
            id: "appointments",
            label: "My Appointments",
            icon: <Icon.Calendar />,
          },
        ];

  return (
    <div className="sidebar">
      <div className="sidebar-logo">
        <div className="sidebar-logo-icon">
          <Icon.Stethoscope />
        </div>
        <h2>
          Tele<span>Clinic</span>
        </h2>
      </div>

      <nav className="nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${page === item.id ? "active" : ""}`}
            onClick={() => setPage(item.id)}
          >
            {item.icon} {item.label}
          </button>
        ))}
      </nav>

      <div className="sidebar-user mt-auto">
        <div className="sidebar-user-info">
          <div className="avatar">{initials(user.full_name)}</div>
          <div>
            <div className="sidebar-user-name">{user.full_name}</div>
            <span className="sidebar-user-role">{user.role}</span>
          </div>
        </div>
        <button
          className="nav-item"
          onClick={onLogout}
          style={{ color: "#ff4757" }}
        >
          <Icon.Logout /> Sign Out
        </button>
      </div>
    </div>
  );
}

// ── Doctor Dashboard ─────────────────────────────────────────────────────────
function DoctorDashboard({ token, user }) {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/appointments/", {}, token)
      .then(setAppts)
      .finally(() => setLoading(false));
  }, []);

  const counts = {
    total: appts.length,
    scheduled: appts.filter((a) => a.status === "scheduled").length,
    completed: appts.filter((a) => a.status === "completed").length,
    cancelled: appts.filter((a) => a.status === "cancelled").length,
  };

  return (
    <>
      <div className="page-header">
        <h2>Welcome back, {user.full_name.split(" ")[0]} 👋</h2>
        <p>Here's what's happening today</p>
      </div>

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{counts.total}</div>
        </div>
        <div className="stat-card" style={{ animationDelay: ".1s" }}>
          <div className="stat-label">Scheduled</div>
          <div className="stat-value blue">{counts.scheduled}</div>
        </div>
        <div className="stat-card" style={{ animationDelay: ".2s" }}>
          <div className="stat-label">Completed</div>
          <div className="stat-value accent">{counts.completed}</div>
        </div>
        <div className="stat-card" style={{ animationDelay: ".3s" }}>
          <div className="stat-label">Cancelled</div>
          <div className="stat-value danger">{counts.cancelled}</div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Appointments</h3>
        </div>
        {loading ? (
          <div className="empty">Loading…</div>
        ) : appts.length === 0 ? (
          <div className="empty">No appointments yet</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Scheduled</th>
                <th>Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appts.slice(0, 8).map((a) => (
                <tr key={a.id}>
                  <td>{a.patient?.full_name || "—"}</td>
                  <td>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Icon.Clock />
                      {fmtDate(a.scheduled_at)}
                    </span>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{a.notes || "—"}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ── Doctor Appointments ──────────────────────────────────────────────────────
function DoctorAppointments({ token, user }) {
  const [appts, setAppts] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({
    patient_id: "",
    scheduled_at: "",
    notes: "",
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const load = () =>
    Promise.all([
      apiFetch("/appointments/", {}, token),
      apiFetch("/users/", {}, token),
    ])
      .then(([a, u]) => {
        setAppts(a);
        setUsers(u);
      })
      .finally(() => setLoading(false));

  useEffect(() => {
    load();
  }, []);

  const patients = users.filter((u) => u.role === "patient");
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: e.target.value }));

  const toast = useToast();

  async function save() {
    setError("");
    setSaving(true);
    try {
      await apiFetch(
        "/appointments/",
        {
          method: "POST",
          body: JSON.stringify({
            patient_id: Number(form.patient_id),
            doctor_id: user.id,
            scheduled_at: new Date(form.scheduled_at).toISOString(),
            notes: form.notes,
          }),
        },
        token,
      );
      toast("Appointment scheduled successfully!", "success");
      setShowModal(false);
      setForm({ patient_id: "", scheduled_at: "", notes: "" });
      load();
    } catch (e) {
      toast("Could not create appointment. Please try again.", "error");
      setError("Could not create appointment. Please try again.");
    } finally {
      setSaving(false);
    }
  }

  async function cancel(id) {
    try {
      await apiFetch(`/appointments/${id}/cancel`, { method: "DELETE" }, token);
      toast("Appointment cancelled.", "info");
      load();
    } catch {
      toast("Could not cancel appointment.", "error");
    }
  }

  async function updateStatus(id, status) {
    try {
      await apiFetch(
        `/appointments/${id}`,
        { method: "PATCH", body: JSON.stringify({ status }) },
        token,
      );
      toast(`Appointment marked as ${status}.`, "success");
      load();
    } catch {
      toast("Could not update appointment.", "error");
    }
  }

  return (
    <>
      <div className="page-header">
        <h2>Appointments</h2>
        <p>Manage your schedule</p>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>All Appointments</h3>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => setShowModal(true)}
          >
            <Icon.Plus /> New
          </button>
        </div>
        {loading ? (
          <div className="empty">Loading…</div>
        ) : appts.length === 0 ? (
          <div className="empty">No appointments yet</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Patient</th>
                <th>Scheduled</th>
                <th>Notes</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {appts.map((a) => (
                <tr key={a.id}>
                  <td>{a.patient?.full_name || "—"}</td>
                  <td>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Icon.Clock />
                      {fmtDate(a.scheduled_at)}
                    </span>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{a.notes || "—"}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                  <td>
                    <div className="flex gap-2">
                      {a.status === "scheduled" && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => updateStatus(a.id, "confirmed")}
                        >
                          <Icon.Check /> Confirm
                        </button>
                      )}
                      {a.status === "confirmed" && (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => updateStatus(a.id, "completed")}
                        >
                          <Icon.Check /> Complete
                        </button>
                      )}
                      {["scheduled", "confirmed"].includes(a.status) && (
                        <button
                          className="btn btn-danger btn-sm"
                          onClick={() => cancel(a.id)}
                        >
                          <Icon.X /> Cancel
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {showModal && (
        <div
          className="overlay"
          onClick={(e) => e.target === e.currentTarget && setShowModal(false)}
        >
          <div className="modal">
            <div className="modal-header">
              <h3>New Appointment</h3>
              <button
                className="btn btn-ghost btn-sm"
                onClick={() => setShowModal(false)}
              >
                <Icon.X />
              </button>
            </div>
            {error && <div className="error-box">⚠ {error}</div>}
            <div className="field">
              <label>Patient</label>
              <select value={form.patient_id} onChange={set("patient_id")}>
                <option value="">Select patient…</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.full_name}
                  </option>
                ))}
              </select>
            </div>
            <div className="field">
              <label>Date & Time</label>
              <input
                type="datetime-local"
                value={form.scheduled_at}
                onChange={set("scheduled_at")}
              />
            </div>
            <div className="field">
              <label>Notes</label>
              <input
                value={form.notes}
                onChange={set("notes")}
                placeholder="Optional notes…"
              />
            </div>
            <div className="modal-actions">
              <button
                className="btn btn-ghost"
                onClick={() => setShowModal(false)}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary"
                onClick={save}
                disabled={saving || !form.patient_id || !form.scheduled_at}
              >
                {saving ? "Saving…" : "Schedule"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

// ── Patients List ────────────────────────────────────────────────────────────
function PatientsList({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/users/", {}, token)
      .then((u) => setUsers(u.filter((x) => x.role === "patient")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <h2>Patients</h2>
        <p>All registered patients</p>
      </div>
      <div className="card">
        <div className="card-header">
          <h3>Patient Registry</h3>
        </div>
        {loading ? (
          <div className="empty">Loading…</div>
        ) : users.length === 0 ? (
          <div className="empty">No patients yet</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div
                      className="flex gap-2"
                      style={{ alignItems: "center" }}
                    >
                      <div
                        className="avatar"
                        style={{ width: 32, height: 32, fontSize: 12 }}
                      >
                        {initials(u.full_name)}
                      </div>
                      {u.full_name}
                    </div>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{u.email}</td>
                  <td>
                    <span
                      className={`badge ${u.is_active ? "badge-confirmed" : "badge-cancelled"}`}
                    >
                      {u.is_active ? "Active" : "Inactive"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ── Patient Dashboard ────────────────────────────────────────────────────────
function PatientDashboard({ token, user }) {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/appointments/my", {}, token)
      .then(setAppts)
      .finally(() => setLoading(false));
  }, []);

  const next = appts
    .filter((a) => a.status === "scheduled" || a.status === "confirmed")
    .sort((a, b) => new Date(a.scheduled_at) - new Date(b.scheduled_at))[0];

  return (
    <>
      <div className="page-header">
        <h2>Hello, {user.full_name.split(" ")[0]} 👋</h2>
        <p>Your health dashboard</p>
      </div>

      {next && (
        <div
          className="card"
          style={{
            marginBottom: 20,
            background: "linear-gradient(135deg, #00d4aa10, #0099ff08)",
            borderColor: "#00d4aa30",
          }}
        >
          <div style={{ padding: "20px 24px" }}>
            <div
              style={{
                fontSize: 12,
                color: "var(--accent)",
                textTransform: "uppercase",
                letterSpacing: ".5px",
                marginBottom: 8,
              }}
            >
              Next Appointment
            </div>
            <div
              style={{
                fontSize: 20,
                fontFamily: "Syne",
                fontWeight: 700,
                marginBottom: 4,
              }}
            >
              Dr. {next.doctor?.full_name}
            </div>
            <div
              style={{
                color: "var(--muted)",
                fontSize: 14,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <Icon.Clock /> {fmtDate(next.scheduled_at)}
            </div>
            <StatusBadge status={next.status} />
          </div>
        </div>
      )}

      <div className="stats">
        <div className="stat-card">
          <div className="stat-label">Total</div>
          <div className="stat-value">{appts.length}</div>
        </div>
        <div className="stat-card" style={{ animationDelay: ".1s" }}>
          <div className="stat-label">Upcoming</div>
          <div className="stat-value blue">
            {
              appts.filter((a) => ["scheduled", "confirmed"].includes(a.status))
                .length
            }
          </div>
        </div>
        <div className="stat-card" style={{ animationDelay: ".2s" }}>
          <div className="stat-label">Completed</div>
          <div className="stat-value accent">
            {appts.filter((a) => a.status === "completed").length}
          </div>
        </div>
      </div>

      <div className="card">
        <div className="card-header">
          <h3>Recent Appointments</h3>
        </div>
        {loading ? (
          <div className="empty">Loading…</div>
        ) : appts.length === 0 ? (
          <div className="empty">
            No appointments yet. Book one with a doctor!
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Scheduled</th>
                <th>Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appts.slice(0, 6).map((a) => (
                <tr key={a.id}>
                  <td>{a.doctor?.full_name || "—"}</td>
                  <td>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Icon.Clock />
                      {fmtDate(a.scheduled_at)}
                    </span>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{a.notes || "—"}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ── Patient Appointments ─────────────────────────────────────────────────────
function PatientAppointments({ token }) {
  const [appts, setAppts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/appointments/my", {}, token)
      .then(setAppts)
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <h2>My Appointments</h2>
        <p>Your consultations</p>
      </div>
      <div className="card">
        <div className="card-header">
          <h3>All Appointments</h3>
        </div>
        {loading ? (
          <div className="empty">Loading…</div>
        ) : appts.length === 0 ? (
          <div className="empty">
            No appointments yet. Ask your doctor to schedule one!
          </div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Doctor</th>
                <th>Scheduled</th>
                <th>Notes</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {appts.map((a) => (
                <tr key={a.id}>
                  <td>{a.doctor?.full_name || "—"}</td>
                  <td>
                    <span
                      style={{ display: "flex", alignItems: "center", gap: 6 }}
                    >
                      <Icon.Clock />
                      {fmtDate(a.scheduled_at)}
                    </span>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{a.notes || "—"}</td>
                  <td>
                    <StatusBadge status={a.status} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ── Doctors List (for patients) ──────────────────────────────────────────────
function DoctorsList({ token }) {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch("/users/", {}, token)
      .then((u) => setUsers(u.filter((x) => x.role === "doctor")))
      .finally(() => setLoading(false));
  }, []);

  return (
    <>
      <div className="page-header">
        <h2>Our Doctors</h2>
        <p>Available medical professionals</p>
      </div>
      <div className="card">
        <div className="card-header">
          <h3>Doctor Registry</h3>
        </div>
        {loading ? (
          <div className="empty">Loading…</div>
        ) : users.length === 0 ? (
          <div className="empty">No doctors registered yet</div>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id}>
                  <td>
                    <div
                      className="flex gap-2"
                      style={{ alignItems: "center" }}
                    >
                      <div
                        className="avatar"
                        style={{
                          width: 32,
                          height: 32,
                          fontSize: 12,
                          background:
                            "linear-gradient(135deg, var(--accent2), #0066cc)",
                        }}
                      >
                        {initials(u.full_name)}
                      </div>
                      {u.full_name}
                    </div>
                  </td>
                  <td style={{ color: "var(--muted)" }}>{u.email}</td>
                  <td>
                    <span
                      className={`badge ${u.is_active ? "badge-confirmed" : "badge-cancelled"}`}
                    >
                      {u.is_active ? "Available" : "Unavailable"}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </>
  );
}

// ── App Shell ────────────────────────────────────────────────────────────────
function Shell({ auth, onLogout }) {
  const { token, user } = auth;
  const [page, setPage] = useState(
    user.role === "patient" ? "appointments" : "dashboard",
  );

  const renderPage = () => {
    if (user.role === "doctor") {
      if (page === "dashboard")
        return <DoctorDashboard token={token} user={user} />;
      if (page === "appointments")
        return <DoctorAppointments token={token} user={user} />;
      if (page === "patients") return <PatientsList token={token} />;
    } else {
      if (page === "appointments") return <PatientAppointments token={token} />;
    }
  };

  return (
    <div className="layout">
      <Sidebar user={user} page={page} setPage={setPage} onLogout={onLogout} />
      <main className="main">{renderPage()}</main>
    </div>
  );
}

// ── Root ─────────────────────────────────────────────────────────────────────
export default function App() {
  const [auth, setAuth] = useState(null);

  async function handleLogout() {
    try {
      await apiFetch("/auth/logout", { method: "POST" }, auth.token);
    } catch (e) {
      console.error("Logout error:", e);
    } finally {
      setAuth(null);
    }
  }

  return (
    <ToastProvider>
      <style>{styles}</style>
      <div className="app">
        {auth ? (
          <Shell auth={auth} onLogout={handleLogout} />
        ) : (
          <Login onLogin={setAuth} />
        )}
      </div>
    </ToastProvider>
  );
}
