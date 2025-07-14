"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import axios from "axios"
import toast from "react-hot-toast"

const Notifications = () => {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState([])
  const [filter, setFilter] = useState("all")
  const [loading, setLoading] = useState(true)
  const [showNewMessageModal, setShowNewMessageModal] = useState(false)
  const [students, setStudents] = useState([])
  const [newMessage, setNewMessage] = useState({
    recipientId: "",
    recipientName: "",
    subject: "",
    message: ""
  })

  useEffect(() => {
    fetchNotifications()
    if (user?.role === "TUTOR") {
      fetchStudents()
    }
  }, [user])

  const fetchStudents = async () => {
    try {
      const response = await axios.get("/api/users?role=STUDENT")
      if (response.data.success) {
        setStudents(response.data.users || [])
      }
    } catch (error) {
      console.error("Error fetching students:", error)
    }
  }

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      
      // Simulate API call - replace with actual endpoint
      setTimeout(() => {
        const mockNotifications = [
          {
            id: 1,
            type: "task",
            title: "New Task Assigned",
            message: "You have been assigned a new Mathematics task: 'Calculus Problem Set'",
            time: new Date(Date.now() - 1000 * 60 * 30), // 30 minutes ago
            read: false,
            icon: "bi-list-task",
            color: "primary"
          },
          {
            id: 2,
            type: "exam",
            title: "Exam Reminder",
            message: "Physics exam is scheduled for tomorrow at 10:00 AM",
            time: new Date(Date.now() - 1000 * 60 * 60 * 2), // 2 hours ago
            read: false,
            icon: "bi-clipboard-check",
            color: "warning"
          },
          {
            id: 3,
            type: "grade",
            title: "Grade Published",
            message: "Your Chemistry assignment has been graded: 85/100",
            time: new Date(Date.now() - 1000 * 60 * 60 * 5), // 5 hours ago
            read: true,
            icon: "bi-trophy",
            color: "success"
          },
          {
            id: 4,
            type: "message",
            title: "New Message",
            message: "Dr. Smith sent you a message about the upcoming project",
            time: new Date(Date.now() - 1000 * 60 * 60 * 24), // 1 day ago
            read: true,
            icon: "bi-chat-dots",
            color: "info"
          },
          {
            id: 5,
            type: "deadline",
            title: "Deadline Approaching",
            message: "Biology assignment is due in 2 days",
            time: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2), // 2 days ago
            read: true,
            icon: "bi-clock",
            color: "danger"
          }
        ]
        
        setNotifications(mockNotifications)
        setLoading(false)
      }, 1000)
      
    } catch (error) {
      console.error("Error fetching notifications:", error)
      setLoading(false)
    }
  }

  const markAsRead = (id) => {
    setNotifications(prev => 
      prev.map(notif => 
        notif.id === id ? { ...notif, read: true } : notif
      )
    )
  }

  const markAllAsRead = () => {
    setNotifications(prev => 
      prev.map(notif => ({ ...notif, read: true }))
    )
  }

  const deleteNotification = (id) => {
    setNotifications(prev => prev.filter(notif => notif.id !== id))
  }

  const handleNewMessage = () => {
    setShowNewMessageModal(true)
  }

  const handleStudentSelect = (student) => {
    setNewMessage(prev => ({
      ...prev,
      recipientId: student._id,
      recipientName: student.fullName
    }))
  }

  const sendNewMessage = async () => {
    if (!newMessage.recipientId || !newMessage.subject || !newMessage.message) {
      toast.error("Please fill in all required fields")
      return
    }

    try {
      // Here you would typically send the message via API
      console.log("Sending message:", newMessage)
      
      // Add the new message as a notification (for demo purposes)
      const newNotification = {
        id: Date.now(),
        type: "message",
        title: "Message Sent",
        message: `Message sent to ${newMessage.recipientName}: ${newMessage.subject}`,
        time: new Date(),
        read: false,
        icon: "bi-send",
        color: "success"
      }
      
      setNotifications(prev => [newNotification, ...prev])
      setShowNewMessageModal(false)
      setNewMessage({ recipientId: "", recipientName: "", subject: "", message: "" })
      toast.success("Message sent successfully!")
      
    } catch (error) {
      console.error("Error sending message:", error)
      toast.error("Failed to send message")
    }
  }

  const filteredNotifications = notifications.filter(notif => {
    if (filter === "unread") return !notif.read
    if (filter === "read") return notif.read
    if (filter !== "all") return notif.type === filter
    return true
  })

  const formatTime = (date) => {
    const now = new Date()
    const diff = now - date
    const minutes = Math.floor(diff / (1000 * 60))
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))

    if (minutes < 60) return `${minutes}m ago`
    if (hours < 24) return `${hours}h ago`
    return `${days}d ago`
  }

  const unreadCount = notifications.filter(n => !n.read).length

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-bell me-2 text-primary"></i>
                Notifications
                {unreadCount > 0 && (
                  <span className="badge bg-danger ms-2">{unreadCount}</span>
                )}
              </h2>
              <p className="text-muted mb-0">Stay updated with your latest activities</p>
            </div>
            <div className="d-flex gap-2">
              <button 
                className="btn btn-success"
                onClick={handleNewMessage}
              >
                <i className="bi bi-plus-circle me-2"></i>
                New Message
              </button>
              {unreadCount > 0 && (
                <button 
                  className="btn btn-outline-primary"
                  onClick={markAllAsRead}
                >
                  <i className="bi bi-check-all me-2"></i>
                  Mark All Read
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="d-flex flex-wrap gap-2">
                {[
                  { key: "all", label: "All", icon: "bi-list" },
                  { key: "unread", label: "Unread", icon: "bi-circle-fill" },
                  { key: "read", label: "Read", icon: "bi-check-circle" },
                  { key: "task", label: "Tasks", icon: "bi-list-task" },
                  { key: "exam", label: "Exams", icon: "bi-clipboard-check" },
                  { key: "grade", label: "Grades", icon: "bi-trophy" },
                  { key: "message", label: "Messages", icon: "bi-chat-dots" },
                  { key: "deadline", label: "Deadlines", icon: "bi-clock" }
                ].map(filterOption => (
                  <button
                    key={filterOption.key}
                    className={`btn ${filter === filterOption.key ? 'btn-primary' : 'btn-outline-secondary'}`}
                    onClick={() => setFilter(filterOption.key)}
                  >
                    <i className={`${filterOption.icon} me-2`}></i>
                    {filterOption.label}
                    {filterOption.key === "unread" && unreadCount > 0 && (
                      <span className="badge bg-light text-dark ms-2">{unreadCount}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Notifications List */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body p-0">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center p-5">
                  <div className="spinner-border text-primary\" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredNotifications.length === 0 ? (
                <div className="text-center p-5">
                  <i className="bi bi-bell-slash text-muted" style={{ fontSize: "3rem" }}></i>
                  <h5 className="mt-3">No Notifications</h5>
                  <p className="text-muted">
                    {filter === "all" 
                      ? "You don't have any notifications yet." 
                      : `No ${filter} notifications found.`
                    }
                  </p>
                </div>
              ) : (
                <div className="notifications-list">
                  {filteredNotifications.map((notification, index) => (
                    <div 
                      key={notification.id} 
                      className={`notification-item ${!notification.read ? 'unread' : ''}`}
                    >
                      <div className="notification-content">
                        <div className="notification-icon-wrapper">
                          <div className={`notification-icon bg-${notification.color}`}>
                            <i className={notification.icon}></i>
                          </div>
                          {!notification.read && (
                            <div className="unread-indicator"></div>
                          )}
                        </div>
                        
                        <div className="notification-body">
                          <div className="notification-header">
                            <h6 className="notification-title">{notification.title}</h6>
                            <span className="notification-time">{formatTime(notification.time)}</span>
                          </div>
                          <p className="notification-message">{notification.message}</p>
                        </div>
                        
                        <div className="notification-actions">
                          <div className="dropdown">
                            <button 
                              className="btn btn-sm btn-outline-secondary dropdown-toggle"
                              data-bs-toggle="dropdown"
                            >
                              <i className="bi bi-three-dots"></i>
                            </button>
                            <ul className="dropdown-menu">
                              {!notification.read && (
                                <li>
                                  <button 
                                    className="dropdown-item"
                                    onClick={() => markAsRead(notification.id)}
                                  >
                                    <i className="bi bi-check me-2"></i>Mark as Read
                                  </button>
                                </li>
                              )}
                              <li>
                                <button className="dropdown-item">
                                  <i className="bi bi-eye me-2"></i>View Details
                                </button>
                              </li>
                              <li><hr className="dropdown-divider" /></li>
                              <li>
                                <button 
                                  className="dropdown-item text-danger"
                                  onClick={() => deleteNotification(notification.id)}
                                >
                                  <i className="bi bi-trash me-2"></i>Delete
                                </button>
                              </li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* New Message Modal */}
      {showNewMessageModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-envelope me-2"></i>
                  New Message
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowNewMessageModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Select Recipient *</label>
                  <div className="row">
                    <div className="col-md-8">
                      <select
                        className="form-select"
                        value={newMessage.recipientId}
                        onChange={(e) => {
                          const selectedStudent = students.find(s => s._id === e.target.value)
                          if (selectedStudent) {
                            handleStudentSelect(selectedStudent)
                          }
                        }}
                      >
                        <option value="">Choose a student...</option>
                        {students.map(student => (
                          <option key={student._id} value={student._id}>
                            {student.fullName} ({student.email})
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="col-md-4">
                      {newMessage.recipientName && (
                        <div className="alert alert-info py-2 mb-0">
                          <i className="bi bi-person-check me-2"></i>
                          {newMessage.recipientName}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Subject *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter message subject"
                    value={newMessage.subject}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, subject: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Message *</label>
                  <textarea
                    className="form-control"
                    rows="5"
                    placeholder="Type your message here..."
                    value={newMessage.message}
                    onChange={(e) => setNewMessage(prev => ({ ...prev, message: e.target.value }))}
                  ></textarea>
                </div>
                {students.length === 0 && (
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    No students found. Please ensure students are enrolled in your courses.
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowNewMessageModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={sendNewMessage}
                  disabled={!newMessage.recipientId || !newMessage.subject || !newMessage.message}
                >
                  <i className="bi bi-send me-2"></i>
                  Send Message
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .notifications-list {
          max-height: 70vh;
          overflow-y: auto;
        }

        .notification-item {
          border-bottom: 1px solid #f3f4f6;
          transition: all 0.3s ease;
          position: relative;
        }

        .notification-item:hover {
          background-color: #f8fafc;
        }

        .notification-item.unread {
          background-color: rgba(59, 130, 246, 0.02);
          border-left: 4px solid #3b82f6;
        }

        .notification-content {
          display: flex;
          align-items: flex-start;
          padding: 1.5rem;
          gap: 1rem;
        }

        .notification-icon-wrapper {
          position: relative;
          flex-shrink: 0;
        }

        .notification-icon {
          width: 48px;
          height: 48px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.2rem;
        }

        .unread-indicator {
          position: absolute;
          top: -2px;
          right: -2px;
          width: 12px;
          height: 12px;
          background-color: #ef4444;
          border-radius: 50%;
          border: 2px solid white;
        }

        .notification-body {
          flex: 1;
          min-width: 0;
        }

        .notification-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 0.5rem;
        }

        .notification-title {
          font-weight: 600;
          color: #1f2937;
          margin: 0;
          font-size: 1rem;
        }

        .notification-time {
          color: #6b7280;
          font-size: 0.875rem;
          white-space: nowrap;
          margin-left: 1rem;
        }

        .notification-message {
          color: #4b5563;
          margin: 0;
          font-size: 0.9rem;
          line-height: 1.5;
        }

        .notification-actions {
          flex-shrink: 0;
        }

        /* Scrollbar styling */
        .notifications-list::-webkit-scrollbar {
          width: 6px;
        }

        .notifications-list::-webkit-scrollbar-track {
          background: #f1f5f9;
        }

        .notifications-list::-webkit-scrollbar-thumb {
          background: #cbd5e1;
          border-radius: 3px;
        }

        .notifications-list::-webkit-scrollbar-thumb:hover {
          background: #94a3b8;
        }

        @media (max-width: 768px) {
          .notification-content {
            padding: 1rem;
            gap: 0.75rem;
          }

          .notification-icon {
            width: 40px;
            height: 40px;
            font-size: 1rem;
          }

          .notification-header {
            flex-direction: column;
            align-items: flex-start;
          }

          .notification-time {
            margin-left: 0;
            margin-top: 0.25rem;
          }
        }
      `}</style>
    </div>
  )
}

export default Notifications