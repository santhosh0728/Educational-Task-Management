"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { useAuth } from "../../contexts/AuthContext"

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    role: "",
    institution: "",
    studentId: "",
    subjects: [],
  })
  const [animate, setAnimate] = useState(false)
  const [focusInput, setFocusInput] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })
  const [passwordMatch, setPasswordMatch] = useState(true)
  const [error, setError] = useState("")
  const { register } = useAuth()
  const navigate = useNavigate()

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
    // Trigger animations after component mounts
    const timer = setTimeout(() => setAnimate(true), 100)

    // Mouse tracking for interactive effects
    const handleMouseMove = (e) => {
      setMousePosition({ x: e.clientX, y: e.clientY })
    }

    window.addEventListener("mousemove", handleMouseMove)

    return () => {
      clearTimeout(timer)
      window.removeEventListener("mousemove", handleMouseMove)
    }
  }, [])

  useEffect(() => {
    // Check password match
    if (formData.password && formData.confirmPassword) {
      setPasswordMatch(formData.password === formData.confirmPassword)
    }
  }, [formData.password, formData.confirmPassword])

  const handleFocus = (field) => setFocusInput(field)
  const handleBlur = () => setFocusInput(null)

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
    setError("")
  }

  const handleSubjectChange = (subject, checked) => {
    setFormData((prev) => ({
      ...prev,
      subjects: checked ? [...prev.subjects, subject] : prev.subjects.filter((s) => s !== subject),
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!passwordMatch) {
      setError("Passwords do not match")
      return
    }

    if (formData.subjects.length === 0) {
      setError("Please select at least one subject")
      return
    }

    setIsSubmitting(true)
    setError("")

    try {
      const { confirmPassword, ...submitData } = formData
      const result = await register(submitData)

      if (result.success) {
        navigate("/dashboard")
      } else {
        setError(result.message || "Registration failed. Please try again.")
      }
    } catch (err) {
      console.error("Registration error:", err)
      setError("Cannot connect to server. Please check your internet connection or try again later.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getInputStyle = (field) => ({
    ...styles.input,
    boxShadow:
      focusInput === field
        ? "0 0 20px 3px rgba(99, 102, 241, 0.15), inset 0 0 8px rgba(99, 102, 241, 0.05)"
        : "inset 0 0 8px rgba(0, 0, 0, 0.03)",
    background: focusInput === field ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.9)",
    transform: focusInput === field ? "scale(1.02)" : "scale(1)",
    borderColor:
      field === "confirmPassword" && !passwordMatch && formData.confirmPassword
        ? "#ef4444"
        : focusInput === field
          ? "#6366f1"
          : "rgba(229, 231, 235, 0.8)",
  })

  const getSelectStyle = () => ({
    ...styles.select,
    boxShadow:
      focusInput === "role"
        ? "0 0 20px 3px rgba(99, 102, 241, 0.15), inset 0 0 8px rgba(99, 102, 241, 0.05)"
        : "inset 0 0 8px rgba(0, 0, 0, 0.03)",
    background: focusInput === "role" ? "rgba(255, 255, 255, 1)" : "rgba(255, 255, 255, 0.9)",
    transform: focusInput === "role" ? "scale(1.02)" : "scale(1)",
    borderColor: focusInput === "role" ? "#6366f1" : "rgba(229, 231, 235, 0.8)",
  })

  return (
    <div style={styles.page}>
      {/* Animated background gradient */}
      <div style={styles.animatedBackground} />

      {/* Interactive cursor follower */}
      <div
        style={{
          ...styles.cursorFollower,
          left: mousePosition.x - 100,
          top: mousePosition.y - 100,
        }}
      />

      {/* Floating geometric shapes */}
      <div style={styles.shapesContainer}>
        {[...Array(10)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.floatingShape,
              left: `${5 + i * 10}%`,
              top: `${15 + (i % 4) * 20}%`,
              animationDelay: `${i * 0.6}s`,
              animationDuration: `${4 + (i % 3)}s`,
              borderRadius: i % 2 === 0 ? "50%" : "12px",
            }}
          />
        ))}
      </div>

      {/* Educational icons floating */}
      <div style={styles.iconsContainer}>
        {["📚", "🎓", "📝", "💡", "🏆", "📊"].map((icon, i) => (
          <div
            key={i}
            style={{
              ...styles.floatingIcon,
              left: `${15 + i * 15}%`,
              top: `${10 + (i % 2) * 70}%`,
              animationDelay: `${i * 1.2}s`,
            }}
          >
            {icon}
          </div>
        ))}
      </div>

      {/* Floating particles */}
      <div style={styles.particlesContainer}>
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
              animationDuration: `${3 + Math.random() * 4}s`,
            }}
          />
        ))}
      </div>

      {/* Animated grid overlay */}
      <div style={styles.gridOverlay} />

      {/* Main form container - CENTERED */}
      <div style={styles.centerContainer}>
        <form
          onSubmit={handleSubmit}
          style={{
            ...styles.form,
            ...(animate ? styles.formAnimate : {}),
          }}
        >
          {/* Title */}
          <h1
            style={{
              ...styles.title,
              ...(animate ? styles.titleAnimate : {}),
            }}
          >
            Join EduTask
          </h1>

          <p
            style={{
              ...styles.subtitle,
              ...(animate ? styles.subtitleAnimate : {}),
            }}
          >
            Create your educational task management account
          </p>

          {/* Error message */}
          {error && (
            <div style={styles.errorContainer}>
              <p style={styles.errorMessage}>{error}</p>
            </div>
          )}

          {/* Full Name field */}
          <div style={{ ...styles.inputGroup, display: "block" }}>
            <label
              htmlFor="fullName"
              style={{
                ...styles.label,
                ...(animate ? styles.labelAnimate : {}),
                display: "block",
              }}
            >
              Full Name
            </label>
            <input
              type="text"
              id="fullName"
              name="fullName"
              placeholder="John Doe"
              value={formData.fullName}
              onChange={(e) => handleInputChange("fullName", e.target.value)}
              style={{ ...getInputStyle("fullName"), display: "block", width: "100%" }}
              onFocus={() => handleFocus("fullName")}
              onBlur={handleBlur}
              required
            />
          </div>

          {/* Email field */}
          <div style={styles.inputGroup}>
            <label
              htmlFor="email"
              style={{
                ...styles.label,
                ...(animate ? styles.labelAnimateDelayed : {}),
              }}
            >
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              placeholder="student@university.edu"
              value={formData.email}
              onChange={(e) => handleInputChange("email", e.target.value)}
              style={getInputStyle("email")}
              onFocus={() => handleFocus("email")}
              onBlur={handleBlur}
              required
            />
          </div>

          {/* Role Selection */}
          <div style={styles.inputGroup}>
            <label
              htmlFor="role"
              style={{
                ...styles.label,
                ...(animate ? styles.labelAnimateDelayed2 : {}),
              }}
            >
              I am a...
            </label>
            <select
              id="role"
              name="role"
              value={formData.role}
              onChange={(e) => handleInputChange("role", e.target.value)}
              style={getSelectStyle()}
              onFocus={() => handleFocus("role")}
              onBlur={handleBlur}
              required
            >
              <option value="">Select your role</option>
              <option value="STUDENT">Student</option>
              <option value="TUTOR">Tutor/Teacher</option>
            </select>
          </div>

          {/* Institution field */}
          <div style={styles.inputGroup}>
            <label
              htmlFor="institution"
              style={{
                ...styles.label,
                ...(animate ? styles.labelAnimateDelayed3 : {}),
              }}
            >
              Institution
            </label>
            <input
              type="text"
              id="institution"
              name="institution"
              placeholder="University of Education"
              value={formData.institution}
              onChange={(e) => handleInputChange("institution", e.target.value)}
              style={getInputStyle("institution")}
              onFocus={() => handleFocus("institution")}
              onBlur={handleBlur}
              required
            />
          </div>

          {/* Student ID (conditional) */}
          {formData.role === "STUDENT" && (
            <div style={styles.inputGroup}>
              <label
                htmlFor="studentId"
                style={{
                  ...styles.label,
                  ...(animate ? styles.labelAnimateDelayed4 : {}),
                }}
              >
                Student ID
              </label>
              <input
                type="text"
                id="studentId"
                name="studentId"
                placeholder="STU123456"
                value={formData.studentId}
                onChange={(e) => handleInputChange("studentId", e.target.value)}
                style={getInputStyle("studentId")}
                onFocus={() => handleFocus("studentId")}
                onBlur={handleBlur}
              />
            </div>
          )}

          {/* Subjects */}
          <div style={styles.inputGroup}>
            <label
              style={{
                ...styles.label,
                ...(animate ? styles.labelAnimateDelayed4 : {}),
              }}
            >
              {formData.role === "STUDENT" ? "Enrolled Subjects" : "Teaching Subjects"}
            </label>
            <div style={styles.subjectsGrid}>
              {subjectOptions.map((subject) => (
                <div key={subject} style={styles.checkboxContainer}>
                  <input
                    type="checkbox"
                    id={subject}
                    name={subject}
                    checked={formData.subjects.includes(subject)}
                    onChange={(e) => handleSubjectChange(subject, e.target.checked)}
                    style={styles.checkbox}
                  />
                  <label htmlFor={subject} style={styles.checkboxLabel}>
                    {subject}
                  </label>
                </div>
              ))}
            </div>
          </div>

          {/* Password field */}
          <div style={styles.inputGroup}>
            <label
              htmlFor="password"
              style={{
                ...styles.label,
                ...(animate ? styles.labelAnimateDelayed4 : {}),
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={formData.password}
              onChange={(e) => handleInputChange("password", e.target.value)}
              style={getInputStyle("password")}
              onFocus={() => handleFocus("password")}
              onBlur={handleBlur}
              required
            />
          </div>

          {/* Confirm Password field */}
          <div style={styles.inputGroup}>
            <label
              htmlFor="confirmPassword"
              style={{
                ...styles.label,
                ...(animate ? styles.labelAnimateDelayed5 : {}),
              }}
            >
              Confirm Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              placeholder="••••••••"
              value={formData.confirmPassword}
              onChange={(e) => handleInputChange("confirmPassword", e.target.value)}
              style={getInputStyle("confirmPassword")}
              onFocus={() => handleFocus("confirmPassword")}
              onBlur={handleBlur}
              required
            />
            {!passwordMatch && formData.confirmPassword && <div style={styles.fieldError}>Passwords do not match</div>}
          </div>

          {/* Terms checkbox */}
          <div style={styles.checkboxContainer}>
            <input type="checkbox" id="terms" name="terms" required style={styles.checkbox} />
            <label htmlFor="terms" style={styles.termsLabel}>
              I agree to the{" "}
              <a href="/terms" style={styles.termsLink}>
                Terms of Service
              </a>{" "}
              and{" "}
              <a href="/privacy" style={styles.termsLink}>
                Privacy Policy
              </a>
            </label>
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting || !passwordMatch}
            style={{
              ...styles.button,
              ...(animate ? styles.buttonAnimate : {}),
              ...(isSubmitting ? styles.buttonSubmitting : {}),
              ...(!passwordMatch ? styles.buttonDisabled : {}),
            }}
          >
            {isSubmitting ? <div style={styles.spinner} /> : "Create Account"}
          </button>

          {/* Sign in link */}
          <div
            style={{
              ...styles.signInContainer,
              ...(animate ? styles.signInAnimate : {}),
            }}
          >
            Already have an account?{" "}
            <a href="/signin" style={styles.signInLink}>
              Sign In
            </a>
          </div>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    minHeight: "100vh",
    width: "100vw",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    paddingTop: "20px",
    paddingBottom: "20px",
  },
  animatedBackground: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(45deg, #f8f9ff, #e8f4fd, #f0f8ff, #faf9ff, #f5f7ff, #fff8f0)",
    backgroundSize: "400% 400%",
    animation: "gradientShift 10s ease infinite",
    zIndex: 1,
  },
  cursorFollower: {
    position: "fixed",
    width: "200px",
    height: "200px",
    background: "radial-gradient(circle, rgba(99, 102, 241, 0.08) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 2,
    transition: "all 0.1s ease",
  },
  gridOverlay: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `
      linear-gradient(rgba(99, 102, 241, 0.05) 1px, transparent 1px),
      linear-gradient(90deg, rgba(99, 102, 241, 0.05) 1px, transparent 1px)
    `,
    backgroundSize: "60px 60px",
    animation: "gridMove 25s linear infinite",
    zIndex: 2,
  },
  shapesContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 3,
  },
  floatingShape: {
    position: "absolute",
    width: "50px",
    height: "50px",
    background: "rgba(99, 102, 241, 0.08)",
    animation: "floatRotate 6s ease-in-out infinite",
    border: "1px solid rgba(99, 102, 241, 0.15)",
  },
  iconsContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 3,
  },
  floatingIcon: {
    position: "absolute",
    fontSize: "2rem",
    animation: "iconFloat 8s ease-in-out infinite",
    opacity: 0.6,
    filter: "grayscale(20%)",
  },
  particlesContainer: {
    position: "fixed",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 3,
  },
  particle: {
    position: "absolute",
    width: "4px",
    height: "4px",
    background: "rgba(99, 102, 241, 0.4)",
    borderRadius: "50%",
    animation: "particleFloat 6s ease-in-out infinite",
  },
  centerContainer: {
    position: "relative",
    zIndex: 10,
    width: "100%",
    maxWidth: "480px",
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    maxHeight: "90vh",
    overflowY: "auto",
  },
  form: {
    width: "100%",
    background: "rgba(255, 255, 255, 0.85)",
    boxShadow: "0 25px 45px rgba(0, 0, 0, 0.08), 0 10px 20px rgba(0, 0, 0, 0.04)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.9)",
    padding: "40px 35px",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    opacity: 0,
    transform: "translateY(50px) scale(0.9)",
    transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1)",
  },
  formAnimate: {
    opacity: 1,
    transform: "translateY(0) scale(1)",
  },
  title: {
    color: "#1f2937",
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "8px",
    textAlign: "center",
    opacity: 0,
    transform: "translateY(30px)",
    transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
    textShadow: "0 2px 10px rgba(0, 0, 0, 0.05)",
  },
  titleAnimate: {
    opacity: 1,
    transform: "translateY(0)",
  },
  subtitle: {
    color: "#6b7280",
    fontSize: "1rem",
    marginBottom: "30px",
    textAlign: "center",
    opacity: 0,
    transform: "translateY(30px)",
    transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.4s",
  },
  subtitleAnimate: {
    opacity: 1,
    transform: "translateY(0)",
  },
  errorContainer: {
    width: "100%",
    padding: "12px",
    marginBottom: "20px",
    borderRadius: "12px",
    backgroundColor: "rgba(239, 68, 68, 0.1)",
    borderLeft: "4px solid rgba(239, 68, 68, 0.8)",
    animation: "fadeIn 0.5s ease-in-out",
  },
  errorMessage: {
    color: "#ef4444",
    fontSize: "0.9rem",
    margin: 0,
    textAlign: "left",
  },
  inputGroup: {
    width: "100%",
    marginBottom: "20px",
  },
  label: {
    color: "#374151",
    fontWeight: "600",
    fontSize: "0.95rem",
    letterSpacing: "0.05em",
    marginBottom: "8px",
    display: "block",
    opacity: 0,
    transform: "translateX(-30px)",
    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.5s",
  },
  labelAnimate: {
    opacity: 1,
    transform: "translateX(0)",
  },
  labelAnimateDelayed: {
    opacity: 1,
    transform: "translateX(0)",
    transitionDelay: "0.6s",
  },
  labelAnimateDelayed2: {
    opacity: 1,
    transform: "translateX(0)",
    transitionDelay: "0.7s",
  },
  labelAnimateDelayed3: {
    opacity: 1,
    transform: "translateX(0)",
    transitionDelay: "0.8s",
  },
  labelAnimateDelayed4: {
    opacity: 1,
    transform: "translateX(0)",
    transitionDelay: "0.9s",
  },
  labelAnimateDelayed5: {
    opacity: 1,
    transform: "translateX(0)",
    transitionDelay: "1.0s",
  },
  input: {
    width: "100%",
    padding: "15px 20px",
    borderRadius: "12px",
    border: "2px solid rgba(229, 231, 235, 0.8)",
    outline: "none",
    fontSize: "1rem",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#1f2937",
    boxShadow: "inset 0 0 8px rgba(0, 0, 0, 0.03)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    boxSizing: "border-box",
  },
  select: {
    width: "100%",
    padding: "15px 20px",
    borderRadius: "12px",
    border: "2px solid rgba(229, 231, 235, 0.8)",
    outline: "none",
    fontSize: "1rem",
    background: "rgba(255, 255, 255, 0.9)",
    color: "#1f2937",
    boxShadow: "inset 0 0 8px rgba(0, 0, 0, 0.03)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    boxSizing: "border-box",
    cursor: "pointer",
  },
  fieldError: {
    color: "#ef4444",
    fontSize: "0.85rem",
    marginTop: "5px",
    textShadow: "0 1px 2px rgba(0, 0, 0, 0.1)",
  },
  subjectsGrid: {
    display: "grid",
    gridTemplateColumns: "1fr 1fr",
    gap: "10px",
    width: "100%",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    marginBottom: "10px",
  },
  checkbox: {
    marginRight: "8px",
    width: "16px",
    height: "16px",
    accentColor: "#6366f1",
  },
  checkboxLabel: {
    color: "#4b5563",
    fontSize: "0.9rem",
  },
  termsLabel: {
    color: "#4b5563",
    fontSize: "0.9rem",
  },
  termsLink: {
    color: "#6366f1",
    textDecoration: "none",
    fontWeight: "600",
  },
  button: {
    width: "100%",
    padding: "16px",
    borderRadius: "12px",
    border: "none",
    outline: "none",
    fontSize: "1.1rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
    color: "white",
    cursor: "pointer",
    marginTop: "20px",
    marginBottom: "20px",
    opacity: 0,
    transform: "translateY(30px)",
    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1.1s",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(99, 102, 241, 0.25)",
  },
  buttonAnimate: {
    opacity: 1,
    transform: "translateY(0)",
  },
  buttonSubmitting: {
    background: "linear-gradient(135deg, #9ca3af, #6b7280)",
    cursor: "not-allowed",
  },
  buttonDisabled: {
    background: "linear-gradient(135deg, #ef4444, #dc2626)",
    opacity: 0.6,
    cursor: "not-allowed",
  },
  spinner: {
    width: "22px",
    height: "22px",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    borderTop: "3px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  signInContainer: {
    color: "#6b7280",
    fontSize: "0.95rem",
    textAlign: "center",
    opacity: 0,
    transform: "translateY(30px)",
    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 1.2s",
  },
  signInAnimate: {
    opacity: 1,
    transform: "translateY(0)",
  },
  signInLink: {
    color: "#6366f1",
    textDecoration: "none",
    fontWeight: "600",
  },
}

