import { Link } from "react-router-dom";
import Logo from "../components/Logo";
import { useAuth } from "../auth/useAuth";

/** Stand-in for pages that aren't built yet, so links and redirects have somewhere to land. */
export default function Placeholder({ title }) {
  const { user, logout } = useAuth();
  return (
    <main style={{ minHeight: "100vh", display: "grid", placeItems: "center", padding: 24, background: "#fff" }}>
      <div style={{ textAlign: "center", maxWidth: 420 }}>
        <Logo />
        <h1 style={{ fontSize: "1.5rem", margin: "32px 0 8px" }}>{title}</h1>
        <p style={{ color: "var(--ig-slate)", margin: 0 }}>
          {user ? `Logged in as ${user.firstName} (${user.role}). ` : ""}This page hasn't been built yet.
        </p>
        <p style={{ marginTop: 24 }}>
          {user
            ? <>
                <Link to="/apply" className="text-link">Start a rental application</Link>
                {"  |  "}
                <button type="button" className="text-link" onClick={logout}>Log out</button>
              </>
            : <Link to="/login" className="text-link">Back to log in</Link>}
        </p>
      </div>
    </main>
  );
}
