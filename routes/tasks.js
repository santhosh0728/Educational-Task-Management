const express = require("express")
const Task = require("../models/Task")
const auth = require("../middleware/auth")

const router = express.Router()

// Create task (Tutor only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "TUTOR") {
      return res.status(403).json({ message: "Only tutors can create tasks" })
    }

    const task = new Task({
      ...req.body,
      tutor: req.user.userId,
    })

    await task.save()
    await task.populate("tutor", "fullName email")
    await task.populate("assignedTo", "fullName email studentId")

    res.status(201).json({
      message: "Task created successfully",
      task,
    })
  } catch (error) {
    console.error("Create task error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get tasks
router.get("/", auth, async (req, res) => {
  try {
    const query = {}

    if (req.user.role === "TUTOR") {
      query.tutor = req.user.userId
    } else if (req.user.role === "STUDENT") {
      query.assignedTo = req.user.userId
    }

    const tasks = await Task.find(query)
      .populate("tutor", "fullName email")
      .populate("assignedTo", "fullName email studentId")
      .populate("submissions.student", "fullName email studentId")
      .sort({ createdAt: -1 })

    res.json(tasks)
  } catch (error) {
    console.error("Get tasks error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get single task
router.get("/:id", auth, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("tutor", "fullName email")
      .populate("assignedTo", "fullName email studentId")
      .populate("submissions.student", "fullName email studentId")

    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Check access
    const hasAccess =
      (req.user.role === "TUTOR" && task.tutor._id.toString() === req.user.userId) ||
      (req.user.role === "STUDENT" && task.assignedTo.some((student) => student._id.toString() === req.user.userId))

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json(task)
  } catch (error) {
    console.error("Get task error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Submit task (Student only)
router.post("/:id/submit", auth, async (req, res) => {
  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can submit tasks" })
    }

    const task = await Task.findById(req.params.id)
    if (!task) {
      return res.status(404).json({ message: "Task not found" })
    }

    // Check if student is assigned to this task
    if (!task.assignedTo.includes(req.user.userId)) {
      return res.status(403).json({ message: "You are not assigned to this task" })
    }

    // Check if already submitted
    const existingSubmission = task.submissions.find((sub) => sub.student.toString() === req.user.userId)

    if (existingSubmission) {
      return res.status(400).json({ message: "Task already submitted" })
    }

    // Add submission
    task.submissions.push({
      student: req.user.userId,
      files: req.body.files || [],
      submittedAt: new Date(),
    })

    await task.save()
    await task.populate("submissions.student", "fullName email studentId")

    res.json({
      message: "Task submitted successfully",
      task,
    })
  } catch (error) {
    console.error("Submit task error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

module.exports = router
