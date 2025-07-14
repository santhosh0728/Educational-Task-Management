"use client"

import { useState, useEffect } from "react"
import axios from "axios"
import { Link, useNavigate } from "react-router-dom"
import toast from "react-hot-toast"
import { useAuth } from "../../contexts/AuthContext"
import DeleteExamModal from "./DeleteExamModal"
import BulkDeleteModal from "./BulkDeleteModal"
import "./ExamList.css"

const ExamList = () => {
  const [exams, setExams] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [selectedExams, setSelectedExams] = useState([])
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showBulkDeleteModal, setShowBulkDeleteModal] = useState(false)
  const [examToDelete, setExamToDelete] = useState(null)
  const [bulkSelectMode, setBulkSelectMode] = useState(false)
  const [searchTerm, setSearchTerm] = useState("")
  const [filterStatus, setFilterStatus] = useState("all")
  const { user } = useAuth()
  const navigate = useNavigate()

  useEffect(() => {
    fetchExams()
  }, [])

  const fetchExams = async () => {
    try {
      setLoading(true)
      setError(null)

      const token = localStorage.getItem("token")
      const response = await axios.get("/api/exams", {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      setExams(response.data || [])
    } catch (error) {
      console.error("Error fetching exams:", error)
      if (error.code === "ERR_NETWORK" || !error.response) {
        const errorMsg = "Cannot connect to server. Please ensure the backend is running."
        setError(errorMsg)
        toast.error(errorMsg)
      } else {
        const errorMsg = "Failed to fetch exams"
        setError(errorMsg)
        toast.error(errorMsg)
      }
    } finally {
      setLoading(false)
    }
  }

  const handleDeleteClick = (exam, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }
    setExamToDelete(exam)
    setShowDeleteModal(true)
  }

  const handleDeleteConfirm = (examId) => {
    setExams(exams.filter((exam) => exam._id !== examId))
    setSelectedExams(selectedExams.filter((id) => id !== examId))
    setShowDeleteModal(false)
    setExamToDelete(null)
    toast.success("🗑️ Exam deleted successfully!")
  }

  const handleBulkDeleteClick = () => {
    if (selectedExams.length === 0) {
      toast.error("Please select at least one exam to delete")
      return
    }
    setShowBulkDeleteModal(true)
  }

  const handleBulkDeleteConfirm = (examIds) => {
    setExams(exams.filter((exam) => !examIds.includes(exam._id)))
    setSelectedExams([])
    setBulkSelectMode(false)
    setShowBulkDeleteModal(false)
    toast.success(`🗑️ ${examIds.length} exams deleted successfully!`)
  }

  const toggleExamSelection = (examId, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    setSelectedExams((prev) => {
      if (prev.includes(examId)) {
        return prev.filter((id) => id !== examId)
      } else {
        return [...prev, examId]
      }
    })
  }

  const handleSelectAll = () => {
    const filteredExams = getFilteredExams()
    if (selectedExams.length === filteredExams.length) {
      setSelectedExams([])
      toast.info("All exams deselected")
    } else {
      setSelectedExams(filteredExams.map((exam) => exam._id))
      toast.success(`${filteredExams.length} exams selected`)
    }
  }

  const handleTakeExam = (examId, e) => {
    if (e) {
      e.preventDefault()
      e.stopPropagation()
    }

    console.log("Taking exam:", examId)
    toast.loading("Starting exam...", { id: "take-exam" })

    try {
      navigate(`/exam/${examId}/take`)
      toast.success("Redirecting to exam...", { id: "take-exam" })
    } catch (error) {
      console.error("Navigation error:", error)
      toast.error("Failed to start exam", { id: "take-exam" })
    }
  }

  const getExamStatus = (exam) => {
    const now = new Date()
    const startDate = new Date(exam.startDate)
    const endDate = new Date(exam.endDate)

    if (now < startDate) {
      return { status: "upcoming", color: "upcoming", text: "Upcoming", icon: "⏳", bgColor: "#FED7AA" }
    } else if (now > endDate) {
      return { status: "ended", color: "ended", text: "Ended", icon: "🔒", bgColor: "#E5E7EB" }
    } else {
      return { status: "active", color: "active", text: "Active", icon: "🟢", bgColor: "#BBF7D0" }
    }
  }

  const getFilteredExams = () => {
    return exams.filter((exam) => {
      const matchesSearch =
        exam.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        exam.subject?.toLowerCase().includes(searchTerm.toLowerCase())

      if (filterStatus === "all") return matchesSearch

      const status = getExamStatus(exam).status
      return matchesSearch && status === filterStatus
    })
  }

  const getExamStats = () => {
    return {
      total: exams.length,
      active: exams.filter((exam) => getExamStatus(exam).status === "active").length,
      upcoming: exams.filter((exam) => getExamStatus(exam).status === "upcoming").length,
      ended: exams.filter((exam) => getExamStatus(exam).status === "ended").length,
    }
  }

  if (loading) {
    return (
      <div className="exam-list-container">
        <div className="loading-container">
          <div className="loading-spinner">
            <div className="spinner"></div>
            <h3>Loading Exams...</h3>
            <p>Please wait while we fetch your exams</p>
          </div>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="exam-list-container">
        <div className="error-container">
          <div className="error-icon">⚠️</div>
          <h3>Error Loading Exams</h3>
          <p>{error}</p>
          <button className="retry-btn" onClick={fetchExams}>
            <span>🔄</span>
            Retry
          </button>
        </div>
      </div>
    )
  }

  const filteredExams = getFilteredExams()
  const selectedExamObjects = exams.filter((exam) => selectedExams.includes(exam._id))
  const stats = getExamStats()

  return (
    <div className="exam-list-container">
      <div className="exam-list-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">
              <span className="title-icon">📚</span>
              Available Exams
              {selectedExams.length > 0 && (
                <span className="selection-badge">
                  {selectedExams.length} selected
                  <button
                    className="clear-selection-btn"
                    onClick={() => {
                      setSelectedExams([])
                      toast.info("Selection cleared")
                    }}
                  >
                    ✕
                  </button>
                </span>
              )}
            </h1>

            <div className="stats-row">
              <div className="stat-chip total">
                <span className="stat-icon">📊</span>
                <span className="stat-text">{stats.total} Total</span>
              </div>
              <div className="stat-chip active">
                <span className="stat-icon">🟢</span>
                <span className="stat-text">{stats.active} Active</span>
              </div>
              <div className="stat-chip upcoming">
                <span className="stat-icon">⏳</span>
                <span className="stat-text">{stats.upcoming} Upcoming</span>
              </div>
              <div className="stat-chip ended">
                <span className="stat-icon">🔒</span>
                <span className="stat-text">{stats.ended} Ended</span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            {user?.role === "TUTOR" && exams.length > 0 && (
              <>
                <button
                  className={`action-btn ${bulkSelectMode ? "active" : "secondary"}`}
                  onClick={() => {
                    setBulkSelectMode(!bulkSelectMode)
                    setSelectedExams([])
                    toast.info(bulkSelectMode ? "Selection mode disabled" : "Selection mode enabled")
                  }}
                >
                  <span>{bulkSelectMode ? "❌" : "☑️"}</span>
                  {bulkSelectMode ? "Cancel Selection" : "Select Multiple"}
                </button>

                {bulkSelectMode && (
                  <>
                    <button className="action-btn secondary" onClick={handleSelectAll}>
                      <span>📋</span>
                      {selectedExams.length === filteredExams.length ? "Deselect All" : "Select All"}
                    </button>

                    {selectedExams.length > 0 && (
                      <button className="action-btn danger" onClick={handleBulkDeleteClick}>
                        <span>🗑️</span>
                        Delete Selected ({selectedExams.length})
                      </button>
                    )}
                  </>
                )}
              </>
            )}
          </div>
        </div>

        <div className="filters-section">
          <div className="search-container">
            <span className="search-icon">🔍</span>
            <input
              type="text"
              placeholder="Search exams by title, subject, or description..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
            {searchTerm && (
              <button className="clear-search-btn" onClick={() => setSearchTerm("")} title="Clear search">
                ✕
              </button>
            )}
          </div>

          <div className="filter-container">
            <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="filter-select">
              <option value="all">All Status</option>
              <option value="active">Active Only</option>
              <option value="upcoming">Upcoming Only</option>
              <option value="ended">Ended Only</option>
            </select>
          </div>
        </div>
      </div>

      {filteredExams.length === 0 ? (
        <div className="empty-state">
          <div className="empty-icon">{searchTerm || filterStatus !== "all" ? "🔍" : "📝"}</div>
          <h3>{searchTerm || filterStatus !== "all" ? "No Matching Exams" : "No Exams Found"}</h3>
          <p>
            {searchTerm || filterStatus !== "all"
              ? "Try adjusting your search or filter criteria."
              : "There are no exams available at the moment."}
          </p>
          {user?.role === "TUTOR" && !searchTerm && filterStatus === "all" && (
            <Link to="/exams/new" className="action-btn primary">
              <span>➕</span>
              Create Your First Exam
            </Link>
          )}
        </div>
      ) : (
        <div className="exams-grid">
          {filteredExams.map((exam, index) => {
            const status = getExamStatus(exam)
            const isSelected = selectedExams.includes(exam._id)

            return (
              <div
                key={exam._id}
                className={`exam-card ${isSelected ? "selected" : ""} ${bulkSelectMode ? "selectable" : ""}`}
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                {bulkSelectMode && user?.role === "TUTOR" && (
                  <div className="selection-header">
                    <label className="selection-checkbox">
                      <input
                        type="checkbox"
                        checked={isSelected}
                        onChange={(e) => toggleExamSelection(exam._id, e)}
                        onClick={(e) => e.stopPropagation()}
                      />
                      <span className="checkmark"></span>
                      <span className="checkbox-label">{isSelected ? "✅ Selected" : "Select this exam"}</span>
                    </label>
                  </div>
                )}

                <div className="card-header">
                  <div className="exam-title-section">
                    <h3 className="exam-title">{exam.title}</h3>
                    <div className={`status-badge ${status.color}`} style={{ backgroundColor: status.bgColor }}>
                      <span className="status-icon">{status.icon}</span>
                      {status.text}
                    </div>
                  </div>
                  <p className="exam-subject">{exam.subject || exam.description || "No subject specified"}</p>
                </div>

                <div className="card-body">
                  <div className="exam-stats">
                    <div className="stat-item">
                      <div className="stat-icon">❓</div>
                      <div className="stat-content">
                        <div className="stat-value">{exam.questions?.length || 0}</div>
                        <div className="stat-label">Questions</div>
                      </div>
                    </div>

                    <div className="stat-item">
                      <div className="stat-icon">⏱️</div>
                      <div className="stat-content">
                        <div className="stat-value">{exam.duration}</div>
                        <div className="stat-label">Minutes</div>
                      </div>
                    </div>

                    <div className="stat-item">
                      <div className="stat-icon">🏆</div>
                      <div className="stat-content">
                        <div className="stat-value">{exam.passingScore}%</div>
                        <div className="stat-label">Pass Rate</div>
                      </div>
                    </div>

                    <div className="stat-item">
                      <div className="stat-icon">👥</div>
                      <div className="stat-content">
                        <div className="stat-value">{exam.assignedTo?.length || 0}</div>
                        <div className="stat-label">Students</div>
                      </div>
                    </div>
                  </div>

                  <div className="exam-schedule">
                    <div className="schedule-item">
                      <span className="schedule-icon">🚀</span>
                      <div className="schedule-content">
                        <span className="schedule-label">Start:</span>
                        <span className="schedule-value">{new Date(exam.startDate).toLocaleString()}</span>
                      </div>
                    </div>
                    <div className="schedule-item">
                      <span className="schedule-icon">🏁</span>
                      <div className="schedule-content">
                        <span className="schedule-label">End:</span>
                        <span className="schedule-value">{new Date(exam.endDate).toLocaleString()}</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="card-footer">
                  <div className="action-buttons">
                    {status.status === "active" && user?.role === "STUDENT" ? (
                      <button
                        className="primary-action-btn"
                        onClick={(e) => handleTakeExam(exam._id, e)}
                        disabled={bulkSelectMode}
                        style={{
                          pointerEvents: "auto",
                          cursor: "pointer",
                          zIndex: 10,
                          position: "relative",
                        }}
                      >
                        <span>▶️</span>
                        Take Exam
                      </button>
                    ) : (
                      <Link
                        to={`/exams/${exam._id}`}
                        className="secondary-action-btn"
                        onClick={(e) => bulkSelectMode && e.preventDefault()}
                      >
                        <span>👁️</span>
                        View Details
                      </Link>
                    )}

                    {!bulkSelectMode && (
                      <div className="dropdown-container">
                        <button className="dropdown-btn" onClick={(e) => e.stopPropagation()}>
                          <span>⋯</span>
                        </button>
                        <div className="dropdown-menu">
                          <Link
                            className="dropdown-item"
                            to={`/exam/${exam._id}/results`}
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>📊</span>
                            View Results
                          </Link>
                          {user?.role === "TUTOR" && (
                            <>
                              <div className="dropdown-divider"></div>
                              <button className="dropdown-item danger" onClick={(e) => handleDeleteClick(exam, e)}>
                                <span>🗑️</span>
                                Delete Exam
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}

      {/* Delete Modals */}
      {examToDelete && (
        <DeleteExamModal
          exam={examToDelete}
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setExamToDelete(null)
          }}
          onDelete={handleDeleteConfirm}
        />
      )}

      {selectedExamObjects.length > 0 && (
        <BulkDeleteModal
          selectedExams={selectedExamObjects}
          isOpen={showBulkDeleteModal}
          onClose={() => setShowBulkDeleteModal(false)}
          onDelete={handleBulkDeleteConfirm}
        />
      )}
    </div>
  )
}

export default ExamList
