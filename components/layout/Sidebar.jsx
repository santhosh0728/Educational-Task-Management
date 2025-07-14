"use client"

import { useState } from "react"
import { Link, useLocation, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import toast from "react-hot-toast"
import "./Sidebar.css"

const Sidebar = () => {
  const { user, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleLogout = () => {
    logout()
    toast.success("👋 Logged out successfully!")
    navigate("/signin")
  }

  const handleCreateExam = () => {
    navigate("/exams/new")
    toast.info("📝 Creating new exam...")
  }

  const menuItems = [
    {
      icon: "🏠",
      label: "Dashboard",
      path: "/dashboard",
      roles: ["TUTOR", "STUDENT"],
    },
    {
      icon: "📚",
      label: "Exams",
      path: "/dashboard/exams",
      roles: ["TUTOR", "STUDENT"],
    },
    {
      icon: "📝",
      label: "Tasks",
      path: "/dashboard/tasks",
      roles: ["TUTOR", "STUDENT"],
    },
    {
      icon: "👥",
      label: "Students",
      path: "/dashboard/students",
      roles: ["TUTOR"],
    },
    {
      icon: "💬",
      label: "Chat",
      path: "/dashboard/chat",
      roles: ["TUTOR", "STUDENT"],
    },
    {
      icon: "📊",
      label: "Analytics",
      path: "/dashboard/analytics",
      roles: ["TUTOR"],
    },
    {
      icon: "👤",
      label: "Profile",
      path: "/dashboard/profile",
      roles: ["TUTOR", "STUDENT"],
    },
  ]

  const quickActions = [
    {
      icon: "➕",
      label: "Create Exam",
      action: handleCreateExam,
      color: "primary",
      roles: ["TUTOR"],
    },
    {
      icon: "📝",
      label: "New Task",
      action: () => navigate("/dashboard/tasks/new"),
      color: "secondary",
      roles: ["TUTOR"],
    },
    {
      icon: "👥",
      label: "Add Student",
      action: () => navigate("/dashboard/students/add"),
      color: "success",
      roles: ["TUTOR"],
    },
  ]

  const filteredMenuItems = menuItems.filter((item) => item.roles.includes(user?.role))
  const filteredQuickActions = quickActions.filter((action) => action.roles.includes(user?.role))

  return (
    <div className={`sidebar ${isCollapsed ? "collapsed" : ""}`}>
      {/* Sidebar Header */}
      <div className="sidebar-header">
        <div className="user-info">
          <div className="user-avatar">
            <span className="avatar-text">{user?.fullName?.charAt(0)?.toUpperCase() || "U"}</span>
            <div className="status-indicator online"></div>
          </div>
          {!isCollapsed && (
            <div className="user-details">
              <h3 className="user-name">{user?.fullName || "User"}</h3>
              <span className={`user-role ${user?.role?.toLowerCase()}`}>{user?.role || "USER"}</span>
            </div>
          )}
        </div>
        <button className="collapse-btn" onClick={() => setIsCollapsed(!isCollapsed)} title="Toggle Sidebar">
          <span className={`collapse-icon ${isCollapsed ? "collapsed" : ""}`}>⟨</span>
        </button>
      </div>

      {/* Quick Actions */}
      {user?.role === "TUTOR" && (
        <div className="quick-actions">
          {!isCollapsed && <h4 className="section-title">Quick Actions</h4>}
          <div className="actions-grid">
            {filteredQuickActions.map((action, index) => (
              <button
                key={index}
                className={`quick-action-btn ${action.color}`}
                onClick={action.action}
                title={action.label}
              >
                <span className="action-icon">{action.icon}</span>
                {!isCollapsed && <span className="action-label">{action.label}</span>}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Navigation Menu */}
      <nav className="sidebar-nav">
        {!isCollapsed && <h4 className="section-title">Navigation</h4>}
        <ul className="nav-list">
          {filteredMenuItems.map((item, index) => {
            const isActive = location.pathname === item.path || location.pathname.startsWith(item.path + "/")
            return (
              <li key={index} className="nav-item">
                <Link to={item.path} className={`nav-link ${isActive ? "active" : ""}`} title={item.label}>
                  <span className="nav-icon">{item.icon}</span>
                  {!isCollapsed && <span className="nav-label">{item.label}</span>}
                  {isActive && <div className="active-indicator"></div>}
                </Link>
              </li>
            )
          })}
        </ul>
      </nav>

      {/* Exam Management Section */}
      {user?.role === "TUTOR" && location.pathname.includes("/exams") && (
        <div className="exam-management">
          {!isCollapsed && <h4 className="section-title">Exam Management</h4>}
          <div className="management-actions">
            <button className="management-btn create" onClick={handleCreateExam} title="Create New Exam">
              <span className="btn-icon">📝</span>
              {!isCollapsed && <span className="btn-label">Create Exam</span>}
            </button>
            <button
              className="management-btn import"
              onClick={() => toast.info("📥 Import feature coming soon!")}
              title="Import Exams"
            >
              <span className="btn-icon">📥</span>
              {!isCollapsed && <span className="btn-label">Import</span>}
            </button>
            <button
              className="management-btn export"
              onClick={() => toast.info("📤 Export feature coming soon!")}
              title="Export Exams"
            >
              <span className="btn-icon">📤</span>
              {!isCollapsed && <span className="btn-label">Export</span>}
            </button>
          </div>
        </div>
      )}

      {/* Stats Section */}
      <div className="sidebar-stats">
        {!isCollapsed && <h4 className="section-title">Quick Stats</h4>}
        <div className="stats-grid">
          <div className="stat-item" title="Total Exams">
            <span className="stat-icon">📚</span>
            {!isCollapsed && (
              <div className="stat-content">
                <span className="stat-value">12</span>
                <span className="stat-label">Exams</span>
              </div>
            )}
          </div>
          <div className="stat-item" title="Active Students">
            <span className="stat-icon">👥</span>
            {!isCollapsed && (
              <div className="stat-content">
                <span className="stat-value">45</span>
                <span className="stat-label">Students</span>
              </div>
            )}
          </div>
          <div className="stat-item" title="Pending Tasks">
            <span className="stat-icon">📝</span>
            {!isCollapsed && (
              <div className="stat-content">
                <span className="stat-value">8</span>
                <span className="stat-label">Tasks</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Sidebar Footer */}
      <div className="sidebar-footer">
        <button className="logout-btn" onClick={handleLogout} title="Logout">
          <span className="logout-icon">🚪</span>
          {!isCollapsed && <span className="logout-label">Logout</span>}
        </button>
        <div className="app-version">{!isCollapsed && <span className="version-text">v1.0.0</span>}</div>
      </div>
    </div>
  )
}

export default Sidebar
