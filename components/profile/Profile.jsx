"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import { useTheme } from "../../contexts/ThemeContext"
import axios from "axios"
import toast from "react-hot-toast"

const Profile = () => {
  const { user, updateProfile } = useAuth()
  const { theme, toggleTheme } = useTheme()
  const [activeTab, setActiveTab] = useState("profile")
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    fullName: user?.fullName || "",
    email: user?.email || "",
    institution: user?.institution || "",
    studentId: user?.studentId || "",
    subjects: user?.subjects || user?.enrolledSubjects || [],
    theme: theme || "light",
    emailNotifications: true,
    pushNotifications: true,
    language: "en",
    timezone: "UTC"
  })
  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: ""
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
    if (user) {
      setFormData(prev => ({
        ...prev,
        fullName: user.fullName || "",
        email: user.email || "",
        institution: user.institution || "",
        studentId: user.studentId || "",
        subjects: user.subjects || user.enrolledSubjects || [],
        theme: theme || "light"
      }))
    }
  }, [user, theme])

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target

    if (name === "subjects") {
      if (checked) {
        setFormData(prev => ({
          ...prev,
          subjects: [...prev.subjects, value],
        }))
      } else {
        setFormData(prev => ({
          ...prev,
          subjects: prev.subjects.filter((subject) => subject !== value),
        }))
      }
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === "checkbox" ? checked : value,
      }))
    }
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData(prev => ({
      ...prev,
      [name]: value
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)

    try {
      const profileData = {
        fullName: formData.fullName,
        institution: formData.institution,
        studentId: formData.studentId,
        subjects: formData.subjects,
      }

      const result = await updateProfile(profileData)
      if (result?.success) {
        toast.success("Profile updated successfully!")
      }
    } catch (error) {
      console.error("Error updating profile:", error)
      toast.error("Failed to update profile")
    } finally {
      setLoading(false)
    }
  }

  const handlePasswordSubmit = async (e) => {
    e.preventDefault()
    
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      toast.error("New passwords do not match")
      return
    }

    if (passwordData.newPassword.length < 6) {
      toast.error("Password must be at least 6 characters long")
      return
    }

    setLoading(true)

    try {
      const response = await axios.put("/api/users/change-password", {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      })

      if (response.data.success) {
        toast.success("Password changed successfully!")
        setPasswordData({
          currentPassword: "",
          newPassword: "",
          confirmPassword: ""
        })
      }
    } catch (error) {
      console.error("Error changing password:", error)
      const message = error.response?.data?.message || "Failed to change password"
      toast.error(message)
    } finally {
      setLoading(false)
    }
  }

  const handleThemeChange = (newTheme) => {
    setFormData(prev => ({ ...prev, theme: newTheme }))
    if (newTheme !== theme) {
      toggleTheme()
      toast.success(`Switched to ${newTheme} theme`)
    }
  }

  const handlePreferencesSubmit = (e) => {
    e.preventDefault()
    // Save preferences to localStorage or API
    localStorage.setItem("userPreferences", JSON.stringify({
      language: formData.language,
      timezone: formData.timezone,
      emailNotifications: formData.emailNotifications,
      pushNotifications: formData.pushNotifications
    }))
    toast.success("Preferences saved successfully!")
  }

  return (
    <div className="container-fluid py-3">
      <div className="row">
        <div className="col-lg-3 mb-4">
          <div className="card shadow-sm">
            <div className="card-body text-center">
              <div
                className="bg-primary rounded-circle d-flex align-items-center justify-content-center mx-auto mb-3"
                style={{ width: "100px", height: "100px" }}
              >
                <span className="text-white fw-bold" style={{ fontSize: "2.5rem" }}>
                  {user?.fullName?.charAt(0).toUpperCase()}
                </span>
              </div>
              <h5 className="mb-1">{user?.fullName}</h5>
              <p className="text-muted mb-3">{user?.role}</p>
              <span className="badge bg-primary">{user?.institution}</span>
            </div>
            <div className="list-group list-group-flush">
              <button
                className={`list-group-item list-group-item-action ${activeTab === "profile" ? "active" : ""}`}
                onClick={() => setActiveTab("profile")}
              >
                <i className="bi bi-person me-2"></i>
                Profile Information
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === "account" ? "active" : ""}`}
                onClick={() => setActiveTab("account")}
              >
                <i className="bi bi-shield-lock me-2"></i>
                Account Security
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === "preferences" ? "active" : ""}`}
                onClick={() => setActiveTab("preferences")}
              >
                <i className="bi bi-gear me-2"></i>
                Preferences
              </button>
              <button
                className={`list-group-item list-group-item-action ${activeTab === "notifications" ? "active" : ""}`}
                onClick={() => setActiveTab("notifications")}
              >
                <i className="bi bi-bell me-2"></i>
                Notifications
              </button>
            </div>
          </div>
        </div>

        <div className="col-lg-9">
          <div className="card shadow-sm">
            <div className="card-body">
              {activeTab === "profile" && (
                <>
                  <h4 className="card-title mb-4">
                    <i className="bi bi-person me-2"></i>
                    Profile Information
                  </h4>
                  <form onSubmit={handleSubmit}>
                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="fullName" className="form-label">
                          Full Name
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="fullName"
                          name="fullName"
                          value={formData.fullName}
                          onChange={handleChange}
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="email" className="form-label">
                          Email Address
                        </label>
                        <input
                          type="email"
                          className="form-control"
                          id="email"
                          name="email"
                          value={formData.email}
                          disabled
                        />
                        <small className="text-muted">Email cannot be changed</small>
                      </div>
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="institution" className="form-label">
                          Institution
                        </label>
                        <input
                          type="text"
                          className="form-control"
                          id="institution"
                          name="institution"
                          value={formData.institution}
                          onChange={handleChange}
                        />
                      </div>
                      {user?.role === "STUDENT" && (
                        <div className="col-md-6">
                          <label htmlFor="studentId" className="form-label">
                            Student ID
                          </label>
                          <input
                            type="text"
                            className="form-control"
                            id="studentId"
                            name="studentId"
                            value={formData.studentId}
                            onChange={handleChange}
                          />
                        </div>
                      )}
                    </div>

                    <div className="mb-4">
                      <label className="form-label">
                        {user?.role === "STUDENT" ? "Enrolled Subjects" : "Teaching Subjects"}
                      </label>
                      <div className="row">
                        {subjectOptions.map((subject) => (
                          <div key={subject} className="col-md-4 mb-2">
                            <div className="form-check">
                              <input
                                className="form-check-input"
                                type="checkbox"
                                id={subject}
                                name="subjects"
                                value={subject}
                                checked={formData.subjects.includes(subject)}
                                onChange={handleChange}
                              />
                              <label className="form-check-label" htmlFor={subject}>
                                {subject}
                              </label>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <button type="submit" className="btn btn-primary" disabled={loading}>
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2\" role="status"></span>
                          Saving...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-check me-2"></i>
                          Save Changes
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {activeTab === "account" && (
                <>
                  <h4 className="card-title mb-4">
                    <i className="bi bi-shield-lock me-2"></i>
                    Account Security
                  </h4>
                  <form onSubmit={handlePasswordSubmit}>
                    <div className="mb-4">
                      <label htmlFor="currentPassword" className="form-label">
                        Current Password
                      </label>
                      <input 
                        type="password" 
                        className="form-control" 
                        id="currentPassword"
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        required
                      />
                    </div>

                    <div className="row mb-3">
                      <div className="col-md-6">
                        <label htmlFor="newPassword" className="form-label">
                          New Password
                        </label>
                        <input 
                          type="password" 
                          className="form-control" 
                          id="newPassword"
                          name="newPassword"
                          value={passwordData.newPassword}
                          onChange={handlePasswordChange}
                          minLength="6"
                          required
                        />
                      </div>
                      <div className="col-md-6">
                        <label htmlFor="confirmPassword" className="form-label">
                          Confirm New Password
                        </label>
                        <input 
                          type="password" 
                          className="form-control" 
                          id="confirmPassword"
                          name="confirmPassword"
                          value={passwordData.confirmPassword}
                          onChange={handlePasswordChange}
                          minLength="6"
                          required
                        />
                      </div>
                    </div>

                    {passwordData.newPassword && passwordData.confirmPassword && 
                     passwordData.newPassword !== passwordData.confirmPassword && (
                      <div className="alert alert-danger">
                        <i className="bi bi-exclamation-triangle me-2"></i>
                        Passwords do not match
                      </div>
                    )}

                    <div className="mb-4">
                      <h5 className="mb-3">Two-Factor Authentication</h5>
                      <div className="form-check form-switch mb-2">
                        <input className="form-check-input" type="checkbox" id="enableTwoFactor" />
                        <label className="form-check-label" htmlFor="enableTwoFactor">
                          Enable Two-Factor Authentication
                        </label>
                      </div>
                      <small className="text-muted">
                        Two-factor authentication adds an extra layer of security to your account by requiring more than
                        just a password to sign in.
                      </small>
                    </div>

                    <button 
                      type="submit" 
                      className="btn btn-primary"
                      disabled={loading || !passwordData.currentPassword || !passwordData.newPassword || 
                               passwordData.newPassword !== passwordData.confirmPassword}
                    >
                      {loading ? (
                        <>
                          <span className="spinner-border spinner-border-sm me-2\" role="status"></span>
                          Updating...
                        </>
                      ) : (
                        <>
                          <i className="bi bi-shield-check me-2"></i>
                          Update Password
                        </>
                      )}
                    </button>
                  </form>
                </>
              )}

              {activeTab === "preferences" && (
                <>
                  <h4 className="card-title mb-4">
                    <i className="bi bi-gear me-2"></i>
                    Preferences
                  </h4>
                  <form onSubmit={handlePreferencesSubmit}>
                    <div className="mb-4">
                      <h5 className="mb-3">
                        <i className="bi bi-palette me-2"></i>
                        Theme
                      </h5>
                      <div className="row">
                        <div className="col-md-4">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="theme"
                              id="lightTheme"
                              value="light"
                              checked={formData.theme === "light"}
                              onChange={(e) => handleThemeChange(e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="lightTheme">
                              <i className="bi bi-sun me-2"></i>
                              Light Theme
                            </label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="theme"
                              id="darkTheme"
                              value="dark"
                              checked={formData.theme === "dark"}
                              onChange={(e) => handleThemeChange(e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="darkTheme">
                              <i className="bi bi-moon me-2"></i>
                              Dark Theme
                            </label>
                          </div>
                        </div>
                        <div className="col-md-4">
                          <div className="form-check">
                            <input
                              className="form-check-input"
                              type="radio"
                              name="theme"
                              id="autoTheme"
                              value="auto"
                              checked={formData.theme === "auto"}
                              onChange={(e) => handleThemeChange(e.target.value)}
                            />
                            <label className="form-check-label" htmlFor="autoTheme">
                              <i className="bi bi-circle-half me-2"></i>
                              Auto
                            </label>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="mb-3">
                        <i className="bi bi-translate me-2"></i>
                        Language
                      </h5>
                      <select 
                        className="form-select"
                        name="language"
                        value={formData.language}
                        onChange={handleChange}
                      >
                        <option value="en">English</option>
                        <option value="es">Spanish</option>
                        <option value="fr">French</option>
                        <option value="de">German</option>
                        <option value="zh">Chinese</option>
                        <option value="ja">Japanese</option>
                      </select>
                    </div>

                    <div className="mb-4">
                      <h5 className="mb-3">
                        <i className="bi bi-clock me-2"></i>
                        Time Zone
                      </h5>
                      <select 
                        className="form-select"
                        name="timezone"
                        value={formData.timezone}
                        onChange={handleChange}
                      >
                        <option value="UTC">UTC (Coordinated Universal Time)</option>
                        <option value="EST">EST (Eastern Standard Time)</option>
                        <option value="CST">CST (Central Standard Time)</option>
                        <option value="MST">MST (Mountain Standard Time)</option>
                        <option value="PST">PST (Pacific Standard Time)</option>
                        <option value="GMT">GMT (Greenwich Mean Time)</option>
                        <option value="CET">CET (Central European Time)</option>
                        <option value="JST">JST (Japan Standard Time)</option>
                      </select>
                    </div>

                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-check me-2"></i>
                      Save Preferences
                    </button>
                  </form>
                </>
              )}

              {activeTab === "notifications" && (
                <>
                  <h4 className="card-title mb-4">
                    <i className="bi bi-bell me-2"></i>
                    Notification Settings
                  </h4>
                  <form onSubmit={handlePreferencesSubmit}>
                    <div className="mb-4">
                      <h5 className="mb-3">
                        <i className="bi bi-envelope me-2"></i>
                        Email Notifications
                      </h5>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="emailNotifications"
                          name="emailNotifications"
                          checked={formData.emailNotifications}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="emailNotifications">
                          Enable Email Notifications
                        </label>
                      </div>
                      <div className="ms-4">
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="emailTasks"
                            checked={formData.emailNotifications}
                            disabled={!formData.emailNotifications}
                          />
                          <label className="form-check-label" htmlFor="emailTasks">
                            Task Updates
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="emailExams"
                            checked={formData.emailNotifications}
                            disabled={!formData.emailNotifications}
                          />
                          <label className="form-check-label" htmlFor="emailExams">
                            Exam Notifications
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="emailMessages"
                            checked={formData.emailNotifications}
                            disabled={!formData.emailNotifications}
                          />
                          <label className="form-check-label" htmlFor="emailMessages">
                            New Messages
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="emailGrades"
                            checked={formData.emailNotifications}
                            disabled={!formData.emailNotifications}
                          />
                          <label className="form-check-label" htmlFor="emailGrades">
                            Grade Updates
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="mb-3">
                        <i className="bi bi-phone me-2"></i>
                        Push Notifications
                      </h5>
                      <div className="form-check form-switch mb-3">
                        <input
                          className="form-check-input"
                          type="checkbox"
                          id="pushNotifications"
                          name="pushNotifications"
                          checked={formData.pushNotifications}
                          onChange={handleChange}
                        />
                        <label className="form-check-label" htmlFor="pushNotifications">
                          Enable Push Notifications
                        </label>
                      </div>
                      <div className="ms-4">
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="pushTasks"
                            checked={formData.pushNotifications}
                            disabled={!formData.pushNotifications}
                          />
                          <label className="form-check-label" htmlFor="pushTasks">
                            Task Updates
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="pushExams"
                            checked={formData.pushNotifications}
                            disabled={!formData.pushNotifications}
                          />
                          <label className="form-check-label" htmlFor="pushExams">
                            Exam Notifications
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="pushMessages"
                            checked={formData.pushNotifications}
                            disabled={!formData.pushNotifications}
                          />
                          <label className="form-check-label" htmlFor="pushMessages">
                            New Messages
                          </label>
                        </div>
                        <div className="form-check mb-2">
                          <input
                            className="form-check-input"
                            type="checkbox"
                            id="pushDeadlines"
                            checked={formData.pushNotifications}
                            disabled={!formData.pushNotifications}
                          />
                          <label className="form-check-label" htmlFor="pushDeadlines">
                            Deadline Reminders
                          </label>
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h5 className="mb-3">
                        <i className="bi bi-clock-history me-2"></i>
                        Notification Timing
                      </h5>
                      <div className="row">
                        <div className="col-md-6">
                          <label className="form-label">Quiet Hours Start</label>
                          <input type="time" className="form-control" defaultValue="22:00" />
                        </div>
                        <div className="col-md-6">
                          <label className="form-label">Quiet Hours End</label>
                          <input type="time" className="form-control" defaultValue="08:00" />
                        </div>
                      </div>
                      <small className="text-muted">
                        No notifications will be sent during quiet hours
                      </small>
                    </div>

                    <button type="submit" className="btn btn-primary">
                      <i className="bi bi-check me-2"></i>
                      Save Notification Settings
                    </button>
                  </form>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Profile