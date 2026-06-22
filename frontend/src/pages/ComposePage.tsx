import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { mailApi, type SendMailRequest } from "../services/api";

// ─── Field component ──────────────────────────────────────────────────────────

interface FieldProps {
  label: string;
  htmlFor: string;
  children: React.ReactNode;
}

const Field = ({ label, htmlFor, children }: FieldProps) => (
  <div className="flex flex-col gap-1.5">
    <label htmlFor={htmlFor} className="text-sm font-medium text-gray-700">
      {label}
    </label>
    {children}
  </div>
);

const inputClass =
  "w-full rounded-lg border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 transition focus:border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 disabled:cursor-not-allowed disabled:opacity-50";

// ─── Page ─────────────────────────────────────────────────────────────────────

type Status = "idle" | "sending" | "sent" | "error";

const ComposePage = () => {
  const navigate = useNavigate();

  const [to, setTo] = useState("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  const isDisabled = status === "sending" || status === "sent";

  async function handleSend() {
    if (!to.trim() || !body.trim()) return;

    setStatus("sending");
    setErrorMsg("");

    const payload: SendMailRequest = {
      to: to.trim(),
      subject: subject.trim(),
      body: body.trim(),
    };

    try {
      await mailApi.send(payload);
      setStatus("sent");
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

  function handleReset() {
    setTo("");
    setSubject("");
    setBody("");
    setStatus("idle");
    setErrorMsg("");
  }

  // ── Sent confirmation ────────────────────────────────────────────────────────

  if (status === "sent") {
    return (
      <div className="mx-auto max-w-3xl">
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-100">
            <svg
              className="h-7 w-7 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="m4.5 12.75 6 6 9-13.5"
              />
            </svg>
          </div>
          <p className="text-sm font-medium text-gray-900">Message sent</p>
          <p className="mt-1 text-sm text-gray-500">
            Your message to <span className="font-medium">{to}</span> was
            delivered.
          </p>
          <div className="mt-6 flex gap-3">
            <button
              onClick={handleReset}
              className="rounded-lg border border-gray-200 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-50"
            >
              Compose another
            </button>
            <button
              onClick={() => navigate("/inbox")}
              className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700"
            >
              Back to inbox
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ── Compose form ─────────────────────────────────────────────────────────────

  return (
    <div className="mx-auto max-w-3xl">
      <div className="mb-5">
        <h1 className="text-lg font-semibold text-gray-900">New message</h1>
      </div>

      <div className="rounded-xl border border-gray-200 bg-white">
        <div className="flex flex-col gap-4 p-6">
          <Field label="To" htmlFor="to">
            <input
              id="to"
              type="email"
              value={to}
              onChange={(e) => setTo(e.target.value)}
              placeholder="recipient@luissilvacoding.com"
              disabled={isDisabled}
              className={inputClass}
              autoFocus
            />
          </Field>

          <Field label="Subject" htmlFor="subject">
            <input
              id="subject"
              type="text"
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              placeholder="(no subject)"
              disabled={isDisabled}
              className={inputClass}
            />
          </Field>

          <Field label="Message" htmlFor="body">
            <textarea
              id="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              placeholder="Write your message…"
              rows={10}
              disabled={isDisabled}
              className={[inputClass, "resize-none leading-relaxed"].join(" ")}
            />
          </Field>

          {status === "error" && (
            <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3">
              <p className="text-sm text-red-700">{errorMsg}</p>
            </div>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-gray-100 px-6 py-4">
          <button
            onClick={() => navigate("/inbox")}
            disabled={isDisabled}
            className="text-sm text-gray-500 transition hover:text-gray-900 disabled:opacity-40"
          >
            Discard
          </button>

          <button
            onClick={handleSend}
            disabled={isDisabled || !to.trim() || !body.trim()}
            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {status === "sending" ? (
              <>
                <svg
                  className="h-4 w-4 animate-spin"
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
                Sending…
              </>
            ) : (
              "Send"
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

export default ComposePage;
