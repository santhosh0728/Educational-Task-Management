"use client"

import { useState } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const DeleteExamModal = ({ exam, isOpen, onClose, onDelete }) => {
  const [isDeleting, setIsDeleting] = useState(false)
  const [confirmText, setConfirmText] = useState("")

  const handleDelete = async () => {
    if (confirmText !== exam.title) {
      toast.error("Please type the exam title exactly to confirm deletion")
      return
    }

    try {
      setIsDeleting(true)
      console.log("Deleting exam:", exam._id)
      console.log("Exam details:", exam)

      const token = localStorage.getItem("token")
      console.log("Token exists:", !!token)

      if (!token) {
        toast.error("Authentication token not found. Please log in again.")
        return
      }

      const response = await axios.delete(`/api/exams/${exam._id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      })

      console.log("Delete response:", response.data)

      toast.success(
        `Exam "${exam.title}" deleted successfully! ${
          response.data.deletedResults > 0 ? `Also deleted ${response.data.deletedResults} student results.` : ""
        }`,
      )

      onDelete(exam._id)
      onClose()
      setConfirmText("")
    } catch (error) {
      console.error("Error deleting exam:", error)
      console.error("Error response:", error.response?.data)
      console.error("Error status:", error.response?.status)

      let errorMessage = "Failed to delete exam. Please try again."

      if (error.response?.status === 403) {
        errorMessage = "You don't have permission to delete this exam"
      } else if (error.response?.status === 404) {
        errorMessage = "Exam not found"
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

  if (!isOpen) return null

  return (
    <div className="delete-modal-overlay">
      <div className="delete-modal-content">
        {/* Header */}
        <div className="modal-header">
          <div className="header-icon">
            <span className="warning-icon">⚠️</span>
          </div>
          <div className="header-text">
            <h2 className="modal-title">Delete Exam</h2>
            <p className="modal-subtitle">This action cannot be undone!</p>
          </div>
          <button className="close-button" onClick={onClose} disabled={isDeleting}>
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
              <p>This will permanently delete the exam and all associated student results.</p>
            </div>
          </div>

          {/* Exam Details */}
          <div className="exam-details-section">
            <h4 className="section-title">
              <span className="title-icon">📋</span>
              Exam Details:
            </h4>
            <div className="details-grid">
              <div className="detail-row">
                <span className="detail-label">
                  <span className="label-icon">📚</span>
                  Title:
                </span>
                <span className="detail-value">{exam.title}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">
                  <span className="label-icon">📖</span>
                  Subject:
                </span>
                <span className="detail-value">{exam.subject}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">
                  <span className="label-icon">❓</span>
                  Questions:
                </span>
                <span className="detail-value">{exam.questions?.length || 0}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">
                  <span className="label-icon">👥</span>
                  Students:
                </span>
                <span className="detail-value">{exam.assignedTo?.length || 0}</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">
                  <span className="label-icon">📅</span>
                  Created:
                </span>
                <span className="detail-value">{new Date(exam.createdAt).toLocaleDateString()}</span>
              </div>
            </div>
          </div>

          {/* Confirmation Input */}
          <div className="confirmation-section">
            <div className="confirmation-header">
              <span className="lock-icon">🔒</span>
              <h4>Confirmation Required</h4>
            </div>
            <p className="confirmation-text">
              Type <strong>"{exam.title}"</strong> to confirm deletion:
            </p>
            <input
              type="text"
              className="confirmation-input"
              placeholder={`Type "${exam.title}" here`}
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              disabled={isDeleting}
            />
            <small className="help-text">This helps prevent accidental deletions</small>
          </div>
        </div>

        {/* Footer */}
        <div className="modal-footer">
          <button className="cancel-button" onClick={onClose} disabled={isDeleting}>
            <span className="button-icon">❌</span>
            Cancel
          </button>
          <button className="delete-button" onClick={handleDelete} disabled={isDeleting || confirmText !== exam.title}>
            {isDeleting ? (
              <>
                <span className="spinner"></span>
                Deleting...
              </>
            ) : (
              <>
                <span className="button-icon">🗑️</span>
                Delete Exam
              </>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        .delete-modal-overlay {
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

        .delete-modal-content {
          background: white;
          border-radius: 20px;
          max-width: 500px;
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

        .exam-details-section {
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

        .details-grid {
          background: linear-gradient(135deg, #f8fafc, #f1f5f9);
          border: 1px solid #e2e8f0;
          border-radius: 12px;
          padding: 20px;
        }

        .detail-row {
          display: flex;
          justify-content: space-between;
          align-items: center;
          padding: 8px 0;
          border-bottom: 1px solid #e2e8f0;
        }

        .detail-row:last-child {
          border-bottom: none;
        }

        .detail-label {
          display: flex;
          align-items: center;
          font-weight: 600;
          color: #475569;
        }

        .label-icon {
          margin-right: 6px;
          font-size: 14px;
        }

        .detail-value {
          font-weight: 700;
          color: #1e293b;
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
          min-width: 120px;
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
          .delete-modal-content {
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

          .detail-row {
            flex-direction: column;
            align-items: flex-start;
            gap: 4px;
          }
        }
      `}</style>
    </div>
  )
}

export default DeleteExamModal
