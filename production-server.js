const express = require("express")
const mongoose = require("mongoose")
const cors = require("cors")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
const path = require("path")

// Load environment variables from the correct path
require("dotenv").config({ path: path.join(__dirname, "../.env") })

const app = express()

// Debug: Check environment variables
console.log("🔍 Environment Variables Check:")
console.log("- MONGODB_URI:", process.env.MONGODB_URI ? "✅ Set" : "❌ Not set")
console.log("- JWT_SECRET:", process.env.JWT_SECRET ? "✅ Set" : "❌ Not set")
console.log("- PORT:", process.env.PORT || "Using default 5001")

// Exit if critical env vars are missing
if (!process.env.MONGODB_URI) {
  console.error("❌ MONGODB_URI environment variable is required!")
  console.error("Please check your .env file in the root directory")
  process.exit(1)
}

if (!process.env.JWT_SECRET) {
  console.error("❌ JWT_SECRET environment variable is required!")
  console.error("Please check your .env file in the root directory")
  process.exit(1)
}

// Enhanced CORS configuration
const corsOptions = {
  origin: ["http://localhost:5173", "http://127.0.0.1:5173", "http://localhost:3000", "http://127.0.0.1:3000"],
  credentials: true,
  optionsSuccessStatus: 200,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
}

app.use(cors(corsOptions))

// Handle preflight requests
app.options("*", cors(corsOptions))

// Middleware
app.use(express.json({ limit: "10mb" }))
app.use(express.urlencoded({ extended: true }))

