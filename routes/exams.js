const express = require("express")
const { Exam, ExamResult } = require("../models/Exam")
const auth = require("../middleware/auth")

const router = express.Router()

// Create exam (Tutor only)
router.post("/", auth, async (req, res) => {
  try {
    if (req.user.role !== "TUTOR") {
      return res.status(403).json({ message: "Access denied" })
    }

    const exam = new Exam({
      ...req.body,
      tutor: req.user.userId,
    })

    await exam.save()
    res.status(201).json(exam)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get exams
router.get("/", auth, async (req, res) => {
  try {
    const query = {}

    if (req.user.role === "TUTOR") {
      query.tutor = req.user.userId
    } else if (req.user.role === "STUDENT") {
      query.assignedTo = req.user.userId
      query.isActive = true
    }

    const exams = await Exam.find(query)
      .populate("tutor", "fullName")
      .populate("assignedTo", "fullName email")
      .sort({ createdAt: -1 })

    res.json(exams)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Submit exam
router.post("/:id/submit", auth, async (req, res) => {
  try {
    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Access denied" })
    }

    // Validate request body
    if (!req.body.answers || !Array.isArray(req.body.answers)) {
      console.error("Invalid submission format - answers missing or not an array:", req.body)
      return res.status(400).json({ message: "Invalid submission format. Answers must be provided as an array." })
    }

    // Log submission data for debugging
    console.log("Exam submission received:", {
      examId: req.params.id,
      studentId: req.user.userId,
      answersCount: req.body.answers.length,
      timeSpent: req.body.timeSpent,
    })

    const exam = await Exam.findById(req.params.id)
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    const { answers, timeSpent, startedAt } = req.body

    // Calculate score - Enhanced version
    let score = 0
    let totalPoints = 0
    const processedAnswers = []

    exam.questions.forEach((question, index) => {
      // More robust answer matching
      const answer = answers.find((a) => {
        // Try to match by ID first
        if (a.questionId && question._id && a.questionId === question._id.toString()) {
          return true
        }
        // Try index-based matching with q prefix
        if (a.questionId === `q${index}`) {
          return true
        }
        // Last resort: use array index if available
        return false
      }) ||
        answers[index] || { selectedOptions: [] }

      console.log(`Processing question ${index}:`, {
        questionId: question._id?.toString(),
        answerFound: !!answer,
        selectedOptions: answer.selectedOptions,
      })

      totalPoints += question.points

      let isCorrect = false

      if (question.type === "SINGLE") {
        // For single choice questions
        const correctOptionIndex = question.options.findIndex((opt) => opt.isCorrect)
        const selectedOptionIndex =
          answer.selectedOptions && answer.selectedOptions.length > 0 ? answer.selectedOptions[0] : -1

        isCorrect = correctOptionIndex !== -1 && correctOptionIndex === selectedOptionIndex

        console.log(`Question ${index + 1} (Single):`, {
          correctOptionIndex,
          selectedOptionIndex,
          isCorrect,
          questionText: question.question.substring(0, 50) + "...",
        })
      } else if (question.type === "MULTIPLE") {
        // For multiple choice questions
        const correctOptions = question.options
          .map((opt, idx) => (opt.isCorrect ? idx : -1))
          .filter((idx) => idx !== -1)
          .sort()

        const selectedOptions = (answer.selectedOptions || []).sort()

        isCorrect = correctOptions.length > 0 && JSON.stringify(correctOptions) === JSON.stringify(selectedOptions)

        console.log(`Question ${index + 1} (Multiple):`, {
          correctOptions,
          selectedOptions,
          isCorrect,
          questionText: question.question.substring(0, 50) + "...",
        })
      }

      if (isCorrect) {
        score += question.points
      }

      processedAnswers.push({
        questionId: question._id,
        selectedOptions: answer.selectedOptions || [],
        isCorrect,
        points: isCorrect ? question.points : 0,
        timeSpent: answer.timeSpent || 0,
      })
    })

    console.log("Final Score Calculation:", {
      score,
      totalPoints,
      percentage: (score / totalPoints) * 100,
      correctAnswers: processedAnswers.filter((a) => a.isCorrect).length,
      totalQuestions: exam.questions.length,
    })

    const percentage = (score / totalPoints) * 100
    const status = percentage >= exam.passingScore ? "PASS" : "FAIL"

    const result = new ExamResult({
      exam: exam._id,
      student: req.user.userId,
      answers: processedAnswers,
      score,
      totalPoints,
      percentage,
      status,
      timeSpent,
      startedAt: new Date(startedAt),
      submittedAt: new Date(),
      attemptNumber: 1,
    })

    await result.save()

    res.json({
      message: "Exam submitted successfully",
      result: {
        id: result._id,
        score,
        totalPoints,
        percentage,
        status,
        timeSpent,
      },
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get exam results
router.get("/:id/results", auth, async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id)
    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    const query = { exam: req.params.id }

    if (req.user.role === "STUDENT") {
      query.student = req.user.userId
    }

    const results = await ExamResult.find(query)
      .populate("student", "fullName email studentId")
      .populate("exam", "title subject")
      .sort({ submittedAt: -1 })

    res.json(results)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get detailed result
router.get("/:examId/results/:resultId", auth, async (req, res) => {
  try {
    const result = await ExamResult.findById(req.params.resultId)
      .populate("student", "fullName email studentId")
      .populate("exam")

    if (!result) {
      return res.status(404).json({ message: "Result not found" })
    }

    // Check access
    if (req.user.role === "STUDENT" && result.student._id.toString() !== req.user.userId) {
      return res.status(403).json({ message: "Access denied" })
    }

    res.json(result)
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get exam analytics (Tutor only)
router.get("/:id/analytics", auth, async (req, res) => {
  try {
    if (req.user.role !== "TUTOR") {
      return res.status(403).json({ message: "Access denied" })
    }

    const exam = await Exam.findById(req.params.id)
    if (!exam || exam.tutor.toString() !== req.user.userId) {
      return res.status(404).json({ message: "Exam not found" })
    }

    const results = await ExamResult.find({ exam: req.params.id }).populate("student", "fullName email")

    // Calculate analytics
    const totalAttempts = results.length
    const averageScore = results.reduce((sum, result) => sum + result.percentage, 0) / totalAttempts || 0
    const passRate = (results.filter((result) => result.status === "PASS").length / totalAttempts) * 100 || 0

    const topScorer = results.reduce(
      (top, current) => (current.percentage > (top?.percentage || 0) ? current : top),
      null,
    )

    const lowestScorer = results.reduce(
      (lowest, current) => (current.percentage < (lowest?.percentage || 100) ? current : lowest),
      null,
    )

    // Question difficulty analysis
    const questionAnalysis = exam.questions.map((question, index) => {
      const correctAnswers = results.filter((result) => result.answers[index]?.isCorrect).length

      return {
        questionNumber: index + 1,
        question: question.question,
        topic: question.topic,
        correctAnswers,
        totalAttempts,
        difficultyPercentage: (correctAnswers / totalAttempts) * 100 || 0,
      }
    })

    // Topic-wise performance
    const topicPerformance = {}
    exam.questions.forEach((question, qIndex) => {
      if (!topicPerformance[question.topic]) {
        topicPerformance[question.topic] = { correct: 0, total: 0 }
      }

      results.forEach((result) => {
        if (result.answers[qIndex]) {
          topicPerformance[question.topic].total++
          if (result.answers[qIndex].isCorrect) {
            topicPerformance[question.topic].correct++
          }
        }
      })
    })

    const topicStats = Object.entries(topicPerformance).map(([topic, stats]) => ({
      topic,
      percentage: (stats.correct / stats.total) * 100 || 0,
      correct: stats.correct,
      total: stats.total,
    }))

    res.json({
      totalAttempts,
      averageScore: Math.round(averageScore * 100) / 100,
      passRate: Math.round(passRate * 100) / 100,
      topScorer,
      lowestScorer,
      questionAnalysis,
      topicStats,
      results,
    })
  } catch (error) {
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete exam (Tutor only)
router.delete("/:id", auth, async (req, res) => {
  try {
    console.log("=== SINGLE DELETE REQUEST ===")
    console.log("Exam ID:", req.params.id)
    console.log("User ID:", req.user.userId)
    console.log("User Role:", req.user.role)

    if (req.user.role !== "TUTOR") {
      console.log("❌ Access denied - not a tutor")
      return res.status(403).json({ message: "Access denied. Only tutors can delete exams." })
    }

    // Find the exam with detailed logging
    const exam = await Exam.findById(req.params.id)
    console.log("Found exam:", exam ? "YES" : "NO")

    if (!exam) {
      console.log("❌ Exam not found in database")
      return res.status(404).json({ message: "Exam not found" })
    }

    console.log("Exam tutor ID:", exam.tutor.toString())
    console.log("Current user ID:", req.user.userId)
    console.log("IDs match:", exam.tutor.toString() === req.user.userId)

    // Check ownership with flexible comparison
    const examTutorId = exam.tutor.toString()
    const currentUserId = req.user.userId.toString()

    if (examTutorId !== currentUserId) {
      console.log("❌ Permission denied - user doesn't own this exam")
      console.log("Expected tutor:", examTutorId)
      console.log("Current user:", currentUserId)
      return res.status(403).json({ message: "Access denied. You can only delete your own exams." })
    }

    console.log("✅ Ownership verified - proceeding with deletion")

    // Delete related exam results
    const resultsCount = await ExamResult.countDocuments({ exam: req.params.id })
    console.log("Related results to delete:", resultsCount)

    if (resultsCount > 0) {
      await ExamResult.deleteMany({ exam: req.params.id })
      console.log("✅ Deleted", resultsCount, "exam results")
    }

    // Delete the exam
    await Exam.findByIdAndDelete(req.params.id)
    console.log("✅ Exam deleted successfully")

    res.json({
      message: "Exam deleted successfully",
      deletedResults: resultsCount,
      examTitle: exam.title,
    })
  } catch (error) {
    console.error("❌ Error deleting exam:", error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
    })
  }
})

// Bulk delete exams (Tutor only)
router.delete("/bulk/delete", auth, async (req, res) => {
  try {
    console.log("=== BULK DELETE REQUEST ===")
    console.log("Request body:", req.body)
    console.log("User ID:", req.user.userId)
    console.log("User Role:", req.user.role)

    if (req.user.role !== "TUTOR") {
      console.log("❌ Access denied - not a tutor")
      return res.status(403).json({ message: "Access denied. Only tutors can delete exams." })
    }

    const { examIds } = req.body

    if (!examIds || !Array.isArray(examIds) || examIds.length === 0) {
      console.log("❌ Invalid examIds:", examIds)
      return res.status(400).json({ message: "Please provide valid exam IDs to delete" })
    }

    console.log("Exam IDs to delete:", examIds)
    console.log("Looking for exams owned by user:", req.user.userId)

    // Find exams with detailed logging
    const allExams = await Exam.find({ _id: { $in: examIds } })
    console.log("Found exams in database:", allExams.length)

    allExams.forEach((exam, index) => {
      console.log(`Exam ${index + 1}:`, {
        id: exam._id.toString(),
        title: exam.title,
        tutor: exam.tutor.toString(),
        ownedByCurrentUser: exam.tutor.toString() === req.user.userId.toString(),
      })
    })

    // Filter exams owned by current user
    const ownedExams = allExams.filter((exam) => exam.tutor.toString() === req.user.userId.toString())
    console.log("Exams owned by current user:", ownedExams.length)

    if (ownedExams.length === 0) {
      console.log("❌ No owned exams found")
      return res.status(404).json({
        message: "No exams found or you don't have permission to delete them",
        details: {
          requestedExams: examIds.length,
          foundExams: allExams.length,
          ownedExams: ownedExams.length,
        },
      })
    }

    const examIdsToDelete = ownedExams.map((exam) => exam._id)
    console.log("✅ Proceeding to delete exams:", examIdsToDelete)

    // Delete related exam results
    const deletedResults = await ExamResult.deleteMany({ exam: { $in: examIdsToDelete } })
    console.log("✅ Deleted results:", deletedResults.deletedCount)

    // Delete the exams
    const deletedExams = await Exam.deleteMany({ _id: { $in: examIdsToDelete } })
    console.log("✅ Deleted exams:", deletedExams.deletedCount)

    res.json({
      message: `Successfully deleted ${deletedExams.deletedCount} exams`,
      deletedExams: deletedExams.deletedCount,
      deletedResults: deletedResults.deletedCount,
      examTitles: ownedExams.map((exam) => exam.title),
      skippedExams: allExams.length - ownedExams.length,
    })
  } catch (error) {
    console.error("❌ Error bulk deleting exams:", error)
    res.status(500).json({
      message: "Server error",
      error: error.message,
    })
  }
})

module.exports = router
