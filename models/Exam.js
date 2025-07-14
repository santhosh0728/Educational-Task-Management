const mongoose = require("mongoose")

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ["SINGLE", "MULTIPLE"],
    default: "SINGLE",
  },
  options: [
    {
      text: String,
      isCorrect: Boolean,
    },
  ],
  explanation: {
    type: String,
  },
  topic: {
    type: String,
  },
  difficulty: {
    type: String,
    enum: ["EASY", "MEDIUM", "HARD"],
    default: "MEDIUM",
  },
  points: {
    type: Number,
    default: 1,
  },
})

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
    },
    subject: {
      type: String,
      required: true,
    },
    tutor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    assignedTo: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    questions: [questionSchema],
    duration: {
      type: Number, // in minutes
      required: true,
    },
    startDate: {
      type: Date,
      required: true,
    },
    endDate: {
      type: Date,
      required: true,
    },
    attemptLimit: {
      type: Number,
      default: 1,
    },
    passingScore: {
      type: Number,
      default: 60,
    },
    showResultsImmediately: {
      type: Boolean,
      default: false,
    },
    showCorrectAnswers: {
      type: Boolean,
      default: false,
    },
    randomizeQuestions: {
      type: Boolean,
      default: false,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  {
    timestamps: true,
  },
)

const examResultSchema = new mongoose.Schema(
  {
    exam: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Exam",
      required: true,
    },
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    answers: [
      {
        questionId: mongoose.Schema.Types.ObjectId,
        selectedOptions: [Number],
        isCorrect: Boolean,
        points: Number,
        timeSpent: Number, // in seconds
      },
    ],
    score: {
      type: Number,
      required: true,
    },
    totalPoints: {
      type: Number,
      required: true,
    },
    percentage: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["PASS", "FAIL"],
      required: true,
    },
    timeSpent: {
      type: Number, // in minutes
      required: true,
    },
    startedAt: {
      type: Date,
      required: true,
    },
    submittedAt: {
      type: Date,
      required: true,
    },
    attemptNumber: {
      type: Number,
      default: 1,
    },
  },
  {
    timestamps: true,
  },
)

const Exam = mongoose.model("Exam", examSchema)
const ExamResult = mongoose.model("ExamResult", examResultSchema)

module.exports = { Exam, ExamResult }
