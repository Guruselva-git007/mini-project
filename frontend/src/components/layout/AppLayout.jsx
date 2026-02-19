import { Link, NavLink } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { ROLES, roleHomePath } from "../../utils/roles";

const AppLayout = ({ children }) => {
  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="topbar">
        <div>
          <Link className="brand" to={roleHomePath(user.role)}>
            Civic Issue Reporting
          </Link>
          <p className="muted small">{user.role}</p>
        </div>

        <nav className="nav-links">
          {user.role === ROLES.CITIZEN && (
            <>
              <NavLink to="/citizen">Dashboard</NavLink>
              <NavLink to="/report">Report Issue</NavLink>
              <NavLink to="/map">Map</NavLink>
            </>
          )}

          {user.role === ROLES.AUTHORITY && (
            <>
              <NavLink to="/authority">Dashboard</NavLink>
              <NavLink to="/map">Map</NavLink>
            </>
          )}

          {user.role === ROLES.ADMIN && (
            <>
              <NavLink to="/admin">Admin Panel</NavLink>
              <NavLink to="/map">Map</NavLink>
            </>
          )}

          <button className="btn btn-outline" type="button" onClick={logout}>
            Logout
          </button>
        </nav>
      </header>

      <main className="page-body">{children}</main>
    </div>
  );
};

export default AppLayout;
