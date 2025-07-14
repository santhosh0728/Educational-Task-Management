"use client"

import { useAuth } from "../../contexts/AuthContext"
import { useTheme } from "../../contexts/ThemeContext"

const Header = ({ setSidebarOpen }) => {
  const { user, logout } = useAuth()
  const { theme, toggleTheme } = useTheme()

  return (
    <header className="main-header fade-in">
      <div className="d-flex align-items-center">
        <button
          className="btn btn-link d-lg-none me-3 p-0"
          onClick={() => setSidebarOpen(true)}
          style={{ border: "none", background: "none" }}
        >
          <i className="bi bi-list fs-4"></i>
        </button>

        <div className="header-search position-relative">
          <div className="position-relative">
            <span className="input-group-text">
              <i className="bi bi-search"></i>
            </span>
            <input type="text" className="form-control" placeholder="Search tasks, exams, students..." />
          </div>
        </div>
      </div>

      <div className="header-actions">
        <button className="btn position-relative" onClick={toggleTheme} title="Toggle Theme">
          <i className={`bi ${theme === "light" ? "bi-moon-stars-fill" : "bi-sun-fill"} fs-5`}></i>
        </button>

        <button className="btn position-relative" title="Notifications">
          <i className="bi bi-bell-fill fs-5"></i>
          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger">
            3<span className="visually-hidden">unread messages</span>
          </span>
        </button>

        <div className="dropdown">
          <button
            className="btn d-flex align-items-center p-0"
            type="button"
            data-bs-toggle="dropdown"
            style={{ border: "none", background: "none" }}
          >
            <div className="d-flex align-items-center">
              <div
                className="bg-primary rounded-circle d-flex align-items-center justify-content-center me-2 position-relative"
                style={{ width: "44px", height: "44px" }}
              >
                <span className="text-white fw-bold">{user?.fullName?.charAt(0).toUpperCase()}</span>
                <div
                  className="position-absolute bottom-0 end-0 bg-success rounded-circle border border-2 border-white"
                  style={{ width: "12px", height: "12px" }}
                ></div>
              </div>
              <div className="text-start d-none d-md-block">
                <div className="fw-semibold">{user?.fullName}</div>
                <small className="text-muted text-capitalize">{user?.role?.toLowerCase()}</small>
              </div>
              <i className="bi bi-chevron-down ms-2"></i>
            </div>
          </button>
          <ul className="dropdown-menu dropdown-menu-end shadow-lg border-0 mt-2" style={{ borderRadius: "16px" }}>
            <li>
              <a className="dropdown-item py-2" href="#">
                <i className="bi bi-person-circle me-2 text-primary"></i>
                My Profile
              </a>
            </li>
            <li>
              <a className="dropdown-item py-2" href="#">
                <i className="bi bi-gear-fill me-2 text-secondary"></i>
                Settings
              </a>
            </li>
            <li>
              <a className="dropdown-item py-2" href="#">
                <i className="bi bi-question-circle-fill me-2 text-info"></i>
                Help & Support
              </a>
            </li>
            <li>
              <hr className="dropdown-divider" />
            </li>
            <li>
              <button className="dropdown-item py-2 text-danger" onClick={logout}>
                <i className="bi bi-box-arrow-right me-2"></i>
                Sign Out
              </button>
            </li>
          </ul>
        </div>
      </div>
    </header>
  )
}

export default Header
