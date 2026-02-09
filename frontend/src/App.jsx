import { useState, useEffect } from 'react'

const API_URL = 'http://localhost:8000/api/tasks'

function App() {
  const [tasks, setTasks] = useState([])
  const [newTaskTitle, setNewTaskTitle] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await fetch(API_URL)
      if (!response.ok) throw new Error('Failed to fetch tasks')
      const data = await response.json()
      // Sort: incomplete first, then by creation date (newest first)
      const sorted = data.sort((a, b) => {
        if (a.is_completed === b.is_completed) {
          return new Date(b.created_at) - new Date(a.created_at)
        }
        return a.is_completed ? 1 : -1
      })
      setTasks(sorted)
      setError(null)
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const addTask = async (e) => {
    e.preventDefault()
    if (!newTaskTitle.trim()) return

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ title: newTaskTitle }),
      })
      if (!response.ok) throw new Error('Failed to create task')
      setNewTaskTitle('')
      fetchTasks()
    } catch (err) {
      alert(err.message)
    }
  }

  const completeTask = async (id) => {
    try {
      const response = await fetch(`${API_URL}/${id}/complete`, {
        method: 'PATCH',
      })
      if (!response.ok) throw new Error('Failed to complete task')
      fetchTasks()
    } catch (err) {
      alert(err.message)
    }
  }

  return (
    <div className="min-h-screen bg-slate-100 py-10 px-4">
      <div className="max-w-md mx-auto bg-white rounded-xl shadow-md overflow-hidden md:max-w-2xl p-6">
        <h1 className="text-3xl font-bold text-slate-800 mb-6">Task Manager</h1>

        {/* Add Task Form */}
        <form onSubmit={addTask} className="mb-8 flex gap-2">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="What needs to be done?"
            className="flex-1 p-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            type="submit"
            className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors"
          >
            Add
          </button>
        </form>

        {/* Error Message */}
        {error && (
          <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-lg text-sm">
            Error: {error}. Make sure backend services are running.
          </div>
        )}

        {/* Task List */}
        {loading ? (
          <div className="text-center text-slate-500">Loading tasks...</div>
        ) : (
          <ul className="space-y-3">
            {tasks.length === 0 && !error && (
              <li className="text-center text-slate-400 italic">No tasks yet. Add one above!</li>
            )}
            {tasks.map((task) => (
              <li
                key={task.id}
                className={`flex items-center justify-between p-4 rounded-lg border ${task.is_completed
                    ? 'bg-slate-50 border-slate-200'
                    : 'bg-white border-slate-200 shadow-sm'
                  }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${task.is_completed ? 'border-green-500 bg-green-50' : 'border-slate-300'
                    }`}>
                    {task.is_completed && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
                  </div>
                  <span className={`text-lg ${task.is_completed ? 'text-slate-400 line-through' : 'text-slate-700'}`}>
                    {task.title}
                  </span>
                </div>
                {!task.is_completed && (
                  <button
                    onClick={() => completeTask(task.id)}
                    className="text-sm text-indigo-600 hover:text-indigo-800 font-medium px-3 py-1 rounded hover:bg-indigo-50 transition-colors"
                  >
                    Check
                  </button>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}

export default App
