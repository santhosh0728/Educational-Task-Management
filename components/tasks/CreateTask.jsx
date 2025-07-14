"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import axios from "axios"
import toast from "react-hot-toast"

const CreateTask = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    assignedTo: [],
    dueDate: "",
    priority: "MEDIUM",
    instructions: "",
    maxScore: 100,
  })

  const subjectOptions = [
    "Mathematics",
    "Physics",
    "Chemistry",
    "Biology",
    "Computer Science",
    "English",
    "History",
    "Geography",
    "Economics",
    "Psychology",
  ]

  const priorityOptions = [
    { value: "LOW", label: "Low", color: "success" },
    { value: "MEDIUM", label: "Medium", color: "warning" },
    { value: "HIGH", label: "High", color: "danger" },
    { value: "URGENT", label: "Urgent", color: "danger" },
  ]

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      const response = await axios.get("/api/users?role=STUDENT")
      setStudents(response.data.users || [])
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to load students")
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "assignedTo") {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          assignedTo: [...prev.assignedTo, value]
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          assignedTo: prev.assignedTo.filter(id => id !== value)
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "number" ? Number(value) : value
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.title || !formData.description || !formData.subject || !formData.dueDate) {
        toast.error("Please fill in all required fields")
        return
      }

      if (formData.assignedTo.length === 0) {
        toast.error("Please select at least one student")
        return
      }

      // Check if due date is in the future
      const dueDate = new Date(formData.dueDate)
      const now = new Date()
      if (dueDate <= now) {
        toast.error("Due date must be in the future")
        return
      }

      const response = await axios.post("/api/tasks", formData)
      
      if (response.data) {
        toast.success("Task created successfully!")
        navigate("/dashboard/tasks")
      }
    } catch (error) {
      console.error("Error creating task:", error)
      const message = error.response?.data?.message || "Failed to create task"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (formData.assignedTo.length === students.length) {
      setFormData(prev => ({ ...prev, assignedTo: [] }))
    } else {
      setFormData(prev => ({ ...prev, assignedTo: students.map(s => s._id) }))
    }
  }

  return (
    <div className="container-fluid py-4">
      <div className="row">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-plus-circle me-2 text-primary"></i>
                Create New Task
              </h2>
              <p className="text-muted mb-0">Assign a new task to your students</p>
            </div>
            <button 
              onClick={() => navigate("/dashboard/tasks")} 
              className="btn btn-outline-secondary"
            >
              <i className="bi bi-arrow-left me-2"></i>
              Back to Tasks
            </button>
          </div>
        </div>
      </div>

      <div className="row">
        <div className="col-lg-8">
          <div className="card shadow-sm">
            <div className="card-header bg-primary text-white">
              <h5 className="mb-0">
                <i className="bi bi-info-circle me-2"></i>
                Task Details
              </h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row mb-3">
                  <div className="col-md-8">
                    <label htmlFor="title" className="form-label">
                      Task Title <span className="text-danger">*</span>
                    </label>
                    <input
                      type="text"
                      className="form-control"
                      id="title"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter task title"
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="subject" className="form-label">
                      Subject <span className="text-danger">*</span>
                    </label>
                    <select
                      className="form-select"
                      id="subject"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      required
                    >
                      <option value="">Select Subject</option>
                      {subjectOptions.map(subject => (
                        <option key={subject} value={subject}>{subject}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label htmlFor="description" className="form-label">
                    Description <span className="text-danger">*</span>
                  </label>
                  <textarea
                    className="form-control"
                    id="description"
                    name="description"
                    rows="4"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Describe the task requirements and objectives"
                    required
                  ></textarea>
                </div>

                <div className="mb-3">
                  <label htmlFor="instructions" className="form-label">
                    Additional Instructions
                  </label>
                  <textarea
                    className="form-control"
                    id="instructions"
                    name="instructions"
                    rows="3"
                    value={formData.instructions}
                    onChange={handleChange}
                    placeholder="Any additional instructions or guidelines"
                  ></textarea>
                </div>

                <div className="row mb-3">
                  <div className="col-md-4">
                    <label htmlFor="dueDate" className="form-label">
                      Due Date <span className="text-danger">*</span>
                    </label>
                    <input
                      type="datetime-local"
                      className="form-control"
                      id="dueDate"
                      name="dueDate"
                      value={formData.dueDate}
                      onChange={handleChange}
                      min={new Date().toISOString().slice(0, 16)}
                      required
                    />
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="priority" className="form-label">
                      Priority
                    </label>
                    <select
                      className="form-select"
                      id="priority"
                      name="priority"
                      value={formData.priority}
                      onChange={handleChange}
                    >
                      {priorityOptions.map(option => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label htmlFor="maxScore" className="form-label">
                      Maximum Score
                    </label>
                    <input
                      type="number"
                      className="form-control"
                      id="maxScore"
                      name="maxScore"
                      value={formData.maxScore}
                      onChange={handleChange}
                      min="1"
                      max="1000"
                    />
                  </div>
                </div>

                <div className="d-flex gap-3 mt-4">
                  <button
                    type="submit"
                    className="btn btn-primary"
                    disabled={loading}
                  >
                    {loading ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2\" role="status"></span>
                        Creating...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Create Task
                      </>
                    )}
                  </button>
                  <button
                    type="button"
                    className="btn btn-outline-secondary"
                    onClick={() => navigate("/dashboard/tasks")}
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card shadow-sm">
            <div className="card-header bg-success text-white">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-people me-2"></i>
                  Assign to Students
                </h5>
                <button
                  type="button"
                  className="btn btn-sm btn-outline-light"
                  onClick={handleSelectAll}
                >
                  {formData.assignedTo.length === students.length ? "Deselect All" : "Select All"}
                </button>
              </div>
            </div>
            <div className="card-body" style={{ maxHeight: "400px", overflowY: "auto" }}>
              {students.length === 0 ? (
                <div className="text-center text-muted py-4">
                  <i className="bi bi-person-x fs-1 mb-2"></i>
                  <p>No students found</p>
                </div>
              ) : (
                <div className="space-y-2">
                  {students.map(student => (
                    <div key={student._id} className="form-check">
                      <input
                        className="form-check-input"
                        type="checkbox"
                        id={`student-${student._id}`}
                        name="assignedTo"
                        value={student._id}
                        checked={formData.assignedTo.includes(student._id)}
                        onChange={handleChange}
                      />
                      <label className="form-check-label" htmlFor={`student-${student._id}`}>
                        <div>
                          <div className="fw-semibold">{student.fullName}</div>
                          <small className="text-muted">{student.email}</small>
                          {student.studentId && (
                            <small className="text-muted d-block">ID: {student.studentId}</small>
                          )}
                        </div>
                      </label>
                    </div>
                  ))}
                </div>
              )}
            </div>
            <div className="card-footer bg-light">
              <small className="text-muted">
                <i className="bi bi-info-circle me-1"></i>
                {formData.assignedTo.length} student(s) selected
              </small>
            </div>
          </div>

          {/* Task Preview */}
          <div className="card shadow-sm mt-3">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0">
                <i className="bi bi-eye me-2"></i>
                Task Preview
              </h6>
            </div>
            <div className="card-body">
              <div className="mb-2">
                <strong>Title:</strong> {formData.title || "Untitled Task"}
              </div>
              <div className="mb-2">
                <strong>Subject:</strong> {formData.subject || "Not selected"}
              </div>
              <div className="mb-2">
                <strong>Priority:</strong>{" "}
                <span className={`badge bg-${priorityOptions.find(p => p.value === formData.priority)?.color || 'secondary'}`}>
                  {priorityOptions.find(p => p.value === formData.priority)?.label || formData.priority}
                </span>
              </div>
              <div className="mb-2">
                <strong>Due Date:</strong>{" "}
                {formData.dueDate ? new Date(formData.dueDate).toLocaleString() : "Not set"}
              </div>
              <div>
                <strong>Max Score:</strong> {formData.maxScore} points
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default CreateTask