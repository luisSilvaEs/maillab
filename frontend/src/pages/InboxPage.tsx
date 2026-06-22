import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { mailApi, type MailMessageDto } from "../services/api";

// ─── Sub-components ───────────────────────────────────────────────────────────

const LoadingState = () => (
  <div className="flex flex-col gap-2">
    {Array.from({ length: 6 }).map((_, i) => (
      <div
        key={i}
        className="h-16 animate-pulse rounded-lg bg-gray-100"
        style={{ opacity: 1 - i * 0.12 }}
      />
    ))}
  </div>
);

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-24 text-center">
    <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-gray-100">
      <svg
        className="h-7 w-7 text-gray-400"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={1.5}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21.75 9v.906a2.25 2.25 0 0 1-1.183 1.981l-6.478 3.488M2.25 9v.906a2.25 2.25 0 0 0 1.183 1.981l6.478 3.488m8.839 2.51-4.661-2.51m0 0-1.023-.55a2.25 2.25 0 0 0-2.134 0l-1.022.55m0 0-4.661 2.51m16.5 1.615a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V8.844a2.25 2.25 0 0 1 1.183-1.981l7.5-4.039a2.25 2.25 0 0 1 2.134 0l7.5 4.039a2.25 2.25 0 0 1 1.183 1.98V19.5Z"
        />
      </svg>
    </div>
    <p className="text-sm font-medium text-gray-900">No messages yet</p>
    <p className="mt-1 text-sm text-gray-500">
      Messages sent to your address will appear here.
    </p>
  </div>
);

interface ErrorStateProps {
  message: string;
  onRetry: () => void;
}

const ErrorState = ({ message, onRetry }: ErrorStateProps) => (
  <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
    <p className="text-sm text-red-700">{message}</p>
    <button
      onClick={onRetry}
      className="mt-2 text-sm font-medium text-red-700 underline hover:text-red-900"
    >
      Try again
    </button>
  </div>
);

interface MessageRowProps {
  message: MailMessageDto;
  onClick: (uid: number) => void;
}

const MessageRow = ({ message, onClick }: MessageRowProps) => {
  function formatSender(raw: string): string {
    const match = raw.match(/^(.+?)\s*<[^>]+>$/);
    if (match) return match[1].trim();
    return raw.split("@")[0];
  }

  return (
    <button
      onClick={() => onClick(message.uid)}
      className={[
        "w-full rounded-lg border px-4 py-3 text-left transition-colors hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-1",
        message.seen
          ? "border-gray-100 bg-white"
          : "border-indigo-100 bg-indigo-50/40",
      ].join(" ")}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex min-w-0 items-center gap-2.5">
          {!message.seen && (
            <span className="mt-0.5 h-2 w-2 flex-shrink-0 rounded-full bg-indigo-500" />
          )}
          <div className="min-w-0">
            <p
              className={[
                "truncate text-sm",
                message.seen
                  ? "font-normal text-gray-600"
                  : "font-semibold text-gray-900",
              ].join(" ")}
            >
              {formatSender(message.from)}
            </p>
            <p
              className={[
                "mt-0.5 truncate text-sm",
                message.seen ? "text-gray-500" : "font-medium text-gray-800",
              ].join(" ")}
            >
              {message.subject || "(no subject)"}
            </p>
          </div>
        </div>
        <time
          dateTime={message.sentAt}
          className="flex-shrink-0 text-xs text-gray-400"
        >
          {formatDate(message.sentAt)}
        </time>
      </div>
    </button>
  );
};

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(raw: string): string {
  const date = new Date(raw);
  const now = new Date();
  const isToday =
    date.getFullYear() === now.getFullYear() &&
    date.getMonth() === now.getMonth() &&
    date.getDate() === now.getDate();

  return isToday
    ? date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
    : date.toLocaleDateString([], { month: "short", day: "numeric" });
}

// ─── Page ─────────────────────────────────────────────────────────────────────

type Status = "loading" | "success" | "error";

const InboxPage = () => {
  const navigate = useNavigate();
  const [messages, setMessages] = useState<MailMessageDto[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [errorMsg, setErrorMsg] = useState("");

  async function loadInbox() {
    setStatus("loading");
    try {
      const data = await mailApi.getInbox();
      setMessages(
        data.sort(
          (a, b) => new Date(b.sentAt).getTime() - new Date(a.sentAt).getTime(),
        ),
      );
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

  useEffect(() => {
    loadInbox();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const unreadCount = messages.filter((m) => !m.seen).length;

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold text-gray-900">Inbox</h1>
          {status === "success" && unreadCount > 0 && (
            <p className="mt-0.5 text-sm text-gray-500">{unreadCount} unread</p>
          )}
        </div>
        <button
          onClick={loadInbox}
          disabled={status === "loading"}
          className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900 disabled:opacity-40"
          title="Refresh"
        >
          <svg
            className={[
              "h-4 w-4",
              status === "loading" ? "animate-spin" : "",
            ].join(" ")}
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2}
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99"
            />
          </svg>
          Refresh
        </button>
      </div>

      {status === "loading" && <LoadingState />}
      {status === "error" && (
        <ErrorState message={errorMsg} onRetry={loadInbox} />
      )}
      {status === "success" && messages.length === 0 && <EmptyState />}
      {status === "success" && messages.length > 0 && (
        <div className="flex flex-col gap-1.5">
          {messages.map((msg) => (
            <MessageRow
              key={msg.uid}
              message={msg}
              onClick={(uid) => navigate(`/inbox/${uid}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default InboxPage;
