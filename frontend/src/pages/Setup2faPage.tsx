import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { authApi } from "../services/api";

// ─── Types ────────────────────────────────────────────────────────────────────

type SetupStep = "loading" | "scan" | "error";

// ─── Component ────────────────────────────────────────────────────────────────

const Setup2faPage = () => {
  const navigate = useNavigate();

  const [step, setStep] = useState<SetupStep>("loading");
  const [qrCode, setQrCode] = useState("");
  const [error, setError] = useState("");

  // Call the protected endpoint on mount to generate the TOTP secret + QR code
  useEffect(() => {
    async function initSetup() {
      try {
        const response = await authApi.setupTwoFactor();

        if (response.qrCode) {
          setQrCode(response.qrCode);
          setStep("scan");
          return;
        }

        setError("Could not generate QR code. Please try again.");
        setStep("error");
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : "Setup failed. Please try again.",
        );
        setStep("error");
      }
    }

    initSetup();
  }, []);

  function handleContinue() {
    navigate("/inbox", { replace: true });
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
            Set up two-factor authentication
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-8 shadow-sm">
          {step === "loading" && <LoadingState />}
          {step === "scan" && (
            <ScanState qrCode={qrCode} onContinue={handleContinue} />
          )}
          {step === "error" && <ErrorState message={error} />}
        </div>
      </div>
    </div>
  );
};

// ─── Loading state ────────────────────────────────────────────────────────────

const LoadingState = () => (
  <div className="flex flex-col items-center gap-3 py-4">
    <div className="h-5 w-5 animate-spin rounded-full border-2 border-indigo-600 border-t-transparent" />
    <p className="text-sm text-gray-500">Generating your QR code…</p>
  </div>
);

// ─── Scan state ───────────────────────────────────────────────────────────────

interface ScanStateProps {
  qrCode: string;
  onContinue: () => void;
}

const ScanState = ({ qrCode, onContinue }: ScanStateProps) => (
  <div className="flex flex-col items-center gap-6">
    <div className="space-y-1.5 text-center">
      <h2 className="text-base font-semibold text-gray-900">
        Scan with your authenticator app
      </h2>
      <p className="text-sm text-gray-500">
        Use Google Authenticator or Authy to scan the QR code below. You'll need
        it every time you sign in.
      </p>
    </div>

    {/* QR code — base64 image returned by the backend */}
    <div className="rounded-lg border border-gray-200 p-3">
      <img
        src={`data:image/png;base64,${qrCode}`}
        alt="TOTP QR code"
        className="h-48 w-48"
      />
    </div>

    <button onClick={onContinue} className={primaryButtonClass}>
      I've scanned it — continue
    </button>
  </div>
);

// ─── Error state ──────────────────────────────────────────────────────────────

const ErrorState = ({ message }: { message: string }) => (
  <div className="flex flex-col items-center gap-4 py-2">
    <div className="rounded-md bg-red-50 px-4 py-3 w-full">
      <p className="text-sm text-red-700">{message}</p>
    </div>
    <a href="/login" className="text-sm text-indigo-600 hover:text-indigo-500">
      Back to sign in
    </a>
  </div>
);

// ─── Shared class strings ─────────────────────────────────────────────────────

const primaryButtonClass =
  "w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50";

export default Setup2faPage;
