const mongoose = require("mongoose")

const messageSchema = new mongoose.Schema(
  {
    roomId: {
      type: String,
      required: true,
      index: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    messageType: {
      type: String,
      enum: ["text", "image", "file", "system"],
      default: "text",
    },
    attachments: [
      {
        fileUrl: String,
        fileName: String,
        fileType: String,
        fileSize: Number,
      },
    ],
    readBy: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
    ],
    readAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  },
)

// Create indexes for faster queries
messageSchema.index({ roomId: 1, createdAt: -1 })
messageSchema.index({ sender: 1 })

const Message = mongoose.model("Message", messageSchema)

module.exports = Message
