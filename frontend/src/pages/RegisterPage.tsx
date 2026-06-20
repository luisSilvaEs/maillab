import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

interface RegisterFormState {
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState<RegisterFormState>({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const response = await authApi.register({
        username: form.username,
        email: form.email,
        password: form.password,
      });

      if (response.token) {
        // Store the token so Setup2faPage can call the protected /setup-2fa endpoint
        localStorage.setItem("token", response.token);
        navigate("/setup-2fa", { replace: true });
        return;
      }

      setError("Unexpected response from server. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Registration failed.");
    } finally {
      setLoading(false);
    }
  }

  // ─── Render ─────────────────────────────────────────────────────────────────

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        {/* Brand */}
        <div className="mb-8 text-center">
          <span className="text-2xl font-semibold tracking-tight text-indigo-600">
            MailLab
          </span>
          <p className="mt-1 text-sm text-gray-500">Create your account</p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          <form onSubmit={handleSubmit} noValidate className="space-y-5">
            <Field label="Username">
              <input
                id="username"
                name="username"
                type="text"
                autoComplete="username"
                autoFocus
                required
                value={form.username}
                onChange={handleChange}
                className={inputClass}
                placeholder="alice"
              />
            </Field>

            <Field label="Email">
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={form.email}
                onChange={handleChange}
                className={inputClass}
                placeholder="alice@luissilvacoding.com"
              />
            </Field>

            <Field label="Password">
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="new-password"
                required
                value={form.password}
                onChange={handleChange}
                className={inputClass}
                placeholder="••••••••"
              />
            </Field>

            <Field label="Confirm password">
              <input
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                autoComplete="new-password"
                required
                value={form.confirmPassword}
                onChange={handleChange}
                className={inputClass}
                placeholder="••••••••"
              />
            </Field>

            {error && <ErrorMessage message={error} />}

            <button
              type="submit"
              disabled={loading}
              className={primaryButtonClass}
            >
              {loading ? "Creating account…" : "Create account"}
            </button>
          </form>
        </div>

        <p className="mt-6 text-center text-sm text-gray-500">
          Already have an account?{" "}
          <a
            href="/login"
            className="font-medium text-indigo-600 hover:text-indigo-500"
          >
            Sign in
          </a>
        </p>
      </div>
    </div>
  );
};

// ─── Shared sub-components ────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  children: React.ReactNode;
}

const Field = ({ label, children }: FieldProps) => (
  <div className="space-y-1.5">
    <label className="block text-sm font-medium text-gray-700">{label}</label>
    {children}
  </div>
);

const ErrorMessage = ({ message }: { message: string }) => (
  <div className="rounded-md bg-red-50 px-4 py-3">
    <p className="text-sm text-red-700">{message}</p>
  </div>
);

// ─── Shared class strings ─────────────────────────────────────────────────────

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20";

const primaryButtonClass =
  "w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default RegisterPage;
