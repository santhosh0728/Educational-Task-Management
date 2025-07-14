// src/types.js

// Dummy shape placeholders (can be used with PropTypes or for clarity)
// These are just for reference and won't affect runtime unless you use PropTypes or TypeScript

export const Task = {
  id: '',
  title: '',
  subject: '',
  dueDate: '',
  status: '',
  type: '' // 'quiz', 'exam', 'assignment'
};

export const Subject = {
  id: '',
  name: '',
  color: '',
  taskCount: 0,
  completedCount: 0
};

export const Announcement = {
  id: '',
  title: '',
  message: '',
  type: '', // 'info', 'success', 'warning'
  date: '',
  isNew: false
};
