"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"
import axios from "axios"
import toast from "react-hot-toast"
import "./CreateExam.css"

const CreateExam = () => {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [students, setStudents] = useState([])
  const [studentsLoading, setStudentsLoading] = useState(true)
  const [currentStep, setCurrentStep] = useState(1)
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    subject: "",
    assignedTo: [],
    duration: 60,
    startDate: "",
    endDate: "",
    attemptLimit: 1,
    passingScore: 60,
    showResultsImmediately: false,
    showCorrectAnswers: false,
    randomizeQuestions: false,
    questions: [],
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

  useEffect(() => {
    fetchStudents()

    // Set default dates
    const now = new Date()
    const tomorrow = new Date(now)
    tomorrow.setDate(tomorrow.getDate() + 1)
    tomorrow.setHours(9, 0, 0, 0)

    const dayAfterTomorrow = new Date(tomorrow)
    dayAfterTomorrow.setDate(dayAfterTomorrow.getDate() + 1)
    dayAfterTomorrow.setHours(17, 0, 0, 0)

    const formatDateForInput = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      const hours = String(date.getHours()).padStart(2, "0")
      const minutes = String(date.getMinutes()).padStart(2, "0")
      return `${year}-${month}-${day}T${hours}:${minutes}`
    }

    setFormData((prev) => ({
      ...prev,
      startDate: formatDateForInput(tomorrow),
      endDate: formatDateForInput(dayAfterTomorrow),
    }))
  }, [])

  const fetchStudents = async () => {
    try {
      setStudentsLoading(true)
      console.log("Fetching students...")

      const token = localStorage.getItem("token")
      if (!token) {
        toast.error("Authentication required")
        navigate("/signin")
        return
      }

      const response = await axios.get("/api/users", {
        params: { role: "STUDENT" },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Students response:", response.data)

      if (response.data.success) {
        setStudents(response.data.users || [])
        toast.success(`✅ Loaded ${response.data.users?.length || 0} students`)
      } else {
        setStudents([])
        toast.error("Failed to load students")
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      setStudents([])

      if (error.response?.status === 401) {
        toast.error("Authentication failed. Please login again.")
        navigate("/signin")
      } else if (error.response?.status === 404) {
        toast.error("Students endpoint not found. Please check server configuration.")
      } else {
        toast.error("Failed to load students. Please try again.")
      }
    } finally {
      setStudentsLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "assignedTo") {
      if (checked) {
        setFormData((prev) => ({
          ...prev,
          assignedTo: [...prev.assignedTo, value],
        }))
      } else {
        setFormData((prev) => ({
          ...prev,
          assignedTo: prev.assignedTo.filter((id) => id !== value),
        }))
      }
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value,
      }))
    }
  }

  const addQuestion = () => {
    const newQuestion = {
      id: Date.now(),
      question: "",
      type: "SINGLE",
      options: [
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
        { text: "", isCorrect: false },
      ],
      explanation: "",
      topic: "",
      difficulty: "MEDIUM",
      points: 1,
    }

    setFormData((prev) => ({
      ...prev,
      questions: [...prev.questions, newQuestion],
    }))

    toast.success("➕ Question added!")
  }

  const updateQuestion = (questionId, field, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) => (q.id === questionId ? { ...q, [field]: value } : q)),
    }))
  }

  const updateOption = (questionId, optionIndex, field, value) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.map((q) =>
        q.id === questionId
          ? {
              ...q,
              options: q.options.map((opt, idx) => (idx === optionIndex ? { ...opt, [field]: value } : opt)),
            }
          : q,
      ),
    }))
  }

  const removeQuestion = (questionId) => {
    setFormData((prev) => ({
      ...prev,
      questions: prev.questions.filter((q) => q.id !== questionId),
    }))
    toast.success("🗑️ Question removed!")
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Validate form
      if (!formData.title || !formData.subject || !formData.startDate || !formData.endDate) {
        toast.error("❌ Please fill in all required fields")
        return
      }

      if (formData.assignedTo.length === 0) {
        toast.error("❌ Please select at least one student")
        return
      }

      if (formData.questions.length === 0) {
        toast.error("❌ Please add at least one question")
        return
      }

      // Validate questions
      for (let i = 0; i < formData.questions.length; i++) {
        const question = formData.questions[i]
        if (!question.question.trim()) {
          toast.error(`❌ Question ${i + 1} is empty`)
          return
        }

        const hasCorrectAnswer = question.options.some((opt) => opt.isCorrect)
        if (!hasCorrectAnswer) {
          toast.error(`❌ Question ${i + 1} must have at least one correct answer`)
          return
        }

        const hasEmptyOption = question.options.some((opt) => !opt.text.trim())
        if (hasEmptyOption) {
          toast.error(`❌ Question ${i + 1} has empty options`)
          return
        }
      }

      // Date validation
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)
      const now = new Date()

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        toast.error("❌ Invalid date format")
        return
      }

      const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)
      if (startDate < fiveMinutesFromNow) {
        toast.error("❌ Start date must be at least 5 minutes in the future")
        return
      }

      if (endDate <= startDate) {
        toast.error("❌ End date must be after start date")
        return
      }

      // Prepare data for submission
      const examData = {
        ...formData,
        startDate: startDate.toISOString(),
        endDate: endDate.toISOString(),
        questions: formData.questions.map((q) => ({
          question: q.question,
          type: q.type,
          options: q.options,
          explanation: q.explanation,
          topic: q.topic,
          difficulty: q.difficulty,
          points: q.points,
        })),
      }

      console.log("Submitting exam data:", {
        ...examData,
        questions: `${examData.questions.length} questions`,
      })

      const response = await axios.post("/api/exams", examData, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
          "Content-Type": "application/json",
        },
      })

      if (response.data) {
        toast.success("🎉 Exam created successfully!")
        console.log("Exam created:", response.data)
        navigate("/dashboard/exams")
      }
    } catch (error) {
      console.error("Error creating exam:", error)
      const message = error.response?.data?.message || "Failed to create exam"
      toast.error(`❌ ${message}`)
    } finally {
      setLoading(false)
    }
  }

  const handleSelectAll = () => {
    if (formData.assignedTo.length === students.length) {
      setFormData((prev) => ({ ...prev, assignedTo: [] }))
      toast.info("All students deselected")
    } else {
      setFormData((prev) => ({ ...prev, assignedTo: students.map((s) => s._id) }))
      toast.success(`${students.length} students selected`)
    }
  }

  const nextStep = () => {
    if (currentStep === 1) {
      // Validate basic info
      if (!formData.title || !formData.subject || !formData.startDate || !formData.endDate) {
        toast.error("❌ Please fill in all required fields")
        return
      }
      if (formData.assignedTo.length === 0) {
        toast.error("❌ Please select at least one student")
        return
      }

      // Validate dates
      const startDate = new Date(formData.startDate)
      const endDate = new Date(formData.endDate)

      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) {
        toast.error("❌ Please enter valid dates")
        return
      }

      if (endDate <= startDate) {
        toast.error("❌ End date must be after start date")
        return
      }

      toast.success("✅ Step 1 completed!")
    }
    setCurrentStep((prev) => prev + 1)
  }

  const prevStep = () => {
    setCurrentStep((prev) => prev - 1)
  }

  const getMinDateTime = () => {
    const now = new Date()
    const fiveMinutesFromNow = new Date(now.getTime() + 5 * 60 * 1000)
    return fiveMinutesFromNow.toISOString().slice(0, 16)
  }

  return (
    <div className="create-exam-container">
      <div className="create-exam-header">
        <div className="header-content">
          <div className="title-section">
            <h1 className="page-title">
              <span className="title-icon">📝</span>
              Create New Exam
            </h1>
            <p className="page-subtitle">Design an engaging examination for your students</p>
          </div>
          <button onClick={() => navigate("/dashboard/exams")} className="back-btn">
            <span>←</span>
            Back to Exams
          </button>
        </div>

        {/* Progress Steps */}
        <div className="progress-steps">
          <div className={`step ${currentStep >= 1 ? "active" : ""} ${currentStep > 1 ? "completed" : ""}`}>
            <div className="step-number">{currentStep > 1 ? "✓" : "1"}</div>
            <div className="step-label">Basic Info</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 2 ? "active" : ""} ${currentStep > 2 ? "completed" : ""}`}>
            <div className="step-number">{currentStep > 2 ? "✓" : "2"}</div>
            <div className="step-label">Questions</div>
          </div>
          <div className="step-line"></div>
          <div className={`step ${currentStep >= 3 ? "active" : ""}`}>
            <div className="step-number">3</div>
            <div className="step-label">Review</div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="create-exam-form">
        {/* Step 1: Basic Information */}
        {currentStep === 1 && (
          <div className="form-step">
            <div className="step-content">
              <div className="main-content">
                <div className="form-card">
                  <div className="card-header">
                    <h3>📋 Exam Details</h3>
                    <p>Configure the basic information for your exam</p>
                  </div>
                  <div className="card-body">
                    <div className="form-row">
                      <div className="form-group large">
                        <label htmlFor="title" className="form-label required">
                          Exam Title
                        </label>
                        <input
                          type="text"
                          className="form-input"
                          id="title"
                          name="title"
                          value={formData.title}
                          onChange={handleChange}
                          placeholder="Enter a descriptive exam title"
                          required
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="subject" className="form-label required">
                          Subject
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
                          {subjectOptions.map((subject) => (
                            <option key={subject} value={subject}>
                              {subject}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>

                    <div className="form-group">
                      <label htmlFor="description" className="form-label">
                        Description
                      </label>
                      <textarea
                        className="form-textarea"
                        id="description"
                        name="description"
                        rows="3"
                        value={formData.description}
                        onChange={handleChange}
                        placeholder="Describe the exam content and objectives"
                      ></textarea>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="duration" className="form-label">
                          Duration (minutes)
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          id="duration"
                          name="duration"
                          value={formData.duration}
                          onChange={handleChange}
                          min="5"
                          max="300"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="attemptLimit" className="form-label">
                          Attempt Limit
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          id="attemptLimit"
                          name="attemptLimit"
                          value={formData.attemptLimit}
                          onChange={handleChange}
                          min="1"
                          max="5"
                        />
                      </div>
                      <div className="form-group">
                        <label htmlFor="passingScore" className="form-label">
                          Passing Score (%)
                        </label>
                        <input
                          type="number"
                          className="form-input"
                          id="passingScore"
                          name="passingScore"
                          value={formData.passingScore}
                          onChange={handleChange}
                          min="0"
                          max="100"
                        />
                      </div>
                    </div>

                    <div className="form-row">
                      <div className="form-group">
                        <label htmlFor="startDate" className="form-label required">
                          Start Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          className="form-input"
                          id="startDate"
                          name="startDate"
                          value={formData.startDate}
                          onChange={handleChange}
                          min={getMinDateTime()}
                          required
                        />
                        <small className="form-help">Exam must start at least 5 minutes from now</small>
                      </div>
                      <div className="form-group">
                        <label htmlFor="endDate" className="form-label required">
                          End Date & Time
                        </label>
                        <input
                          type="datetime-local"
                          className="form-input"
                          id="endDate"
                          name="endDate"
                          value={formData.endDate}
                          onChange={handleChange}
                          min={formData.startDate || getMinDateTime()}
                          required
                        />
                        <small className="form-help">Must be after start date</small>
                      </div>
                    </div>

                    {/* Date Preview */}
                    {formData.startDate && formData.endDate && (
                      <div className="date-preview">
                        <h4>📅 Exam Schedule Preview</h4>
                        <div className="preview-grid">
                          <div className="preview-item">
                            <span className="preview-label">Start:</span>
                            <span className="preview-value">{new Date(formData.startDate).toLocaleString()}</span>
                          </div>
                          <div className="preview-item">
                            <span className="preview-label">End:</span>
                            <span className="preview-value">{new Date(formData.endDate).toLocaleString()}</span>
                          </div>
                          <div className="preview-item">
                            <span className="preview-label">Duration:</span>
                            <span className="preview-value">{formData.duration} minutes</span>
                          </div>
                          <div className="preview-item">
                            <span className="preview-label">Total Window:</span>
                            <span className="preview-value">
                              {Math.round(
                                (new Date(formData.endDate) - new Date(formData.startDate)) / (1000 * 60 * 60 * 24),
                              )}{" "}
                              day(s)
                            </span>
                          </div>
                        </div>
                      </div>
                    )}

                    <div className="exam-settings">
                      <h4>⚙️ Exam Settings</h4>
                      <div className="settings-grid">
                        <div className="setting-item">
                          <input
                            className="setting-checkbox"
                            type="checkbox"
                            id="showResultsImmediately"
                            name="showResultsImmediately"
                            checked={formData.showResultsImmediately}
                            onChange={handleChange}
                          />
                          <label className="setting-label" htmlFor="showResultsImmediately">
                            <span className="setting-icon">📊</span>
                            <div className="setting-content">
                              <div className="setting-title">Show results immediately</div>
                              <div className="setting-description">Students see results after submission</div>
                            </div>
                          </label>
                        </div>
                        <div className="setting-item">
                          <input
                            className="setting-checkbox"
                            type="checkbox"
                            id="showCorrectAnswers"
                            name="showCorrectAnswers"
                            checked={formData.showCorrectAnswers}
                            onChange={handleChange}
                          />
                          <label className="setting-label" htmlFor="showCorrectAnswers">
                            <span className="setting-icon">✅</span>
                            <div className="setting-content">
                              <div className="setting-title">Show correct answers</div>
                              <div className="setting-description">Display correct answers to students</div>
                            </div>
                          </label>
                        </div>
                        <div className="setting-item">
                          <input
                            className="setting-checkbox"
                            type="checkbox"
                            id="randomizeQuestions"
                            name="randomizeQuestions"
                            checked={formData.randomizeQuestions}
                            onChange={handleChange}
                          />
                          <label className="setting-label" htmlFor="randomizeQuestions">
                            <span className="setting-icon">🔀</span>
                            <div className="setting-content">
                              <div className="setting-title">Randomize questions</div>
                              <div className="setting-description">Shuffle question order for each student</div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="sidebar-content">
                <div className="form-card">
                  <div className="card-header">
                    <div className="header-with-action">
                      <div>
                        <h3>👥 Assign to Students</h3>
                        <p>Select students who can take this exam</p>
                      </div>
                      {!studentsLoading && students.length > 0 && (
                        <button type="button" className="select-all-btn" onClick={handleSelectAll}>
                          {formData.assignedTo.length === students.length ? "Deselect All" : "Select All"}
                        </button>
                      )}
                    </div>
                  </div>
                  <div className="card-body students-list">
                    {studentsLoading ? (
                      <div className="loading-state">
                        <div className="loading-spinner-small"></div>
                        <p>Loading students...</p>
                      </div>
                    ) : students.length === 0 ? (
                      <div className="empty-state-small">
                        <span className="empty-icon">👤</span>
                        <p>No students found</p>
                        <button type="button" className="retry-btn-small" onClick={fetchStudents}>
                          🔄 Retry
                        </button>
                      </div>
                    ) : (
                      <div className="students-grid">
                        {students.map((student) => (
                          <div key={student._id} className="student-item">
                            <input
                              className="student-checkbox"
                              type="checkbox"
                              id={`student-${student._id}`}
                              name="assignedTo"
                              value={student._id}
                              checked={formData.assignedTo.includes(student._id)}
                              onChange={handleChange}
                            />
                            <label className="student-label" htmlFor={`student-${student._id}`}>
                              <div className="student-avatar">{student.fullName.charAt(0).toUpperCase()}</div>
                              <div className="student-info">
                                <div className="student-name">{student.fullName}</div>
                                <div className="student-email">{student.email}</div>
                                {student.studentId && <div className="student-id">ID: {student.studentId}</div>}
                              </div>
                              <div className="student-checkmark">
                                {formData.assignedTo.includes(student._id) && <span>✓</span>}
                              </div>
                            </label>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <div className="card-footer">
                    <div className="selection-summary">
                      <span className="summary-icon">📋</span>
                      <span className="summary-text">{formData.assignedTo.length} student(s) selected</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Step 2: Questions */}
        {currentStep === 2 && (
          <div className="form-step">
            <div className="questions-content">
              <div className="questions-header">
                <div className="questions-title">
                  <h3>❓ Exam Questions ({formData.questions.length})</h3>
                  <p>Create engaging questions for your exam</p>
                </div>
                <button type="button" className="add-question-btn" onClick={addQuestion}>
                  <span>➕</span>
                  Add Question
                </button>
              </div>

              {formData.questions.length === 0 ? (
                <div className="empty-questions">
                  <div className="empty-icon">❓</div>
                  <h4>No questions added yet</h4>
                  <p>Click "Add Question" to start creating your exam</p>
                  <button type="button" className="add-first-question-btn" onClick={addQuestion}>
                    <span>➕</span>
                    Add Your First Question
                  </button>
                </div>
              ) : (
                <div className="questions-list">
                  {formData.questions.map((question, index) => (
                    <div key={question.id} className="question-card">
                      <div className="question-header">
                        <div className="question-number">
                          <span>Q{index + 1}</span>
                        </div>
                        <div className="question-actions">
                          <button
                            type="button"
                            className="remove-question-btn"
                            onClick={() => removeQuestion(question.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>

                      <div className="question-body">
                        <div className="form-group">
                          <label className="form-label">Question Text</label>
                          <textarea
                            className="form-textarea"
                            rows="3"
                            value={question.question}
                            onChange={(e) => updateQuestion(question.id, "question", e.target.value)}
                            placeholder="Enter your question here..."
                          />
                        </div>

                        <div className="question-meta">
                          <div className="form-group">
                            <label className="form-label">Type</label>
                            <select
                              className="form-select"
                              value={question.type}
                              onChange={(e) => updateQuestion(question.id, "type", e.target.value)}
                            >
                              <option value="SINGLE">Single Choice</option>
                              <option value="MULTIPLE">Multiple Choice</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Difficulty</label>
                            <select
                              className="form-select"
                              value={question.difficulty}
                              onChange={(e) => updateQuestion(question.id, "difficulty", e.target.value)}
                            >
                              <option value="EASY">Easy</option>
                              <option value="MEDIUM">Medium</option>
                              <option value="HARD">Hard</option>
                            </select>
                          </div>
                          <div className="form-group">
                            <label className="form-label">Points</label>
                            <input
                              type="number"
                              className="form-input"
                              value={question.points}
                              onChange={(e) => updateQuestion(question.id, "points", Number(e.target.value))}
                              min="1"
                              max="10"
                            />
                          </div>
                          <div className="form-group">
                            <label className="form-label">Topic</label>
                            <input
                              type="text"
                              className="form-input"
                              value={question.topic}
                              onChange={(e) => updateQuestion(question.id, "topic", e.target.value)}
                              placeholder="Optional"
                            />
                          </div>
                        </div>

                        {/* Options Section - Updated */}
                        <div className="options-section">
                          <label className="form-label">Answer Options</label>
                          <div className="options-help">
                            <span className="help-icon">💡</span>
                            <span>
                              Click the {question.type === "SINGLE" ? "radio button" : "checkbox"} to mark correct
                              answer(s)
                            </span>
                          </div>
                          <div className="options-grid">
                            {question.options.map((option, optIndex) => (
                              <div key={optIndex} className={`option-item ${option.isCorrect ? "correct-option" : ""}`}>
                                <div className="option-selector">
                                  <input
                                    className="option-radio-checkbox"
                                    type={question.type === "SINGLE" ? "radio" : "checkbox"}
                                    name={`question-${question.id}-correct`}
                                    id={`question-${question.id}-option-${optIndex}`}
                                    checked={option.isCorrect}
                                    onChange={(e) => {
                                      if (question.type === "SINGLE") {
                                        // For single choice, uncheck all others first
                                        const newOptions = question.options.map((opt, idx) => ({
                                          ...opt,
                                          isCorrect: idx === optIndex ? e.target.checked : false,
                                        }))
                                        updateQuestion(question.id, "options", newOptions)
                                      } else {
                                        // For multiple choice, toggle this option
                                        updateOption(question.id, optIndex, "isCorrect", e.target.checked)
                                      }
                                    }}
                                  />
                                  <label
                                    htmlFor={`question-${question.id}-option-${optIndex}`}
                                    className="option-label"
                                  >
                                    <span className="option-letter">{String.fromCharCode(65 + optIndex)}</span>
                                    {option.isCorrect && <span className="checkmark">✓</span>}
                                  </label>
                                </div>
                                <input
                                  type="text"
                                  className={`option-text ${option.isCorrect ? "correct-text" : ""}`}
                                  value={option.text}
                                  onChange={(e) => updateOption(question.id, optIndex, "text", e.target.value)}
                                  placeholder={`Option ${String.fromCharCode(65 + optIndex)}`}
                                />
                                {option.isCorrect && (
                                  <div className="correct-badge">
                                    <span>Correct Answer</span>
                                  </div>
                                )}
                              </div>
                            ))}
                          </div>

                          {/* Validation Warning */}
                          {question.options.every((opt) => !opt.isCorrect) && (
                            <div className="validation-warning">
                              <span className="warning-icon">⚠️</span>
                              <span>Please mark at least one correct answer</span>
                            </div>
                          )}

                          {/* Answer Summary */}
                          <div className="answer-summary">
                            <span className="summary-label">Correct Answer(s):</span>
                            <div className="correct-answers">
                              {question.options.map((option, idx) =>
                                option.isCorrect ? (
                                  <span key={idx} className="correct-answer-tag">
                                    {String.fromCharCode(65 + idx)}. {option.text}
                                  </span>
                                ) : null,
                              )}
                              {question.options.every((opt) => !opt.isCorrect) && (
                                <span className="no-correct-answer">No correct answer selected</span>
                              )}
                            </div>
                          </div>
                        </div>

                        <div className="form-group">
                          <label className="form-label">Explanation (Optional)</label>
                          <textarea
                            className="form-textarea"
                            rows="2"
                            value={question.explanation}
                            onChange={(e) => updateQuestion(question.id, "explanation", e.target.value)}
                            placeholder="Explain the correct answer..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* Step 3: Review */}
        {currentStep === 3 && (
          <div className="form-step">
            <div className="review-content">
              <div className="review-header">
                <h3>👁️ Review Exam</h3>
                <p>Review all details before creating your exam</p>
              </div>

              <div className="review-grid">
                <div className="review-section">
                  <h4>📋 Exam Details</h4>
                  <div className="review-table">
                    <div className="review-row">
                      <span className="review-label">Title:</span>
                      <span className="review-value">{formData.title}</span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Subject:</span>
                      <span className="review-value">{formData.subject}</span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Duration:</span>
                      <span className="review-value">{formData.duration} minutes</span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Questions:</span>
                      <span className="review-value">{formData.questions.length}</span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Total Points:</span>
                      <span className="review-value">{formData.questions.reduce((sum, q) => sum + q.points, 0)}</span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Passing Score:</span>
                      <span className="review-value">{formData.passingScore}%</span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">Start Date:</span>
                      <span className="review-value">{new Date(formData.startDate).toLocaleString()}</span>
                    </div>
                    <div className="review-row">
                      <span className="review-label">End Date:</span>
                      <span className="review-value">{new Date(formData.endDate).toLocaleString()}</span>
                    </div>
                  </div>
                </div>

                <div className="review-section">
                  <h4>👥 Assigned Students ({formData.assignedTo.length})</h4>
                  <div className="assigned-students">
                    {students
                      .filter((s) => formData.assignedTo.includes(s._id))
                      .map((student) => (
                        <div key={student._id} className="assigned-student">
                          <div className="student-avatar-small">{student.fullName.charAt(0).toUpperCase()}</div>
                          <div className="student-details">
                            <div className="student-name-small">{student.fullName}</div>
                            <div className="student-email-small">{student.email}</div>
                          </div>
                        </div>
                      ))}
                  </div>
                </div>
              </div>

              <div className="questions-preview">
                <h4>❓ Questions Preview</h4>
                <div className="questions-preview-list">
                  {formData.questions.map((question, index) => (
                    <div key={question.id} className="question-preview">
                      <div className="question-preview-header">
                        <span className="question-preview-number">Q{index + 1}</span>
                        <span className="question-preview-points">{question.points} pts</span>
                        <span className="question-preview-difficulty">{question.difficulty}</span>
                      </div>
                      <div className="question-preview-text">{question.question}</div>
                      <div className="options-preview">
                        {question.options.map((option, optIndex) => (
                          <div key={optIndex} className={`option-preview ${option.isCorrect ? "correct" : ""}`}>
                            <span className="option-preview-letter">{String.fromCharCode(65 + optIndex)}</span>
                            <span className="option-preview-text">{option.text}</span>
                            {option.isCorrect && <span className="correct-indicator">✓</span>}
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Navigation Buttons */}
        <div className="form-navigation">
          <div className="nav-left">
            {currentStep > 1 && (
              <button type="button" className="nav-btn secondary" onClick={prevStep}>
                <span>←</span>
                Previous
              </button>
            )}
          </div>
          <div className="nav-right">
            {currentStep < 3 ? (
              <button type="button" className="nav-btn primary" onClick={nextStep}>
                Next
                <span>→</span>
              </button>
            ) : (
              <button type="submit" className="nav-btn success" disabled={loading}>
                {loading ? (
                  <>
                    <span className="loading-spinner-small"></span>
                    Creating...
                  </>
                ) : (
                  <>
                    <span>🎉</span>
                    Create Exam
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  )
}

export default CreateExam
