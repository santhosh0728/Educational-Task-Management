"use client"

import { useState, useEffect } from "react"

export default function Signin() {
  const [username, setUsername] = useState("")
  const [password, setPassword] = useState("")
  const [animate, setAnimate] = useState(false)
  const [focusInput, setFocusInput] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 })

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

  const handleFocus = (field) => setFocusInput(field)
  const handleBlur = () => setFocusInput(null)

  const handleSubmit = (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    // Simulate API call
    setTimeout(() => setIsSubmitting(false), 2000)
  }

  const getInputStyle = (field) => ({
    ...styles.input,
    boxShadow:
      focusInput === field
        ? "0 0 20px 3px rgba(255, 255, 255, 0.6), inset 0 0 8px rgba(255, 255, 255, 0.3)"
        : "inset 0 0 8px rgba(255, 255, 255, 0.25)",
    background: focusInput === field ? "rgba(255, 255, 255, 0.4)" : "rgba(255, 255, 255, 0.25)",
    transform: focusInput === field ? "scale(1.02)" : "scale(1)",
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
        {[...Array(8)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.floatingShape,
              left: `${10 + i * 12}%`,
              top: `${20 + (i % 3) * 25}%`,
              animationDelay: `${i * 0.7}s`,
              animationDuration: `${4 + (i % 3)}s`,
            }}
          />
        ))}
      </div>

      {/* Floating particles */}
      <div style={styles.particlesContainer}>
        {[...Array(15)].map((_, i) => (
          <div
            key={i}
            style={{
              ...styles.particle,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.3}s`,
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
            Welcome Back
          </h1>

          <p
            style={{
              ...styles.subtitle,
              ...(animate ? styles.subtitleAnimate : {}),
            }}
          >
            Sign in to your account
          </p>

          {/* Username field */}
          <div style={styles.inputGroup}>
            <label
              htmlFor="username"
              style={{
                ...styles.label,
                ...(animate ? styles.labelAnimate : {}),
              }}
            >
              Username
            </label>
            <input
              type="text"
              id="username"
              name="username"
              placeholder="abc@example.com"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={getInputStyle("username")}
              onFocus={() => handleFocus("username")}
              onBlur={handleBlur}
            />
          </div>

          {/* Password field */}
          <div style={styles.inputGroup}>
            <label
              htmlFor="password"
              style={{
                ...styles.label,
                ...(animate ? styles.labelAnimateDelayed : {}),
              }}
            >
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={getInputStyle("password")}
              onFocus={() => handleFocus("password")}
              onBlur={handleBlur}
            />
          </div>

          {/* Submit button */}
          <button
            type="submit"
            disabled={isSubmitting}
            style={{
              ...styles.button,
              ...(animate ? styles.buttonAnimate : {}),
              ...(isSubmitting ? styles.buttonSubmitting : {}),
            }}
          >
            {isSubmitting ? <div style={styles.spinner} /> : "Sign In"}
          </button>

          {/* Forgot password link */}
          <a
            href="#"
            style={{
              ...styles.forgotLink,
              ...(animate ? styles.forgotLinkAnimate : {}),
            }}
          >
            Forgot your password?
          </a>
        </form>
      </div>
    </div>
  )
}

const styles = {
  page: {
    height: "100vh",
    width: "100vw",
    position: "relative",
    overflow: "hidden",
    fontFamily: "'Inter', 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  animatedBackground: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    background: "linear-gradient(45deg, #667eea, #764ba2, #f093fb, #f5576c, #4facfe, #00f2fe)",
    backgroundSize: "400% 400%",
    animation: "gradientShift 8s ease infinite",
    zIndex: 1,
  },
  cursorFollower: {
    position: "absolute",
    width: "200px",
    height: "200px",
    background: "radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%)",
    borderRadius: "50%",
    pointerEvents: "none",
    zIndex: 2,
    transition: "all 0.1s ease",
  },
  gridOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    backgroundImage: `
      linear-gradient(rgba(255,255,255,0.1) 1px, transparent 1px),
      linear-gradient(90deg, rgba(255,255,255,0.1) 1px, transparent 1px)
    `,
    backgroundSize: "50px 50px",
    animation: "gridMove 20s linear infinite",
    zIndex: 2,
  },
  shapesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 3,
  },
  floatingShape: {
    position: "absolute",
    width: "60px",
    height: "60px",
    background: "rgba(255, 255, 255, 0.1)",
    borderRadius: "12px",
    animation: "floatRotate 6s ease-in-out infinite",
    border: "1px solid rgba(255, 255, 255, 0.2)",
  },
  particlesContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
    pointerEvents: "none",
    zIndex: 3,
  },
  particle: {
    position: "absolute",
    width: "6px",
    height: "6px",
    background: "rgba(255, 255, 255, 0.8)",
    borderRadius: "50%",
    animation: "particleFloat 5s ease-in-out infinite",
  },
  centerContainer: {
    position: "relative",
    zIndex: 10,
    width: "100%",
    maxWidth: "420px",
    padding: "20px",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
  },
  form: {
    width: "100%",
    background: "rgba(255, 255, 255, 0.15)",
    boxShadow: "0 25px 45px rgba(0, 0, 0, 0.1), 0 10px 20px rgba(0, 0, 0, 0.05)",
    backdropFilter: "blur(20px)",
    borderRadius: "24px",
    border: "1px solid rgba(255, 255, 255, 0.2)",
    padding: "50px 40px",
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
    color: "white",
    fontSize: "2.5rem",
    fontWeight: "700",
    marginBottom: "8px",
    textAlign: "center",
    opacity: 0,
    transform: "translateY(30px)",
    transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.3s",
    textShadow: "0 2px 10px rgba(0, 0, 0, 0.3)",
  },
  titleAnimate: {
    opacity: 1,
    transform: "translateY(0)",
  },
  subtitle: {
    color: "rgba(255, 255, 255, 0.9)",
    fontSize: "1.1rem",
    marginBottom: "40px",
    textAlign: "center",
    opacity: 0,
    transform: "translateY(30px)",
    transition: "all 1s cubic-bezier(0.4, 0, 0.2, 1) 0.4s",
  },
  subtitleAnimate: {
    opacity: 1,
    transform: "translateY(0)",
  },
  inputGroup: {
    width: "100%",
    marginBottom: "25px",
  },
  label: {
    color: "white",
    fontWeight: "600",
    fontSize: "1rem",
    letterSpacing: "0.05em",
    marginBottom: "10px",
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
  input: {
    width: "100%",
    padding: "18px 24px",
    borderRadius: "16px",
    border: "none",
    outline: "none",
    fontSize: "1.1rem",
    background: "rgba(255, 255, 255, 0.25)",
    color: "#fff",
    boxShadow: "inset 0 0 10px rgba(255, 255, 255, 0.25)",
    transition: "all 0.4s cubic-bezier(0.4, 0, 0.2, 1)",
    boxSizing: "border-box",
  },
  button: {
    width: "100%",
    padding: "18px",
    borderRadius: "16px",
    border: "none",
    outline: "none",
    fontSize: "1.2rem",
    fontWeight: "700",
    background: "linear-gradient(135deg, #ff6b6b, #ee5a24)",
    color: "white",
    cursor: "pointer",
    marginTop: "15px",
    marginBottom: "25px",
    opacity: 0,
    transform: "translateY(30px)",
    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.7s",
    position: "relative",
    overflow: "hidden",
    boxShadow: "0 10px 30px rgba(255, 107, 107, 0.3)",
  },
  buttonAnimate: {
    opacity: 1,
    transform: "translateY(0)",
  },
  buttonSubmitting: {
    background: "linear-gradient(135deg, #a8a8a8, #888888)",
    cursor: "not-allowed",
  },
  spinner: {
    width: "24px",
    height: "24px",
    border: "3px solid rgba(255, 255, 255, 0.3)",
    borderTop: "3px solid white",
    borderRadius: "50%",
    animation: "spin 1s linear infinite",
    margin: "0 auto",
  },
  forgotLink: {
    color: "rgba(255, 255, 255, 0.9)",
    textDecoration: "none",
    fontSize: "1rem",
    opacity: 0,
    transform: "translateY(30px)",
    transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1) 0.8s",
  },
  forgotLinkAnimate: {
    opacity: 1,
    transform: "translateY(0)",
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
      100% { transform: translate(50px, 50px); }
    }
    
    @keyframes floatRotate {
      0%, 100% { 
        transform: translateY(0px) rotate(0deg); 
        opacity: 0.7; 
      }
      50% { 
        transform: translateY(-30px) rotate(180deg); 
        opacity: 1; 
      }
    }
    
    @keyframes particleFloat {
      0%, 100% { 
        transform: translateY(0px) translateX(0px); 
        opacity: 0.4; 
      }
      25% { 
        transform: translateY(-20px) translateX(10px); 
        opacity: 1; 
      }
      75% { 
        transform: translateY(-10px) translateX(-10px); 
        opacity: 0.8; 
      }
    }
    
    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }
    
    input::placeholder {
      color: rgba(255, 255, 255, 0.7);
    }
    
    button:hover:not(:disabled) {
      transform: translateY(-3px) scale(1.02);
      box-shadow: 0 15px 35px rgba(255, 107, 107, 0.4);
    }
    
    a:hover {
      color: white !important;
      text-decoration: underline !important;
      transform: translateY(-2px) !important;
    }
    
    input:focus {
      transform: scale(1.02) !important;
    }
  `
  document.head.appendChild(styleSheet)
}
