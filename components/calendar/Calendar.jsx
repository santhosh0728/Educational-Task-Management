"use client"

import { useState, useEffect } from "react"
import { useAuth } from "../../contexts/AuthContext"
import toast from "react-hot-toast"

const Calendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date())
  const [events, setEvents] = useState([])
  const [loading, setLoading] = useState(true)
  const [showCreateEventModal, setShowCreateEventModal] = useState(false)
  const [newEvent, setNewEvent] = useState({
    title: "",
    description: "",
    date: "",
    time: "",
    type: "task",
    subject: ""
  })
  const { user } = useAuth()

  useEffect(() => {
    fetchEvents()
  }, [currentDate])

  const fetchEvents = async () => {
    try {
      setLoading(true)
      // Simulate API call
      setTimeout(() => {
        const mockEvents = [
          {
            id: 1,
            title: "Mathematics Quiz",
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 15),
            type: "exam",
            subject: "Mathematics",
          },
          {
            id: 2,
            title: "Physics Assignment Due",
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 18),
            type: "task",
            subject: "Physics",
          },
          {
            id: 3,
            title: "Chemistry Lab Report",
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 22),
            type: "task",
            subject: "Chemistry",
          },
          {
            id: 4,
            title: "English Literature Essay",
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 10),
            type: "task",
            subject: "English",
          },
          {
            id: 5,
            title: "Biology Final Exam",
            date: new Date(currentDate.getFullYear(), currentDate.getMonth(), 28),
            type: "exam",
            subject: "Biology",
          },
        ]
        setEvents(mockEvents)
        setLoading(false)
      }, 1000)
    } catch (error) {
      console.error("Error fetching events:", error)
      setLoading(false)
    }
  }

  const handleCreateEvent = () => {
    setShowCreateEventModal(true)
  }

  const saveEvent = () => {
    if (!newEvent.title || !newEvent.date) {
      toast.error("Please fill in all required fields")
      return
    }

    const eventDate = new Date(newEvent.date + (newEvent.time ? `T${newEvent.time}` : 'T09:00'))
    
    const event = {
      id: Date.now(),
      title: newEvent.title,
      description: newEvent.description,
      date: eventDate,
      type: newEvent.type,
      subject: newEvent.subject
    }

    setEvents(prev => [...prev, event])
    setShowCreateEventModal(false)
    setNewEvent({
      title: "",
      description: "",
      date: "",
      time: "",
      type: "task",
      subject: ""
    })
    toast.success("Event created successfully!")
  }

  const daysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate()
  }

  const firstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay()
  }

  const prevMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, 1))
  }

  const nextMonth = () => {
    setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 1))
  }

  const renderCalendar = () => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const totalDays = daysInMonth(year, month)
    const firstDay = firstDayOfMonth(year, month)
    const today = new Date()

    const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const calendarDays = []

    // Add empty cells for days before the first day of the month
    for (let i = 0; i < firstDay; i++) {
      calendarDays.push(
        <div key={`empty-${i}`} className="calendar-day empty">
          <div className="day-number"></div>
        </div>
      )
    }

    // Add cells for each day of the month
    for (let day = 1; day <= totalDays; day++) {
      const date = new Date(year, month, day)
      const isToday = today.getDate() === day && today.getMonth() === month && today.getFullYear() === year

      // Get events for this day
      const dayEvents = events.filter(
        (event) => event.date.getDate() === day && event.date.getMonth() === month && event.date.getFullYear() === year,
      )

      calendarDays.push(
        <div
          key={`day-${day}`}
          className={`calendar-day ${isToday ? "today" : ""}`}
        >
          <div className="day-number">{day}</div>
          <div className="day-events">
            {dayEvents.slice(0, 2).map((event) => (
              <div
                key={event.id}
                className={`event-item ${event.type === "exam" ? "exam" : "task"}`}
                title={`${event.title} - ${event.subject}`}
              >
                <i className={`bi ${event.type === "exam" ? "bi-clipboard-check" : "bi-list-task"}`}></i>
                <span className="event-title">{event.title}</span>
              </div>
            ))}
            {dayEvents.length > 2 && (
              <div className="event-more">+{dayEvents.length - 2} more</div>
            )}
          </div>
        </div>
      )
    }

    return (
      <div className="calendar-container">
        {/* Calendar Header */}
        <div className="calendar-header">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h3 className="mb-0">
              {currentDate.toLocaleString("default", { month: "long" })} {currentDate.getFullYear()}
            </h3>
            <div className="btn-group">
              <button className="btn btn-outline-primary" onClick={prevMonth}>
                <i className="bi bi-chevron-left"></i>
              </button>
              <button className="btn btn-outline-primary" onClick={() => setCurrentDate(new Date())}>
                Today
              </button>
              <button className="btn btn-outline-primary" onClick={nextMonth}>
                <i className="bi bi-chevron-right"></i>
              </button>
            </div>
          </div>
        </div>

        {/* Weekday Headers */}
        <div className="calendar-weekdays">
          {weekdays.map((day) => (
            <div key={day} className="weekday-header">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="calendar-grid">
          {calendarDays}
        </div>
      </div>
    )
  }

  return (
    <div className="container-fluid py-3">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0">
          <i className="bi bi-calendar me-2"></i>
          Calendar
        </h2>
        {user?.role === "TUTOR" && (
          <button className="btn btn-primary" onClick={handleCreateEvent}>
            <i className="bi bi-plus-lg me-2"></i>
            Add Event
          </button>
        )}
      </div>

      <div className="card shadow-sm">
        <div className="card-body">
          {loading ? (
            <div className="d-flex justify-content-center align-items-center p-5">
              <div className="spinner-border text-primary\" role="status">
                <span className="visually-hidden">Loading...</span>
              </div>
            </div>
          ) : (
            renderCalendar()
          )}
        </div>
      </div>

      {/* Create Event Modal */}
      {showCreateEventModal && (
        <div className="modal show d-block" style={{ backgroundColor: "rgba(0,0,0,0.5)" }}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className="bi bi-calendar-plus me-2"></i>
                  Create New Event
                </h5>
                <button 
                  type="button" 
                  className="btn-close"
                  onClick={() => setShowCreateEventModal(false)}
                ></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Event Title *</label>
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Enter event title"
                    value={newEvent.title}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, title: e.target.value }))}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows="3"
                    placeholder="Enter event description"
                    value={newEvent.description}
                    onChange={(e) => setNewEvent(prev => ({ ...prev, description: e.target.value }))}
                  ></textarea>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Date *</label>
                    <input
                      type="date"
                      className="form-control"
                      value={newEvent.date}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, date: e.target.value }))}
                    />
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Time</label>
                    <input
                      type="time"
                      className="form-control"
                      value={newEvent.time}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, time: e.target.value }))}
                    />
                  </div>
                </div>
                <div className="row mb-3">
                  <div className="col-md-6">
                    <label className="form-label">Type</label>
                    <select
                      className="form-select"
                      value={newEvent.type}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, type: e.target.value }))}
                    >
                      <option value="task">Task</option>
                      <option value="exam">Exam</option>
                      <option value="meeting">Meeting</option>
                      <option value="deadline">Deadline</option>
                    </select>
                  </div>
                  <div className="col-md-6">
                    <label className="form-label">Subject</label>
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Enter subject"
                      value={newEvent.subject}
                      onChange={(e) => setNewEvent(prev => ({ ...prev, subject: e.target.value }))}
                    />
                  </div>
                </div>
              </div>
              <div className="modal-footer">
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={() => setShowCreateEventModal(false)}
                >
                  Cancel
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={saveEvent}
                  disabled={!newEvent.title || !newEvent.date}
                >
                  <i className="bi bi-check me-2"></i>
                  Create Event
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <style jsx>{`
        .calendar-container {
          width: 100%;
        }

        .calendar-weekdays {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          margin-bottom: 1px;
          background-color: #e5e7eb;
        }

        .weekday-header {
          background-color: #f8fafc;
          padding: 1rem;
          text-align: center;
          font-weight: 600;
          color: #374151;
          text-transform: uppercase;
          font-size: 0.875rem;
          letter-spacing: 0.05em;
        }

        .calendar-grid {
          display: grid;
          grid-template-columns: repeat(7, 1fr);
          gap: 1px;
          background-color: #e5e7eb;
        }

        .calendar-day {
          background-color: white;
          min-height: 120px;
          padding: 0.75rem;
          display: flex;
          flex-direction: column;
          transition: all 0.2s ease;
          cursor: pointer;
        }

        .calendar-day:hover {
          background-color: #f8fafc;
        }

        .calendar-day.today {
          background-color: #dbeafe;
          border: 2px solid #3b82f6;
        }

        .calendar-day.empty {
          background-color: #f9fafb;
          opacity: 0.5;
          cursor: default;
        }

        .calendar-day.empty:hover {
          background-color: #f9fafb;
        }

        .day-number {
          font-weight: 600;
          color: #1f2937;
          margin-bottom: 0.5rem;
          font-size: 0.875rem;
        }

        .calendar-day.today .day-number {
          color: #1d4ed8;
          font-weight: 700;
        }

        .day-events {
          flex: 1;
          display: flex;
          flex-direction: column;
          gap: 0.25rem;
        }

        .event-item {
          display: flex;
          align-items: center;
          gap: 0.25rem;
          padding: 0.25rem 0.5rem;
          border-radius: 4px;
          font-size: 0.75rem;
          font-weight: 500;
          line-height: 1.2;
          transition: all 0.2s ease;
        }

        .event-item:hover {
          transform: translateY(-1px);
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
        }

        .event-item.exam {
          background-color: #fef2f2;
          color: #dc2626;
          border: 1px solid #fecaca;
        }

        .event-item.task {
          background-color: #eff6ff;
          color: #2563eb;
          border: 1px solid #bfdbfe;
        }

        .event-title {
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }

        .event-more {
          font-size: 0.7rem;
          color: #6b7280;
          font-weight: 500;
          text-align: center;
          padding: 0.125rem;
        }

        @media (max-width: 768px) {
          .calendar-day {
            min-height: 80px;
            padding: 0.5rem;
          }

          .weekday-header {
            padding: 0.75rem 0.5rem;
            font-size: 0.75rem;
          }

          .event-item {
            font-size: 0.7rem;
            padding: 0.125rem 0.25rem;
          }

          .day-number {
            font-size: 0.8rem;
          }
        }

        @media (max-width: 480px) {
          .calendar-day {
            min-height: 60px;
            padding: 0.25rem;
          }

          .weekday-header {
            padding: 0.5rem 0.25rem;
            font-size: 0.7rem;
          }

          .event-item {
            font-size: 0.65rem;
          }

          .event-title {
            display: none;
          }

          .event-item {
            justify-content: center;
            width: 16px;
            height: 16px;
            border-radius: 50%;
            padding: 0;
          }
        }
      `}</style>
    </div>
  )
}

export default Calendar