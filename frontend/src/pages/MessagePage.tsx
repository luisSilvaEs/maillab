import { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { mailApi, type MailMessageDetailDto } from "../services/api";

// ─── Sub-components ───────────────────────────────────────────────────────────

const LoadingState = () => (
  <div className="mx-auto max-w-3xl">
    <div className="mb-6 h-4 w-24 animate-pulse rounded bg-gray-100" />
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4 h-6 w-2/3 animate-pulse rounded bg-gray-100" />
      <div className="mb-6 space-y-2">
        <div className="h-3 w-1/3 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-1/4 animate-pulse rounded bg-gray-100" />
        <div className="h-3 w-1/5 animate-pulse rounded bg-gray-100" />
      </div>
      <div className="space-y-2">
        {Array.from({ length: 5 }).map((_, i) => (
          <div
            key={i}
            className="h-3 animate-pulse rounded bg-gray-100"
            style={{ width: `${85 - i * 8}%` }}
          />
        ))}
      </div>
    </div>
  </div>
);

interface ErrorStateProps {
  message: string;
  onBack: () => void;
}

const ErrorState = ({ message, onBack }: ErrorStateProps) => (
  <div className="mx-auto max-w-3xl">
    <BackButton onClick={onBack} />
    <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
      <p className="text-sm text-red-700">{message}</p>
    </div>
  </div>
);

const BackButton = ({ onClick }: { onClick: () => void }) => (
  <button
    onClick={onClick}
    className="mb-5 flex items-center gap-1.5 text-sm text-gray-500 transition-colors hover:text-gray-900"
  >
    <svg
      className="h-4 w-4"
      fill="none"
      viewBox="0 0 24 24"
      stroke="currentColor"
      strokeWidth={2}
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M10.5 19.5 3 12m0 0 7.5-7.5M3 12h18"
      />
    </svg>
    Back to inbox
  </button>
);

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFullDate(raw: string): string {
  return new Date(raw).toLocaleString([], {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Status = "loading" | "success" | "error";

const MessagePage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [message, setMessage] = useState<MailMessageDetailDto | null>(null);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  useEffect(() => {
    if (!id) {
      navigate("/inbox", { replace: true });
      return;
    }

    async function load() {
      try {
        const data = await mailApi.getMessage(Number(id));
        setMessage(data);
        setStatus("success");
      } catch (err) {
        const msg = err instanceof Error ? err.message : "Something went wrong";
        if (msg.includes("401") || msg === "unauthorized") {
          localStorage.removeItem("token");
          navigate("/login", { replace: true });
          return;
        }
        setErrorMsg(msg);
        setStatus("error");
      }
    }

    load();
  }, [id, navigate]);

  function handleBack() {
    navigate("/inbox");
  }

  if (status === "loading") return <LoadingState />;
  if (status === "error")
    return <ErrorState message={errorMsg} onBack={handleBack} />;
  if (!message) return null;

  return (
    <div className="mx-auto max-w-3xl">
      <BackButton onClick={handleBack} />

      <article className="rounded-xl border border-gray-200 bg-white">
        <div className="border-b border-gray-100 px-6 py-5">
          <h1 className="text-lg font-semibold text-gray-900">
            {message.subject || "(no subject)"}
          </h1>
          <dl className="mt-3 space-y-1">
            <div className="flex gap-2 text-sm">
              <dt className="w-8 flex-shrink-0 text-gray-400">From</dt>
              <dd className="text-gray-700">{message.from}</dd>
            </div>
            <div className="flex gap-2 text-sm">
              <dt className="w-8 flex-shrink-0 text-gray-400">To</dt>
              <dd className="text-gray-700">{message.to}</dd>
            </div>
            <div className="flex gap-2 text-sm">
              <dt className="w-8 flex-shrink-0 text-gray-400">Date</dt>
              <dd className="text-gray-500">
                {formatFullDate(message.sentAt)}
              </dd>
            </div>
          </dl>
        </div>
        <div className="px-6 py-5">
          <pre className="whitespace-pre-wrap font-sans text-sm leading-relaxed text-gray-800">
            {message.body}
          </pre>
        </div>
      </article>
    </div>
  );
};

export default MessagePage;
