const express = require("express")
const router = express.Router()
const bcrypt = require("bcryptjs")
const auth = require("../middleware/auth")
const User = require("../models/User")

// Get user profile
router.get("/profile", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Error fetching user profile:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching user profile",
      error: error.message,
    })
  }
})

// Update user profile
router.put("/profile", auth, async (req, res) => {
  try {
    const { name, email, institution, studentId, bio, phone } = req.body
    const userId = req.user.id

    // Check if email is already taken by another user
    if (email) {
      const existingUser = await User.findOne({
        email,
        _id: { $ne: userId },
      })

      if (existingUser) {
        return res.status(400).json({
          success: false,
          message: "Email is already registered with another account",
        })
      }
    }

    const updateData = {}
    if (name) updateData.name = name
    if (email) updateData.email = email
    if (institution) updateData.institution = institution
    if (studentId) updateData.studentId = studentId
    if (bio) updateData.bio = bio
    if (phone) updateData.phone = phone

    const updatedUser = await User.findByIdAndUpdate(userId, updateData, { new: true, runValidators: true }).select(
      "-password",
    )

    res.json({
      success: true,
      message: "Profile updated successfully",
      user: updatedUser,
    })
  } catch (error) {
    console.error("Error updating profile:", error)
    res.status(500).json({
      success: false,
      message: "Error updating profile",
      error: error.message,
    })
  }
})

// Change password
router.put("/change-password", auth, async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body
    const userId = req.user.id

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "Current password and new password are required",
      })
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: "New password must be at least 6 characters long",
      })
    }

    const user = await User.findById(userId)

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password)

    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Current password is incorrect",
      })
    }

    // Hash new password
    const saltRounds = 12
    const hashedNewPassword = await bcrypt.hash(newPassword, saltRounds)

    // Update password
    await User.findByIdAndUpdate(userId, {
      password: hashedNewPassword,
      passwordChangedAt: new Date(),
    })

    res.json({
      success: true,
      message: "Password changed successfully",
    })
  } catch (error) {
    console.error("Error changing password:", error)
    res.status(500).json({
      success: false,
      message: "Error changing password",
      error: error.message,
    })
  }
})

// Get all users (for admin or chat purposes)
router.get("/", auth, async (req, res) => {
  try {
    const { role, search, page = 1, limit = 20 } = req.query

    const query = {}

    // Filter by role if specified
    if (role) {
      query.role = role
    }

    // Search by name or email
    if (search) {
      query.$or = [{ name: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const total = await User.countDocuments(query)

    res.json({
      success: true,
      users,
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error fetching users:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    })
  }
})

// Get user by ID
router.get("/:userId", auth, async (req, res) => {
  try {
    const { userId } = req.params

    const user = await User.findById(userId).select("-password")

    if (!user) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      })
    }

    res.json({
      success: true,
      user,
    })
  } catch (error) {
    console.error("Error fetching user:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching user",
      error: error.message,
    })
  }
})

// Delete user account (soft delete)
router.delete("/account", auth, async (req, res) => {
  try {
    const userId = req.user.id
    const { password } = req.body

    if (!password) {
      return res.status(400).json({
        success: false,
        message: "Password is required to delete account",
      })
    }

    const user = await User.findById(userId)

    // Verify password
    const isPasswordValid = await bcrypt.compare(password, user.password)

    if (!isPasswordValid) {
      return res.status(400).json({
        success: false,
        message: "Incorrect password",
      })
    }

    // Soft delete - mark as deleted instead of removing
    await User.findByIdAndUpdate(userId, {
      isDeleted: true,
      deletedAt: new Date(),
      email: `deleted_${Date.now()}_${user.email}`, // Prevent email conflicts
    })

    res.json({
      success: true,
      message: "Account deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting account:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting account",
      error: error.message,
    })
  }
})

// Get user statistics
router.get("/stats/overview", auth, async (req, res) => {
  try {
    const userId = req.user.id

    // Get user's task and exam statistics
    const Task = require("../models/Task")
    const Exam = require("../models/Exam")

    const [totalTasks, completedTasks, pendingTasks, totalExams, passedExams] = await Promise.all([
      Task.countDocuments({ userId }),
      Task.countDocuments({ userId, status: "COMPLETED" }),
      Task.countDocuments({ userId, status: { $in: ["PENDING", "IN_PROGRESS"] } }),
      Exam.countDocuments({ userId }),
      Exam.countDocuments({ userId, status: "PASSED" }),
    ])

    const stats = {
      tasks: {
        total: totalTasks,
        completed: completedTasks,
        pending: pendingTasks,
        completionRate: totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0,
      },
      exams: {
        total: totalExams,
        passed: passedExams,
        passRate: totalExams > 0 ? Math.round((passedExams / totalExams) * 100) : 0,
      },
    }

    res.json({
      success: true,
      stats,
    })
  } catch (error) {
    console.error("Error fetching user stats:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching user statistics",
      error: error.message,
    })
  }
})

module.exports = router
