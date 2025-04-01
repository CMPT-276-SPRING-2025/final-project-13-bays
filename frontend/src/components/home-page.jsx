"use client"

import { useState } from "react"
import { Trash2, Menu, PlusCircle, AlertTriangle, X, Calendar, Clock, Check } from "lucide-react"

export default function HomePage() {
  // State for view mode (list or calendar)
  const [viewMode, setViewMode] = useState("list")

  // State for selected category - now defaulting to "Urgent"
  const [selectedCategory, setSelectedCategory] = useState("Urgent")

  // Get today's date in YYYY-MM-DD format for min date validation
  const today = new Date().toISOString().split("T")[0]

  // State for new project modal
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    dueDate: today,
    difficulty: "Easy",
    saveTabs: true,
  })

  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)

  // State for completion confirmation
  const [showCompletionConfirm, setShowCompletionConfirm] = useState(false)
  const [projectToComplete, setProjectToComplete] = useState(null)

  // Sample project data - Archived section starts empty
  const [projects, setProjects] = useState([
    {
      id: 1,
      name: "Learning TypeScript",
      progress: 60,
      timeLeft: "5 days left",
      difficulty: "Easy",
      category: "Upcoming",
      completed: false,
    },
    {
      id: 2,
      name: "CMPT 210 Assignment 3",
      progress: 20,
      timeLeft: "2 weeks left",
      difficulty: "Hard",
      category: "Upcoming",
      completed: false,
    },
    {
      id: 3,
      name: "Personal Portfolio Project",
      progress: 75,
      timeLeft: "2 days left",
      difficulty: "Easy",
      category: "Close",
      completed: false,
    },
    {
      id: 4,
      name: "CyberSecurity Course",
      progress: 90,
      timeLeft: "Today 23:59",
      difficulty: "Medium",
      category: "Urgent",
      alert: true,
      completed: false,
    },
    {
      id: 5,
      name: "Cache Simulator",
      progress: 0,
      timeLeft: "1 week left",
      difficulty: "Hard",
      category: "Trivial",
      completed: false,
    },
  ])

  // Function to delete a project with confirmation
  const initiateDelete = (id) => {
    setProjectToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (projectToDelete !== null) {
      setProjects(projects.filter((project) => project.id !== projectToDelete))
      setShowDeleteConfirm(false)
      setProjectToDelete(null)
    }
  }

  // Function to initiate project completion
  const initiateCompletion = (id) => {
    setProjectToComplete(id)
    setShowCompletionConfirm(true)
  }

  // Function to confirm project completion and move to Archived
  const confirmCompletion = () => {
    if (projectToComplete !== null) {
      setProjects(
        projects.map((project) =>
          project.id === projectToComplete ? { ...project, category: "Archived", completed: true } : project,
        ),
      )
      setShowCompletionConfirm(false)
      setProjectToComplete(null)
    }
  }

  // Function to update project progress
  const updateProgress = (id, newProgress) => {
    setProjects(projects.map((project) => (project.id === id ? { ...project, progress: newProgress } : project)))
  }

  // Function to add a new project - to the currently selected category
  const addNewProject = () => {
    if (newProject.name.trim() === "") return

    const newId = Math.max(...projects.map((p) => p.id), 0) + 1
    const timeLeft = calculateTimeLeft(newProject.dueDate)
    const isUrgent = isDueToday(newProject.dueDate)

    setProjects([
      ...projects,
      {
        id: newId,
        name: newProject.name,
        progress: 0,
        timeLeft: timeLeft,
        difficulty: newProject.difficulty,
        category: selectedCategory, // Use the currently selected category
        alert: isUrgent,
        completed: false,
      },
    ])

    // Reset form and close modal
    setNewProject({
      name: "",
      dueDate: today,
      difficulty: "Easy",
      saveTabs: true,
    })
    setShowNewProjectModal(false)
  }

  // Helper function to calculate time left text
  const calculateTimeLeft = (dueDate) => {
    if (!dueDate) return ""

    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays === 0) return "Today"
    if (diffDays === 1) return "Tomorrow"
    if (diffDays < 7) return `${diffDays} days left`
    if (diffDays < 14) return "1 week left"
    if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks left`
    return `${Math.floor(diffDays / 30)} months left`
  }

  // Helper function to check if due date is today
  const isDueToday = (dueDate) => {
    if (!dueDate) return false

    const due = new Date(dueDate)
    const now = new Date()

    return (
      due.getDate() === now.getDate() && due.getMonth() === now.getMonth() && due.getFullYear() === now.getFullYear()
    )
  }

  // Helper function to get days difference
  const daysDifference = (dueDate) => {
    if (!dueDate) return 0

    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  // Filter projects based on selected category
  const filteredProjects =
    selectedCategory === "All" ? projects : projects.filter((project) => project.category === selectedCategory)

  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return (
          <div className="flex items-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2"
            >
              <path
                d="M13 10V3L4 14H11V21L20 10H13Z"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="text-base text-gray-500">Easy</span>
          </div>
        )
      case "Medium":
        return (
          <div className="flex items-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2"
            >
              <path
                d="M14.5 4C14.5 4 14.5 8 14.5 10C14.5 12 12 13.5 12 15.5C12 17.5 14 19 14 22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
              <path
                d="M8.5 4C8.5 4 8.5 8 8.5 10C8.5 12 11 13.5 11 15.5C11 17.5 9 19 9 22"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            <span className="text-base text-gray-500">Medium</span>
          </div>
        )
      case "Hard":
        return (
          <div className="flex items-center">
            <svg
              width="22"
              height="22"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              className="mr-2"
            >
              <path
                d="M18 8C18 4.69 15.31 2 12 2C8.69 2 6 4.69 6 8C6 12 12 18 12 18"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-base text-gray-500">Hard</span>
          </div>
        )
      default:
        return null
    }
  }

  // Category data
  const categories = [
    { id: "All", name: "All", color: "bg-blue-500" },
    { id: "Urgent", name: "Urgent", color: "bg-red-500" },
    { id: "Upcoming", name: "Upcoming", color: "bg-orange-500" },
    { id: "Close", name: "Close", color: "bg-yellow-400" },
    { id: "Trivial", name: "Trivial", color: "bg-green-500" },
    { id: "Archived", name: "Archived", color: "bg-gray-400" },
  ]

  return (
    <div className="min-h-screen bg-white">
      {/* Header/Navigation */}
      <header className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-5 flex justify-between items-center">
          <div className="flex items-center">
            <button className="p-2 rounded-md text-gray-700 hover:bg-gray-100 focus:outline-none">
              <Menu size={28} />
            </button>
            <div className="ml-4 w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
              <span className="text-xl text-gray-600">?</span>
            </div>
          </div>

          {/* Center view toggle buttons */}
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setViewMode("list")}
              className={`border-2 p-2 rounded ${viewMode === "list" ? "border-black bg-gray-100" : "border-gray-300"}`}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path
                  d="M4 6H20M4 12H20M4 18H11"
                  stroke="black"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </button>

            <button
              onClick={() => setViewMode("calendar")}
              className={`border-2 p-2 rounded ${viewMode === "calendar" ? "border-black bg-gray-100" : "border-gray-300"}`}
            >
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <rect
                  x="3"
                  y="4"
                  width="18"
                  height="18"
                  rx="2"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </button>
          </div>

          <div className="flex items-center">
            <div className="w-14 h-14 bg-gray-200 rounded-md flex items-center justify-center">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle
                  cx="12"
                  cy="8"
                  r="5"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
                <path
                  d="M20 21C20 16.5817 16.4183 13 12 13C7.58172 13 4 16.5817 4 21"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            </div>
            <span className="ml-2 text-base">User</span>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-4">
        {/* Category Boxes - Clickable and Much Bigger */}
        <div className="flex justify-center mb-8">
          <div className="flex space-x-8">
            {categories.slice(1).map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center cursor-pointer transition-all duration-200"
                onClick={() => setSelectedCategory(category.id)}
                style={{
                  transform: selectedCategory === category.id ? "scale(1.15)" : "scale(1)",
                }}
              >
                <span
                  className={`mb-3 font-medium ${selectedCategory === category.id ? "text-2xl font-bold" : "text-xl"}`}
                >
                  {category.name}
                </span>
                <div
                  className={`${category.color} rounded-md transition-all duration-200`}
                  style={{
                    width: selectedCategory === category.id ? "42px" : "36px",
                    height: selectedCategory === category.id ? "28px" : "24px",
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* New Project button - Text centered above button */}
        <div className="flex justify-center mb-10">
          <div className="flex flex-col items-center">
            <span className="mb-3 text-xl font-medium">New Project</span>
            <div
              className="w-32 h-20 border-2 border-dashed border-gray-300 rounded-md flex items-center justify-center cursor-pointer hover:bg-gray-50"
              onClick={() => setShowNewProjectModal(true)}
            >
              <PlusCircle size={32} className="text-gray-400" />
            </div>
          </div>
        </div>

        {viewMode === "list" ? (
          <>
            {/* Project Table Header */}
            <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-gray-50 border-b border-gray-200 mb-2">
              <div className="col-span-1"></div>
              <div className="col-span-3 font-medium text-gray-700 text-base">Project (Window) Name</div>
              <div className="col-span-3 font-medium text-gray-700 text-base">Progress Bar</div>
              <div className="col-span-2 font-medium text-gray-700 text-base">Time Left</div>
              <div className="col-span-2 font-medium text-gray-700 text-base">Difficulty</div>
              <div className="col-span-1"></div>
            </div>

            {/* Project Rows */}
            {filteredProjects.length > 0 ? (
              filteredProjects.map((project) => (
                <div
                  key={project.id}
                  className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 hover:bg-gray-50 mb-1"
                >
                  <div className="col-span-1 flex items-center">
                    <input
                      type="checkbox"
                      checked={project.completed}
                      onChange={() => initiateCompletion(project.id)}
                      className="h-5 w-5 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
                    />
                  </div>
                  <div className="col-span-3 flex items-center">
                    <span
                      className={`text-base font-medium ${project.completed ? "text-gray-400 line-through" : "text-gray-900"}`}
                    >
                      {project.name}
                    </span>
                  </div>
                  <div className="col-span-3 flex items-center">
                    {/* Custom progress slider without visible thumb */}
                    <div className="w-full flex items-center">
                      <div className="w-full relative">
                        <div
                          className="absolute top-0 left-0 h-4 bg-green-500 rounded-l-md"
                          style={{ width: `${project.progress}%` }}
                        ></div>
                        <div className="w-full h-4 bg-gray-200 rounded-md"></div>
                        <input
                          type="range"
                          min="0"
                          max="100"
                          value={project.progress}
                          onChange={(e) => updateProgress(project.id, Number.parseInt(e.target.value))}
                          className="absolute top-0 left-0 w-full h-4 opacity-0 cursor-pointer"
                        />
                      </div>
                      <span className="ml-2 text-sm text-gray-500">{project.progress}%</span>
                    </div>
                  </div>
                  <div className="col-span-2 flex items-center">
                    <span className="text-base text-gray-700">{project.timeLeft}</span>
                    {project.alert && <AlertTriangle size={18} className="ml-2 text-red-500" />}
                  </div>
                  <div className="col-span-2 flex items-center">{getDifficultyIcon(project.difficulty)}</div>
                  <div className="col-span-1 flex items-center justify-end">
                    <button
                      onClick={() => initiateDelete(project.id)}
                      className="text-gray-400 hover:text-red-500 focus:outline-none"
                    >
                      <Trash2 size={20} />
                    </button>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-500">No projects in this category yet.</div>
            )}
          </>
        ) : (
          // Calendar view placeholder
          <div className="bg-gray-100 rounded-lg p-8 text-center">
            <h2 className="text-2xl font-bold mb-4">Calendar View</h2>
            <p className="text-gray-600">Calendar view is coming soon!</p>
          </div>
        )}
      </main>

      {/* New Project Modal - Simplified */}
      {showNewProjectModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            {/* Modal Header - Centered Project title */}
            <div className="px-6 py-4 text-center">
              <h2 className="text-xl font-bold text-gray-800">Project</h2>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-4 space-y-6">
              {/* Project Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>

              {/* Due Date - with min date validation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
                  <Calendar size={18} className="mr-2 text-gray-500" />
                  <input
                    type="date"
                    className="bg-transparent focus:outline-none w-full"
                    value={newProject.dueDate}
                    min={today} // Prevent selecting dates before today
                    onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <div className="flex items-center bg-gray-100 rounded-md px-3 py-2">
                  <Clock size={18} className="mr-2 text-gray-500" />
                  <select
                    className="bg-transparent focus:outline-none w-full"
                    value={newProject.difficulty}
                    onChange={(e) => setNewProject({ ...newProject, difficulty: e.target.value })}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Save Current Tabs Option - Now Purple */}
              <div className="bg-purple-50 rounded-md p-4 border border-purple-100">
                <h3 className="text-lg font-medium text-purple-800 mb-2">Save Current Tabs</h3>
                <p className="text-sm text-purple-600 mb-3">
                  Would you like to save all currently open browser tabs with this project?
                </p>
                <div className="flex space-x-4">
                  <button
                    className={`px-4 py-2 rounded-md ${newProject.saveTabs ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setNewProject({ ...newProject, saveTabs: true })}
                  >
                    Yes
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ${!newProject.saveTabs ? "bg-purple-600 text-white" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setNewProject({ ...newProject, saveTabs: false })}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer - Just Create Project button */}
            <div className="px-6 py-4 flex justify-end">
              <button
                onClick={addNewProject}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-md font-medium"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <h3 className="text-lg font-bold text-gray-900 mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                Cancel
              </button>
              <button onClick={confirmDelete} className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700">
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Confirmation Modal */}
      {showCompletionConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <Check size={24} className="text-green-500 mr-2" />
              <h3 className="text-lg font-bold text-gray-900">Project Completion</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Have you completed this project? It will be moved to the Archived section.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCompletionConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                No
              </button>
              <button
                onClick={confirmCompletion}
                className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
              >
                Yes, Complete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

