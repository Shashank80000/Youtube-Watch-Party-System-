import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContex";

const Navbar = () => {
  const navigate = useNavigate();
  const { user, logout, isAuthenticated } = useAuth();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-neutral-200 bg-[#f7f7f5]/95 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">

        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-neutral-900 text-sm font-bold text-white">
            W
          </div>

          <span className="text-lg font-semibold tracking-tight text-neutral-900">
            WatchParty
          </span>
        </button>

        {/* Right side */}
        <div className="flex items-center gap-3">

          {isAuthenticated ? (
            <>
              {/* User */}
              {user && (
                <div className="flex items-center gap-2">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f1d8c5] text-sm font-semibold text-neutral-800">
                    {user.username?.charAt(0).toUpperCase()}
                  </div>

                  <div className="hidden sm:block">
                    <p className="text-sm font-medium text-neutral-900">
                      {user.username}
                    </p>

                    <p className="text-xs text-neutral-500">
                      Account
                    </p>
                  </div>
                </div>
              )}

              {/* Logout */}
              <button
                onClick={handleLogout}
                className="rounded-lg border border-neutral-200 bg-white px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-50"
              >
                Logout
              </button>
            </>
          ) : (
            <>
              {/* Login */}
              <button
                onClick={() => navigate("/login")}
                className="rounded-lg px-4 py-2 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
              >
                Login
              </button>

              {/* Register */}
              <button
                onClick={() => navigate("/register")}
                className="rounded-lg bg-neutral-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
              >
                Register
              </button>
            </>
          )}

        </div>
      </div>
    </nav>
  );
};

export default Navbar;