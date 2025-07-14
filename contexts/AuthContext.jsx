"use client"

import { createContext, useContext, useState, useEffect } from "react"
import axios from "axios"
import toast from "react-hot-toast"

const AuthContext = createContext()

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  // Set up axios defaults
  const token = localStorage.getItem("token")
  if (token) {
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
  }

  // Configure axios base URL with correct port - FIXED to use 5001
  // axios.defaults.baseURL = process.env.NODE_ENV === 'production' ? '' : ''
  // axios.defaults.baseURL = "http://localhost:5001"
  axios.defaults.timeout = 10000 // 10 seconds

  // Add interceptor to handle network errors gracefully
  axios.interceptors.response.use(
    (response) => response,
    (error) => {
      if (error.code === "ECONNABORTED" || error.code === "ERR_NETWORK" || !error.response) {
        console.error("Network error - Server may not be running:", error)
        toast.error("Cannot connect to server. Please ensure the backend server is running on port 5001.")
      }
      return Promise.reject(error)
    },
  )

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token")
      if (token) {
        try {
          const response = await axios.get("/api/auth/me")
          setUser(response.data)
        } catch (error) {
          console.error("Auth initialization error:", error)
          localStorage.removeItem("token")
          delete axios.defaults.headers.common["Authorization"]
        }
      }
      setLoading(false)
    }

    initAuth()
  }, [])

  const login = async (email, password) => {
    try {
      console.log("Attempting login with:", { email, password: "[HIDDEN]" })

      // Fix: Send email and password directly, not nested
      const response = await axios.post("/api/auth/login", {
        email,
        password,
      })

      const { token, user } = response.data
      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      toast.success("Login successful!")
      return { success: true }
    } catch (error) {
      console.error("Login error:", error)

      if (error.code === "ERR_NETWORK" || !error.response) {
        const message = "Cannot connect to server. Please check if the backend server is running."
        toast.error(message)
        return { success: false, message }
      }

      const message = error.response?.data?.message || "Login failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const register = async (userData) => {
    try {
      console.log("Registering with data:", { ...userData, password: "[HIDDEN]" })

      const response = await axios.post("/api/auth/register", userData)

      const { token, user } = response.data
      localStorage.setItem("token", token)
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      setUser(user)

      toast.success("Registration successful!")
      return { success: true }
    } catch (error) {
      console.error("Registration error:", error)

      if (error.code === "ERR_NETWORK" || !error.response) {
        const message = "Cannot connect to server. Please check if the backend server is running."
        toast.error(message)
        return { success: false, message }
      }

      const message = error.response?.data?.message || "Registration failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const logout = () => {
    localStorage.removeItem("token")
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    toast.success("Logged out successfully")
  }

  const updateProfile = async (profileData) => {
    try {
      const response = await axios.put("/api/auth/profile", profileData)
      setUser(response.data.user)
      toast.success("Profile updated successfully!")
      return { success: true }
    } catch (error) {
      console.error("Profile update error:", error)
      const message = error.response?.data?.message || "Profile update failed"
      toast.error(message)
      return { success: false, message }
    }
  }

  const value = {
    user,
    loading,
    login,
    register,
    logout,
    updateProfile,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export default AuthContext
