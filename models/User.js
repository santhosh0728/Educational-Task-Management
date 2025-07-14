const mongoose = require("mongoose")
const bcrypt = require("bcryptjs")

const userSchema = new mongoose.Schema(
  {
    fullName: {
      type: String,
      required: [true, "Full name is required"],
      trim: true,
      minlength: [2, "Full name must be at least 2 characters"],
      maxlength: [50, "Full name cannot exceed 50 characters"],
    },
    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, "Please enter a valid email"],
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
    },
    role: {
      type: String,
      required: [true, "Role is required"],
      enum: {
        values: ["STUDENT", "TUTOR"],
        message: "Role must be either STUDENT or TUTOR",
      },
    },
    institution: {
      type: String,
      required: [true, "Institution is required"],
      trim: true,
    },
    studentId: {
      type: String,
      trim: true,
      required: function () {
        return this.role === "STUDENT"
      },
    },
    subjects: {
      type: [String],
      default: [],
      validate: {
        validator: function (subjects) {
          return this.role !== "TUTOR" || subjects.length > 0
        },
        message: "Tutors must have at least one subject",
      },
    },
    enrolledSubjects: {
      type: [String],
      default: [],
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
      default: Date.now,
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "auto"],
        default: "light",
      },
      notifications: {
        email: { type: Boolean, default: true },
        push: { type: Boolean, default: true },
        sms: { type: Boolean, default: false },
      },
      language: {
        type: String,
        default: "en",
      },
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: (doc, ret) => {
        delete ret.password
        return ret
      },
    },
  },
)

// Hash password before saving
userSchema.pre("save", async function (next) {
  try {
    // Only hash the password if it has been modified (or is new)
    if (!this.isModified("password")) return next()

    console.log("🔐 Hashing password for user:", this.email)

    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12)
    this.password = await bcrypt.hash(this.password, salt)

    console.log("✅ Password hashed successfully")
    next()
  } catch (error) {
    console.error("❌ Error hashing password:", error)
    next(error)
  }
})

// Compare password method
userSchema.methods.comparePassword = async function (candidatePassword) {
  try {
    console.log("🔍 Comparing password for user:", this.email)
    const isMatch = await bcrypt.compare(candidatePassword, this.password)
    console.log("🔐 Password match result:", isMatch ? "✅ Valid" : "❌ Invalid")
    return isMatch
  } catch (error) {
    console.error("❌ Error comparing password:", error)
    throw error
  }
}

// Create indexes
userSchema.index({ email: 1 })
userSchema.index({ role: 1 })
userSchema.index({ institution: 1 })

const User = mongoose.model("User", userSchema)

module.exports = User
