import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import AppLayout from "./layouts/AppLayout";
import ComposePage from "./pages/ComposePage";
import InboxPage from "./pages/InboxPage";
import LoginPage from "./pages/LoginPage";
import MessagePage from "./pages/MessagePage";
import RegisterPage from "./pages/RegisterPage";
import Setup2faPage from "./pages/Setup2faPage";
import ProtectedRoute from "./routes/ProtectedRoute";

const App = () => {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route path="/setup-2fa" element={<Setup2faPage />} />

        {/* Protected routes — all rendered inside the app shell */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AppLayout />}>
            <Route path="/inbox" element={<InboxPage />} />
            <Route path="/inbox/:id" element={<MessagePage />} />
            <Route path="/compose" element={<ComposePage />} />
          </Route>
        </Route>

        {/* Fallback: redirect root to inbox (ProtectedRoute will redirect to /login if not authed) */}
        <Route path="/" element={<Navigate to="/inbox" replace />} />

        {/* Catch-all for unknown routes */}
        <Route path="*" element={<Navigate to="/inbox" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
