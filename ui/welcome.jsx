"use client"

import { useEffect, useState } from "react"
import { Link } from "react-router-dom"
import "../welcome.css"

const WelcomePage = () => {
  const [currentFeature, setCurrentFeature] = useState(0)

  const features = [
    { icon: "📚", text: "Organize your study materials", color: "#3498db" },
    { icon: "📝", text: "Track assignments & deadlines", color: "#e74c3c" },
    { icon: "🎯", text: "Achieve your learning goals", color: "#2ecc71" },
    { icon: "📊", text: "Monitor your progress", color: "#f39c12" },
    { icon: "🏆", text: "Celebrate achievements", color: "#9b59b6" },
  ]

  useEffect(() => {
    // Enhanced typing effect
    const text = "Welcome to EduTask Manager"
    const container = document.getElementById("typing-text")

    container.innerHTML = "" // Reset

    text.split("").forEach((char, i) => {
      const span = document.createElement("span")
      span.textContent = char === " " ? "\u00A0" : char
      span.style.animationDelay = `${i * 0.08}s`
      span.className = "typing-char"
      container.appendChild(span)
    })

    // Create floating educational elements
    const eduContainer = document.querySelector(".educational-elements")
    const elements = [
      { type: "book", emoji: "📚" },
      { type: "pencil", emoji: "✏️" },
      { type: "ruler", emoji: "📏" },
      { type: "calculator", emoji: "🧮" },
      { type: "notebook", emoji: "📓" },
      { type: "graduation", emoji: "🎓" },
      { type: "apple", emoji: "🍎" },
      { type: "lightbulb", emoji: "💡" },
    ]

    for (let i = 0; i < 20; i++) {
      const element = document.createElement("div")
      const randomElement = elements[Math.floor(Math.random() * elements.length)]
      element.className = `edu-element floating-element`
      element.innerHTML = randomElement.emoji

      // Position randomly
      element.style.left = `${Math.random() * 100}vw`
      element.style.top = `${Math.random() * 100}vh`
      element.style.animationDuration = `${Math.random() * 15 + 10}s`
      element.style.animationDelay = `${Math.random() * 5}s`
      element.style.fontSize = `${Math.random() * 20 + 15}px`

      eduContainer.appendChild(element)
    }

    // Feature rotation
    const interval = setInterval(() => {
      setCurrentFeature((prev) => (prev + 1) % features.length)
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  return (
    <div className="educational-background">
      <div className="educational-elements"></div>

      {/* Navigation */}
      <nav className="modern-nav">
        <div className="nav-brand">
          <span className="brand-icon">🎓</span>
          <span className="brand-text">EduTask</span>
        </div>
        <div className="nav-links">
          <Link to="/about" className="nav-link">
            About
          </Link>
          <Link to="/features" className="nav-link">
            Features
          </Link>
          <Link to="/contact" className="nav-link">
            Contact
          </Link>
        </div>
      </nav>

      <div className="page-container">
        {/* Hero Section */}
        <div className="hero-section">
          <div className="hero-content">
            <div className="hero-badge">
              <span className="badge-text">✨ New Features Available</span>
            </div>

            <div className="header">
              <div className="welcome typing" id="typing-text"></div>
              <div className="subtitle">
                Transform your learning journey with our comprehensive educational platform
              </div>
              <div className="description">
                Streamline tasks, conduct exams, track progress, and achieve academic excellence with cutting-edge tools
                designed for modern education.
              </div>
            </div>

            <div className="cta-section">
              <div className="button-container">
                <Link to="/signup" className="btn primary-btn">
                  <span className="btn-icon">🚀</span>
                  <span>Get Started Free</span>
                  <div className="btn-shine"></div>
                </Link>
                <Link to="/signin" className="btn secondary-btn">
                  <span className="btn-icon">👋</span>
                  <span>Welcome Back</span>
                </Link>
              </div>

              <div className="trust-indicators">
                <div className="trust-item">
                  <span className="trust-number">10K+</span>
                  <span className="trust-label">Students</span>
                </div>
                <div className="trust-item">
                  <span className="trust-number">500+</span>
                  <span className="trust-label">Schools</span>
                </div>
                <div className="trust-item">
                  <span className="trust-number">99%</span>
                  <span className="trust-label">Satisfaction</span>
                </div>
              </div>
            </div>
          </div>

          <div className="hero-visual">
            <div className="dashboard-preview">
              <div className="preview-header">
                <div className="preview-dots">
                  <span className="dot red"></span>
                  <span className="dot yellow"></span>
                  <span className="dot green"></span>
                </div>
                <div className="preview-title">EduTask Dashboard</div>
              </div>
              <div className="preview-content">
                <div className="preview-stats">
                  <div className="stat-card">
                    <div className="stat-icon">📊</div>
                    <div className="stat-value">85%</div>
                    <div className="stat-label">Progress</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">📝</div>
                    <div className="stat-value">12</div>
                    <div className="stat-label">Tasks</div>
                  </div>
                  <div className="stat-card">
                    <div className="stat-icon">🏆</div>
                    <div className="stat-value">A+</div>
                    <div className="stat-label">Grade</div>
                  </div>
                </div>
                <div className="preview-chart">
                  <div className="chart-bars">
                    <div className="bar" style={{ height: "60%" }}></div>
                    <div className="bar" style={{ height: "80%" }}></div>
                    <div className="bar" style={{ height: "45%" }}></div>
                    <div className="bar" style={{ height: "90%" }}></div>
                    <div className="bar" style={{ height: "70%" }}></div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="features-section">
          <div className="section-header">
            <h2 className="section-title">Why Choose EduTask?</h2>
            <p className="section-subtitle">Powerful features designed for educational excellence</p>
          </div>

          <div className="features-grid">
            {features.map((feature, index) => (
              <div
                key={index}
                className={`feature-card ${index === currentFeature ? "active" : ""}`}
                style={{ "--feature-color": feature.color }}
              >
                <div className="feature-icon-large">{feature.icon}</div>
                <div className="feature-text-large">{feature.text}</div>
                <div className="feature-glow"></div>
              </div>
            ))}
          </div>
        </div>

        {/* Benefits Section */}
        <div className="benefits-section">
          <div className="benefit-item">
            <div className="benefit-icon">⚡</div>
            <div className="benefit-content">
              <h3>Lightning Fast</h3>
              <p>Optimized performance for seamless learning experience</p>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">🔒</div>
            <div className="benefit-content">
              <h3>Secure & Private</h3>
              <p>Your data is protected with enterprise-grade security</p>
            </div>
          </div>
          <div className="benefit-item">
            <div className="benefit-icon">📱</div>
            <div className="benefit-content">
              <h3>Mobile Ready</h3>
              <p>Access your learning materials anywhere, anytime</p>
            </div>
          </div>
        </div>
      </div>

      {/* Floating Action Button */}
      <div className="floating-help">
        <div className="help-btn">
          <span>💬</span>
          <div className="help-tooltip">Need help? Chat with us!</div>
        </div>
      </div>
    </div>
  )
}

export default WelcomePage
