"use client"

import { useState, useEffect } from "react"
import { Link } from "react-router-dom"
import axios from "axios"
import { useAuth } from "../../contexts/AuthContext"

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const { user } = useAuth()

  useEffect(() => {
    const fetchTasks = async () => {
      try {
        setLoading(true)
        const response = await axios.get("/api/tasks")
        setTasks(response.data)
        setError(null)
      } catch (err) {
        console.error("Error fetching tasks:", err)
        setError("Failed to load tasks. Please try again later.")
      } finally {
        setLoading(false)
      }
    }

    fetchTasks()
  }, [])

  const getStatusBadgeClass = (status) => {
    switch (status) {
      case "ASSIGNED":
        return "bg-info"
      case "IN_PROGRESS":
        return "bg-warning"
      case "SUBMITTED":
        return "bg-primary"
      case "REVIEWED":
        return "bg-secondary"
      case "COMPLETED":
        return "bg-success"
      default:
        return "bg-light"
    }
  }

  const getPriorityBadgeClass = (priority) => {
    switch (priority) {
      case "LOW":
        return "bg-success"
      case "MEDIUM":
        return "bg-warning"
      case "HIGH":
        return "bg-danger"
      case "URGENT":
        return "bg-danger text-white"
      default:
        return "bg-light"
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    })
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center p-5">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="alert alert-danger m-3" role="alert">
        <i className="bi bi-exclamation-triangle me-2"></i>
        {error}
      </div>
    )
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-list-task me-2"></i>
          {user?.role === "STUDENT" ? "My Tasks" : "Manage Tasks"}
        </h2>
        {user?.role === "TUTOR" && (
          <Link to="/dashboard/tasks/create" className="btn btn-primary">
            <i className="bi bi-plus-lg me-2"></i>
            Create Task
          </Link>
        )}
      </div>

      {tasks.length === 0 ? (
        <div className="card shadow-sm">
          <div className="card-body text-center p-5">
            <i className="bi bi-clipboard text-muted" style={{ fontSize: "3rem" }}></i>
            <h5 className="mt-3">No Tasks Found</h5>
            <p className="text-muted">
              {user?.role === "STUDENT"
                ? "You don't have any assigned tasks yet."
                : "You haven't created any tasks yet."}
            </p>
            {user?.role === "TUTOR" && (
              <Link to="/dashboard/tasks/create" className="btn btn-primary mt-2">
                <i className="bi bi-plus-lg me-2"></i>
                Create Your First Task
              </Link>
            )}
          </div>
        </div>
      ) : (
        <div className="card shadow-sm">
          <div className="card-body p-0">
            <div className="table-responsive">
              <table className="table table-hover mb-0">
                <thead className="table-light">
                  <tr>
                    <th>Title</th>
                    <th>Subject</th>
                    <th>Due Date</th>
                    <th>Priority</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {tasks.map((task) => (
                    <tr key={task._id}>
                      <td>
                        <div className="fw-semibold">{task.title}</div>
                        <small className="text-muted">
                          {user?.role === "STUDENT"
                            ? `Assigned by: ${task.tutor?.fullName || "Unknown"}`
                            : `Assigned to: ${task.assignedTo?.length || 0} students`}
                        </small>
                      </td>
                      <td>{task.subject}</td>
                      <td>
                        <div className={new Date(task.dueDate) < new Date() ? "text-danger" : ""}>
                          {formatDate(task.dueDate)}
                        </div>
                      </td>
                      <td>
                        <span className={`badge ${getPriorityBadgeClass(task.priority)}`}>{task.priority}</span>
                      </td>
                      <td>
                        <span className={`badge ${getStatusBadgeClass(task.status)}`}>{task.status}</span>
                      </td>
                      <td>
                        <div className="btn-group">
                          <Link to={`/dashboard/tasks/${task._id}`} className="btn btn-sm btn-outline-primary">
                            <i className="bi bi-eye"></i>
                          </Link>
                          {user?.role === "STUDENT" && task.status === "ASSIGNED" && (
                            <button className="btn btn-sm btn-outline-success">
                              <i className="bi bi-upload"></i>
                            </button>
                          )}
                          {user?.role === "TUTOR" && (
                            <button className="btn btn-sm btn-outline-secondary">
                              <i className="bi bi-pencil"></i>
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TaskList