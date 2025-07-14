const express = require("express")
const router = express.Router()
const auth = require("../middleware/auth")
const Message = require("../models/Message")

// Get chat messages for a specific room/conversation
router.get("/:roomId", auth, async (req, res) => {
  try {
    const { roomId } = req.params
    const { page = 1, limit = 50 } = req.query

    const messages = await Message.find({ roomId })
      .populate("sender", "name email role")
      .sort({ createdAt: -1 })
      .limit(limit * 1)
      .skip((page - 1) * limit)
      .exec()

    res.json({
      success: true,
      messages: messages.reverse(), // Reverse to show oldest first
      pagination: {
        page: Number.parseInt(page),
        limit: Number.parseInt(limit),
        total: await Message.countDocuments({ roomId }),
      },
    })
  } catch (error) {
    console.error("Error fetching messages:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching messages",
      error: error.message,
    })
  }
})

// Send a new message
router.post("/", auth, async (req, res) => {
  try {
    const { roomId, content, messageType = "text" } = req.body

    if (!roomId || !content) {
      return res.status(400).json({
        success: false,
        message: "Room ID and content are required",
      })
    }

    const newMessage = new Message({
      roomId,
      sender: req.user.id,
      content,
      messageType,
      timestamp: new Date(),
    })

    await newMessage.save()

    // Populate sender info before sending response
    await newMessage.populate("sender", "name email role")

    res.status(201).json({
      success: true,
      message: "Message sent successfully",
      data: newMessage,
    })
  } catch (error) {
    console.error("Error sending message:", error)
    res.status(500).json({
      success: false,
      message: "Error sending message",
      error: error.message,
    })
  }
})

// Get chat rooms for a user
router.get("/rooms/user", auth, async (req, res) => {
  try {
    const userId = req.user.id

    // Find all rooms where user has sent messages
    const userRooms = await Message.distinct("roomId", { sender: userId })

    // Get latest message for each room
    const roomsWithLatestMessage = await Promise.all(
      userRooms.map(async (roomId) => {
        const latestMessage = await Message.findOne({ roomId })
          .populate("sender", "name email role")
          .sort({ createdAt: -1 })
          .exec()

        const messageCount = await Message.countDocuments({ roomId })

        return {
          roomId,
          latestMessage,
          messageCount,
          lastActivity: latestMessage?.createdAt,
        }
      }),
    )

    // Sort by last activity
    roomsWithLatestMessage.sort((a, b) => new Date(b.lastActivity) - new Date(a.lastActivity))

    res.json({
      success: true,
      rooms: roomsWithLatestMessage,
    })
  } catch (error) {
    console.error("Error fetching user rooms:", error)
    res.status(500).json({
      success: false,
      message: "Error fetching chat rooms",
      error: error.message,
    })
  }
})

// Delete a message (only sender or admin can delete)
router.delete("/:messageId", auth, async (req, res) => {
  try {
    const { messageId } = req.params
    const userId = req.user.id
    const userRole = req.user.role

    const message = await Message.findById(messageId)

    if (!message) {
      return res.status(404).json({
        success: false,
        message: "Message not found",
      })
    }

    // Check if user is the sender or an admin
    if (message.sender.toString() !== userId && userRole !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "You can only delete your own messages",
      })
    }

    await Message.findByIdAndDelete(messageId)

    res.json({
      success: true,
      message: "Message deleted successfully",
    })
  } catch (error) {
    console.error("Error deleting message:", error)
    res.status(500).json({
      success: false,
      message: "Error deleting message",
      error: error.message,
    })
  }
})

// Mark messages as read
router.put("/read/:roomId", auth, async (req, res) => {
  try {
    const { roomId } = req.params
    const userId = req.user.id

    await Message.updateMany(
      {
        roomId,
        sender: { $ne: userId }, // Don't mark own messages as read
        readBy: { $ne: userId },
      },
      {
        $addToSet: { readBy: userId },
        $set: { readAt: new Date() },
      },
    )

    res.json({
      success: true,
      message: "Messages marked as read",
    })
  } catch (error) {
    console.error("Error marking messages as read:", error)
    res.status(500).json({
      success: false,
      message: "Error marking messages as read",
      error: error.message,
    })
  }
})

module.exports = router
