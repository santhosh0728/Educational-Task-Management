import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import { Toaster } from "react-hot-toast"
import { AuthProvider } from "./contexts/AuthContext"
import { ThemeProvider } from "./contexts/ThemeContext"

import Dashboard from "./components/Dashboard"
import Signup from "./components/auth/Signup"
import Signin from "./components/auth/Signin"
import CreateTask from "./components/tasks/CreateTask"
import TaskList from "./components/tasks/TaskList"
import Calendar from "./components/calendar/Calendar"
import Chat from "./components/chat/Chat"
import StudentsManagement from "./components/students/StudentsManagement"
import Profile from "./components/profile/Profile"
import CreateExam from "./components/exams/CreateExam"
import ExamList from "./components/exams/ExamList"
import TakeExam from "./components/exams/TakeExam"
import ExamResult from "./components/exams/ExamResult"
import ExamResults from "./components/exams/ExamResults"
import ExamAnalytics from "./components/exams/ExamAnalytics"
import Notifications from "./components/notifications/Notifications"
import Analytics from "./components/analytics/Analytics"
import "./App.css"
import WelcomePage from "./ui/welcome"

// Protected Route Component
const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const token = localStorage.getItem("token")
  const userRole = localStorage.getItem("userRole")

  if (!token) {
    return <Navigate to="/signin" replace />
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
    return <Navigate to="/dashboard" replace />
  }

  return children
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <Toaster
            position="top-right"
            toastOptions={{
              duration: 3000,
              style: {
                background: "#363636",
                color: "#fff",
                borderRadius: "8px",
                padding: "16px",
              },
            }}
          />
          <Routes>
            <Route path="/" element={<WelcomePage />} />
            <Route path="/signup" element={<Signup />} />
            <Route path="/signin" element={<Signin />} />

            {/* Dashboard and nested routes */}
            <Route
              path="/dashboard/*"
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              }
            >
              <Route path="tasks" element={<TaskList />} />
              <Route path="create-task" element={<CreateTask />} />
              <Route path="calendar" element={<Calendar />} />
              <Route path="chat" element={<Chat />} />
              <Route path="exams" element={<ExamList />} />
              <Route path="students" element={<StudentsManagement />} />
              <Route path="profile" element={<Profile />} />
              <Route path="notifications" element={<Notifications />} />
              <Route path="analytics" element={<Analytics />} />
            </Route>

            {/* Exam routes */}
            <Route
              path="/exams/new"
              element={
                <ProtectedRoute allowedRoles={["TUTOR"]}>
                  <CreateExam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exams/:examId"
              element={
                <ProtectedRoute>
                  <CreateExam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:examId/take"
              element={
                <ProtectedRoute>
                  <TakeExam />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:examId/result/:resultId"
              element={
                <ProtectedRoute>
                  <ExamResult />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:examId/results"
              element={
                <ProtectedRoute>
                  <ExamResults />
                </ProtectedRoute>
              }
            />
            <Route
              path="/exam/:examId/analytics"
              element={
                <ProtectedRoute allowedRoles={["TUTOR"]}>
                  <ExamAnalytics />
                </ProtectedRoute>
              }
            />

            {/* Fallback route */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  )
}

export default App
