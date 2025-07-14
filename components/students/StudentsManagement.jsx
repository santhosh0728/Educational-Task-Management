"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import axios from "axios"
import toast from "react-hot-toast"

const StudentsManagement = () => {
  const { user } = useAuth()
  const [students, setStudents] = useState([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")

  useEffect(() => {
    fetchStudents()
  }, [])

  const fetchStudents = async () => {
    try {
      setLoading(true)
      const response = await axios.get("/api/users?role=STUDENT")
      
      if (response.data.success) {
        setStudents(response.data.users || [])
      } else {
        setStudents([])
        toast.error("Failed to load students")
      }
    } catch (error) {
      console.error("Error fetching students:", error)
      toast.error("Failed to load students")
      setStudents([])
    } finally {
      setLoading(false)
    }
  }

  const filteredStudents = students.filter(student => 
    student.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    student.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (student.studentId && student.studentId.toLowerCase().includes(searchTerm.toLowerCase()))
  )

  if (user?.role !== "TUTOR") {
    return (
      <div className="container-fluid py-4">
        <div className="alert alert-warning">
          <i className="bi bi-exclamation-triangle me-2"></i>
          Access denied. Only tutors can manage students.
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="d-flex justify-content-between align-items-center">
            <div>
              <h2 className="mb-1">
                <i className="bi bi-people me-2 text-primary"></i>
                Manage Students
              </h2>
              <p className="text-muted mb-0">View and organize your student groups</p>
            </div>
          </div>
        </div>
      </div>

      {/* Search */}
      <div className="row mb-4">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Search Students</label>
                  <div className="input-group">
                    <span className="input-group-text">
                      <i className="bi bi-search"></i>
                    </span>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Search by name, email, or student ID..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>
                <div className="col-md-6">
                  <label className="form-label">&nbsp;</label>
                  <button 
                    className="btn btn-outline-secondary w-100"
                    onClick={() => setSearchTerm("")}
                  >
                    <i className="bi bi-arrow-clockwise me-1"></i>
                    Clear Search
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Students List */}
      <div className="row">
        <div className="col-12">
          <div className="card shadow-sm">
            <div className="card-header bg-light">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="mb-0">
                  <i className="bi bi-list me-2"></i>
                  Students ({filteredStudents.length})
                </h5>
              </div>
            </div>
            <div className="card-body p-0">
              {loading ? (
                <div className="d-flex justify-content-center align-items-center p-5">
                  <div className="spinner-border text-primary\" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : filteredStudents.length === 0 ? (
                <div className="text-center p-5">
                  <i className="bi bi-person-x text-muted" style={{ fontSize: "3rem" }}></i>
                  <h5 className="mt-3">No Students Found</h5>
                  <p className="text-muted">
                    {searchTerm 
                      ? "No students match your search criteria." 
                      : "No students have been enrolled yet."
                    }
                  </p>
                  {searchTerm && (
                    <button 
                      className="btn btn-outline-primary"
                      onClick={() => setSearchTerm("")}
                    >
                      Clear Search
                    </button>
                  )}
                </div>
              ) : (
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Student</th>
                        <th>Email</th>
                        <th>Student ID</th>
                        <th>Join Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredStudents.map((student) => (
                        <tr key={student._id}>
                          <td>
                            <div className="d-flex align-items-center">
                              <div className="student-avatar me-3">
                                <div className="avatar-circle bg-primary">
                                  {student.fullName.charAt(0).toUpperCase()}
                                </div>
                              </div>
                              <div>
                                <div className="fw-semibold">{student.fullName}</div>
                                <small className="text-muted">{student.institution}</small>
                              </div>
                            </div>
                          </td>
                          <td>
                            <span className="text-muted">{student.email}</span>
                          </td>
                          <td>
                            <span className="badge bg-light text-dark">
                              {student.studentId || "N/A"}
                            </span>
                          </td>
                          <td>
                            <span className="text-muted">
                              {new Date(student.createdAt).toLocaleDateString()}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <style jsx>{`
        .student-avatar {
          position: relative;
        }

        .avatar-circle {
          width: 40px;
          height: 40px;
          border-radius: 50%;
          display: flex;
          align-items: center;
          justify-content: center;
          color: white;
          font-weight: 600;
          font-size: 1rem;
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
          padding: 1rem 0.75rem;
        }

        .table tbody tr:hover {
          background-color: #f8fafc;
        }

        @media (max-width: 768px) {
          .table-responsive {
            font-size: 0.875rem;
          }
          
          .avatar-circle {
            width: 32px;
            height: 32px;
            font-size: 0.875rem;
          }
        }
      `}</style>
    </div>
  )
}

export default StudentsManagement