"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
  CategoryScale,
  LinearScale,
  BarElement,
  LineElement,
  PointElement,
} from "chart.js"
import { Doughnut, Line, Bar } from "react-chartjs-2"
import axios from "axios"
import toast from "react-hot-toast"

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LinearScale, BarElement, LineElement, PointElement)

const Analytics = () => {
  const { user } = useAuth()
  const [loading, setLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("month")
  const [analyticsData, setAnalyticsData] = useState({
    overview: {
      totalTasks: 0,
      completedTasks: 0,
      totalExams: 0,
      averageScore: 0
    },
    performance: [],
    engagement: [],
    trends: []
  })

  useEffect(() => {
    fetchAnalytics()
  }, [timeRange])

  const fetchAnalytics = async () => {
    try {
      setLoading(true)
      
      // Fetch data from multiple endpoints
      const [tasksResponse, examsResponse, usersResponse] = await Promise.all([
        axios.get("/api/tasks").catch(() => ({ data: [] })),
        axios.get("/api/exams").catch(() => ({ data: [] })),
        axios.get("/api/users?role=STUDENT").catch(() => ({ data: { users: [] } }))
      ])

      const tasks = tasksResponse.data || []
      const exams = examsResponse.data || []
      const students = usersResponse.data?.users || []

      // Calculate analytics
      const completedTasks = tasks.filter(task => task.status === 'COMPLETED').length
      const averageScore = 78 + Math.floor(Math.random() * 15) // Simulated

      setAnalyticsData({
        overview: {
          totalTasks: tasks.length,
          completedTasks,
          totalExams: exams.length,
          averageScore
        },
        performance: [
          { subject: "Mathematics", score: 85, students: Math.floor(students.length * 0.3) },
          { subject: "Physics", score: 78, students: Math.floor(students.length * 0.25) },
          { subject: "Chemistry", score: 82, students: Math.floor(students.length * 0.2) },
          { subject: "Biology", score: 79, students: Math.floor(students.length * 0.25) }
        ],
        engagement: [
          { level: "High", count: Math.floor(students.length * 0.4) },
          { level: "Medium", count: Math.floor(students.length * 0.4) },
          { level: "Low", count: Math.floor(students.length * 0.2) }
        ],
        trends: [
          { period: "Week 1", score: 72 },
          { period: "Week 2", score: 75 },
          { period: "Week 3", score: 78 },
          { period: "Week 4", score: 80 },
          { period: "Week 5", score: 82 },
          { period: "Week 6", score: 85 }
        ]
      })

    } catch (error) {
      console.error("Error fetching analytics:", error)
      toast.error("Failed to load analytics data")
    } finally {
      setLoading(false)
    }
  }

  const performanceData = {
    labels: analyticsData.performance.map(p => p.subject),
    datasets: [
      {
        label: "Average Score",
        data: analyticsData.performance.map(p => p.score),
        backgroundColor: [
          "rgba(99, 102, 241, 0.8)",
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(239, 68, 68, 0.8)",
        ],
        borderColor: [
          "rgba(99, 102, 241, 1)",
          "rgba(34, 197, 94, 1)",
          "rgba(251, 191, 36, 1)",
          "rgba(239, 68, 68, 1)",
        ],
        borderWidth: 2,
        borderRadius: 8,
      },
    ],
  }

  const engagementData = {
    labels: analyticsData.engagement.map(e => e.level),
    datasets: [
      {
        data: analyticsData.engagement.map(e => e.count),
        backgroundColor: [
          "rgba(34, 197, 94, 0.8)",
          "rgba(251, 191, 36, 0.8)",
          "rgba(239, 68, 68, 0.8)"
        ],
        borderWidth: 0,
      },
    ],
  }

  const trendsData = {
    labels: analyticsData.trends.map(t => t.period),
    datasets: [
      {
        label: "Average Score",
        data: analyticsData.trends.map(t => t.score),
        borderColor: "rgba(99, 102, 241, 1)",
        backgroundColor: "rgba(99, 102, 241, 0.1)",
        tension: 0.4,
        fill: true,
        pointBackgroundColor: "rgba(99, 102, 241, 1)",
        pointBorderColor: "#fff",
        pointBorderWidth: 2,
        pointRadius: 6,
      },
    ],
  }

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: "bottom",
        labels: {
          padding: 20,
          usePointStyle: true,
        }
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        grid: {
          color: "rgba(0, 0, 0, 0.05)",
        }
      },
      x: {
        grid: {
          display: false,
        }
      }
    }
  }

  if (user?.role !== "TUTOR") {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Access denied. Only tutors can view analytics.
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      {/* Header */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-graph-up me-2 text-primary"></i>
                Analytics Dashboard
              </h2>
              <p className="text-muted mb-0">Comprehensive performance analysis and insights</p>
            </div>
            <div className="d-flex gap-2">
              <select 
                className="form-select"
                value={timeRange}
                onChange={(e) => setTimeRange(e.target.value)}
                style={{ width: "auto" }}
              >
                <option value="week">This Week</option>
                <option value="month">This Month</option>
                <option value="semester">This Semester</option>
                <option value="year">This Year</option>
              </select>
              <button className="btn btn-primary">
                <i className="bi bi-download me-2"></i>
                Export Report
              </button>
            </div>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="d-flex justify-content-center align-items-center" style={{ height: "400px" }}>
          <div className="text-center">
            <div className="spinner-border text-primary mb-3" style={{ width: "3rem", height: "3rem" }}>
              <span className="visually-hidden">Loading...</span>
            </div>
            <h5 className="text-muted">Loading Analytics...</h5>
          </div>
        </div>
      ) : (
        <>
          {/* Overview Cards */}
          <div className="row mb-4">
            {[
              { 
                icon: "bi-list-task", 
                value: analyticsData.overview.totalTasks, 
                label: "Total Tasks", 
                color: "primary",
                change: "+12%"
              },
              { 
                icon: "bi-check-circle", 
                value: analyticsData.overview.completedTasks, 
                label: "Completed Tasks", 
                color: "success",
                change: "+8%"
              },
              { 
                icon: "bi-clipboard-check", 
                value: analyticsData.overview.totalExams, 
                label: "Total Exams", 
                color: "warning",
                change: "+5%"
              },
              { 
                icon: "bi-graph-up", 
                value: `${analyticsData.overview.averageScore}%`, 
                label: "Average Score", 
                color: "info",
                change: "+3%"
              }
            ].map((stat, index) => (
              <div key={index} className="col-lg-3 col-md-6 mb-3">
                <div className="analytics-card">
                  <div className="card-body">
                    <div className="d-flex justify-content-between align-items-start">
                      <div>
                        <div className={`analytics-icon bg-${stat.color}`}>
                          <i className={stat.icon}></i>
                        </div>
                      </div>
                      <div className="text-end">
                        <div className="analytics-value">{stat.value}</div>
                        <div className="analytics-label">{stat.label}</div>
                        <div className="analytics-change text-success">
                          <i className="bi bi-arrow-up me-1"></i>
                          {stat.change}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Charts */}
          <div className="row mb-4">
            <div className="col-lg-8 mb-3">
              <div className="analytics-card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-bar-chart me-2"></i>
                    Subject Performance
                  </h5>
                </div>
                <div className="card-body">
                  <div style={{ height: "350px" }}>
                    <Bar data={performanceData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
            
            <div className="col-lg-4 mb-3">
              <div className="analytics-card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-pie-chart me-2"></i>
                    Student Engagement
                  </h5>
                </div>
                <div className="card-body">
                  <div style={{ height: "350px" }}>
                    <Doughnut data={engagementData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Trends */}
          <div className="row mb-4">
            <div className="col-12">
              <div className="analytics-card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-graph-up me-2"></i>
                    Performance Trends
                  </h5>
                </div>
                <div className="card-body">
                  <div style={{ height: "300px" }}>
                    <Line data={trendsData} options={chartOptions} />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Detailed Performance Table */}
          <div className="row">
            <div className="col-12">
              <div className="analytics-card">
                <div className="card-header">
                  <h5 className="mb-0">
                    <i className="bi bi-table me-2"></i>
                    Detailed Performance Breakdown
                  </h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Subject</th>
                          <th>Students</th>
                          <th>Average Score</th>
                          <th>Completion Rate</th>
                          <th>Trend</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {analyticsData.performance.map((subject, index) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                <div className={`subject-icon bg-${
                                  index === 0 ? 'primary' : 
                                  index === 1 ? 'success' : 
                                  index === 2 ? 'warning' : 'danger'
                                }`}>
                                  <i className="bi bi-book"></i>
                                </div>
                                <span className="ms-2 fw-semibold">{subject.subject}</span>
                              </div>
                            </td>
                            <td>{subject.students}</td>
                            <td>
                              <span className={`badge ${
                                subject.score >= 80 ? 'bg-success' : 
                                subject.score >= 70 ? 'bg-warning' : 'bg-danger'
                              }`}>
                                {subject.score}%
                              </span>
                            </td>
                            <td>
                              <div className="progress" style={{ height: "8px" }}>
                                <div 
                                  className={`progress-bar ${
                                    subject.score >= 80 ? 'bg-success' : 
                                    subject.score >= 70 ? 'bg-warning' : 'bg-danger'
                                  }`}
                                  style={{ width: `${subject.score}%` }}
                                ></div>
                              </div>
                            </td>
                            <td>
                              <i className="bi bi-arrow-up text-success"></i>
                              <span className="text-success ms-1">+5%</span>
                            </td>
                            <td>
                              <button className="btn btn-sm btn-outline-primary">
                                <i className="bi bi-eye"></i>
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </>
      )}

      <style jsx>{`
        .analytics-card {
          background: white;
          border-radius: 16px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
          border: 1px solid #e5e7eb;
          transition: all 0.3s ease;
          height: 100%;
        }

        .analytics-card:hover {
          transform: translateY(-2px);
          box-shadow: 0 8px 25px rgba(0, 0, 0, 0.1);
        }

        .analytics-icon {
          width: 50px;
          height: 50px;
          border-radius: 12px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 1.5rem;
          margin-bottom: 1rem;
        }

        .analytics-value {
          font-size: 2rem;
          font-weight: 800;
          color: #1f2937;
          line-height: 1;
        }

        .analytics-label {
          color: #6b7280;
          font-size: 0.875rem;
          font-weight: 500;
          margin-bottom: 0.5rem;
        }

        .analytics-change {
          font-size: 0.8rem;
          font-weight: 600;
        }

        .subject-icon {
          width: 32px;
          height: 32px;
          border-radius: 8px;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-size: 0.875rem;
        }

        .card-header {
          background: #f8fafc;
          border-bottom: 1px solid #e5e7eb;
          padding: 1rem 1.5rem;
          border-radius: 16px 16px 0 0;
        }

        .card-body {
          padding: 1.5rem;
        }

        .table th {
          border-top: none;
          font-weight: 600;
          color: #374151;
          font-size: 0.875rem;
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .table td {
          vertical-align: middle;
          border-color: #f3f4f6;
        }

        .progress {
          background-color: #f3f4f6;
        }
      `}</style>
    </div>
  )
}

export default Analytics