// Logging middleware
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`)
  next()
})

// Auth middleware
const auth = (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "")

    if (!token) {
      return res.status(401).json({ message: "No token provided, authorization denied" })
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET)
    req.user = decoded
    next()
  } catch (error) {
    console.error("Auth middleware error:", error)
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({ message: "Token expired, please login again" })
    }
    res.status(401).json({ message: "Invalid token, authorization denied" })
  }
}

// User Schema
const userSchema = new mongoose.Schema({
  fullName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  role: { type: String, enum: ["STUDENT", "TUTOR"], required: true },
  institution: { type: String, required: true },
  studentId: { type: String },
  subjects: [{ type: String }],
  enrolledSubjects: [{ type: String }],
  isActive: { type: Boolean, default: true },
  createdAt: { type: Date, default: Date.now },
})

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next()
  this.password = await bcrypt.hash(this.password, 12)
  next()
})

userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password)
  } catch (error) {
    throw error
  }
}

const User = mongoose.model("User", userSchema)

// Exam Schema - FIXED with proper timezone handling
const questionSchema = new mongoose.Schema({
  question: { type: String, required: true },
  type: { type: String, enum: ["SINGLE", "MULTIPLE"], default: "SINGLE" },
  options: [
    {
      text: String,
      isCorrect: Boolean,
    },
  ],
  explanation: { type: String },
  topic: { type: String },
  difficulty: { type: String, enum: ["EASY", "MEDIUM", "HARD"], default: "MEDIUM" },
  points: { type: Number, default: 1 },
})

const examSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String },
    subject: { type: String, required: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    questions: [questionSchema],
    duration: { type: Number, required: true }, // in minutes
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    attemptLimit: { type: Number, default: 1 },
    passingScore: { type: Number, default: 60 },
    showResultsImmediately: { type: Boolean, default: false },
    showCorrectAnswers: { type: Boolean, default: false },
    randomizeQuestions: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
)

const Exam = mongoose.model("Exam", examSchema)

// Exam Result Schema
const examResultSchema = new mongoose.Schema(
  {
    exam: { type: mongoose.Schema.Types.ObjectId, ref: "Exam", required: true },
    student: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    answers: [
      {
        questionId: { type: String, required: true },
        selectedOptions: [{ type: Number }],
        isCorrect: { type: Boolean },
        points: { type: Number, default: 0 },
        timeSpent: { type: Number, default: 0 }, // in seconds
      },
    ],
    score: { type: Number, required: true },
    totalPoints: { type: Number, required: true },
    percentage: { type: Number, required: true },
    status: { type: String, enum: ["PASS", "FAIL"], required: true },
    timeSpent: { type: Number, required: true }, // in seconds
    startedAt: { type: Date, required: true },
    submittedAt: { type: Date, default: Date.now },
    attemptNumber: { type: Number, default: 1 },
    feedback: { type: String },
  },
  {
    timestamps: true,
  },
)

const ExamResult = mongoose.model("ExamResult", examResultSchema)

// Task Schema
const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    subject: { type: String, required: true },
    tutor: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    assignedTo: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    dueDate: { type: Date, required: true },
    priority: { type: String, enum: ["LOW", "MEDIUM", "HIGH", "URGENT"], default: "MEDIUM" },
    status: {
      type: String,
      enum: ["ASSIGNED", "IN_PROGRESS", "SUBMITTED", "REVIEWED", "COMPLETED"],
      default: "ASSIGNED",
    },
    instructions: { type: String },
    maxScore: { type: Number, default: 100 },
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  },
)

const Task = mongoose.model("Task", taskSchema)

// Connect to MongoDB
console.log("🔌 Connecting to MongoDB Atlas...")
mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas successfully!")
    console.log("📊 Database:", mongoose.connection.name)
  })
  .catch((error) => {
    console.error("❌ MongoDB connection error:", error.message)
    console.error("Please check your MONGODB_URI in the .env file")
  })

// Routes
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    timestamp: new Date().toISOString(),
    database: mongoose.connection.readyState === 1 ? "Connected" : "Disconnected",
    env: {
      NODE_ENV: process.env.NODE_ENV || "development",
      PORT: process.env.PORT || "5001",
    },
  })
})

// Users route - Get all users with optional role filtering
app.get("/api/users", auth, async (req, res) => {
  try {
    console.log("=== USERS REQUEST RECEIVED ===")
    console.log("Query params:", req.query)
    console.log("User making request:", req.user)

    const { role, search, page = 1, limit = 20 } = req.query

    const query = { isActive: { $ne: false } }

    // Filter by role if specified
    if (role) {
      query.role = role.toUpperCase()
      console.log("Filtering by role:", role.toUpperCase())
    }

    // Search by name or email
    if (search) {
      query.$or = [{ fullName: { $regex: search, $options: "i" } }, { email: { $regex: search, $options: "i" } }]
    }

    console.log("MongoDB query:", query)

    const users = await User.find(query)
      .select("-password")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    const total = await User.countDocuments(query)

    console.log(`✅ Found ${users.length} users out of ${total} total`)

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
    console.error("❌ Users fetch error:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching users",
      error: error.message,
    })
  }
})

// Registration route
app.post("/api/auth/register", async (req, res) => {
  try {
    console.log("📝 Registration request received:", { ...req.body, password: "[HIDDEN]" })

    const { fullName, email, password, role, institution, studentId, subjects } = req.body

    // Validation
    if (!fullName || !email || !password || !role || !institution) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["fullName", "email", "password", "role", "institution"],
      })
    }

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      console.log("❌ User already exists:", email)
      return res.status(400).json({ message: "User already exists with this email" })
    }

    // Create user data
    const userData = {
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      role,
      institution: institution.trim(),
    }

    // Add role-specific fields
    if (role === "STUDENT") {
      userData.studentId = studentId || ""
      userData.enrolledSubjects = Array.isArray(subjects) ? subjects : []
    } else if (role === "TUTOR") {
      userData.subjects = Array.isArray(subjects) ? subjects : []
    }

    // Create new user
    const user = new User(userData)
    await user.save()
    console.log("✅ User created successfully:", user._id)

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    res.status(201).json({
      message: "Registration successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        institution: user.institution,
        studentId: user.studentId,
        subjects: user.subjects,
        enrolledSubjects: user.enrolledSubjects,
      },
      token,
    })
  } catch (error) {
    console.error("❌ Registration error:", error)
    if (error.code === 11000) {
      res.status(400).json({ message: "User already exists with this email" })
    } else {
      res.status(500).json({ message: "Registration failed", error: error.message })
    }
  }
})

// Login route
app.post("/api/auth/login", async (req, res) => {
  try {
    console.log("🔐 Login request received")

    // Handle both correct and incorrect request formats
    let email, password
    if (req.body.email && typeof req.body.email === "object") {
      email = req.body.email.email
      password = req.body.email.password
    } else {
      email = req.body.email
      password = req.body.password
    }

    console.log("Attempting login for:", email)

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required" })
    }

    // Find user
    const user = await User.findOne({ email: email.toLowerCase().trim() })
    if (!user) {
      console.log("❌ User not found:", email)
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Check password
    const isPasswordValid = await user.comparePassword(password)
    if (!isPasswordValid) {
      console.log("❌ Invalid password for:", email)
      return res.status(400).json({ message: "Invalid email or password" })
    }

    // Generate JWT token
    const token = jwt.sign({ userId: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" })

    console.log("✅ Login successful for:", email)

    res.json({
      message: "Login successful",
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        role: user.role,
        institution: user.institution,
        studentId: user.studentId,
        subjects: user.subjects,
        enrolledSubjects: user.enrolledSubjects,
      },
      token,
    })
  } catch (error) {
    console.error("❌ Login error:", error)
    res.status(500).json({ message: "Login failed", error: error.message })
  }
})

// Get current user
app.get("/api/auth/me", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.userId).select("-password")

    if (!user) {
      return res.status(404).json({ message: "User not found" })
    }

    res.json(user)
  } catch (error) {
    console.error("❌ Auth verification error:", error)
    res.status(401).json({ message: "Invalid token" })
  }
})

// Tasks routes
app.get("/api/tasks", auth, async (req, res) => {
  try {
    console.log("=== TASKS REQUEST RECEIVED ===")
    console.log("User role:", req.user.role)
    console.log("User ID:", req.user.userId)

    const query = { isActive: { $ne: false } }

    if (req.user.role === "TUTOR") {
      query.tutor = req.user.userId
    } else if (req.user.role === "STUDENT") {
      query.assignedTo = req.user.userId
    }

    console.log("Tasks query:", query)

    const tasks = await Task.find(query)
      .populate("tutor", "fullName email")
      .populate("assignedTo", "fullName email studentId")
      .sort({ createdAt: -1 })

    console.log(`✅ Found ${tasks.length} tasks`)
    res.json(tasks)
  } catch (error) {
    console.error("❌ Tasks error:", error)
    res.status(500).json({ message: "Error fetching tasks", error: error.message })
  }
})

app.post("/api/tasks", auth, async (req, res) => {
  try {
    console.log("=== CREATE TASK REQUEST ===")

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

    console.log("✅ Task created successfully:", task._id)
    res.status(201).json({
      message: "Task created successfully",
      task,
    })
  } catch (error) {
    console.error("❌ Create task error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Exams routes - FIXED VISIBILITY AND DATE ISSUES
app.get("/api/exams", auth, async (req, res) => {
  try {
    console.log("=== EXAMS REQUEST RECEIVED ===")
    console.log("User role:", req.user.role)
    console.log("User ID:", req.user.userId)

    const query = { isActive: { $ne: false } }

    if (req.user.role === "TUTOR") {
      // Tutors see exams they created
      query.tutor = req.user.userId
      console.log("Fetching exams for tutor:", req.user.userId)
    } else if (req.user.role === "STUDENT") {
      // Students see exams assigned to them - FIXED: Use proper ObjectId comparison
      query.assignedTo = { $in: [new mongoose.Types.ObjectId(req.user.userId)] }
      console.log("Fetching exams assigned to student:", req.user.userId)
    }

    console.log("Exams query:", JSON.stringify(query, null, 2))

    const exams = await Exam.find(query)
      .populate("tutor", "fullName")
      .populate("assignedTo", "fullName email")
      .sort({ createdAt: -1 })

    console.log(`✅ Found ${exams.length} exams`)

    // Log exam details for debugging
    exams.forEach((exam) => {
      console.log(`Exam: ${exam.title}`)
      console.log(`  - Created by tutor: ${exam.tutor?._id}`)
      console.log(`  - Assigned to: ${exam.assignedTo?.length || 0} students`)
      console.log(`  - Student IDs: ${exam.assignedTo?.map((s) => s._id).join(", ")}`)
      console.log(`  - Start Date: ${exam.startDate}`)
      console.log(`  - End Date: ${exam.endDate}`)
      console.log(`  - Current Time: ${new Date()}`)
    })

    res.json(exams)
  } catch (error) {
    console.error("❌ Exams error:", error)
    res.status(500).json({ message: "Error fetching exams", error: error.message })
  }
})

app.post("/api/exams", auth, async (req, res) => {
  try {
    console.log("=== CREATE EXAM REQUEST ===")
    console.log("Request body:", { ...req.body, questions: `${req.body.questions?.length || 0} questions` })

    if (req.user.role !== "TUTOR") {
      return res.status(403).json({ message: "Only tutors can create exams" })
    }

    // Validate required fields
    const { title, subject, startDate, endDate, assignedTo, questions } = req.body

    if (!title || !subject || !startDate || !endDate) {
      return res.status(400).json({
        message: "Missing required fields",
        required: ["title", "subject", "startDate", "endDate"],
      })
    }

    if (!assignedTo || assignedTo.length === 0) {
      return res.status(400).json({ message: "Please assign the exam to at least one student" })
    }

    if (!questions || questions.length === 0) {
      return res.status(400).json({ message: "Please add at least one question" })
    }

    // Validate dates - FIXED: Proper date handling
    const start = new Date(startDate)
    const end = new Date(endDate)
    const now = new Date()

    console.log("Date validation:")
    console.log("  - Start date:", start.toISOString())
    console.log("  - End date:", end.toISOString())
    console.log("  - Current time:", now.toISOString())

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      return res.status(400).json({ message: "Invalid date format" })
    }

    if (end <= start) {
      return res.status(400).json({ message: "End date must be after start date" })
    }

    // Validate questions
    for (let i = 0; i < questions.length; i++) {
      const question = questions[i]
      if (!question.question || !question.question.trim()) {
        return res.status(400).json({ message: `Question ${i + 1} is empty` })
      }

      const hasCorrectAnswer = question.options && question.options.some((opt) => opt.isCorrect)
      if (!hasCorrectAnswer) {
        return res.status(400).json({ message: `Question ${i + 1} must have at least one correct answer` })
      }

      const hasEmptyOption = question.options && question.options.some((opt) => !opt.text || !opt.text.trim())
      if (hasEmptyOption) {
        return res.status(400).json({ message: `Question ${i + 1} has empty options` })
      }
    }

    console.log("Creating exam with assigned students:", assignedTo)

    // Convert assignedTo to ObjectIds if they're strings - FIXED
    const assignedToObjectIds = assignedTo.map((id) => {
      if (typeof id === "string") {
        return new mongoose.Types.ObjectId(id)
      }
      return id
    })

    const exam = new Exam({
      ...req.body,
      tutor: req.user.userId,
      assignedTo: assignedToObjectIds,
      startDate: start,
      endDate: end,
    })

    await exam.save()
    await exam.populate("tutor", "fullName")
    await exam.populate("assignedTo", "fullName email")

    console.log("✅ Exam created successfully:", exam._id)
    console.log(
      "Assigned to students:",
      exam.assignedTo.map((s) => `${s.fullName} (${s._id})`),
    )

    res.status(201).json({
      message: "Exam created successfully",
      exam,
    })
  } catch (error) {
    console.error("❌ Create exam error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get single exam with proper date handling
app.get("/api/exams/:id", auth, async (req, res) => {
  try {
    console.log("=== GET SINGLE EXAM REQUEST ===")
    console.log("Exam ID:", req.params.id)
    console.log("User:", req.user.userId, req.user.role)

    const exam = await Exam.findById(req.params.id)
      .populate("tutor", "fullName email")
      .populate("assignedTo", "fullName email")

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    // Check access permissions
    const hasAccess =
      (req.user.role === "TUTOR" && exam.tutor._id.toString() === req.user.userId) ||
      (req.user.role === "STUDENT" && exam.assignedTo.some((student) => student._id.toString() === req.user.userId))

    if (!hasAccess) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Add current time and exam status for frontend
    const now = new Date()
    const examWithStatus = {
      ...exam.toObject(),
      currentTime: now.toISOString(),
      isUpcoming: now < new Date(exam.startDate),
      isActive: now >= new Date(exam.startDate) && now <= new Date(exam.endDate),
      isCompleted: now > new Date(exam.endDate),
    }

    console.log("✅ Exam found and access granted")
    console.log("Exam status:", {
      isUpcoming: examWithStatus.isUpcoming,
      isActive: examWithStatus.isActive,
      isCompleted: examWithStatus.isCompleted,
    })

    res.json(examWithStatus)
  } catch (error) {
    console.error("❌ Get exam error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Submit exam endpoint
app.post("/api/exams/:id/submit", auth, async (req, res) => {
  try {
    console.log("=== SUBMIT EXAM REQUEST ===")
    console.log("Exam ID:", req.params.id)
    console.log("User:", req.user.userId, req.user.role)

    const examId = req.params.id
    const { answers, timeSpent, startedAt } = req.body

    console.log("Submission data:", {
      answersCount: answers?.length || 0,
      timeSpent,
      startedAt,
    })

    // Debug the answers format
    if (answers && answers.length > 0) {
      console.log("First answer format:", JSON.stringify(answers[0], null, 2))
    } else {
      console.log("WARNING: No answers provided or answers is not an array")
    }

    if (req.user.role !== "STUDENT") {
      return res.status(403).json({ message: "Only students can submit exams" })
    }

    const exam = await Exam.findById(examId)

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    // Check if student is assigned to this exam
    const isAssigned = exam.assignedTo.some((id) => id.toString() === req.user.userId)
    if (!isAssigned) {
      return res.status(403).json({ message: "You are not assigned to this exam" })
    }

    // Check if exam is still active
    const now = new Date()
    if (now < new Date(exam.startDate)) {
      return res.status(400).json({ message: "Exam has not started yet" })
    }

    if (now > new Date(exam.endDate)) {
      return res.status(400).json({ message: "Exam has ended" })
    }

    // Check if student has already submitted this exam
    const existingSubmissions = await ExamResult.find({
      exam: examId,
      student: req.user.userId,
    }).sort({ attemptNumber: -1 })

    const latestAttempt = existingSubmissions[0]
    const currentAttemptNumber = latestAttempt ? latestAttempt.attemptNumber + 1 : 1

    if (latestAttempt && currentAttemptNumber > exam.attemptLimit) {
      return res.status(400).json({
        message: "You have reached the maximum number of attempts for this exam",
        attemptsMade: latestAttempt.attemptNumber,
        attemptsAllowed: exam.attemptLimit,
      })
    }

    // Validate answers format
    if (!Array.isArray(answers)) {
      return res.status(400).json({
        message: "Invalid answers format. Expected an array of answers.",
        received: typeof answers,
      })
    }

    // Calculate score
    let score = 0
    let totalPoints = 0
    const processedAnswers = []

    exam.questions.forEach((question, index) => {
      const answer = answers.find((a) => a.questionId === question._id.toString() || a.questionId === `q${index}`) || {
        selectedOptions: [],
      }
      totalPoints += question.points

      let isCorrect = false
      if (question.type === "SINGLE") {
        // For single choice, check if the selected option is correct
        const selectedOption = answer.selectedOptions[0]
        if (selectedOption !== undefined && question.options[selectedOption]) {
          isCorrect = question.options[selectedOption].isCorrect
        }
      } else if (question.type === "MULTIPLE") {
        // For multiple choice, all correct options must be selected and no incorrect ones
        const correctOptionIndexes = question.options
          .map((opt, idx) => (opt.isCorrect ? idx : -1))
          .filter((idx) => idx !== -1)

        const selectedOptions = answer.selectedOptions || []

        // Check if all correct options are selected
        const allCorrectSelected = correctOptionIndexes.every((idx) => selectedOptions.includes(idx))

        // Check if no incorrect options are selected
        const noIncorrectSelected = selectedOptions.every((idx) => correctOptionIndexes.includes(idx))

        isCorrect = allCorrectSelected && noIncorrectSelected && selectedOptions.length > 0
      }

      if (isCorrect) {
        score += question.points
      }

      processedAnswers.push({
        questionId: question._id || `q${index}`,
        selectedOptions: answer.selectedOptions || [],
        isCorrect,
        points: isCorrect ? question.points : 0,
        timeSpent: answer.timeSpent || 0,
      })
    })

    const percentage = totalPoints > 0 ? (score / totalPoints) * 100 : 0
    const status = percentage >= exam.passingScore ? "PASS" : "FAIL"

    const examResult = new ExamResult({
      exam: examId,
      student: req.user.userId,
      answers: processedAnswers,
      score,
      totalPoints,
      percentage: Math.round(percentage * 100) / 100,
      status,
      timeSpent: timeSpent || 0,
      startedAt: new Date(startedAt),
      submittedAt: now,
      attemptNumber: currentAttemptNumber,
    })

    await examResult.save()

    console.log(`✅ Exam submitted successfully. Score: ${score}/${totalPoints} (${percentage.toFixed(1)}%)`)
    console.log(`Attempt number: ${currentAttemptNumber}`)

    res.json({
      message: "Exam submitted successfully",
      result: {
        id: examResult._id,
        score,
        totalPoints,
        percentage: examResult.percentage,
        status,
        attemptNumber: currentAttemptNumber,
      },
    })
  } catch (error) {
    console.error("❌ Submit exam error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get exam results for a student
app.get("/api/exams/:id/results", auth, async (req, res) => {
  try {
    console.log("=== GET EXAM RESULTS REQUEST ===")
    console.log("Exam ID:", req.params.id)
    console.log("User:", req.user.userId, req.user.role)

    const examId = req.params.id

    // Find the exam
    const exam = await Exam.findById(examId)

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    // Check permissions
    const isTutor = req.user.role === "TUTOR" && exam.tutor.toString() === req.user.userId
    const isStudent = req.user.role === "STUDENT" && exam.assignedTo.some((id) => id.toString() === req.user.userId)

    if (!isTutor && !isStudent) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Query based on role
    const query = { exam: examId }

    if (isStudent) {
      // Students can only see their own results
      query.student = req.user.userId
    }

    const results = await ExamResult.find(query)
      .populate("student", "fullName email studentId")
      .sort({ submittedAt: -1 })

    console.log(`✅ Found ${results.length} exam results`)

    res.json(results)
  } catch (error) {
    console.error("❌ Get exam results error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Get specific exam result
app.get("/api/exams/:examId/results/:resultId", auth, async (req, res) => {
  try {
    console.log("=== GET SPECIFIC EXAM RESULT REQUEST ===")
    console.log("Exam ID:", req.params.examId)
    console.log("Result ID:", req.params.resultId)
    console.log("User:", req.user.userId, req.user.role)

    const { examId, resultId } = req.params

    // Find the result with populated exam and student
    const result = await ExamResult.findById(resultId).populate("exam").populate("student", "fullName email studentId")

    if (!result || result.exam._id.toString() !== examId) {
      return res.status(404).json({ message: "Result not found" })
    }

    // Check permissions
    const isTutor = req.user.role === "TUTOR" && result.exam.tutor.toString() === req.user.userId
    const isStudent = req.user.role === "STUDENT" && result.student._id.toString() === req.user.userId

    if (!isTutor && !isStudent) {
      return res.status(403).json({ message: "Access denied" })
    }

    // If student and showCorrectAnswers is false, remove correct answer info
    if (isStudent && !result.exam.showCorrectAnswers) {
      // Create a copy without correct answer information
      const sanitizedResult = result.toObject()

      // Remove isCorrect flag and correct options from questions
      if (sanitizedResult.exam && sanitizedResult.exam.questions) {
        sanitizedResult.exam.questions = sanitizedResult.exam.questions.map((q) => {
          // Remove isCorrect flag from options
          if (q.options) {
            q.options = q.options.map((opt) => ({
              text: opt.text,
              // isCorrect is omitted
            }))
          }
          return q
        })
      }

      console.log("✅ Returning sanitized result (hiding correct answers)")
      return res.json(sanitizedResult)
    }

    console.log("✅ Returning full result with correct answers")
    res.json(result)
  } catch (error) {
    console.error("❌ Get specific exam result error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Clear exam attempts (for testing purposes only)
app.delete("/api/exams/:id/attempts", auth, async (req, res) => {
  try {
    console.log("=== CLEAR EXAM ATTEMPTS REQUEST ===")
    console.log("Exam ID:", req.params.id)
    console.log("User:", req.user.userId, req.user.role)

    const examId = req.params.id

    // Only allow students to clear their own attempts or tutors to clear any attempts for their exams
    const exam = await Exam.findById(examId)

    if (!exam) {
      return res.status(404).json({ message: "Exam not found" })
    }

    // Check permissions
    const isTutor = req.user.role === "TUTOR" && exam.tutor.toString() === req.user.userId
    const isStudent = req.user.role === "STUDENT" && exam.assignedTo.some((id) => id.toString() === req.user.userId)

    if (!isTutor && !isStudent) {
      return res.status(403).json({ message: "Access denied" })
    }

    // Query based on role
    const query = { exam: examId }

    if (isStudent) {
      // Students can only clear their own attempts
      query.student = req.user.userId
    }

    const deletedResults = await ExamResult.deleteMany(query)

    console.log(`✅ Cleared ${deletedResults.deletedCount} exam attempts`)

    res.json({
      message: `Successfully cleared ${deletedResults.deletedCount} exam attempt(s)`,
      deletedCount: deletedResults.deletedCount,
    })
  } catch (error) {
    console.error("❌ Clear exam attempts error:", error)
    res.status(500).json({ message: "Server error", error: error.message })
  }
})

// Delete exam (Tutor only)
app.delete("/api/exams/:id", auth, async (req, res) => {
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
app.delete("/api/exams/bulk/delete", auth, async (req, res) => {
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

// 404 handler
app.use("*", (req, res) => {
  console.log("❌ 404 - Route not found:", req.method, req.originalUrl)
  res.status(404).json({
    message: "Route not found",
    method: req.method,
    path: req.originalUrl,
    availableRoutes: [
      "GET /health",
      "POST /api/auth/register",
      "POST /api/auth/login",
      "GET /api/auth/me",
      "GET /api/users",
      "GET /api/tasks",
      "POST /api/tasks",
      "GET /api/exams",
      "POST /api/exams",
      "GET /api/exams/:id",
      "POST /api/exams/:id/submit",
      "GET /api/exams/:id/results",
      "GET /api/exams/:examId/results/:resultId",
      "DELETE /api/exams/:id/attempts",
    ],
  })
})

// Start server
const PORT = process.env.PORT || 5001
app.listen(PORT, "0.0.0.0", () => {
  console.log(`
🚀 Production server running!

📡 Server listening on port ${PORT}
🔗 Health check: http://localhost:${PORT}/health
🔗 Register endpoint: http://localhost:${PORT}/api/auth/register (POST)
🔗 Login endpoint: http://localhost:${PORT}/api/auth/login (POST)
🔗 Me endpoint: http://localhost:${PORT}/api/auth/me (GET)
🔗 Users endpoint: http://localhost:${PORT}/api/users (GET)
🔗 Tasks endpoint: http://localhost:${PORT}/api/tasks (GET/POST)
🔗 Exams endpoint: http://localhost:${PORT}/api/exams (GET/POST)
🔗 Submit exam: http://localhost:${PORT}/api/exams/:id/submit (POST)
🔗 Exam results: http://localhost:${PORT}/api/exams/:id/results (GET)
🔗 Clear attempts: http://localhost:${PORT}/api/exams/:id/attempts (DELETE)

This is the production server with MongoDB integration.
`)
})
