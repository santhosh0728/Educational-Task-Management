"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js"
import { Doughnut, Line } from "react-chartjs-2"
import axios from "axios"
import toast from "react-hot-toast"
import { useAuth } from "../../contexts/AuthContext"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement)

const TutorDashboard = () => {
  const navigate = useNavigate()
  const { user, logout } = useAuth()
  const [stats, setStats] = useState({
    totalStudents: 0,
    activeTasks: 0,
    completedExams: 0,
    averageClassScore: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [classPerformance, setClassPerformance] = useState([])
  const [loading, setLoading] = useState(true)
  const [animationStep, setAnimationStep] = useState(0)
  const [showLogoutModal, setShowLogoutModal] = useState(false)
  const [loggingOut, setLoggingOut] = useState(false)

  useEffect(() => {
    fetchDashboardData()

    // Stagger animations
    const animationTimer = setInterval(() => {
      setAnimationStep((prev) => prev + 1)
    }, 200)

    setTimeout(() => {
      clearInterval(animationTimer)
    }, 2000)

    return () => clearInterval(animationTimer)
  }, [])

  const fetchDashboardData = async () => {
    try {
      setLoading(true)

      // Fetch real data from API
      const [tasksResponse, examsResponse, usersResponse] = await Promise.all([
        axios.get("/api/tasks").catch(() => ({ data: [] })),
        axios.get("/api/exams").catch(() => ({ data: [] })),
        axios.get("/api/users?role=STUDENT").catch(() => ({ data: { users: [] } })),
      ])

      const tasks = tasksResponse.data || []
      const exams = examsResponse.data || []
      const students = usersResponse.data?.users || []

      // Calculate real stats
      const activeTasks = tasks.filter((task) => task.status === "ASSIGNED" || task.status === "IN_PROGRESS").length

      const completedExams = exams.filter((exam) => new Date(exam.endDate) < new Date()).length

      setStats({
        totalStudents: students.length,
        activeTasks: activeTasks,
        completedExams: completedExams,
        averageClassScore: 78 + Math.floor(Math.random() * 15), // Simulated for now
      })

      // Generate recent activity from real data
      const activities = []

      tasks.slice(0, 3).forEach((task) => {
        activities.push({
          id: `task-${task._id}`,
          type: "task_created",
          title: `Created task: ${task.title}`,
          time: new Date(task.createdAt).toLocaleString(),
          icon: "bi-plus-circle",
          color: "primary",
          link: `/dashboard/tasks/${task._id}`,
        })
      })

      exams.slice(0, 2).forEach((exam) => {
        activities.push({
          id: `exam-${exam._id}`,
          type: "exam_created",
          title: `Created exam: ${exam.title}`,
          time: new Date(exam.createdAt).toLocaleString(),
          icon: "bi-clipboard-check",
          color: "success",
          link: `/dashboard/exams/${exam._id}`,
        })
      })

      setRecentActivity(activities.slice(0, 5))

      // Set class performance data
      setClassPerformance([
        { subject: "Mathematics", average: 85, trend: "up", students: Math.floor(students.length * 0.3) },
        { subject: "Physics", average: 78, trend: "down", students: Math.floor(students.length * 0.25) },
        { subject: "Chemistry", average: 82, trend: "up", students: Math.floor(students.length * 0.2) },
        { subject: "Biology", average: 79, trend: "stable", students: Math.floor(students.length * 0.25) },
      ])
    } catch (error) {
      console.error("Error fetching dashboard data:", error)
      toast.error("Failed to load dashboard data")
    } finally {
      setLoading(false)
    }
  }

  // Handle navigation clicks
  const handleNavigation = (path) => {
    navigate(path)
  }

  // Enhanced logout functionality
  const handleLogout = async () => {
    setLoggingOut(true)
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)) // Simulate logout process
      logout()
      toast.success("👋 Successfully logged out!")
      navigate("/signin")
    } catch (error) {
      toast.error("Failed to logout. Please try again.")
    } finally {
      setLoggingOut(false)
      setShowLogoutModal(false)
    }
  }

  const studentEngagementData = {
    labels: ["Highly Active", "Moderately Active", "Low Activity"],
    datasets: [
      {
        data: [35, 45, 20],
        backgroundColor: ["rgba(34, 197, 94, 0.8)", "rgba(251, 191, 36, 0.8)", "rgba(239, 68, 68, 0.8)"],
        borderColor: ["rgba(34, 197, 94, 1)", "rgba(251, 191, 36, 1)", "rgba(239, 68, 68, 1)"],
        borderWidth: 2,
        hoverOffset: 10,
      },
    ],
  }

  const performanceTrendData = {
    labels: ["Week 1", "Week 2", "Week 3", "Week 4", "Week 5", "Week 6"],
    datasets: [
      {
        label: "Class Average (%)",
        data: [72, 75, 78, 76, 80, 82],
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
        pointHoverRadius: 8,
      },
    ],
  }

  const subjectComparisonData = {
    labels: classPerformance.map((p) => p.subject),
    datasets: [
      {
        label: "Average Score",
        data: classPerformance.map((p) => p.average),
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: ["rgba(99, 102, 241, 1)", "rgba(34, 197, 94, 1)", "rgba(251, 191, 36, 1)", "rgba(239, 68, 68, 1)"],
        borderWidth: 2,
        borderRadius: 8,
        borderSkipped: false,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
          font: {
            size: 12,
            weight: "500",
          },
        },
      },
      tooltip: {
        backgroundColor: "rgba(0, 0, 0, 0.8)",
        titleColor: "#fff",
        bodyColor: "#fff",
        borderColor: "rgba(99, 102, 241, 0.5)",
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
      x: {
        grid: {
          display: false,
        },
        ticks: {
          font: {
            size: 11,
          },
        },
      },
    },
  }

  if (loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-content">
          <div className="loading-spinner">
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
            <div className="spinner-ring"></div>
          </div>
          <h3 className="loading-title">Loading Dashboard...</h3>
          <p className="loading-subtitle">Preparing your personalized experience</p>
        </div>
      </div>
    )
  }

  return (
    <div className="modern-tutor-dashboard">
      {/* Enhanced Header with User Info and Logout */}
      <div className={`dashboard-header ${animationStep >= 0 ? "animate-slide-down" : ""}`}>
        <div className="header-content">
          <div className="user-welcome">
            <div className="user-avatar-large">
              <img
                src={
                  user?.avatar ||
                  `https://ui-avatars.com/api/?name=${encodeURIComponent(user?.fullName || "User")}&background=667eea&color=fff&size=80`
                }
                alt="User Avatar"
                className="avatar-image"
              />
              <div className="status-dot online"></div>
            </div>
            <div className="welcome-text">
              <h1 className="welcome-title">
                Welcome back, {user?.fullName?.split(" ")[0] || "Professor"}!<span className="wave-emoji">👋</span>
              </h1>
              <p className="welcome-subtitle">Ready to inspire and educate? Let's make today productive!</p>
              <div className="user-stats">
                <span className="stat-badge">
                  <i className="bi bi-calendar-check"></i>
                  {new Date().toLocaleDateString("en-US", {
                    weekday: "long",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                  })}
                </span>
                <span className="stat-badge">
                  <i className="bi bi-clock"></i>
                  {new Date().toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                </span>
              </div>
            </div>
          </div>
          <div className="header-actions">
            <button className="action-btn notification-btn">
              <i className="bi bi-bell"></i>
              <span className="notification-badge">3</span>
            </button>
            <button className="action-btn settings-btn" onClick={() => navigate("/dashboard/profile")}>
              <i className="bi bi-gear"></i>
            </button>
            <button className="logout-btn-header" onClick={() => setShowLogoutModal(true)}>
              <i className="bi bi-box-arrow-right"></i>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="stats-section">
        <div className="stats-grid">
          {[
            {
              icon: "bi-people",
              value: stats.totalStudents,
              label: "Total Students",
              color: "primary",
              change: "+12%",
              changeType: "positive",
              description: "Active learners",
            },
            {
              icon: "bi-list-task",
              value: stats.activeTasks,
              label: "Active Tasks",
              color: "success",
              change: "+5%",
              changeType: "positive",
              description: "Pending assignments",
            },
            {
              icon: "bi-clipboard-check",
              value: stats.completedExams,
              label: "Completed Exams",
              color: "warning",
              change: "+8%",
              changeType: "positive",
              description: "This month",
            },
            {
              icon: "bi-graph-up",
              value: `${stats.averageClassScore}%`,
              label: "Class Average",
              color: "info",
              change: "+3%",
              changeType: "positive",
              description: "Overall performance",
            },
          ].map((stat, index) => (
            <div key={index} className={`modern-stat-card ${animationStep >= index + 1 ? "animate-scale-in" : ""}`}>
              <div className="stat-card-header">
                <div className={`stat-icon-modern bg-${stat.color}`}>
                  <i className={stat.icon}></i>
                </div>
                <div className={`stat-change-modern ${stat.changeType}`}>
                  <i className={`bi ${stat.changeType === "positive" ? "bi-trending-up" : "bi-trending-down"}`}></i>
                  {stat.change}
                </div>
              </div>
              <div className="stat-content">
                <div className="stat-value-modern">{stat.value}</div>
                <div className="stat-label-modern">{stat.label}</div>
                <div className="stat-description">{stat.description}</div>
              </div>
              <div className="stat-progress-modern">
                <div className={`progress-fill bg-${stat.color}`} style={{ width: "75%" }}></div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick Actions Section */}
      <div className="quick-actions-section">
        <div className="section-header">
          <h2 className="section-title">
            <i className="bi bi-lightning-charge"></i>
            Quick Actions
          </h2>
          <p className="section-subtitle">Get things done faster</p>
        </div>
        <div className="quick-actions-grid-modern">
          {[
            {
              icon: "bi-plus-circle",
              title: "Create Task",
              description: "Assign new tasks to students",
              link: "/dashboard/tasks/create",
              color: "primary",
              gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            },
            {
              icon: "bi-clipboard-plus",
              title: "Create Exam",
              description: "Design and schedule exams",
              link: "/dashboard/exams/create",
              color: "success",
              gradient: "linear-gradient(135deg, #11998e 0%, #38ef7d 100%)",
            },
            {
              icon: "bi-people",
              title: "Manage Students",
              description: "View and organize student groups",
              link: "/dashboard/students",
              color: "info",
              gradient: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
            },
            {
              icon: "bi-graph-up",
              title: "View Analytics",
              description: "Analyze performance metrics",
              link: "/dashboard/analytics",
              color: "warning",
              gradient: "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
            },
          ].map((action, index) => (
            <button
              key={index}
              onClick={() => handleNavigation(action.link)}
              className="modern-quick-action"
              style={{ background: action.gradient }}
            >
              <div className="action-icon-modern">
                <i className={action.icon}></i>
              </div>
              <div className="action-content-modern">
                <h3 className="action-title-modern">{action.title}</h3>
                <p className="action-description-modern">{action.description}</p>
              </div>
              <div className="action-arrow-modern">
                <i className="bi bi-arrow-right"></i>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Charts and Analytics */}
      <div className="analytics-section">
        <div className="analytics-grid">
          <div className="chart-card-modern">
            <div className="chart-header-modern">
              <h3 className="chart-title-modern">
                <i className="bi bi-pie-chart"></i>
                Student Engagement
              </h3>
            </div>
            <div className="chart-body-modern">
              <Doughnut data={studentEngagementData} options={chartOptions} />
            </div>
          </div>

          <div className="chart-card-modern large">
            <div className="chart-header-modern">
              <h3 className="chart-title-modern">
                <i className="bi bi-graph-up"></i>
                Performance Trend
              </h3>
            </div>
            <div className="chart-body-modern">
              <Line data={performanceTrendData} options={chartOptions} />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity and Performance */}
      <div className="activity-section">
        <div className="activity-grid">
          <div className="activity-card-modern">
            <div className="card-header-modern">
              <h3 className="card-title-modern">
                <i className="bi bi-activity"></i>
                Recent Activity
              </h3>
            </div>
            <div className="activity-list-modern">
              {recentActivity.length > 0 ? (
                recentActivity.map((activity, index) => (
                  <div key={activity.id} className="activity-item-modern">
                    <div className={`activity-icon-modern bg-${activity.color}`}>
                      <i className={activity.icon}></i>
                    </div>
                    <div className="activity-content-modern">
                      <div className="activity-title-modern">{activity.title}</div>
                      <div className="activity-time-modern">{activity.time}</div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="empty-state">
                  <i className="bi bi-clock-history"></i>
                  <p>No recent activity</p>
                </div>
              )}
            </div>
          </div>

          <div className="performance-card-modern">
            <div className="card-header-modern">
              <h3 className="card-title-modern">
                <i className="bi bi-bar-chart"></i>
                Subject Performance
              </h3>
            </div>
            <div className="performance-list-modern">
              {classPerformance.map((subject, index) => (
                <div key={index} className="performance-item-modern">
                  <div className="subject-info-modern">
                    <div className="subject-name-modern">{subject.subject}</div>
                    <div className="subject-students-modern">{subject.students} students</div>
                  </div>
                  <div className="performance-score-modern">
                    <span className="score-value-modern">{subject.average}%</span>
                    <div className={`trend-indicator-modern ${subject.trend}`}>
                      <i
                        className={`bi ${
                          subject.trend === "up"
                            ? "bi-arrow-up"
                            : subject.trend === "down"
                              ? "bi-arrow-down"
                              : "bi-dash"
                        }`}
                      ></i>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Logout Modal */}
      {showLogoutModal && (
        <div className="logout-modal-overlay" onClick={() => setShowLogoutModal(false)}>
          <div className="logout-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="logout-icon">
                <i className="bi bi-box-arrow-right"></i>
              </div>
              <h3>Confirm Logout</h3>
              <p>Are you sure you want to logout from your account?</p>
            </div>
            <div className="modal-actions">
              <button className="btn-cancel" onClick={() => setShowLogoutModal(false)} disabled={loggingOut}>
                Cancel
              </button>
              <button className="btn-logout" onClick={handleLogout} disabled={loggingOut}>
                {loggingOut ? (
                  <>
                    <div className="logout-spinner"></div>
                    Logging out...
                  </>
                ) : (
                  <>
                    <i className="bi bi-box-arrow-right"></i>
                    Logout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .modern-tutor-dashboard {
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
          padding: 1rem;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
          maxWidth: 100vw;
          overflowX: hidden;
        }

        /* Loading Styles */
        .dashboard-loading {
          display: flex;
          align-items: center;
          justify-content: center;
          min-height: 100vh;
          background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
        }

        .loading-content {
          text-align: center;
          color: white;
        }

        .loading-spinner {
          position: relative;
          width: 80px;
          height: 80px;
          margin: 0 auto 2rem;
        }

        .spinner-ring {
          position: absolute;
          width: 100%;
          height: 100%;
          border: 3px solid transparent;
          border-top: 3px solid rgba(255, 255, 255, 0.8);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .spinner-ring:nth-child(2) {
          width: 60px;
          height: 60px;
          top: 10px;
          left: 10px;
          animation-delay: -0.3s;
        }

        .spinner-ring:nth-child(3) {
          width: 40px;
          height: 40px;
          top: 20px;
          left: 20px;
          animation-delay: -0.6s;
        }

        .loading-title {
          font-size: 1.5rem;
          font-weight: 600;
          margin-bottom: 0.5rem;
        }

        .loading-subtitle {
          opacity: 0.8;
          font-size: 1rem;
        }

        /* Header Styles */
        .dashboard-header {
          background: rgba(30, 41, 59, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 24px;
          padding: 1.5rem;
          margin-bottom: 2rem;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          maxWidth: 100%;
          overflowX: hidden;
        }

        .header-content {
          display: flex;
          justify-content: space-between;
          align-items: center;
          gap: 2rem;
          flexWrap: wrap;
          maxWidth: 100%;
        }

        .user-welcome {
          display: flex;
          align-items: center;
          gap: 1.5rem;
        }

        .user-avatar-large {
          position: relative;
        }

        .avatar-image {
          width: 80px;
          height: 80px;
          border-radius: 20px;
          border: 4px solid rgba(102, 126, 234, 0.2);
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
        }

        .status-dot {
          position: absolute;
          bottom: 5px;
          right: 5px;
          width: 16px;
          height: 16px;
          background: #22c55e;
          border: 3px solid white;
          border-radius: 50%;
          box-shadow: 0 2px 8px rgba(34, 197, 94, 0.3);
        }

        .status-dot.online {
          animation: pulse 2s infinite;
        }

        .welcome-title {
          font-size: 1.8rem;
          font-weight: 800;
          color: #f8fafc;
          margin-bottom: 0.5rem;
          line-height: 1.2;
        }

        .wave-emoji {
          display: inline-block;
          animation: wave 2s ease-in-out infinite;
          transform-origin: 70% 70%;
        }

        .welcome-subtitle {
          color: #cbd5e1;
          font-size: 1.1rem;
          margin-bottom: 1rem;
        }

        .user-stats {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .stat-badge {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          padding: 0.5rem 1rem;
          border-radius: 12px;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .header-actions {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .action-btn {
          position: relative;
          width: 48px;
          height: 48px;
          border: none;
          background: rgba(102, 126, 234, 0.1);
          color: #667eea;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.2rem;
          cursor: pointer;
          transition: all 0.3s ease;
        }

        .action-btn:hover {
          background: rgba(102, 126, 234, 0.2);
          transform: translateY(-2px);
        }

        .notification-badge {
          position: absolute;
          top: -5px;
          right: -5px;
          background: #ef4444;
          color: white;
          font-size: 0.75rem;
          font-weight: 600;
          padding: 0.2rem 0.4rem;
          border-radius: 10px;
          min-width: 18px;
          text-align: center;
        }

        .logout-btn-header {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          box-shadow: 0 4px 15px rgba(239, 68, 68, 0.3);
        }

        .logout-btn-header:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.4);
        }

        /* Stats Section */
        .stats-section {
          margin-bottom: 2rem;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
          gap: 1.5rem;
          maxWidth: 100%;
          overflowX: auto;
        }

        .modern-stat-card {
          background: rgba(30, 41, 59, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 1.5rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
          transition: all 0.4s ease;
          position: relative;
          overflow: hidden;
        }

        .modern-stat-card::before {
          content: '';
          position: absolute;
          top: 0;
          left: 0;
          right: 0;
          height: 4px;
          background: linear-gradient(90deg, #667eea, #764ba2);
        }

        .modern-stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1.5rem;
        }

        .stat-icon-modern {
          width: 60px;
          height: 60px;
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          color: white;
          position: relative;
        }

        .stat-change-modern {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.5rem 1rem;
          border-radius: 20px;
        }

        .stat-change-modern.positive {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .stat-value-modern {
          font-size: 3rem;
          font-weight: 800;
          color: #f8fafc;
          margin-bottom: 0.5rem;
          line-height: 1;
        }

        .stat-label-modern {
          color: #cbd5e1;
          font-size: 1rem;
          font-weight: 600;
          margin-bottom: 0.25rem;
        }

        .stat-description {
          color: #94a3b8;
          font-size: 0.875rem;
        }

        .stat-progress-modern {
          height: 6px;
          background: #f3f4f6;
          border-radius: 3px;
          overflow: hidden;
          margin-top: 1rem;
        }

        .progress-fill {
          height: 100%;
          border-radius: 3px;
          transition: width 1.5s ease-in-out;
        }

        /* Quick Actions */
        .quick-actions-section {
          margin-bottom: 2rem;
        }

        .section-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .section-title {
          font-size: 2rem;
          font-weight: 800;
          color: #f8fafc;
          margin-bottom: 0.5rem;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .section-subtitle {
          color: rgba(255, 255, 255, 0.8);
          font-size: 1.1rem;
        }

        .quick-actions-grid-modern {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
          gap: 1.5rem;
        }

        .modern-quick-action {
          display: flex;
          align-items: center;
          gap: 1.5rem;
          padding: 2rem;
          border: none;
          border-radius: 20px;
          color: #f8fafc;
          cursor: pointer;
          transition: all 0.4s ease;
          text-align: left;
          position: relative;
          overflow: hidden;
        }

        .modern-quick-action::before {
          content: '';
          position: absolute;
          top: 0;
          left: -100%;
          width: 100%;
          height: 100%;
          background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent);
          transition: left 0.5s ease;
        }

        .modern-quick-action:hover::before {
          left: 100%;
        }

        .modern-quick-action:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
        }

        .action-icon-modern {
          width: 60px;
          height: 60px;
          background: rgba(255, 255, 255, 0.2);
          border-radius: 16px;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 1.5rem;
          flex-shrink: 0;
        }

        .action-content-modern {
          flex: 1;
        }

        .action-title-modern {
          font-size: 1.25rem;
          font-weight: 700;
          margin-bottom: 0.5rem;
        }

        .action-description-modern {
          opacity: 0.9;
          margin: 0;
        }

        .action-arrow-modern {
          font-size: 1.5rem;
          opacity: 0.7;
          transition: all 0.3s ease;
        }

        .modern-quick-action:hover .action-arrow-modern {
          opacity: 1;
          transform: translateX(5px);
        }

        /* Analytics Section */
        .analytics-section {
          margin-bottom: 2rem;
        }

        .analytics-grid {
          display: grid;
          grid-template-columns: 1fr 2fr;
          gap: 1.5rem;
        }

        .chart-card-modern {
          background: rgba(30, 41, 59, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .chart-header-modern {
          margin-bottom: 1.5rem;
        }

        .chart-title-modern {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .chart-body-modern {
          height: 300px;
          position: relative;
        }

        /* Activity Section */
        .activity-section {
          margin-bottom: 2rem;
        }

        .activity-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: 1.5rem;
        }

        .activity-card-modern,
        .performance-card-modern {
          background: rgba(30, 41, 59, 0.95);
          backdrop-filter: blur(20px);
          border-radius: 20px;
          padding: 2rem;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.1);
          border: 1px solid rgba(255, 255, 255, 0.2);
        }

        .card-header-modern {
          margin-bottom: 1.5rem;
        }

        .card-title-modern {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f8fafc;
          display: flex;
          align-items: center;
          gap: 0.5rem;
        }

        .activity-list-modern,
        .performance-list-modern {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .activity-item-modern {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: rgba(51, 65, 85, 0.3);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .activity-item-modern:hover {
          background: rgba(51, 65, 85, 0.5);
          transform: translateX(5px);
        }

        .activity-icon-modern {
          width: 40px;
          height: 40px;
          border-radius: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1rem;
          flex-shrink: 0;
        }

        .activity-content-modern {
          flex: 1;
        }

        .activity-title-modern {
          font-weight: 600;
          color: #f8fafc;
          margin-bottom: 0.25rem;
        }

        .activity-time-modern {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .performance-item-modern {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1rem;
          background: rgba(51, 65, 85, 0.3);
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .performance-item-modern:hover {
          background: rgba(51, 65, 85, 0.5);
          transform: translateX(5px);
        }

        .subject-info-modern {
          flex: 1;
        }

        .subject-name-modern {
          font-weight: 600;
          color: #f8fafc;
          margin-bottom: 0.25rem;
        }

        .subject-students-modern {
          font-size: 0.875rem;
          color: #94a3b8;
        }

        .performance-score-modern {
          display: flex;
          align-items: center;
          gap: 1rem;
        }

        .score-value-modern {
          font-size: 1.25rem;
          font-weight: 700;
          color: #f8fafc;
        }

        .trend-indicator-modern {
          width: 32px;
          height: 32px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          font-size: 0.875rem;
        }

        .trend-indicator-modern.up {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .trend-indicator-modern.down {
          background: rgba(239, 68, 68, 0.1);
          color: #ef4444;
        }

        .trend-indicator-modern.stable {
          background: rgba(107, 114, 128, 0.1);
          color: #6b7280;
        }

        .empty-state {
          text-align: center;
          padding: 2rem;
          color: #6b7280;
        }

        .empty-state i {
          font-size: 3rem;
          margin-bottom: 1rem;
          opacity: 0.5;
        }

        /* Logout Modal */
        .logout-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.5);
          backdrop-filter: blur(10px);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          animation: fadeIn 0.3s ease;
        }

        .logout-modal {
          background: #1e293b;
          color: #f8fafc;
          border-radius: 20px;
          padding: 2rem;
          max-width: 400px;
          width: 90%;
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.2);
          animation: slideUp 0.3s ease;
        }

        .modal-header {
          text-align: center;
          margin-bottom: 2rem;
        }

        .logout-icon {
          width: 80px;
          height: 80px;
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          margin: 0 auto 1rem;
          color: white;
          font-size: 2rem;
        }

        .modal-header h3 {
          font-size: 1.5rem;
          font-weight: 700;
          color: #f8fafc;
          margin-bottom: 0.5rem;
        }

        .modal-header p {
          color: #cbd5e1;
          margin: 0;
        }

        .modal-actions {
          display: flex;
          gap: 1rem;
        }

        .btn-cancel,
        .btn-logout {
          flex: 1;
          padding: 0.75rem 1.5rem;
          border-radius: 12px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.3s ease;
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 0.5rem;
        }

        .btn-cancel {
          background: #334155;
          color: #f8fafc;
          border: 1px solid #475569;
        }

        .btn-cancel:hover {
          background: #475569;
        }

        .btn-logout {
          background: linear-gradient(135deg, #ef4444 0%, #dc2626 100%);
          color: white;
          border: none;
        }

        .btn-logout:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(239, 68, 68, 0.3);
        }

        .btn-logout:disabled {
          opacity: 0.7;
          cursor: not-allowed;
          transform: none;
        }

        .logout-spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        /* Animations */
        @keyframes spin {
          to { transform: rotate(360deg); }
        }

        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
        }

        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.5; }
        }

        @keyframes fadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }

        @keyframes slideUp {
          from {
            opacity: 0;
            transform: translateY(30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        .animate-slide-down {
          animation: slideDown 0.8s ease forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.6s ease forwards;
        }

        @keyframes slideDown {
          from {
            opacity: 0;
            transform: translateY(-30px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }

        @keyframes scaleIn {
          from {
            opacity: 0;
            transform: scale(0.9);
          }
          to {
            opacity: 1;
            transform: scale(1);
          }
        }

        /* Responsive Design */
        @media (max-width: 1200px) {
          .analytics-grid {
            grid-template-columns: 1fr;
          }
        }

        @media (max-width: 1400px) {
          .stats-grid {
            grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
            gap: 1rem;
          }
          
          .modern-tutor-dashboard {
            padding: 0.5rem;
          }
          
          .dashboard-header {
            padding: 1rem;
          }
        }

        @media (max-width: 768px) {
          .modern-tutor-dashboard {
            padding: 1rem;
          }

          .header-content {
            flex-direction: column;
            text-align: center;
            gap: 1.5rem;
          }

          .user-welcome {
            flex-direction: column;
            text-align: center;
          }

          .welcome-title {
            font-size: 1.5rem;
          }

          .stats-grid {
            grid-template-columns: 1fr;
          }

          .quick-actions-grid-modern {
            grid-template-columns: 1fr;
          }

          .activity-grid {
            grid-template-columns: 1fr;
          }

          .user-stats {
            justify-content: center;
          }

          .header-actions {
            flex-wrap: wrap;
            justify-content: center;
          }
        }

        @media (max-width: 480px) {
          .dashboard-header {
            padding: 1.5rem;
          }

          .modern-stat-card {
            padding: 1.5rem;
          }

          .modern-quick-action {
            padding: 1.5rem;
          }

          .chart-card-modern,
          .activity-card-modern,
          .performance-card-modern {
            padding: 1.5rem;
          }
        }
      `}</style>
    </div>
  )
}

export default TutorDashboard
