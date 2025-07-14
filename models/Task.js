const mongoose = require("mongoose")

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: true,
      maxlength: 2000,
    },
    subject: {
      type: String,
      required: true,
      trim: true,
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
    dueDate: {
      type: Date,
      required: true,
      validate: {
        validator: (value) => value > new Date(),
        message: "Due date must be in the future",
      },
    },
    priority: {
      type: String,
      enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      default: "MEDIUM",
    },
    status: {
      type: String,
      enum: ["ASSIGNED", "IN_PROGRESS", "SUBMITTED", "REVIEWED", "COMPLETED"],
      default: "ASSIGNED",
    },
    attachments: [
      {
        filename: String,
        originalName: String,
        path: String,
        mimetype: String,
        size: Number,
        uploadedAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
    instructions: {
      type: String,
      maxlength: 1000,
    },
    submissions: [
      {
        student: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
          required: true,
        },
        files: [
          {
            filename: String,
            originalName: String,
            path: String,
            mimetype: String,
            size: Number,
            uploadedAt: {
              type: Date,
              default: Date.now,
            },
          },
        ],
        submittedAt: {
          type: Date,
          default: Date.now,
        },
        feedback: {
          type: String,
          maxlength: 1000,
        },
        grade: {
          type: Number,
          min: 0,
          max: 100,
        },
        status: {
          type: String,
          enum: ["SUBMITTED", "REVIEWED", "GRADED"],
          default: "SUBMITTED",
        },
        reviewedAt: Date,
        reviewedBy: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    maxScore: {
      type: Number,
      default: 100,
      min: 1,
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

// Index for better query performance
taskSchema.index({ tutor: 1, createdAt: -1 })
taskSchema.index({ assignedTo: 1, dueDate: 1 })
taskSchema.index({ status: 1 })

module.exports = mongoose.model("Task", taskSchema)
