"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import axios from "axios"
import toast from "react-hot-toast"

const StudentDashboard = () => {
  const { user } = useAuth()
  const [animationStep, setAnimationStep] = useState(0)
  const [stats, setStats] = useState({
    totalTasks: 0,
    completedTasks: 0,
    totalExams: 0,
    averageScore: 0,
  })
  const [recentActivity, setRecentActivity] = useState([])
  const [upcomingDeadlines, setUpcomingDeadlines] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let isMounted = true

    // Stagger animations
    const animationTimer = setInterval(() => {
      setAnimationStep(prev => prev + 1)
    }, 200)

    setTimeout(() => {
      clearInterval(animationTimer)
    }, 2000)

    const fetchDashboardData = async () => {
      try {
        setLoading(true)
        
        // Fetch data from multiple endpoints
        const [tasksResponse, examsResponse] = await Promise.all([
          axios.get("/api/tasks").catch(() => ({ data: [] })),
          axios.get("/api/exams").catch(() => ({ data: [] }))
        ])

        if (!isMounted) return

        const tasks = tasksResponse.data || []
        const exams = examsResponse.data || []

        // Calculate stats
        const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length
        const averageScore = 78 + Math.floor(Math.random() * 15) // Simulated

        setStats({
          totalTasks: tasks.length,
          completedTasks,
          totalExams: exams.length,
          averageScore
        })

        // Set recent activity
        const activities = []
        
        tasks.slice(0, 3).forEach(task => {
          activities.push({
            id: `task-${task._id}`,
            type: "task",
            title: `New task assigned: ${task.title}`,
            time: new Date(task.createdAt).toLocaleString(),
            icon: "bi-list-task",
            color: "primary"
          })
        })

        exams.slice(0, 2).forEach(exam => {
          activities.push({
            id: `exam-${exam._id}`,
            type: "exam",
            title: `Exam scheduled: ${exam.title}`,
            time: new Date(exam.createdAt).toLocaleString(),
            icon: "bi-clipboard-check",
            color: "warning"
          })
        })

        setRecentActivity(activities.slice(0, 5))

        // Set upcoming deadlines
        const deadlines = []
        
        tasks.forEach(task => {
          if (new Date(task.dueDate) > new Date()) {
            deadlines.push({
              id: task._id,
              title: task.title,
              subject: task.subject,
              dueDate: task.dueDate,
              type: "task",
              priority: task.priority
            })
          }
        })

        exams.forEach(exam => {
          if (new Date(exam.startDate) > new Date()) {
            deadlines.push({
              id: exam._id,
              title: exam.title,
              subject: exam.subject,
              dueDate: exam.startDate,
              type: "exam",
              priority: "HIGH"
            })
          }
        })

        setUpcomingDeadlines(deadlines.sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate)).slice(0, 5))

      } catch (error) {
        console.error("Error fetching dashboard data:", error)
        if (isMounted) {
          toast.error("Failed to load dashboard data")
        }
      } finally {
        if (isMounted) {
          setLoading(false)
        }
      }
    }

    if (user) {
      fetchDashboardData()
    }

    return () => {
      isMounted = false
      clearInterval(animationTimer)
    }
  }, [user])

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffTime = date - now
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 7) return `${diffDays} days`
    return date.toLocaleDateString()
  }

  const getPriorityColor = (priority) => {
    switch (priority) {
      case "HIGH":
      case "URGENT":
        return "danger"
      case "MEDIUM":
        return "warning"
      case "LOW":
        return "success"
      default:
        return "secondary"
    }
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <div className="spinner-border text-primary mb-3\" style={{ width: "3rem", height: "3rem" }}>
            <span className="visually-hidden">Loading...</span>
          </div>
          <h5 className="text-muted">Loading Dashboard...</h5>
        </div>
      </div>
    )
  }

  return (
    <div className="student-dashboard">
      {/* Enhanced Welcome Banner */}
      <div className={`row mb-4 ${animationStep >= 0 ? 'animate-slide-up' : ''}`}>
        <div className="col-12">
          <div className="welcome-hero">
            <div className="welcome-content">
              <div className="row align-items-center">
                <div className="col-lg-8">
                  <div className="welcome-text">
                    <h1 className="welcome-title">
                      Welcome back, {user?.fullName?.split(' ')[0]}! 
                      <span className="wave-emoji">👋</span>
                    </h1>
                    <p className="welcome-subtitle">
                      You have <span className="highlight">{stats.totalTasks}</span> tasks and 
                      <span className="highlight"> {stats.totalExams}</span> exams to focus on.
                      Keep up the great work!
                    </p>
                    <div className="welcome-actions">
                      <Link to="/dashboard/tasks" className="btn btn-welcome btn-primary">
                        <i className="bi bi-list-task me-2"></i>
                        View Tasks
                      </Link>
                      <Link to="/dashboard/exams" className="btn btn-welcome btn-outline-light">
                        <i className="bi bi-clipboard-check me-2"></i>
                        View Exams
                      </Link>
                    </div>
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="welcome-illustration">
                    <div className="floating-elements">
                      <div className="element element-1">📚</div>
                      <div className="element element-2">🎓</div>
                      <div className="element element-3">📝</div>
                      <div className="element element-4">💡</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Stats Cards */}
      <div className="row mb-4">
        {[
          { 
            icon: "bi-list-task", 
            value: stats.totalTasks, 
            label: "Total Tasks", 
            color: "primary",
            change: "+12%",
            changeType: "positive",
            link: "/dashboard/tasks"
          },
          { 
            icon: "bi-check-circle", 
            value: stats.completedTasks, 
            label: "Completed", 
            color: "success",
            change: "+8%",
            changeType: "positive",
            link: "/dashboard/tasks"
          },
          { 
            icon: "bi-clipboard-check", 
            value: stats.totalExams, 
            label: "Exams", 
            color: "warning",
            change: "+5%",
            changeType: "positive",
            link: "/dashboard/exams"
          },
          { 
            icon: "bi-trophy", 
            value: `${stats.averageScore}%`, 
            label: "Average Score", 
            color: "info",
            change: "+3%",
            changeType: "positive",
            link: "/dashboard/profile"
          }
        ].map((stat, index) => (
          <div key={index} className="col-lg-3 col-md-6 mb-3">
            <Link to={stat.link} className="text-decoration-none">
              <div 
                className={`enhanced-stat-card ${animationStep >= index + 1 ? 'animate-scale-in' : ''}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="stat-card-inner">
                  <div className="stat-header">
                    <div className={`stat-icon bg-${stat.color}`}>
                      <i className={stat.icon}></i>
                    </div>
                    <div className={`stat-change ${stat.changeType}`}>
                      <i className={`bi ${stat.changeType === 'positive' ? 'bi-arrow-up' : 'bi-arrow-down'}`}></i>
                      {stat.change}
                    </div>
                  </div>
                  <div className="stat-body">
                    <div className="stat-value">{stat.value}</div>
                    <div className="stat-label">{stat.label}</div>
                  </div>
                  <div className="stat-progress">
                    <div className={`progress-bar bg-${stat.color}`} style={{ width: "75%" }}></div>
                  </div>
                </div>
              </div>
            </Link>
          </div>
        ))}
      </div>

      {/* Main Content */}
      <div className="row mb-4">
        {/* Recent Activity */}
        <div className="col-lg-6 mb-3">
          <div className={`enhanced-activity-card ${animationStep >= 5 ? 'animate-slide-left' : ''}`}>
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-activity me-2 text-primary"></i>
                Recent Activity
              </h5>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => window.location.href = '/dashboard/notifications'}
              >
                <i className="bi bi-arrow-right"></i>
              </button>
            </div>
            <div className="card-body">
              <div className="activity-timeline">
                {recentActivity.length > 0 ? recentActivity.map((activity, index) => (
                  <div key={activity.id} className="timeline-item">
                    <div className={`timeline-icon bg-${activity.color}`}>
                      <i className={activity.icon}></i>
                    </div>
                    <div className="timeline-content">
                      <div className="timeline-title">{activity.title}</div>
                      <div className="timeline-time">{activity.time}</div>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-clock-history fs-1 mb-2"></i>
                    <p>No recent activity</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Upcoming Deadlines */}
        <div className="col-lg-6 mb-3">
          <div className={`enhanced-activity-card ${animationStep >= 6 ? 'animate-slide-right' : ''}`}>
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-clock me-2 text-danger"></i>
                Upcoming Deadlines
              </h5>
              <button 
                className="btn btn-sm btn-outline-primary"
                onClick={() => window.location.href = '/dashboard/calendar'}
              >
                <i className="bi bi-calendar"></i>
              </button>
            </div>
            <div className="card-body">
              <div className="deadlines-list">
                {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((deadline, index) => (
                  <div key={deadline.id} className="deadline-item">
                    <div className="deadline-header">
                      <div className="deadline-title">{deadline.title}</div>
                      <span className={`badge bg-${getPriorityColor(deadline.priority)}`}>
                        {deadline.type.toUpperCase()}
                      </span>
                    </div>
                    <div className="deadline-meta">
                      <span className="deadline-subject">{deadline.subject}</span>
                      <span className="deadline-time">{formatDate(deadline.dueDate)}</span>
                    </div>
                  </div>
                )) : (
                  <div className="text-center text-muted py-4">
                    <i className="bi bi-calendar-check fs-1 mb-2"></i>
                    <p>No upcoming deadlines</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Quick Actions */}
      <div className="row">
        <div className="col-12">
          <div className={`quick-actions-card ${animationStep >= 7 ? 'animate-fade-in' : ''}`}>
            <div className="card-header">
              <h5 className="card-title">
                <i className="bi bi-lightning me-2 text-warning"></i>
                Quick Actions
              </h5>
            </div>
            <div className="card-body">
              <div className="quick-actions-grid">
                {[
                  { 
                    icon: "bi-list-task", 
                    title: "View Tasks", 
                    description: "Check your assigned tasks",
                    link: "/dashboard/tasks",
                    color: "primary"
                  },
                  { 
                    icon: "bi-clipboard-check", 
                    title: "Take Exams", 
                    description: "Access your scheduled exams",
                    link: "/dashboard/exams",
                    color: "success"
                  },
                  { 
                    icon: "bi-calendar-event", 
                    title: "Calendar", 
                    description: "View your schedule",
                    link: "/dashboard/calendar",
                    color: "info"
                  },
                  { 
                    icon: "bi-chat-dots", 
                    title: "Messages", 
                    description: "Chat with tutors",
                    link: "/dashboard/chat",
                    color: "warning"
                  },
                  { 
                    icon: "bi-person", 
                    title: "Profile", 
                    description: "Update your information",
                    link: "/dashboard/profile",
                    color: "secondary"
                  },
                  { 
                    icon: "bi-bell", 
                    title: "Notifications", 
                    description: "Check your notifications",
                    link: "/dashboard/notifications",
                    color: "danger"
                  }
                ].map((action, index) => (
                  <Link 
                    key={index}
                    to={action.link}
                    className="quick-action-item"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="action-icon-wrapper">
                      <div className={`action-icon bg-${action.color}`}>
                        <i className={action.icon}></i>
                      </div>
                    </div>
                    <div className="action-content">
                      <h6 className="action-title">{action.title}</h6>
                      <p className="action-description">{action.description}</p>
                    </div>
                    <div className="action-arrow">
                      <i className="bi bi-arrow-right"></i>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .student-dashboard {
          padding: 1rem;
          background: linear-gradient(135deg, #f8fafc 0%, #e2e8f0 100%);
          min-height: 100vh;
        }

        /* Welcome Hero Section */
        .welcome-hero {
          background: linear-gradient(135deg, #10b981 0%, #059669 100%);
          border-radius: 24px;
          padding: 3rem;
          color: white;
          position: relative;
          overflow: hidden;
          box-shadow: 0 20px 40px rgba(16, 185, 129, 0.3);
        }

        .welcome-hero::before {
          content: '';
          position: absolute;
          top: -50%;
          right: -50%;
          width: 200%;
          height: 200%;
          background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
          animation: float 8s ease-in-out infinite;
        }

        .welcome-content {
          position: relative;
          z-index: 2;
        }

        .welcome-title {
          font-size: 2.5rem;
          font-weight: 800;
          margin-bottom: 1rem;
          line-height: 1.2;
        }

        .wave-emoji {
          display: inline-block;
          animation: wave 2s ease-in-out infinite;
          transform-origin: 70% 70%;
        }

        .welcome-subtitle {
          font-size: 1.2rem;
          opacity: 0.9;
          margin-bottom: 2rem;
          line-height: 1.6;
        }

        .highlight {
          background: rgba(255, 255, 255, 0.2);
          padding: 0.2rem 0.5rem;
          border-radius: 8px;
          font-weight: 600;
        }

        .welcome-actions {
          display: flex;
          gap: 1rem;
          flex-wrap: wrap;
        }

        .btn-welcome {
          padding: 0.75rem 2rem;
          border-radius: 12px;
          font-weight: 600;
          transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
          border: 2px solid transparent;
        }

        .btn-welcome:hover {
          transform: translateY(-3px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
        }

        .welcome-illustration {
          position: relative;
          height: 200px;
        }

        .floating-elements {
          position: relative;
          width: 100%;
          height: 100%;
        }

        .element {
          position: absolute;
          font-size: 2rem;
          animation: elementFloat 6s ease-in-out infinite;
          opacity: 0.8;
        }

        .element-1 { top: 20%; left: 20%; animation-delay: 0s; }
        .element-2 { top: 10%; right: 20%; animation-delay: 1.5s; }
        .element-3 { bottom: 30%; left: 30%; animation-delay: 3s; }
        .element-4 { bottom: 20%; right: 30%; animation-delay: 4.5s; }

        /* Enhanced Stat Cards */
        .enhanced-stat-card {
          background: white;
          border-radius: 20px;
          padding: 0;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          height: 100%;
        }

        .enhanced-stat-card:hover {
          transform: translateY(-8px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.15);
        }

        .stat-card-inner {
          padding: 1.5rem;
          height: 100%;
          display: flex;
          flex-direction: column;
        }

        .stat-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 1rem;
        }

        .stat-icon {
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

        .stat-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: inherit;
          opacity: 0.1;
          transform: scale(1.5);
        }

        .stat-change {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          font-size: 0.875rem;
          font-weight: 600;
          padding: 0.25rem 0.75rem;
          border-radius: 20px;
        }

        .stat-change.positive {
          background: rgba(34, 197, 94, 0.1);
          color: #22c55e;
        }

        .stat-body {
          flex: 1;
        }

        .stat-value {
          font-size: 2.5rem;
          font-weight: 800;
          color: #1f2937;
          margin-bottom: 0.5rem;
          line-height: 1;
        }

        .stat-label {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .stat-progress {
          height: 4px;
          background: #f3f4f6;
          border-radius: 2px;
          overflow: hidden;
          margin-top: 1rem;
        }

        .stat-progress .progress-bar {
          height: 100%;
          border-radius: 2px;
          transition: width 1s ease-in-out;
        }

        /* Enhanced Activity Cards */
        .enhanced-activity-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          overflow: hidden;
          height: 100%;
        }

        .enhanced-activity-card:hover {
          transform: translateY(-4px);
          box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12);
        }

        .card-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 1.5rem 1.5rem 0;
          border: none;
          background: none;
        }

        .card-title {
          margin: 0;
          font-weight: 700;
          color: #1f2937;
          display: flex;
          align-items: center;
        }

        .card-body {
          padding: 1.5rem;
        }

        /* Activity Timeline */
        .activity-timeline {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .timeline-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .timeline-item:hover {
          background: #f1f5f9;
          transform: translateX(4px);
        }

        .timeline-icon {
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

        .timeline-content {
          flex: 1;
        }

        .timeline-title {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .timeline-time {
          font-size: 0.875rem;
          color: #6b7280;
        }

        /* Deadline Items */
        .deadlines-list {
          display: flex;
          flex-direction: column;
          gap: 1rem;
        }

        .deadline-item {
          padding: 1rem;
          background: #f8fafc;
          border-radius: 12px;
          transition: all 0.3s ease;
        }

        .deadline-item:hover {
          background: #f1f5f9;
          transform: translateX(4px);
        }

        .deadline-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 0.5rem;
        }

        .deadline-title {
          font-weight: 600;
          color: #1f2937;
        }

        .deadline-meta {
          display: flex;
          justify-content: space-between;
          align-items: center;
          font-size: 0.875rem;
          color: #6b7280;
        }

        /* Quick Actions */
        .quick-actions-card {
          background: white;
          border-radius: 20px;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.08);
          overflow: hidden;
        }

        .quick-actions-grid {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
          gap: 1rem;
        }

        .quick-action-item {
          display: flex;
          align-items: center;
          gap: 1rem;
          padding: 1.5rem;
          background: #f8fafc;
          border-radius: 16px;
          border: 2px solid transparent;
          transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
          cursor: pointer;
          width: 100%;
          text-decoration: none;
          color: inherit;
        }

        .quick-action-item:hover {
          background: white;
          border-color: #e5e7eb;
          transform: translateY(-4px);
          box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
          color: inherit;
          text-decoration: none;
        }

        .action-icon-wrapper {
          position: relative;
        }

        .action-icon {
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

        .action-icon::before {
          content: '';
          position: absolute;
          inset: 0;
          border-radius: 16px;
          background: inherit;
          opacity: 0.1;
          transform: scale(1.5);
        }

        .action-content {
          flex: 1;
        }

        .action-title {
          font-weight: 700;
          color: #1f2937;
          margin-bottom: 0.25rem;
        }

        .action-description {
          color: #6b7280;
          margin: 0;
          font-size: 0.875rem;
        }

        .action-arrow {
          color: #6b7280;
          transition: all 0.3s ease;
        }

        .quick-action-item:hover .action-arrow {
          color: #3b82f6;
          transform: translateX(4px);
        }

        /* Animations */
        @keyframes wave {
          0%, 100% { transform: rotate(0deg); }
          25% { transform: rotate(20deg); }
          75% { transform: rotate(-10deg); }
        }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(0deg); }
          50% { transform: translateY(-20px) rotate(180deg); }
        }

        @keyframes elementFloat {
          0%, 100% { transform: translateY(0px) scale(1); }
          50% { transform: translateY(-15px) scale(1.1); }
        }

        .animate-slide-up {
          animation: slideUp 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-scale-in {
          animation: scaleIn 0.6s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-fade-in {
          animation: fadeIn 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-slide-left {
          animation: slideLeft 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
        }

        .animate-slide-right {
          animation: slideRight 0.8s cubic-bezier(0.4, 0, 0.2, 1) forwards;
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

        @keyframes fadeIn {
          from {
            opacity: 0;
          }
          to {
            opacity: 1;
          }
        }

        @keyframes slideLeft {
          from {
            opacity: 0;
            transform: translateX(-30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        @keyframes slideRight {
          from {
            opacity: 0;
            transform: translateX(30px);
          }
          to {
            opacity: 1;
            transform: translateX(0);
          }
        }

        /* Responsive Design */
        @media (max-width: 768px) {
          .student-dashboard {
            padding: 0.5rem;
          }

          .welcome-hero {
            padding: 2rem 1.5rem;
          }

          .welcome-title {
            font-size: 2rem;
          }

          .welcome-subtitle {
            font-size: 1rem;
          }

          .welcome-actions {
            flex-direction: column;
          }

          .quick-actions-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  )
}

export default StudentDashboard