"use client"

import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const BulkDeleteModal = ({ selectedExams, isOpen, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  const handleBulkDelete = async () => {
    if (confirmText !== "DELETE ALL") {
      toast.error('Please type "DELETE ALL" to confirm bulk deletion')
      return
    }

    try {
      setIsDeleting(true)
      const examIds = selectedExams.map((exam) => exam._id)

      console.log("=== CLIENT BULK DELETE ===")
      console.log("Selected exams:", selectedExams)
      console.log("Exam IDs:", examIds)

      const token = localStorage.getItem("token")
      console.log("Token exists:", !!token)

      if (!token) {
        toast.error("Authentication token not found. Please log in again.")
        return
      }

      // Log the request details
      console.log("Making DELETE request to /api/exams/bulk/delete")
      console.log("Request data:", { examIds })

      const response = await axios.delete("/api/exams/bulk/delete", {
        data: { examIds },
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("✅ Bulk delete response:", response.data)

      // Show success message with details
      const { deletedExams, deletedResults, skippedExams } = response.data

      let successMessage = `Successfully deleted ${deletedExams} exam${deletedExams !== 1 ? "s" : ""}`
      if (deletedResults > 0) {
        successMessage += ` and ${deletedResults} student result${deletedResults !== 1 ? "s" : ""}`
      }
      if (skippedExams > 0) {
        successMessage += `. ${skippedExams} exam${skippedExams !== 1 ? "s" : ""} skipped (not owned by you)`
      }

      toast.success(successMessage)

      // Only remove the successfully deleted exams from the UI
      const deletedExamIds = response.data.examTitles
        ? selectedExams.filter((exam) => response.data.examTitles.includes(exam.title)).map((exam) => exam._id)
        : examIds.slice(0, deletedExams)

      onDelete(deletedExamIds)
      onClose()
      setConfirmText("")
    } catch (error) {
      console.error("❌ Error bulk deleting exams:", error)
      console.error("Error response:", error.response?.data)
      console.error("Error status:", error.response?.status)

      let errorMessage = "Failed to delete exams. Please try again."

      if (error.response?.status === 403) {
        errorMessage = "You don't have permission to delete these exams"
      } else if (error.response?.status === 404) {
        errorMessage = error.response.data.message || "Some exams were not found or you don't own them"
      } else if (error.response?.status === 400) {
        errorMessage = error.response.data.message || "Invalid request data"
      } else if (error.response?.status === 401) {
        errorMessage = "Authentication failed. Please log in again."
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }

      toast.error(errorMessage)
    } finally {
      setIsDeleting(false)
    }
  }

  const handleClose = () => {
    setConfirmText("")
    onClose()
  }

  if (!isOpen) return null

  const totalQuestions = selectedExams.reduce((sum, exam) => sum + (exam.questions?.length || 0), 0)
  const totalStudents = selectedExams.reduce((sum, exam) => sum + (exam.assignedTo?.length || 0), 0)

  return (
    <div className="bulk-delete-modal-overlay">
      <div className="bulk-delete-modal-content">
        {/* Header */}
        <div className="modal-header">
          <div className="header-icon">
            <span className="warning-icon">⚠️</span>
          </div>
          <div className="header-text">
            <h2 className="modal-title">Bulk Delete Exams</h2>
            <p className="modal-subtitle">This action cannot be undone!</p>
          </div>
          <button className="close-button" onClick={handleClose} disabled={isDeleting}>
            ✕
          </button>
        </div>

        {/* Content */}
        <div className="modal-body">
          {/* Warning Alert */}
          <div className="warning-alert">
            <div className="alert-icon">🚨</div>
            <div className="alert-content">
              <h3>Permanent Deletion Warning</h3>
              <p>
                This will permanently delete <strong>{selectedExams.length} exams</strong> and all associated student
                results.
              </p>
            </div>
          </div>

          {/* Statistics */}
          <div className="deletion-stats">
            <div className="stat-card">
              <div className="stat-icon">📚</div>
              <div className="stat-info">
                <div className="stat-number">{selectedExams.length}</div>
                <div className="stat-label">Exams</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">❓</div>
              <div className="stat-info">
                <div className="stat-number">{totalQuestions}</div>
                <div className="stat-label">Questions</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">👥</div>
              <div className="stat-info">
                <div className="stat-number">{totalStudents}</div>
                <div className="stat-label">Students</div>
              </div>
            </div>
            <div className="stat-card">
              <div className="stat-icon">📊</div>
              <div className="stat-info">
                <div className="stat-number">All</div>
                <div className="stat-label">Results</div>
              </div>
            </div>
          </div>

          {/* Exam List */}
          <div className="exam-list-section">
            <h4 className="section-title">
              <span className="title-icon">📋</span>
              Exams to be deleted:
            </h4>
            <div className="exam-list">
              {selectedExams.map((exam) => (
                <div key={exam._id} className="exam-item">
                  <div className="exam-info">
                    <h5 className="exam-title">{exam.title}</h5>
                    <div className="exam-details">
                      <span className="detail-item">
                        <span className="detail-icon">📖</span>
                        {exam.subject}
                      </span>
                      <span className="detail-item">
                        <span className="detail-icon">❓</span>
                        {exam.questions?.length || 0} questions
                      </span>
                      <span className="detail-item">
                        <span className="detail-icon">👥</span>
                        {exam.assignedTo?.length || 0} students
                      </span>
                      <span className="detail-item">
                        <span className="detail-icon">🆔</span>
                        ID: {exam._id.slice(-6)}
                      </span>
                    </div>
                  </div>
                  <div className="delete-badge">
                    <span className="badge-icon">🗑️</span>
                    Delete
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="confirmation-section">
            <div className="confirmation-header">
              <span className="lock-icon">🔒</span>
              <h4>Confirmation Required</h4>
            </div>
            <p className="confirmation-text">
              Type <strong>"DELETE ALL"</strong> to confirm bulk deletion:
            </p>
            <input
              type="text"
              className="confirmation-input"
              placeholder="Type DELETE ALL here"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isDeleting}
            />
            <small className="help-text">This helps prevent accidental bulk deletions</small>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="cancel-button" onClick={handleClose} disabled={isDeleting}>
            <span className="button-icon">❌</span>
            Cancel
          </button>
          <button
            className="delete-button"
            onClick={handleBulkDelete}
            disabled={isDeleting || confirmText !== "DELETE ALL"}
          >
            {isDeleting ? (
              <>
                <span className="spinner"></span>
                Deleting {selectedExams.length} Exams...
              </>
            ) : (
              <>
                <span className="button-icon">🗑️</span>
                Delete {selectedExams.length} Exams
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .bulk-delete-modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.6);
          display: flex;
          align-items: center;
          justify-content: center;
          z-index: 1000;
          padding: 20px;
        }

        .bulk-delete-modal-content {
          background: white;
          border-radius: 20px;
          max-width: 600px;
          width: 100%;
          max-height: 90vh;
          overflow-y: auto;
          box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
          animation: modalSlideIn 0.3s ease-out;
        }

        @keyframes modalSlideIn {
          from {
            opacity: 0;
            transform: translateY(-30px) scale(0.95);
          }
          to {
            opacity: 1;
            transform: translateY(0) scale(1);
          }
        }

        .modal-header {
          display: flex;
          align-items: center;
          padding: 25px 30px;
          border-bottom: 1px solid #e5e7eb;
          background: linear-gradient(135deg, #fee2e2, #fef2f2);
        }

        .header-icon {
          margin-right: 15px;
        }

        .warning-icon {
          font-size: 32px;
          animation: pulse 2s infinite;
        }

        @keyframes pulse {
          0%,
          100% {
            transform: scale(1);
          }
          50% {
            transform: scale(1.1);
          }
        }

        .header-text {
          flex: 1;
        }

        .modal-title {
          margin: 0 0 5px 0;
          font-size: 24px;
          font-weight: 800;
          color: #dc2626;
        }

        .modal-subtitle {
          margin: 0;
          color: #7f1d1d;
          font-weight: 600;
        }

        .close-button {
          width: 40px;
          height: 40px;
          border: none;
          background: rgba(220, 38, 38, 0.1);
          color: #dc2626;
          border-radius: 50%;
          cursor: pointer;
          font-size: 18px;
          font-weight: bold;
          transition: all 0.2s ease;
        }

        .close-button:hover:not(:disabled) {
          background: rgba(220, 38, 38, 0.2);
          transform: scale(1.1);
        }

        .close-button:disabled {
          opacity: 0.5;
          cursor: not-allowed;
        }

        .modal-body {
          padding: 30px;
        }

        .warning-alert {
          display: flex;
          align-items: center;
          padding: 20px;
          background: linear-gradient(135deg, #fef3c7, #fef9e7);
          border: 2px solid #f59e0b;
          border-radius: 12px;
          margin-bottom: 25px;
        }

        .alert-icon {
          font-size: 24px;
          margin-right: 15px;
        }

        .alert-content h3 {
          margin: 0 0 8px 0;
          font-size: 18px;
          font-weight: 700;
          color: #92400e;
        }

        .alert-content p {
          margin: 0;
          color: #78350f;
          font-weight: 500;
        }

        .deletion-stats {
          display: grid;
          grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
          gap: 15px;
          margin-bottom: 25px;
        }

        .stat-card {
          display: flex;
          align-items: center;
          padding: 15px;
          background: linear-gradient(135deg, #f3f4f6, #f9fafb);
          border-radius: 12px;
          border: 1px solid #e5e7eb;
        }

        .stat-icon {
          font-size: 20px;
          margin-right: 12px;
        }

        .stat-number {
          font-size: 20px;
          font-weight: 800;
          color: #374151;
          line-height: 1;
        }

        .stat-label {
          font-size: 12px;
          color: #6b7280;
          text-transform: uppercase;
          letter-spacing: 0.5px;
          font-weight: 600;
        }

        .exam-list-section {
          margin-bottom: 25px;
        }

        .section-title {
          display: flex;
          align-items: center;
          margin: 0 0 15px 0;
          font-size: 16px;
          font-weight: 700;
          color: #374151;
        }

        .title-icon {
          margin-right: 8px;
          font-size: 18px;
        }

        .exam-list {
          max-height: 200px;
          overflow-y: auto;
          border: 1px solid #e5e7eb;
          border-radius: 8px;
        }

        .exam-item {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 15px;
          border-bottom: 1px solid #f3f4f6;
        }

        .exam-item:last-child {
          border-bottom: none;
        }

        .exam-info {
          flex: 1;
        }

        .exam-title {
          margin: 0 0 8px 0;
          font-size: 16px;
          font-weight: 600;
          color: #374151;
        }

        .exam-details {
          display: flex;
          gap: 15px;
          flex-wrap: wrap;
        }

        .detail-item {
          display: flex;
          align-items: center;
          font-size: 13px;
          color: #6b7280;
          font-weight: 500;
        }

        .detail-icon {
          margin-right: 4px;
          font-size: 12px;
        }

        .delete-badge {
          display: flex;
          align-items: center;
          padding: 6px 12px;
          background: linear-gradient(135deg, #fee2e2, #fecaca);
          color: #dc2626;
          border-radius: 20px;
          font-size: 12px;
          font-weight: 600;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .badge-icon {
          margin-right: 4px;
          font-size: 12px;
        }

        .confirmation-section {
          background: linear-gradient(135deg, #f0f9ff, #e0f2fe);
          padding: 20px;
          border-radius: 12px;
          border: 2px solid #0ea5e9;
        }

        .confirmation-header {
          display: flex;
          align-items: center;
          margin-bottom: 10px;
        }

        .lock-icon {
          font-size: 20px;
          margin-right: 8px;
        }

        .confirmation-header h4 {
          margin: 0;
          font-size: 16px;
          font-weight: 700;
          color: #0c4a6e;
        }

        .confirmation-text {
          margin: 0 0 15px 0;
          color: #075985;
          font-weight: 500;
        }

        .confirmation-input {
          width: 100%;
          padding: 12px 16px;
          border: 2px solid #bae6fd;
          border-radius: 8px;
          font-size: 16px;
          font-weight: 600;
          transition: all 0.2s ease;
        }

        .confirmation-input:focus {
          outline: none;
          border-color: #0ea5e9;
          box-shadow: 0 0 0 3px rgba(14, 165, 233, 0.1);
        }

        .confirmation-input:disabled {
          background: #f3f4f6;
          opacity: 0.7;
        }

        .help-text {
          display: block;
          margin-top: 8px;
          color: #64748b;
          font-size: 12px;
          font-style: italic;
        }

        .modal-footer {
          display: flex;
          justify-content: space-between;
          gap: 15px;
          padding: 25px 30px;
          border-top: 1px solid #e5e7eb;
          background: #f9fafb;
          border-radius: 0 0 20px 20px;
        }

        .cancel-button,
        .delete-button {
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 12px 24px;
          border: none;
          border-radius: 8px;
          font-weight: 600;
          cursor: pointer;
          transition: all 0.2s ease;
          min-width: 140px;
        }

        .cancel-button {
          background: #f3f4f6;
          color: #374151;
        }

        .cancel-button:hover:not(:disabled) {
          background: #e5e7eb;
          transform: translateY(-1px);
        }

        .delete-button {
          background: linear-gradient(135deg, #dc2626, #b91c1c);
          color: white;
        }

        .delete-button:hover:not(:disabled) {
          background: linear-gradient(135deg, #b91c1c, #991b1b);
          transform: translateY(-1px);
          box-shadow: 0 4px 12px rgba(220, 38, 38, 0.3);
        }

        .delete-button:disabled {
          background: #d1d5db;
          color: #9ca3af;
          cursor: not-allowed;
        }

        .button-icon {
          margin-right: 8px;
          font-size: 14px;
        }

        .spinner {
          width: 16px;
          height: 16px;
          border: 2px solid rgba(255, 255, 255, 0.3);
          border-top: 2px solid white;
          border-radius: 50%;
          animation: spin 1s linear infinite;
          margin-right: 8px;
        }

        @keyframes spin {
          0% {
            transform: rotate(0deg);
          }
          100% {
            transform: rotate(360deg);
          }
        }

        @media (max-width: 640px) {
          .bulk-delete-modal-content {
            margin: 10px;
            max-height: 95vh;
          }

          .modal-header {
            padding: 20px;
          }

          .modal-body {
            padding: 20px;
          }

          .modal-footer {
            padding: 20px;
            flex-direction: column;
          }

          .deletion-stats {
            grid-template-columns: repeat(2, 1fr);
          }

          .exam-details {
            flex-direction: column;
            gap: 8px;
          }
        }
      `}</style>
    </div>
  )
}

export default BulkDeleteModal
