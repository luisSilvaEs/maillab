import { NavLink, Outlet, useNavigate } from "react-router-dom";

/**
 * AppLayout is the persistent shell rendered around all authenticated pages.
 * It renders a sidebar with navigation links and a top bar with the user info.
 * Page content is injected through <Outlet />.
 */
const AppLayout = () => {
  const navigate = useNavigate();

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/login", { replace: true });
  }

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900">
      {/* Sidebar */}
      <aside className="flex w-56 flex-col border-r border-gray-200 bg-white">
        {/* Brand */}
        <div className="flex h-14 items-center border-b border-gray-200 px-5">
          <span className="text-lg font-semibold tracking-tight text-indigo-600">
            MailLab
          </span>
        </div>

        {/* Navigation */}
        <nav className="flex flex-1 flex-col gap-1 p-3">
          <SidebarLink to="/inbox" label="Inbox" />
          <SidebarLink to="/compose" label="Compose" />
        </nav>

        {/* Logout */}
        <div className="border-t border-gray-200 p-3">
          <button
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-2 text-left text-sm text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
          >
            Sign out
          </button>
        </div>
      </aside>

      {/* Main content area */}
      <div className="flex flex-1 flex-col overflow-hidden">
        {/* Top bar */}
        <header className="flex h-14 items-center border-b border-gray-200 bg-white px-6">
          <span className="text-sm text-gray-500">
            {/* Will be replaced with real user info from AuthContext */}
            user@luissilvacoding.com
          </span>
        </header>

        {/* Page outlet */}
        <main className="flex-1 overflow-auto p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

// ─── Sidebar nav link ────────────────────────────────────────────────────────

interface SidebarLinkProps {
  to: string;
  label: string;
}

const SidebarLink = ({ to, label }: SidebarLinkProps) => (
  <NavLink
    to={to}
    className={({ isActive }) =>
      [
        "rounded-md px-3 py-2 text-sm font-medium transition-colors",
        isActive
          ? "bg-indigo-50 text-indigo-600"
          : "text-gray-600 hover:bg-gray-100 hover:text-gray-900",
      ].join(" ")
    }
  >
    {label}
  </NavLink>
);

export default AppLayout;
