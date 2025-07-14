"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import axios from "axios"
import toast from "react-hot-toast"

const ExamResults = () => {
  const { examId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const [exam, setExam] = useState(null)
  const [results, setResults] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchExamAndResults()
  }, [examId])

  const fetchExamAndResults = async () => {
    try {
      setLoading(true)

      // Fetch exam details
      const examResponse = await axios.get(`/api/exams/${examId}`)
      setExam(examResponse.data)

      // Fetch results for this exam
      const resultsResponse = await axios.get(`/api/exams/${examId}/results`)
      setResults(Array.isArray(resultsResponse.data) ? resultsResponse.data : [])
    } catch (error) {
      console.error("Error fetching exam results:", error)
      if (error.response?.status === 404) {
        setError("Exam not found or no results available")
      } else if (error.response?.status === 403) {
        setError("You don't have permission to view these results")
      } else {
        setError("Failed to load exam results")
      }
      toast.error("Failed to load exam results")
    } finally {
      setLoading(false)
    }
  }

  const clearAttempts = async () => {
    if (
      !window.confirm("Are you sure you want to clear all your attempts for this exam? This action cannot be undone.")
    ) {
      return
    }

    try {
      await axios.delete(`/api/exams/${examId}/attempts`)
      toast.success("Exam attempts cleared successfully!")

      // Refresh the results
      await fetchExamAndResults()

      // Navigate back to take exam
      setTimeout(() => {
        navigate(`/exam/${examId}/take`)
      }, 1000)
    } catch (error) {
      console.error("Error clearing attempts:", error)
      toast.error("Failed to clear attempts")
    }
  }

  const getStatusBadge = (status) => {
    const statusClass = status === "PASS" ? "bg-success" : "bg-danger"
    return <span className={`badge ${statusClass}`}>{status}</span>
  }

  const getGradeColor = (percentage) => {
    if (percentage >= 90) return "text-success"
    if (percentage >= 80) return "text-info"
    if (percentage >= 70) return "text-warning"
    return "text-danger"
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading results...</span>
        </div>
        <div className="ms-3">
          <h5>Loading Results...</h5>
          <p className="text-muted">Please wait while we fetch your exam results.</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="container mt-5">
        <div className="alert alert-danger">
          <h4 className="alert-heading">Error</h4>
          <p>{error}</p>
          <hr />
          <button className="btn btn-primary" onClick={() => navigate("/dashboard/exams")}>
            <i className="bi bi-arrow-left me-2"></i>
            Back to Exams
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="container mt-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <button onClick={() => navigate("/dashboard/exams")} className="btn btn-link text-decoration-none mb-3">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Exams
          </button>

          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">{exam?.title || "Exam Results"}</h2>
              <p className="text-muted mb-0">
                <i className="bi bi-book me-1"></i>
                Subject: {exam?.subject} |<i className="bi bi-clock ms-2 me-1"></i>
                Duration: {exam?.duration} minutes |<i className="bi bi-list-ol ms-2 me-1"></i>
                Questions: {exam?.questions?.length || 0}
              </p>
            </div>
            <div className="d-flex gap-2">
              {results.length > 0 && (
                <button className="btn btn-warning" onClick={clearAttempts}>
                  <i className="bi bi-trash me-2"></i>
                  Clear Attempts
                </button>
              )}
              {(!results.length || results.length < (exam?.attemptLimit || 1)) && (
                <button className="btn btn-success" onClick={() => navigate(`/exam/${examId}/take`)}>
                  <i className="bi bi-play-circle me-2"></i>
                  {results.length > 0 ? "Retake Exam" : "Take Exam"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Results Summary */}
      {results.length > 0 && (
        <div className="row mb-4">
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card bg-primary text-white">
              <div className="card-body text-center">
                <h4 className="mb-1">{results.length}</h4>
                <p className="mb-0">Total Attempts</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card bg-success text-white">
              <div className="card-body text-center">
                <h4 className="mb-1">{Math.round(Math.max(...results.map((r) => r.percentage || 0)))}%</h4>
                <p className="mb-0">Best Score</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card bg-info text-white">
              <div className="card-body text-center">
                <h4 className="mb-1">
                  {Math.round(results.reduce((sum, r) => sum + (r.percentage || 0), 0) / results.length)}%
                </h4>
                <p className="mb-0">Average Score</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-3">
            <div className="card bg-warning text-white">
              <div className="card-body text-center">
                <h4 className="mb-1">{results.filter((r) => r.status === "PASS").length}</h4>
                <p className="mb-0">Passed Attempts</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Results Table */}
      <div className="card shadow">
        <div className="card-header">
          <h5 className="mb-0">
            <i className="bi bi-list-check me-2"></i>
            Exam Attempts
          </h5>
        </div>
        <div className="card-body">
          {results.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-clipboard-x display-1 text-muted"></i>
              <h4 className="mt-3 text-muted">No Attempts Yet</h4>
              <p className="text-muted">You haven't taken this exam yet.</p>
              <button className="btn btn-primary" onClick={() => navigate(`/exam/${examId}/take`)}>
                <i className="bi bi-play-circle me-2"></i>
                Take Exam Now
              </button>
            </div>
          ) : (
            <div className="table-responsive">
              <table className="table table-hover">
                <thead className="table-light">
                  <tr>
                    <th>Attempt</th>
                    <th>Date & Time</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Status</th>
                    <th>Time Spent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {results.map((result, index) => (
                    <tr key={result.id || index}>
                      <td>
                        <span className="badge bg-secondary">#{result.attemptNumber || index + 1}</span>
                      </td>
                      <td>
                        <div>
                          <div className="fw-semibold">{new Date(result.submittedAt).toLocaleDateString()}</div>
                          <small className="text-muted">{new Date(result.submittedAt).toLocaleTimeString()}</small>
                        </div>
                      </td>
                      <td>
                        <span className="fw-bold">
                          {result.score || 0}/{result.totalPoints || exam?.questions?.length || 0}
                        </span>
                      </td>
                      <td>
                        <span className={`fw-bold ${getGradeColor(result.percentage || 0)}`}>
                          {Math.round(result.percentage || 0)}%
                        </span>
                      </td>
                      <td>{getStatusBadge(result.status || "FAIL")}</td>
                      <td>
                        <i className="bi bi-clock me-1"></i>
                        {result.timeSpent || 0} min
                      </td>
                      <td>
                        <button
                          className="btn btn-sm btn-outline-primary"
                          onClick={() => navigate(`/exam/${examId}/result/${result.id}`)}
                          disabled={!result.id}
                        >
                          <i className="bi bi-eye me-1"></i>
                          View Details
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {results.length > 0 && (
          <div className="card-footer">
            <div className="row align-items-center">
              <div className="col-md-6">
                <small className="text-muted">
                  Attempts used: {results.length} of {exam?.attemptLimit || 1}
                </small>
              </div>
              <div className="col-md-6 text-end">
                {results.length < (exam?.attemptLimit || 1) ? (
                  <span className="text-success">
                    <i className="bi bi-check-circle me-1"></i>
                    {(exam?.attemptLimit || 1) - results.length} attempt(s) remaining
                  </span>
                ) : (
                  <span className="text-warning">
                    <i className="bi bi-exclamation-triangle me-1"></i>
                    No attempts remaining
                  </span>
                )}
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Exam Information */}
      {exam && (
        <div className="card mt-4">
          <div className="card-header">
            <h6 className="mb-0">
              <i className="bi bi-info-circle me-2"></i>
              Exam Information
            </h6>
          </div>
          <div className="card-body">
            <div className="row">
              <div className="col-md-6">
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <strong>Passing Score:</strong> {exam.passingScore}%
                  </li>
                  <li className="mb-2">
                    <strong>Total Questions:</strong> {exam.questions?.length || 0}
                  </li>
                  <li className="mb-2">
                    <strong>Duration:</strong> {exam.duration} minutes
                  </li>
                </ul>
              </div>
              <div className="col-md-6">
                <ul className="list-unstyled">
                  <li className="mb-2">
                    <strong>Start Date:</strong> {new Date(exam.startDate).toLocaleString()}
                  </li>
                  <li className="mb-2">
                    <strong>End Date:</strong> {new Date(exam.endDate).toLocaleString()}
                  </li>
                  <li className="mb-2">
                    <strong>Attempts Allowed:</strong> {exam.attemptLimit}
                  </li>
                </ul>
              </div>
            </div>
            {exam.description && (
              <div className="mt-3">
                <strong>Description:</strong>
                <p className="mt-1 text-muted">{exam.description}</p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}

export default ExamResults
