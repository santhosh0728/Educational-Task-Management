"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js"
import { Doughnut, Bar } from "react-chartjs-2"
import axios from "axios"
import toast from "react-hot-toast"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const ExamResult = () => {
  const { examId, resultId } = useParams()
  const navigate = useNavigate()
  const [result, setResult] = useState(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("summary")

  useEffect(() => {
    fetchResult()
  }, [examId, resultId])

  const fetchResult = async () => {
    try {
      const response = await axios.get(`/api/exams/${examId}/results/${resultId}`)
      setResult(response.data)
    } catch (error) {
      toast.error("Failed to fetch exam result")
      navigate("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const downloadResult = () => {
    toast.success("Result downloaded successfully!")
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-custom"></div>
      </div>
    )
  }

  if (!result) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <h2 className="mb-4">Result Not Found</h2>
          <button onClick={() => navigate("/dashboard")} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { exam, student, score, totalPoints, percentage, status, timeSpent, answers, submittedAt, attemptNumber } =
    result

  // Calculate topic-wise performance
  const topicPerformance = {}
  exam.questions.forEach((question, index) => {
    const topic = question.topic || "General"
    if (!topicPerformance[topic]) {
      topicPerformance[topic] = { correct: 0, total: 0 }
    }
    topicPerformance[topic].total++
    if (answers[index]?.isCorrect) {
      topicPerformance[topic].correct++
    }
  })

  const topicData = Object.entries(topicPerformance).map(([topic, stats]) => ({
    topic,
    percentage: Math.round((stats.correct / stats.total) * 100),
    correct: stats.correct,
    total: stats.total,
  }))

  const pieData = {
    labels: ["Correct", "Incorrect"],
    datasets: [
      {
        data: [answers.filter((a) => a.isCorrect).length, answers.filter((a) => !a.isCorrect).length],
        backgroundColor: ["#198754", "#dc3545"],
        borderWidth: 0,
      },
    ],
  }

  const timeData = {
    labels: answers.map((_, index) => `Q${index + 1}`),
    datasets: [
      {
        label: "Time (minutes)",
        data: answers.map((answer) => Math.round(answer.timeSpent / 60) || 0),
        backgroundColor: "rgba(13, 110, 253, 0.8)",
        borderColor: "rgba(13, 110, 253, 1)",
        borderWidth: 1,
      },
    ],
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <button onClick={() => navigate("/dashboard")} className="btn btn-link text-decoration-none mb-3">
            <i className="bi bi-arrow-left me-2"></i>
            Back to Dashboard
          </button>

          <div className="result-header">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1 className="mb-2">{exam.title}</h1>
                <div className="d-flex flex-wrap gap-3 text-white-50">
                  <div>
                    <i className="bi bi-person me-1"></i>
                    {student.fullName}
                  </div>
                  <div>
                    <i className="bi bi-calendar me-1"></i>
                    {new Date(submittedAt).toLocaleDateString()}
                  </div>
                  <div>
                    <i className="bi bi-clock me-1"></i>
                    Attempt #{attemptNumber}
                  </div>
                </div>
              </div>
              <div className="col-md-4 text-center">
                <button onClick={downloadResult} className="btn btn-light btn-custom">
                  <i className="bi bi-download me-2"></i>
                  Download PDF
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Result Summary Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="dashboard-card stat-card">
            <div className={`stat-icon ${status === "PASS" ? "bg-success" : "bg-danger"} text-white`}>
              <i className={`bi ${status === "PASS" ? "bi-trophy" : "bi-x-circle"}`}></i>
            </div>
            <div className={`stat-value ${status === "PASS" ? "text-success" : "text-danger"}`}>{status}</div>
            <div className="stat-label">Result</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="dashboard-card stat-card">
            <div className="stat-icon bg-primary text-white">
              <i className="bi bi-bar-chart"></i>
            </div>
            <div className="stat-value text-primary">
              {score}/{totalPoints}
            </div>
            <div className="stat-label">Score</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="dashboard-card stat-card">
            <div className="stat-icon bg-info text-white">
              <i className="bi bi-percent"></i>
            </div>
            <div className="stat-value text-info">{Math.round(percentage)}%</div>
            <div className="stat-label">Percentage</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="dashboard-card stat-card">
            <div className="stat-icon bg-warning text-white">
              <i className="bi bi-stopwatch"></i>
            </div>
            <div className="stat-value text-warning">{timeSpent}</div>
            <div className="stat-label">Minutes</div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="dashboard-card">
        <ul className="nav nav-tabs" role="tablist">
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "summary" ? "active" : ""}`}
              onClick={() => setActiveTab("summary")}
            >
              <i className="bi bi-bar-chart me-2"></i>
              Summary
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "questions" ? "active" : ""}`}
              onClick={() => setActiveTab("questions")}
            >
              <i className="bi bi-list-check me-2"></i>
              Question Review
            </button>
          </li>
          <li className="nav-item">
            <button
              className={`nav-link ${activeTab === "analytics" ? "active" : ""}`}
              onClick={() => setActiveTab("analytics")}
            >
              <i className="bi bi-graph-up me-2"></i>
              Analytics
            </button>
          </li>
        </ul>

        <div className="tab-content p-4">
          {activeTab === "summary" && (
            <div className="row">
              <div className="col-lg-6 mb-4">
                <h5 className="mb-3">Answer Distribution</h5>
                <div style={{ height: "300px" }}>
                  <Doughnut data={pieData} options={{ responsive: true, maintainAspectRatio: false }} />
                </div>
              </div>
              <div className="col-lg-6 mb-4">
                <h5 className="mb-3">Topic-wise Performance</h5>
                <div className="space-y-3">
                  {topicData.map((topic, index) => (
                    <div key={index} className="topic-card">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-semibold">{topic.topic}</span>
                        <span className="text-muted">
                          {topic.correct}/{topic.total}
                        </span>
                      </div>
                      <div className="progress progress-custom topic-progress">
                        <div
                          className={`progress-bar ${
                            topic.percentage >= 70 ? "bg-success" : topic.percentage >= 50 ? "bg-warning" : "bg-danger"
                          }`}
                          style={{ width: `${topic.percentage}%` }}
                        ></div>
                      </div>
                      <div className="text-end mt-1">
                        <small className="fw-semibold">{topic.percentage}%</small>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {activeTab === "questions" && (
            <div>
              <h5 className="mb-3">Question-wise Review</h5>
              <div className="table-responsive">
                <table className="table table-custom">
                  <thead>
                    <tr>
                      <th>Question</th>
                      <th>Your Answer</th>
                      <th>Correct Answer</th>
                      <th>Status</th>
                      <th>Points</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exam.questions.map((question, index) => {
                      const answer = answers[index]
                      const correctOptions = question.options
                        .map((opt, idx) => (opt.isCorrect ? idx : -1))
                        .filter((idx) => idx !== -1)

                      return (
                        <tr key={index}>
                          <td>
                            <div>
                              <strong>Q{index + 1}:</strong> {question.question}
                            </div>
                            {question.topic && <small className="text-muted">Topic: {question.topic}</small>}
                          </td>
                          <td>
                            {answer?.selectedOptions.map((optIndex) => question.options[optIndex]?.text).join(", ") ||
                              "Not answered"}
                          </td>
                          <td>{correctOptions.map((optIndex) => question.options[optIndex]?.text).join(", ")}</td>
                          <td>
                            <span className={`answer-${answer?.isCorrect ? "correct" : "incorrect"}`}>
                              <i className={`bi ${answer?.isCorrect ? "bi-check-circle" : "bi-x-circle"} me-1`}></i>
                              {answer?.isCorrect ? "Correct" : "Incorrect"}
                            </span>
                          </td>
                          <td>
                            {answer?.points || 0}/{question.points}
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>

              {/* Explanations */}
              {exam.showCorrectAnswers && (
                <div className="mt-4">
                  <h5 className="mb-3">Explanations</h5>
                  {exam.questions.map(
                    (question, index) =>
                      question.explanation && (
                        <div key={index} className="alert alert-info">
                          <strong>Q{index + 1}:</strong> {question.question}
                          <br />
                          <strong>Explanation:</strong> {question.explanation}
                        </div>
                      ),
                  )}
                </div>
              )}
            </div>
          )}

          {activeTab === "analytics" && (
            <div>
              <h5 className="mb-3">Performance Analytics</h5>

              <div className="row mb-4">
                <div className="col-lg-8">
                  <h6 className="mb-3">Time Spent per Question</h6>
                  <div style={{ height: "300px" }}>
                    <Bar data={timeData} options={{ responsive: true, maintainAspectRatio: false }} />
                  </div>
                </div>
                <div className="col-lg-4">
                  <div className="analytics-card">
                    <h6 className="mb-3">Performance Insights</h6>
                    <div className="mb-3">
                      <div className="text-muted small">Strongest Topic</div>
                      <div className="fw-bold text-success">
                        {
                          topicData.reduce((best, current) => (current.percentage > best.percentage ? current : best))
                            .topic
                        }{" "}
                        (
                        {
                          topicData.reduce((best, current) => (current.percentage > best.percentage ? current : best))
                            .percentage
                        }
                        %)
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="text-muted small">Needs Improvement</div>
                      <div className="fw-bold text-danger">
                        {
                          topicData.reduce((worst, current) =>
                            current.percentage < worst.percentage ? current : worst,
                          ).topic
                        }{" "}
                        (
                        {
                          topicData.reduce((worst, current) =>
                            current.percentage < worst.percentage ? current : worst,
                          ).percentage
                        }
                        %)
                      </div>
                    </div>
                    <div className="mb-3">
                      <div className="text-muted small">Average Time per Question</div>
                      <div className="fw-bold">{Math.round((timeSpent / exam.questions.length) * 10) / 10} min</div>
                    </div>
                    <div>
                      <div className="text-muted small">Completion Rate</div>
                      <div className="fw-bold">
                        {Math.round(
                          (answers.filter((a) => a.selectedOptions.length > 0).length / exam.questions.length) * 100,
                        )}
                        %
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default ExamResult