// Add CSS animations
if (typeof document !== "undefined") {
  const styleSheet = document.createElement("style")
  styleSheet.textContent = `
    @keyframes gradientShift {
      0% { background-position: 0% 50%; }
      50% { background-position: 100% 50%; }
      100% { background-position: 0% 50%; }
    }
    
    @keyframes gridMove {
      0% { transform: translate(0, 0); }
      100% { transform: translate(60px, 60px); }
    }
    
    @keyframes floatRotate {
      0%, 100% { 
        transform: translateY(0px) rotate(0deg); 
        opacity: 0.6; 
      }
      50% { 
        transform: translateY(-25px) rotate(180deg); 
        opacity: 1; 
      }
    }
    
    @keyframes iconFloat {
      0%, 100% { 
        transform: translateY(0px) scale(1); 
        opacity: 0.6; 
      }
      50% { 
        transform: translateY(-15px) scale(1.1); 
        opacity: 0.8; 
      }
    }
    
    @keyframes particleFloat {
      0%, 100% { 
        transform: translateY(0px) translateX(0px); 
        opacity: 0.4; 
      }
      25% { 
        transform: translateY(-15px) translateX(8px); 
        opacity: 0.8; 
      }
      75% { 
        transform: translateY(-8px) translateX(-8px); 
        opacity: 0.6; 
      }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    @keyframes fadeIn {
      0% { opacity: 0; transform: translateY(-10px); }
      100% { opacity: 1; transform: translateY(0); }
    }
    
    input::placeholder {
      color: rgba(107, 114, 128, 0.7);
    }
    
    select option {
      background: white;
      color: #1f2937;
    }
    
    button:hover:not(:disabled) {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 15px 35px rgba(99, 102, 241, 0.35);
    }
    
    a:hover {
      text-decoration: underline !important;
      transform: translateY(-1px) !important;
      color: #4f46e5 !important;
    }
    
    input:focus, select:focus {
      transform: scale(1.02) !important;
    }
    
    /* Scrollbar styling for light theme */
    ::-webkit-scrollbar {
      width: 6px;
    }
    
    ::-webkit-scrollbar-track {
      background: rgba(229, 231, 235, 0.3);
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb {
      background: rgba(99, 102, 241, 0.3);
      border-radius: 3px;
    }
    
    ::-webkit-scrollbar-thumb:hover {
      background: rgba(99, 102, 241, 0.5);
    }
  `
  document.head.appendChild(styleSheet)
}

export default Signup
