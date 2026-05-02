import React, { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { calendarAPI } from '../utils/api';

export default function ContentCalendar() {
  const { user, isAuthenticated } = useAuth();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);

  const [scheduleForm, setScheduleForm] = useState({
    contentId: '',
    scheduledTime: '',
    platforms: [],
  });

  useEffect(() => {
    if (isAuthenticated && user?.id) {
      fetchCalendarEvents();
    }
  }, [currentDate, user?.id, isAuthenticated]);

  const fetchCalendarEvents = async () => {
    try {
      setLoading(true);
      const year = currentDate.getFullYear();
      const month = currentDate.getMonth() + 1;
      const data = await calendarAPI.getMonth(user.id, year, month);
      setEvents(data);
    } catch (err) {
      setError(err.message || 'Failed to load calendar');
    } finally {
      setLoading(false);
    }
  };

  const handleScheduleContent = async (e) => {
    e.preventDefault();
    try {
      if (!scheduleForm.contentId || !scheduleForm.scheduledTime) {
        throw new Error('Content ID and scheduled time are required');
      }

      await calendarAPI.addEvent({
        userId: user.id,
        contentId: scheduleForm.contentId,
        scheduledTime: scheduleForm.scheduledTime,
        platforms: scheduleForm.platforms,
      });

      setSuccess('Content scheduled successfully!');
      setScheduleForm({ contentId: '', scheduledTime: '', platforms: [] });
      fetchCalendarEvents();
      setTimeout(() => setSuccess(null), 2000);
    } catch (err) {
      setError(err.message || 'Failed to schedule');
    }
  };

  if (!isAuthenticated) {
    return <div className="p-8 text-center"><p className="text-gray-600">Please log in</p></div>;
  }

  const daysInMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() + 1, 0).getDate();
  const monthName = currentDate.toLocaleDateString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold text-gray-900 mb-8">Content Calendar</h1>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
      {success && <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">{success}</div>}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Schedule Form */}
        <div className="bg-white rounded-lg shadow p-6">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Schedule Content</h3>

          <form onSubmit={handleScheduleContent} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Content ID</label>
              <input
                type="text"
                value={scheduleForm.contentId}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, contentId: e.target.value }))}
                placeholder="Enter content ID"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Scheduled Time</label>
              <input
                type="datetime-local"
                value={scheduleForm.scheduledTime}
                onChange={(e) => setScheduleForm((prev) => ({ ...prev, scheduledTime: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Platforms</label>
              <div className="space-y-2">
                {['linkedin', 'twitter', 'instagram', 'facebook'].map((p) => (
                  <label key={p} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={scheduleForm.platforms.includes(p)}
                      onChange={(e) =>
                        setScheduleForm((prev) => ({
                          ...prev,
                          platforms: e.target.checked
                            ? [...prev.platforms, p]
                            : prev.platforms.filter((x) => x !== p),
                        }))
                      }
                      className="mr-2"
                    />
                    <span className="text-sm capitalize">{p}</span>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              className="w-full px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 font-medium"
            >
              Schedule
            </button>
          </form>
        </div>

        {/* Calendar */}
        <div className="lg:col-span-2 bg-white rounded-lg shadow p-6">
          <div className="flex justify-between items-center mb-6">
            <h3 className="text-lg font-bold text-gray-900">{monthName}</h3>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() - 1))}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                ←
              </button>
              <button
                onClick={() => setCurrentDate(new Date(currentDate.getFullYear(), currentDate.getMonth() + 1))}
                className="px-3 py-1 bg-gray-200 rounded hover:bg-gray-300"
              >
                →
              </button>
            </div>
          </div>

          {loading ? (
            <p className="text-center py-8">Loading calendar...</p>
          ) : (
            <div className="space-y-3">
              {events.map((day) => (
                <div key={day.date} className="border border-gray-200 rounded-lg p-3">
                  <p className="font-bold text-gray-900 mb-2">{day.date}</p>
                  {day.events?.map((event, idx) => (
                    <div key={idx} className="text-xs bg-blue-50 p-2 rounded mb-1">
                      <p className="font-medium">{event.title}</p>
                      <p className="text-gray-600">{event.platforms?.join(', ')}</p>
                    </div>
                  ))}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
