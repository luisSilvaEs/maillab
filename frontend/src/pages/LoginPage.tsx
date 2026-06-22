import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type LoginStep = "credentials" | "totp";

interface CredentialsFormState {
  username: string;
  password: string;
}

// ─── Component ────────────────────────────────────────────────────────────────

const LoginPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<LoginStep>("credentials");

  // Retained from step one so we can send it with the TOTP request
  const [pendingUsername, setPendingUsername] = useState("");

  const [credentials, setCredentials] = useState<CredentialsFormState>({
    username: "",
    password: "",
  });
  const [totpCode, setTotpCode] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // ─── Handlers ───────────────────────────────────────────────────────────────

  function handleCredentialsChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setCredentials((prev) => ({ ...prev, [name]: value }));
    setError("");
  }

  async function handleCredentialsSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.login({
        username: credentials.username,
        password: credentials.password,
      });

      if (response.requiresTwoFactor) {
        // Backend confirmed credentials but needs TOTP — advance to step two
        setPendingUsername(credentials.username);
        setStep("totp");
        return;
      }

      if (response.token) {
        localStorage.setItem("token", response.token);
        navigate("/inbox", { replace: true });
        return;
      }

      // Should not happen, but guard against unexpected shapes
      setError("Unexpected response from server. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Login failed.");
    } finally {
      setLoading(false);
    }
  }

  async function handleTotpSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await authApi.verifyTwoFactor({
        username: pendingUsername,
        code: parseInt(totpCode, 10),
      });

      if (response.token) {
        localStorage.setItem("token", response.token);
        navigate("/inbox", { replace: true });
        return;
      }

      setError("Verification failed. Please try again.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Verification failed.");
    } finally {
      setLoading(false);
    }
  }

  function handleBackToCredentials() {
    setStep("credentials");
    setTotpCode("");
    setError("");
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
          <p className="mt-1 text-sm text-gray-500">
            {step === "credentials"
              ? "Sign in to your account"
              : "Two-factor authentication"}
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {step === "credentials" ? (
            <CredentialsForm
              values={credentials}
              error={error}
              loading={loading}
              onChange={handleCredentialsChange}
              onSubmit={handleCredentialsSubmit}
            />
          ) : (
            <TotpForm
              code={totpCode}
              username={pendingUsername}
              error={error}
              loading={loading}
              onChange={(value) => {
                setTotpCode(value);
                setError("");
              }}
              onSubmit={handleTotpSubmit}
              onBack={handleBackToCredentials}
            />
          )}
        </div>

        {/* Register link — only shown on the credentials step */}
        {step === "credentials" && (
          <p className="mt-6 text-center text-sm text-gray-500">
            No account?{" "}
            <a
              href="/register"
              className="font-medium text-indigo-600 hover:text-indigo-500"
            >
              Create one
            </a>
          </p>
        )}
      </div>
    </div>
  );
};

// ─── Credentials form ─────────────────────────────────────────────────────────

interface CredentialsFormProps {
  values: CredentialsFormState;
  error: string;
  loading: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
}

const CredentialsForm = ({
  values,
  error,
  loading,
  onChange,
  onSubmit,
}: CredentialsFormProps) => (
  <form onSubmit={onSubmit} noValidate className="space-y-5">
    <Field label="Username">
      <input
        id="username"
        name="username"
        type="text"
        autoComplete="username"
        autoFocus
        required
        value={values.username}
        onChange={onChange}
        className={inputClass}
        placeholder="your-username"
      />
    </Field>

    <Field label="Password">
      <input
        id="password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
        value={values.password}
        onChange={onChange}
        className={inputClass}
        placeholder="••••••••"
      />
    </Field>

    {error && <ErrorMessage message={error} />}

    <button type="submit" disabled={loading} className={primaryButtonClass}>
      {loading ? "Signing in…" : "Sign in"}
    </button>
  </form>
);

// ─── TOTP form ────────────────────────────────────────────────────────────────

interface TotpFormProps {
  code: string;
  username: string;
  error: string;
  loading: boolean;
  onChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  onBack: () => void;
}

const TotpForm = ({
  code,
  username,
  error,
  loading,
  onChange,
  onSubmit,
  onBack,
}: TotpFormProps) => (
  <form onSubmit={onSubmit} noValidate className="space-y-5">
    <p className="text-sm text-gray-600">
      Enter the 6-digit code from your authenticator app for{" "}
      <span className="font-medium text-gray-900">{username}</span>.
    </p>

    <Field label="Authentication code">
      <input
        id="totp-code"
        name="totp-code"
        type="text"
        inputMode="numeric"
        autoComplete="one-time-code"
        autoFocus
        required
        maxLength={6}
        value={code}
        onChange={(e) => {
          // Only allow digits
          const digits = e.target.value.replace(/\D/g, "");
          onChange(digits);
        }}
        className={`${inputClass} tracking-widest`}
        placeholder="000000"
      />
    </Field>

    {error && <ErrorMessage message={error} />}

    <button
      type="submit"
      disabled={loading || code.length !== 6}
      className={primaryButtonClass}
    >
      {loading ? "Verifying…" : "Verify"}
    </button>

    <button
      type="button"
      onClick={onBack}
      className="w-full text-center text-sm text-gray-500 hover:text-gray-700"
    >
      ← Use a different account
    </button>
  </form>
);

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

export default LoginPage;
