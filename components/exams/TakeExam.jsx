"use client"
import { useState, useEffect, useRef } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import axios from "axios"
import toast from "react-hot-toast"
import "./TakeExam.css"

const TakeExam = () => {
  const { examId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()

  const [exam, setExam] = useState(null)
  const [loading, setLoading] = useState(true)
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [answers, setAnswers] = useState({})
  const [timeRemaining, setTimeRemaining] = useState(0)
  const [examStarted, setExamStarted] = useState(false)
  const [showInstructions, setShowInstructions] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [showSubmitConfirm, setShowSubmitConfirm] = useState(false)
  const [error, setError] = useState(null)
  const [existingAttempts, setExistingAttempts] = useState(0)

  const timerRef = useRef(null)
  const startTimeRef = useRef(null)

  useEffect(() => {
    fetchExam()
    return () => {
      if (timerRef.current) clearInterval(timerRef.current)
    }
  }, [examId])

  const fetchExam = async () => {
    try {
      setLoading(true)
      console.log("Fetching exam with ID:", examId)

      const response = await axios.get(`/api/exams/${examId}`)

      if (!response.data || !response.data.questions || !Array.isArray(response.data.questions)) {
        console.error("Invalid exam data received:", response.data)
        setError("The exam data is invalid or corrupted. Please contact your instructor.")
        return
      }

      const examData = response.data
      const now = new Date()
      const startDate = new Date(examData.startDate)
      const endDate = new Date(examData.endDate)

      console.log("Exam data received:", {
        title: examData.title,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        currentTime: now.toISOString(),
      })

      if (now < startDate) {
        toast.error("This exam hasn't started yet")
        navigate("/dashboard/exams")
        return
      }

      if (now > endDate) {
        toast.error("This exam has already ended")
        navigate("/dashboard/exams")
        return
      }

      setExam(examData)
      setTimeRemaining(examData.duration * 60)

      const initialAnswers = {}
      examData.questions.forEach((question, index) => {
        initialAnswers[index] = {
          selectedOptions: [],
          timeSpent: 0,
          questionId: question._id || `q${index}`,
        }
      })
      setAnswers(initialAnswers)

      await checkExistingAttempts(examId)
    } catch (error) {
      console.error("Error fetching exam:", error)
      if (error.code === "ERR_NETWORK" || !error.response) {
        setError("Cannot connect to server. Please ensure the backend server is running.")
        toast.error("Cannot connect to server. Please check your connection.")
      } else if (error.response?.status === 404) {
        setError("Exam not found")
        toast.error("Exam not found")
      } else if (error.response?.status === 403) {
        setError("You don't have permission to access this exam")
        toast.error("Access denied")
      } else {
        setError("Failed to load exam. Please try again.")
        toast.error("Failed to load exam")
      }
    } finally {
      setLoading(false)
    }
  }

  const checkExistingAttempts = async (examId) => {
    try {
      const response = await axios.get(`/api/exams/${examId}/results`)
      const results = response.data
      if (Array.isArray(results) && results.length > 0) {
        setExistingAttempts(results.length)
        console.log(`Found ${results.length} existing attempts for this exam`)
      }
    } catch (error) {
      console.log("No existing attempts found or error checking attempts:", error.response?.status)
    }
  }

  const startExam = () => {
    setShowInstructions(false)
    setExamStarted(true)
    startTimeRef.current = new Date()

    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          handleAutoSubmit()
          return 0
        }
        return prev - 1
      })
    }, 1000)

    toast.success("Exam started! Good luck! 🚀")
  }

  const handleAutoSubmit = () => {
    if (timerRef.current) clearInterval(timerRef.current)
    toast.warning("Time's up! Submitting exam automatically...")
    submitExam()
  }

  const handleAnswerChange = (questionIndex, optionIndex, isChecked) => {
    const question = exam.questions[questionIndex]
    setAnswers((prev) => {
      const newAnswers = { ...prev }
      if (question.type === "SINGLE") {
        newAnswers[questionIndex] = {
          ...newAnswers[questionIndex],
          selectedOptions: isChecked ? [optionIndex] : [],
        }
      } else {
        const currentSelections = newAnswers[questionIndex].selectedOptions || []
        newAnswers[questionIndex] = {
          ...newAnswers[questionIndex],
          selectedOptions: isChecked
            ? [...currentSelections, optionIndex]
            : currentSelections.filter((idx) => idx !== optionIndex),
        }
      }
      return newAnswers
    })
  }

  const submitExam = async () => {
    try {
      setSubmitting(true)
      if (timerRef.current) clearInterval(timerRef.current)

      const endTime = new Date()
      const timeSpentSeconds = Math.round((endTime - startTimeRef.current) / 1000)

      const answersArray = Object.keys(answers).map((index) => {
        const questionIndex = Number.parseInt(index)
        return {
          questionId: answers[questionIndex].questionId || exam.questions[questionIndex]._id || `q${questionIndex}`,
          selectedOptions: answers[questionIndex].selectedOptions || [],
          timeSpent: answers[questionIndex].timeSpent || 0,
        }
      })

      const submissionData = {
        answers: answersArray,
        timeSpent: timeSpentSeconds,
        startedAt: startTimeRef.current.toISOString(),
      }

      console.log("Submitting exam:", submissionData)

      const response = await axios.post(`/api/exams/${examId}/submit`, submissionData)

      toast.success("Exam submitted successfully! 🎉")
      console.log("Submission response:", response.data)

      if (response.data.result?.id) {
        navigate(`/exam/${examId}/result/${response.data.result.id}`)
      } else if (response.data.result) {
        // If we have a result but no ID, still try to navigate to results
        toast.success("Exam submitted successfully! Redirecting to results...")
        setTimeout(() => navigate(`/exam/${examId}/results`), 1500)
      } else {
        toast.success("Exam submitted successfully! Redirecting to dashboard...")
        setTimeout(() => navigate("/dashboard/exams"), 1500)
      }
    } catch (error) {
      console.error("Error submitting exam:", error)
      if (error.code === "ERR_NETWORK") {
        toast.error("Cannot connect to server. Please try again.")
      } else if (error.response?.status === 400) {
        const errorMessage = error.response.data.message || "Invalid submission format"
        toast.error(errorMessage)

        if (errorMessage.includes("maximum number of attempts")) {
          setError(
            `You have already completed this exam. Attempts made: ${error.response.data.attemptsMade || existingAttempts}/${error.response.data.attemptsAllowed || exam?.attemptLimit || 1}`,
          )
        }
      } else {
        toast.error("Failed to submit exam. Please try again.")
      }
    } finally {
      setSubmitting(false)
      setShowSubmitConfirm(false)
    }
  }

  const formatTime = (seconds) => {
    const hours = Math.floor(seconds / 3600)
    const minutes = Math.floor((seconds % 3600) / 60)
    const secs = seconds % 60

    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
    }
    return `${minutes}:${secs.toString().padStart(2, "0")}`
  }

  const isQuestionAnswered = (index) => {
    return answers[index]?.selectedOptions?.length > 0
  }

  const getAnsweredQuestionsCount = () => {
    return Object.values(answers).filter((answer) => answer.selectedOptions?.length > 0).length
  }

  const getTimerClass = () => {
    if (timeRemaining < 300) return "timer danger" // Less than 5 minutes
    if (timeRemaining < 600) return "timer warning" // Less than 10 minutes
    return "timer"
  }

  if (loading) {
    return (
      <div className="take-exam-container">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <h3 style={{ color: "white", marginBottom: "10px" }}>Loading Your Exam</h3>
          <p style={{ color: "rgba(255,255,255,0.8)" }}>Please wait while we prepare everything for you...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="take-exam-container">
        <div className="error-message">
          <div className="error-icon">⚠️</div>
          <h3>Oops! Something went wrong</h3>
          <p>{error}</p>
          <div style={{ display: "flex", gap: "15px", justifyContent: "center", marginTop: "25px" }}>
            <button className="btn-primary" onClick={() => navigate("/dashboard/exams")}>
              <i className="bi bi-arrow-left me-2"></i>
              Back to Exams
            </button>
            {error.includes("maximum number of attempts") && (
              <button className="btn-outline" onClick={() => navigate(`/exam/${examId}/results`)}>
                <i className="bi bi-eye me-2"></i>
                View Results
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  if (!exam) {
    return (
      <div className="take-exam-container">
        <div className="error-message">
          <div className="error-icon">🔍</div>
          <h3>Exam Not Found</h3>
          <p>The exam you're trying to access could not be found or you don't have permission to access it.</p>
          <button className="btn-primary" onClick={() => navigate("/dashboard/exams")} style={{ marginTop: "25px" }}>
            <i className="bi bi-arrow-left me-2"></i>
            Back to Exams
          </button>
        </div>
      </div>
    )
  }

  if (showInstructions) {
    return (
      <div className="take-exam-container">
        <div className="exam-header">
          <div className="exam-info">
            <h1 className="exam-title">{exam.title}</h1>
            <p className="exam-subject">📚 {exam.subject}</p>
          </div>

          {existingAttempts > 0 && (
            <div
              style={{
                background: "linear-gradient(135deg, #ffa726, #ff9800)",
                color: "white",
                padding: "20px",
                borderRadius: "15px",
                marginBottom: "25px",
                boxShadow: "0 8px 25px rgba(255, 167, 38, 0.3)",
              }}
            >
              <h6 style={{ margin: "0 0 10px 0", fontSize: "16px", fontWeight: "700" }}>⚠️ Previous Attempts Found</h6>
              <p style={{ margin: "0 0 15px 0", opacity: "0.95" }}>
                You have already attempted this exam {existingAttempts} time(s). Maximum attempts allowed:{" "}
                {exam.attemptLimit}
              </p>
              {existingAttempts >= exam.attemptLimit && (
                <button
                  className="btn-outline"
                  onClick={() => navigate(`/exam/${examId}/results`)}
                  style={{ background: "rgba(255,255,255,0.2)", borderColor: "white", color: "white" }}
                >
                  View Your Results
                </button>
              )}
            </div>
          )}

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
              gap: "30px",
              marginBottom: "30px",
            }}
          >
            <div>
              <h5 style={{ color: "#667eea", marginBottom: "20px", fontSize: "20px", fontWeight: "700" }}>
                📋 Exam Information
              </h5>
              <div
                style={{ background: "#f8fafc", padding: "25px", borderRadius: "15px", border: "2px solid #e2e8f0" }}
              >
                <div style={{ display: "grid", gap: "15px" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "600", color: "#4a5568" }}>⏱️ Duration:</span>
                    <span style={{ fontWeight: "700", color: "#2d3748" }}>{exam.duration} minutes</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "600", color: "#4a5568" }}>❓ Questions:</span>
                    <span style={{ fontWeight: "700", color: "#2d3748" }}>{exam.questions.length}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "600", color: "#4a5568" }}>🎯 Passing Score:</span>
                    <span style={{ fontWeight: "700", color: "#2d3748" }}>{exam.passingScore}%</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "600", color: "#4a5568" }}>🔄 Attempts Allowed:</span>
                    <span style={{ fontWeight: "700", color: "#2d3748" }}>{exam.attemptLimit}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                    <span style={{ fontWeight: "600", color: "#4a5568" }}>📊 Attempts Used:</span>
                    <span
                      style={{
                        fontWeight: "700",
                        color: existingAttempts >= exam.attemptLimit ? "#e53e3e" : "#2d3748",
                      }}
                    >
                      {existingAttempts}/{exam.attemptLimit}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div>
              <h5 style={{ color: "#e53e3e", marginBottom: "20px", fontSize: "20px", fontWeight: "700" }}>
                ⚠️ Important Instructions
              </h5>
              <div
                style={{
                  background: "linear-gradient(135deg, #fed7d7, #feb2b2)",
                  padding: "25px",
                  borderRadius: "15px",
                  border: "2px solid #fc8181",
                }}
              >
                <ul style={{ margin: "0", paddingLeft: "20px", color: "#742a2a", fontWeight: "600" }}>
                  <li style={{ marginBottom: "8px" }}>You have {exam.duration} minutes to complete this exam</li>
                  <li style={{ marginBottom: "8px" }}>You can only take this exam {exam.attemptLimit} time(s)</li>
                  <li style={{ marginBottom: "8px" }}>Make sure you have a stable internet connection</li>
                  <li style={{ marginBottom: "8px" }}>Do not refresh the page during the exam</li>
                  <li style={{ marginBottom: "8px" }}>You can navigate between questions freely</li>
                  <li style={{ marginBottom: "8px" }}>Click "Submit Exam" when you're finished</li>
                  <li>The exam will auto-submit when time runs out</li>
                </ul>
              </div>
            </div>
          </div>

          {exam.description && (
            <div
              style={{
                background: "linear-gradient(135deg, #bee3f8, #90cdf4)",
                padding: "25px",
                borderRadius: "15px",
                border: "2px solid #63b3ed",
                marginBottom: "30px",
              }}
            >
              <h6 style={{ color: "#2c5282", marginBottom: "10px", fontSize: "16px", fontWeight: "700" }}>
                📝 Description
              </h6>
              <p style={{ margin: "0", color: "#2c5282", fontWeight: "600" }}>{exam.description}</p>
            </div>
          )}

          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <button className="btn-secondary" onClick={() => navigate("/dashboard/exams")}>
              <i className="bi bi-arrow-left me-2"></i>
              Cancel
            </button>
            {existingAttempts >= exam.attemptLimit ? (
              <button className="btn-outline" onClick={() => navigate(`/exam/${examId}/results`)}>
                <i className="bi bi-eye me-2"></i>
                View Results
              </button>
            ) : (
              <button className="btn-submit" onClick={startExam}>
                <i className="bi bi-play-circle me-2"></i>
                Start Exam {existingAttempts > 0 ? `(Attempt ${existingAttempts + 1})` : ""} 🚀
              </button>
            )}
          </div>
        </div>
      </div>
    )
  }

  const currentQuestion = exam.questions[currentQuestionIndex]
  const progress = (getAnsweredQuestionsCount() / exam.questions.length) * 100
  const answeredCount = getAnsweredQuestionsCount()

  return (
    <div className="take-exam-container">
      {/* Header with timer and progress */}
      <div className="exam-header">
        <div className="exam-info">
          <h1 className="exam-title">{exam.title}</h1>
          <p className="exam-subject">📚 {exam.subject}</p>
        </div>

        <div className="exam-stats">
          <div className={getTimerClass()}>
            <div className="timer-icon">⏰</div>
            <div className="timer-text">
              <div className="timer-label">Time Remaining</div>
              <div className="timer-value">{formatTime(timeRemaining)}</div>
            </div>
          </div>

          <div className="progress-info">
            <span className="progress-text">
              Question {currentQuestionIndex + 1} of {exam.questions.length}
            </span>
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${((currentQuestionIndex + 1) / exam.questions.length) * 100}%` }}
              ></div>
            </div>
          </div>

          <div className="answered-count">
            <div className="answered-label">Answered</div>
            <div className="answered-value">
              {answeredCount}/{exam.questions.length}
            </div>
          </div>
        </div>
      </div>

      <div className="exam-content">
        {/* Question Panel */}
        <div className="question-panel">
          <div className="question-header">
            <div className="question-number">Q{currentQuestionIndex + 1}</div>
            <div className="question-type">
              {currentQuestion.type === "MULTIPLE" ? "🔘 Multiple Choice" : "⚪ Single Choice"}
            </div>
            {currentQuestion.points && <div className="question-points">🏆 {currentQuestion.points} pts</div>}
          </div>

          <div className="question-content">
            <h2 className="question-text">{currentQuestion.question}</h2>

            <div className="options-container">
              {currentQuestion.options.map((option, optionIndex) => (
                <label
                  key={optionIndex}
                  className={`option-label ${
                    answers[currentQuestionIndex]?.selectedOptions?.includes(optionIndex) ? "selected" : ""
                  }`}
                >
                  <input
                    className="option-input"
                    type={currentQuestion.type === "SINGLE" ? "radio" : "checkbox"}
                    name={`question-${currentQuestionIndex}`}
                    checked={answers[currentQuestionIndex]?.selectedOptions?.includes(optionIndex) || false}
                    onChange={(e) => handleAnswerChange(currentQuestionIndex, optionIndex, e.target.checked)}
                  />

                  {currentQuestion.type === "SINGLE" ? (
                    <div className="option-indicator">
                      <div className="radio-indicator"></div>
                    </div>
                  ) : (
                    <div className="checkbox-indicator">
                      {answers[currentQuestionIndex]?.selectedOptions?.includes(optionIndex) && "✓"}
                    </div>
                  )}

                  <div className="option-text">
                    <strong>{String.fromCharCode(65 + optionIndex)}.</strong> {option.text}
                  </div>
                </label>
              ))}
            </div>

            {currentQuestion.topic && (
              <div
                style={{
                  marginTop: "30px",
                  padding: "15px",
                  background: "#f0f4ff",
                  borderRadius: "10px",
                  border: "2px solid #e2e8f0",
                }}
              >
                <small style={{ color: "#667eea", fontWeight: "600" }}>🏷️ Topic: {currentQuestion.topic}</small>
              </div>
            )}
          </div>

          <div className="question-navigation">
            <button
              className="btn-secondary"
              onClick={() => setCurrentQuestionIndex((i) => Math.max(i - 1, 0))}
              disabled={currentQuestionIndex === 0}
            >
              <i className="bi bi-arrow-left me-2"></i>
              Previous
            </button>

            <div className="nav-center">
              {currentQuestionIndex === exam.questions.length - 1 ? (
                <button className="btn-submit" onClick={() => setShowSubmitConfirm(true)}>
                  <i className="bi bi-check-circle me-2"></i>
                  Submit Exam 🎯
                </button>
              ) : (
                <button
                  className="btn-primary"
                  onClick={() => setCurrentQuestionIndex((i) => Math.min(i + 1, exam.questions.length - 1))}
                >
                  Next
                  <i className="bi bi-arrow-right ms-2"></i>
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Question Navigator Sidebar */}
        <div className="question-navigator">
          <h3 className="navigator-title">📋 Question Navigator</h3>

          <div className="overall-progress">
            <div
              className="progress-circle"
              style={{
                background: `conic-gradient(#667eea ${progress * 3.6}deg, #e2e8f0 ${progress * 3.6}deg)`,
              }}
            >
              <div className="progress-text">{Math.round(progress)}%</div>
            </div>
            <div className="progress-label">Completed</div>
          </div>

          <div className="question-grid">
            {exam.questions.map((_, index) => (
              <button
                key={index}
                className={`question-nav-btn ${
                  index === currentQuestionIndex ? "current" : isQuestionAnswered(index) ? "answered" : ""
                }`}
                onClick={() => setCurrentQuestionIndex(index)}
              >
                {index + 1}
              </button>
            ))}
          </div>

          <div className="legend">
            <div className="legend-item">
              <div className="legend-color answered"></div>
              <span>✅ Answered</span>
            </div>
            <div className="legend-item">
              <div className="legend-color current"></div>
              <span>👉 Current</span>
            </div>
            <div className="legend-item">
              <div className="legend-color unanswered"></div>
              <span>⭕ Not answered</span>
            </div>
          </div>
        </div>
      </div>

      {/* Submit Confirmation Modal */}
      {showSubmitConfirm && (
        <div className="modal-overlay">
          <div className="modal-content">
            <h3>🎯 Confirm Submission</h3>
            <p>You are about to submit your exam. Please review your progress:</p>

            <div
              style={{
                background: "#f8fafc",
                padding: "20px",
                borderRadius: "12px",
                margin: "20px 0",
                border: "2px solid #e2e8f0",
              }}
            >
              <div style={{ display: "grid", gap: "12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>📝 Questions answered:</span>
                  <strong style={{ color: answeredCount === exam.questions.length ? "#48bb78" : "#e53e3e" }}>
                    {answeredCount} out of {exam.questions.length}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>⏰ Time remaining:</span>
                  <strong style={{ color: timeRemaining < 300 ? "#e53e3e" : "#4a5568" }}>
                    {formatTime(timeRemaining)}
                  </strong>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>🔄 Attempt:</span>
                  <strong>
                    {existingAttempts + 1} of {exam.attemptLimit}
                  </strong>
                </div>
              </div>
            </div>

            <p className="warning-text">⚠️ You cannot change your answers after submission!</p>

            <p style={{ color: "#4a5568", fontWeight: "600" }}>Are you sure you want to submit?</p>

            <div className="modal-actions">
              <button className="btn-secondary" onClick={() => setShowSubmitConfirm(false)} disabled={submitting}>
                Cancel
              </button>
              <button className="btn-submit" onClick={submitExam} disabled={submitting}>
                {submitting ? (
                  <>
                    <span
                      style={{
                        display: "inline-block",
                        width: "16px",
                        height: "16px",
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTop: "2px solid white",
                        borderRadius: "50%",
                        animation: "spin 1s linear infinite",
                        marginRight: "8px",
                      }}
                    ></span>
                    Submitting...
                  </>
                ) : (
                  <>
                    <i className="bi bi-check-circle me-2"></i>
                    Submit Exam 🚀
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default TakeExam
