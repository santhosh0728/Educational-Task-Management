"use client"

import { useState, useEffect } from "react"
import { useParams, useNavigate } from "react-router-dom"
import { Chart as ChartJS, ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement } from "chart.js"
import { Doughnut, Bar } from "react-chartjs-2"
import axios from "axios"
import toast from "react-hot-toast"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement)

const ExamAnalytics = () => {
  const { examId } = useParams()
  const navigate = useNavigate()
  const [analytics, setAnalytics] = useState(null)
  const [loading, setLoading] = useState(true)
  const [selectedFilter, setSelectedFilter] = useState("all")

  useEffect(() => {
    fetchAnalytics()
  }, [examId])

  const fetchAnalytics = async () => {
    try {
      const response = await axios.get(`http://localhost:5000/api/exams/${examId}/analytics`)
      setAnalytics(response.data)
    } catch (error) {
      toast.error("Failed to fetch exam analytics")
      navigate("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const exportAnalytics = () => {
    toast.success("Analytics exported successfully!")
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="spinner-custom"></div>
      </div>
    )
  }

  if (!analytics) {
    return (
      <div className="d-flex justify-content-center align-items-center min-vh-100">
        <div className="text-center">
          <h2 className="mb-4">Analytics Not Available</h2>
          <button onClick={() => navigate("/dashboard")} className="btn btn-primary">
            Back to Dashboard
          </button>
        </div>
      </div>
    )
  }

  const { totalAttempts, averageScore, passRate, topScorer, lowestScorer, questionAnalysis, topicStats, results } =
    analytics

  // Prepare data for charts
  const scoreDistribution = [
    { range: "0-20%", count: results.filter((r) => r.percentage <= 20).length },
    { range: "21-40%", count: results.filter((r) => r.percentage > 20 && r.percentage <= 40).length },
    { range: "41-60%", count: results.filter((r) => r.percentage > 40 && r.percentage <= 60).length },
    { range: "61-80%", count: results.filter((r) => r.percentage > 60 && r.percentage <= 80).length },
    { range: "81-100%", count: results.filter((r) => r.percentage > 80).length },
  ]

  const passFailData = {
    labels: ["Pass", "Fail"],
    datasets: [
      {
        data: [results.filter((r) => r.status === "PASS").length, results.filter((r) => r.status === "FAIL").length],
        backgroundColor: ["#198754", "#dc3545"],
        borderWidth: 0,
      },
    ],
  }

  const questionDifficultyData = {
    labels: questionAnalysis.map((q) => `Q${q.questionNumber}`),
    datasets: [
      {
        label: "Correct Answers (%)",
        data: questionAnalysis.map((q) => q.difficultyPercentage),
        backgroundColor: "rgba(25, 135, 84, 0.8)",
        borderColor: "rgba(25, 135, 84, 1)",
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

          <div className="dashboard-card">
            <div className="row align-items-center">
              <div className="col-md-8">
                <h1 className="mb-2">Exam Analytics</h1>
                <p className="text-muted mb-0">Comprehensive performance analysis and insights</p>
              </div>
              <div className="col-md-4 text-end">
                <div className="d-flex gap-2 justify-content-end">
                  <select
                    value={selectedFilter}
                    onChange={(e) => setSelectedFilter(e.target.value)}
                    className="form-select"
                    style={{ width: "auto" }}
                  >
                    <option value="all">All Students</option>
                    <option value="pass">Passed Only</option>
                    <option value="fail">Failed Only</option>
                  </select>
                  <button onClick={exportAnalytics} className="btn btn-primary">
                    <i className="bi bi-download me-2"></i>
                    Export
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="row mb-4">
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="dashboard-card stat-card">
            <div className="stat-icon bg-primary text-white">
              <i className="bi bi-people"></i>
            </div>
            <div className="stat-value text-primary">{totalAttempts}</div>
            <div className="stat-label">Total Attempts</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="dashboard-card stat-card">
            <div className="stat-icon bg-success text-white">
              <i className="bi bi-bar-chart"></i>
            </div>
            <div className="stat-value text-success">{averageScore}%</div>
            <div className="stat-label">Average Score</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="dashboard-card stat-card">
            <div className="stat-icon bg-info text-white">
              <i className="bi bi-trophy"></i>
            </div>
            <div className="stat-value text-info">{passRate}%</div>
            <div className="stat-label">Pass Rate</div>
          </div>
        </div>
        <div className="col-lg-3 col-md-6 mb-3">
          <div className="dashboard-card stat-card">
            <div className="stat-icon bg-warning text-white">
              <i className="bi bi-clock"></i>
            </div>
            <div className="stat-value text-warning">
              {Math.round(results.reduce((sum, r) => sum + r.timeSpent, 0) / totalAttempts || 0)}
            </div>
            <div className="stat-label">Avg Time (min)</div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="row mb-4">
        <div className="col-lg-6 mb-3">
          <div className="dashboard-card">
            <h5 className="mb-3">Score Distribution</h5>
            <div style={{ height: "300px" }}>
              <Bar
                data={{
                  labels: scoreDistribution.map((d) => d.range),
                  datasets: [
                    {
                      label: "Number of Students",
                      data: scoreDistribution.map((d) => d.count),
                      backgroundColor: "rgba(13, 110, 253, 0.8)",
                      borderColor: "rgba(13, 110, 253, 1)",
                      borderWidth: 1,
                    },
                  ],
                }}
                options={{ responsive: true, maintainAspectRatio: false }}
              />
            </div>
          </div>
        </div>
        <div className="col-lg-6 mb-3">
          <div className="dashboard-card">
            <h5 className="mb-3">Pass/Fail Distribution</h5>
            <div style={{ height: "300px" }}>
              <Doughnut data={passFailData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>
          </div>
        </div>
      </div>

      {/* Question Analysis */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="dashboard-card">
            <h5 className="mb-3">Question Difficulty Analysis</h5>
            <div style={{ height: "300px" }} className="mb-4">
              <Bar data={questionDifficultyData} options={{ responsive: true, maintainAspectRatio: false }} />
            </div>

            <div className="table-responsive">
              <table className="table table-custom">
                <thead>
                  <tr>
                    <th>Question</th>
                    <th>Topic</th>
                    <th>Correct Answers</th>
                    <th>Success Rate</th>
                    <th>Difficulty</th>
                  </tr>
                </thead>
                <tbody>
                  {questionAnalysis.map((question, index) => (
                    <tr key={index}>
                      <td>Q{question.questionNumber}</td>
                      <td>{question.topic || "General"}</td>
                      <td>
                        {question.correctAnswers}/{question.totalAttempts}
                      </td>
                      <td>{question.difficultyPercentage.toFixed(1)}%</td>
                      <td>
                        <span
                          className={`badge ${
                            question.difficultyPercentage >= 70
                              ? "bg-success"
                              : question.difficultyPercentage >= 50
                                ? "bg-warning"
                                : "bg-danger"
                          }`}
                        >
                          {question.difficultyPercentage >= 70
                            ? "Easy"
                            : question.difficultyPercentage >= 50
                              ? "Medium"
                              : "Hard"}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      {/* Topic Performance */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="dashboard-card">
            <h5 className="mb-3">Topic-wise Performance</h5>
            <div className="row">
              {topicStats.map((topic, index) => (
                <div key={index} className="col-lg-4 col-md-6 mb-3">
                  <div className="topic-card">
                    <div className="d-flex justify-content-between align-items-center mb-2">
                      <span className="fw-semibold">{topic.topic}</span>
                      <span className="text-muted">
                        {topic.correct}/{topic.total}
                      </span>
                    </div>
                    <div className="progress progress-custom">
                      <div
                        className={`progress-bar ${
                          topic.percentage >= 70 ? "bg-success" : topic.percentage >= 50 ? "bg-warning" : "bg-danger"
                        }`}
                        style={{ width: `${topic.percentage}%` }}
                      ></div>
                    </div>
                    <div className="text-end mt-1">
                      <small className="fw-semibold">{topic.percentage.toFixed(1)}%</small>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Top and Bottom Performers */}
      <div className="row mb-4">
        <div className="col-lg-6 mb-3">
          <div className="dashboard-card">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-trophy text-warning me-2 fs-4"></i>
              <h5 className="mb-0">Top Performer</h5>
            </div>
            {topScorer ? (
              <div className="alert alert-success">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">{topScorer.student.fullName}</div>
                    <small className="text-muted">{topScorer.student.email}</small>
                  </div>
                  <div className="text-end">
                    <div className="h4 text-success mb-0">{topScorer.percentage.toFixed(1)}%</div>
                    <small className="text-muted">
                      {topScorer.score}/{topScorer.totalPoints} points
                    </small>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted">No data available</div>
            )}
          </div>
        </div>
        <div className="col-lg-6 mb-3">
          <div className="dashboard-card">
            <div className="d-flex align-items-center mb-3">
              <i className="bi bi-arrow-down-circle text-danger me-2 fs-4"></i>
              <h5 className="mb-0">Needs Attention</h5>
            </div>
            {lowestScorer ? (
              <div className="alert alert-danger">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <div className="fw-bold">{lowestScorer.student.fullName}</div>
                    <small className="text-muted">{lowestScorer.student.email}</small>
                  </div>
                  <div className="text-end">
                    <div className="h4 text-danger mb-0">{lowestScorer.percentage.toFixed(1)}%</div>
                    <small className="text-muted">
                      {lowestScorer.score}/{lowestScorer.totalPoints} points
                    </small>
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-muted">No data available</div>
            )}
          </div>
        </div>
      </div>

      {/* Student Results Table */}
      <div className="row">
        <div className="col-12">
          <div className="dashboard-card">
            <h5 className="mb-3">All Student Results</h5>
            <div className="table-responsive">
              <table className="table table-custom">
                <thead>
                  <tr>
                    <th>Student</th>
                    <th>Score</th>
                    <th>Percentage</th>
                    <th>Time Taken</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {results
                    .filter((result) => {
                      if (selectedFilter === "pass") return result.status === "PASS"
                      if (selectedFilter === "fail") return result.status === "FAIL"
                      return true
                    })
                    .map((result, index) => (
                      <tr key={index}>
                        <td>
                          <div>
                            <div className="fw-semibold">{result.student.fullName}</div>
                            <small className="text-muted">{result.student.email}</small>
                          </div>
                        </td>
                        <td>
                          {result.score}/{result.totalPoints}
                        </td>
                        <td>{result.percentage.toFixed(1)}%</td>
                        <td>{result.timeSpent} min</td>
                        <td>
                          <span className={`badge ${result.status === "PASS" ? "bg-success" : "bg-danger"}`}>
                            {result.status}
                          </span>
                        </td>
                        <td>{new Date(result.submittedAt).toLocaleDateString()}</td>
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ExamAnalytics
