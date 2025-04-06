"use client"

import { useState, useRef, useEffect } from "react"
import {
  Trash2,
  Menu,
  PlusCircle,
  AlertTriangle,
  X,
  Calendar,
  Clock,
  Check,
  Plus,
  Briefcase,
  User,
  Book,
  Search,
  Heart,
} from "lucide-react"

export default function HomePage() {
  // State for menu sidebar
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const sidebarRef = useRef(null)

  // State for view mode (list or calendar)
  const [viewMode, setViewMode] = useState("list")
  // Animation state for view mode transition
  const [isAnimating, setIsAnimating] = useState(false)

  // State for selected system category (Urgent, Upcoming, etc.)
  const [selectedSystemCategory, setSelectedSystemCategory] = useState(null)
  // State for selected user category
  const [selectedUserCategory, setSelectedUserCategory] = useState(null)

  // State for user-created project categories
  const [projectCategories, setProjectCategories] = useState([])

  // State for new category modal
  const [showNewCategoryModal, setShowNewCategoryModal] = useState(false)
  const [newCategory, setNewCategory] = useState({
    name: "",
    icon: "briefcase",
  })

  // Get today's date in YYYY-MM-DD format for min date validation
  const today = new Date().toISOString().split("T")[0]

  // State for new project modal
  const [showNewProjectModal, setShowNewProjectModal] = useState(false)
  const [newProject, setNewProject] = useState({
    name: "",
    dueDate: today,
    difficulty: "Easy",
    saveTabs: true,
    category: null, // For user category selection
  })

  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)

  // State for completion confirmation
  const [showCompletionConfirm, setShowCompletionConfirm] = useState(false)
  const [projectToComplete, setProjectToComplete] = useState(null)

  // Add these new state variables after the other state declarations
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState(null)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [categoryToEdit, setcategoryToEdit] = useState(null)

  // Close sidebar when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (sidebarRef.current && !sidebarRef.current.contains(event.target) && !event.target.closest(".menu-button")) {
        setIsMenuOpen(false)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [sidebarRef])

  // Start with empty projects
  const [projects, setProjects] = useState([])

  // State for user category projects
  const [userCategoryProjects, setUserCategoryProjects] = useState({})

  // Function to determine system category based on due date
  const determineSystemCategory = (dueDate) => {
    if (!dueDate) return "Trivial"

    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 7) {
      return "Urgent"
    } else if (diffDays <= 30) {
      return "Upcoming"
    } else {
      return "Trivial"
    }
  }

  // Function to update project categories based on current date
  const updateProjectCategories = () => {
    // Update general projects
    setProjects(
      projects.map((project) => {
        if (project.completed) return project // Don't change completed projects
        const newCategory = determineSystemCategory(project.dueDate)
        return { ...project, systemCategory: newCategory }
      }),
    )

    // Update user category projects
    Object.keys(userCategoryProjects).forEach((categoryId) => {
      setUserCategoryProjects((prev) => ({
        ...prev,
        [categoryId]: prev[categoryId].map((project) => {
          if (project.completed) return project // Don't change completed projects
          const newCategory = determineSystemCategory(project.dueDate)
          return { ...project, systemCategory: newCategory }
        }),
      }))
    })
  }

  // Update categories when component mounts and daily
  useEffect(() => {
    updateProjectCategories()
    // Set up a daily check to update categories
    const interval = setInterval(updateProjectCategories, 1000 * 60 * 60 * 24) // Once a day
    return () => clearInterval(interval)
  }, [])

  // Function to add a new category
  const addNewCategory = () => {
    if (newCategory.name.trim() === "") return

    const newId = `category-${Date.now()}`
    const newUserCategory = {
      id: newId,
      name: newCategory.name,
      icon: newCategory.icon,
    }

    setProjectCategories([...projectCategories, newUserCategory])

    // Initialize empty projects array for this category
    setUserCategoryProjects((prev) => ({
      ...prev,
      [newId]: [],
    }))

    // Reset form and close modal
    setNewCategory({
      name: "",
      icon: "briefcase",
    })
    setShowNewCategoryModal(false)

    // Automatically select the new category
    setSelectedUserCategory(newId)
    setSelectedSystemCategory(null)
  }

  // Function to handle selecting a user category
  const selectUserCategory = (categoryId) => {
    setSelectedUserCategory(categoryId)
    setSelectedSystemCategory(null)
    setIsMenuOpen(false)
  }

  // Function to handle selecting a system category
  const selectSystemCategory = (categoryId) => {
    setSelectedSystemCategory(categoryId)
    // Don't clear user category, we want to filter by both
  }

  // Function to handle view mode change with animation
  const changeViewMode = (mode) => {
    if (mode === viewMode) return

    setIsAnimating(true)
    setTimeout(() => {
      setViewMode(mode)
      setTimeout(() => {
        setIsAnimating(false)
      }, 300)
    }, 300)
  }

  // Function to delete a project with confirmation
  const initiateDelete = (id) => {
    setProjectToDelete(id)
    setShowDeleteConfirm(true)
  }

  const confirmDelete = () => {
    if (projectToDelete !== null) {
      if (selectedUserCategory) {
        // Delete from user category projects
        setUserCategoryProjects((prev) => ({
          ...prev,
          [selectedUserCategory]: prev[selectedUserCategory].filter((project) => project.id !== projectToDelete),
        }))
      } else {
        // Delete from system category projects
        setProjects(projects.filter((project) => project.id !== projectToDelete))
      }
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
      // Find the project to complete
      let projectFound = false
      let projectLocation = null

      // First check if it's in general projects
      const updatedProjects = projects.map((project) => {
        if (project.id === projectToComplete) {
          projectFound = true
          return { ...project, completed: true, systemCategory: "Archived" }
        }
        return project
      })

      if (projectFound) {
        setProjects(updatedProjects)
      } else {
        // Check in user categories
        for (const categoryId in userCategoryProjects) {
          const categoryProjects = userCategoryProjects[categoryId]
          if (categoryProjects.some((p) => p.id === projectToComplete)) {
            projectLocation = categoryId
            setUserCategoryProjects((prev) => ({
              ...prev,
              [categoryId]: prev[categoryId].map((project) =>
                project.id === projectToComplete
                  ? { ...project, completed: true, systemCategory: "Archived" }
                  : project,
              ),
            }))
            break
          }
        }
      }

      setShowCompletionConfirm(false)
      setProjectToComplete(null)
    }
  }

  // Function to update project progress
  const updateProgress = (id, newProgress) => {
    if (selectedUserCategory) {
      // Update progress in user category projects
      setUserCategoryProjects((prev) => ({
        ...prev,
        [selectedUserCategory]: prev[selectedUserCategory].map((project) =>
          project.id === id ? { ...project, progress: newProgress } : project,
        ),
      }))
    } else {
      // Update progress in system category projects
      setProjects(projects.map((project) => (project.id === id ? { ...project, progress: newProgress } : project)))
    }
  }

  // Function to add a new project
  const addNewProject = () => {
    if (newProject.name.trim() === "") return

    const newId = Date.now()
    const timeLeft = calculateTimeLeft(newProject.dueDate)
    const systemCategory = determineSystemCategory(newProject.dueDate)

    const newProjectItem = {
      id: newId,
      name: newProject.name,
      progress: 0,
      timeLeft: timeLeft,
      difficulty: newProject.difficulty,
      alert: timeLeft === "Today",
      completed: false,
      systemCategory: systemCategory,
      userCategory: newProject.category || selectedUserCategory || null,
      dueDate: newProject.dueDate, // Store the due date for future recategorization
    }

    if (selectedUserCategory) {
      // Add to user category projects
      setUserCategoryProjects((prev) => ({
        ...prev,
        [selectedUserCategory]: [...(prev[selectedUserCategory] || []), newProjectItem],
      }))
    } else if (newProject.category) {
      // Add to selected user category from dropdown
      setUserCategoryProjects((prev) => ({
        ...prev,
        [newProject.category]: [...(prev[newProject.category] || []), newProjectItem],
      }))
    } else {
      // Add to general projects
      setProjects([...projects, newProjectItem])
    }

    // Reset form and close modal
    setNewProject({
      name: "",
      dueDate: today,
      difficulty: "Easy",
      saveTabs: true,
      category: null,
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

  // Get projects to display based on selected categories
  const getDisplayProjects = () => {
    const filteredProjects = []

    if (selectedUserCategory) {
      // Get projects from the selected user category
      const categoryProjects = userCategoryProjects[selectedUserCategory] || []

      // If a system category is also selected, filter by that too
      if (selectedSystemCategory) {
        return categoryProjects.filter((project) => project.systemCategory === selectedSystemCategory)
      }

      return categoryProjects
    } else if (selectedSystemCategory) {
      // Get all projects with the selected system category

      // From general projects
      const generalProjects = projects.filter((project) => project.systemCategory === selectedSystemCategory)

      // From all user categories
      const userProjects = Object.values(userCategoryProjects)
        .flat()
        .filter((project) => project.systemCategory === selectedSystemCategory)

      return [...generalProjects, ...userProjects]
    }

    // If no categories selected, return all projects
    const allProjects = [...projects, ...Object.values(userCategoryProjects).flat()]

    return allProjects
  }

  const displayProjects = getDisplayProjects()

  // Static images for difficulty levels
  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return (
          <div className="flex items-center">
            {/* Running stick figure static image */}
            <div className="mr-3 relative w-8 h-8">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="12" cy="7" r="3" fill="currentColor" />
                <line x1="12" y1="10" x2="12" y2="18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="18" x2="8" y2="24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="18" x2="18" y2="22" stroke="currentColor" strokeLinecap="round" />
                <line x1="7" y1="14" x2="17" y2="14" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-base text-gray-500">Easy</span>
          </div>
        )
      case "Medium":
        return (
          <div className="flex items-center">
            {/* Person climbing hill static image */}
            <div className="mr-3 relative w-8 h-8">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M6 26L26 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="18" cy="14" r="3" fill="currentColor" />
                <line x1="18" y1="17" x2="18" y2="22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="18" y1="22" x2="15" y2="26" stroke="currentColor" strokeLinecap="round" />
                <line x1="18" y1="22" x2="21" y2="26" stroke="currentColor" strokeLinecap="round" />
                <line x1="14" y1="19" x2="22" y2="19" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-base text-gray-500">Medium</span>
          </div>
        )
      case "Hard":
        return (
          <div className="flex items-center">
            {/* Drowning person static image */}
            <div className="mr-3 relative w-8 h-8">
              <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 24H28" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
                <path d="M8 22H24" stroke="#6B7280" strokeWidth="2" strokeLinecap="round" />
                <circle cx="16" cy="18" r="3" fill="currentColor" />
                <line x1="16" y1="21" x2="16" y2="26" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="12" y1="16" x2="20" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <line x1="13" y1="26" x2="16" y2="21" stroke="currentColor" strokeLinecap="round" />
                <line x1="19" y1="26" x2="16" y2="21" stroke="currentColor" strokeLinecap="round" />
              </svg>
            </div>
            <span className="text-base text-gray-500">Hard</span>
          </div>
        )
      default:
        return null
    }
  }

  // Category data - updated with new colors
  const systemCategories = [
    { id: "Urgent", name: "Urgent", color: "bg-red-500" },
    { id: "Upcoming", name: "Upcoming", color: "bg-orange-500" },
    { id: "Trivial", name: "Trivial", color: "bg-yellow-500" },
    { id: "Archived", name: "Completed", color: "bg-green-500" },
  ]

  // Get icon component based on icon name
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case "briefcase":
        return <Briefcase size={18} className="mr-3 text-[#FF8C6B]" />
      case "user":
        return <User size={18} className="mr-3 text-[#FF8C6B]" />
      case "book":
        return <Book size={18} className="mr-3 text-[#FF8C6B]" />
      case "search":
        return <Search size={18} className="mr-3 text-[#FF8C6B]" />
      case "heart":
        return <Heart size={18} className="mr-3 text-[#FF8C6B]" />
      default:
        return <Briefcase size={18} className="mr-3 text-[#FF8C6B]" />
    }
  }

  // Get current category name for display
  const getCurrentCategoryName = () => {
    if (selectedUserCategory && selectedSystemCategory) {
      const userCategory = projectCategories.find((cat) => cat.id === selectedUserCategory)
      const systemCategory = systemCategories.find((cat) => cat.id === selectedSystemCategory)
      return `${systemCategory?.name} Projects in ${userCategory?.name}`
    } else if (selectedUserCategory) {
      const category = projectCategories.find((cat) => cat.id === selectedUserCategory)
      return category ? category.name : ""
    } else if (selectedSystemCategory) {
      const category = systemCategories.find((cat) => cat.id === selectedSystemCategory)
      return category ? `${category.name} Projects` : ""
    }
    return "All Projects"
  }

  // Add this function to handle editing a project
  const initiateEditProject = (project) => {
    setProjectToEdit(project)
    setShowEditProjectModal(true)
  }

  // Add this function to save edited project
  const saveEditedProject = () => {
    if (!projectToEdit) return

    // Preserve the system category if it's "Archived", otherwise recalculate
    const systemCategory =
      projectToEdit.systemCategory === "Archived" ? "Archived" : determineSystemCategory(projectToEdit.dueDate)

    // Recalculate time left
    const timeLeft = calculateTimeLeft(projectToEdit.dueDate)

    const updatedProject = {
      ...projectToEdit,
      timeLeft,
      systemCategory,
      alert: timeLeft === "Today" && systemCategory !== "Archived",
    }

    // First, find and remove the project from its original location
    let originalCategory = null
    let found = false

    // Check if it's in the general projects
    const updatedProjects = projects.filter((p) => {
      if (p.id === updatedProject.id) {
        found = true
        return false // Remove it
      }
      return true
    })

    if (found) {
      setProjects(updatedProjects)
    } else {
      // Check in user categories
      for (const categoryId in userCategoryProjects) {
        if (userCategoryProjects[categoryId].some((p) => p.id === updatedProject.id)) {
          originalCategory = categoryId
          break
        }
      }

      if (originalCategory) {
        setUserCategoryProjects((prev) => ({
          ...prev,
          [originalCategory]: prev[originalCategory].filter((p) => p.id !== updatedProject.id),
        }))
      }
    }

    // Then add the project to its new location
    if (updatedProject.userCategory) {
      // Add to user category
      setUserCategoryProjects((prev) => ({
        ...prev,
        [updatedProject.userCategory]: [...(prev[updatedProject.userCategory] || []), updatedProject],
      }))
    } else {
      // Add to general projects
      setProjects((prev) => [...prev, updatedProject])
    }

    setShowEditProjectModal(false)
    setProjectToEdit(null)
  }

  // Add this function to handle editing a category
  const initiateEditCategory = (category) => {
    setcategoryToEdit({ ...category })
    setShowEditCategoryModal(true)
  }

  // Add this function to save edited category
  const saveEditedCategory = () => {
    if (!categoryToEdit || categoryToEdit.name.trim() === "") return

    setProjectCategories(
      projectCategories.map((category) => (category.id === categoryToEdit.id ? categoryToEdit : category)),
    )

    setShowEditCategoryModal(false)
    setcategoryToEdit(null)
  }

  // Add this function to move a project to a different category
  const moveProjectToCategory = (projectId, newCategoryId) => {
    // Find the project in all possible locations
    let projectToMove = null
    let sourceCategory = null

    // Check in general projects
    const generalProject = projects.find((p) => p.id === projectId)
    if (generalProject) {
      projectToMove = { ...generalProject }
      sourceCategory = null
    } else {
      // Check in user categories
      for (const [categoryId, categoryProjects] of Object.entries(userCategoryProjects)) {
        const foundProject = categoryProjects.find((p) => p.id === projectId)
        if (foundProject) {
          projectToMove = { ...foundProject }
          sourceCategory = categoryId
          break
        }
      }
    }

    if (!projectToMove) return

    // Remove from source
    if (sourceCategory) {
      setUserCategoryProjects((prev) => ({
        ...prev,
        [sourceCategory]: prev[sourceCategory].filter((p) => p.id !== projectId),
      }))
    } else {
      setProjects(projects.filter((p) => p.id !== projectId))
    }

    // Add to destination
    if (newCategoryId) {
      projectToMove.userCategory = newCategoryId
      setUserCategoryProjects((prev) => ({
        ...prev,
        [newCategoryId]: [...(prev[newCategoryId] || []), projectToMove],
      }))
    } else {
      projectToMove.userCategory = null
      setProjects([...projects, projectToMove])
    }
  }

  return (
    <div className="min-h-screen bg-[#f8eece] relative overflow-x-hidden">
      {/* Sidebar Menu */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-64 bg-[#f8eece] shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-xl font-bold text-[#FF8C6B]">TabMark</h2>
            <button onClick={() => setIsMenuOpen(false)} className="text-gray-500 hover:text-gray-700">
              <X size={20} />
            </button>
          </div>

          {/* All Projects Button */}
          <div className="mb-6">
            <button
              onClick={() => {
                setSelectedUserCategory(null)
                setSelectedSystemCategory(null)
                setIsMenuOpen(false)
              }}
              className="flex items-center justify-center w-full px-3 py-2 rounded-md transition-colors bg-[#f8eece] hover:bg-[#f5e5b5] text-[#4a2b40] font-medium"
            >
              <span>All Projects</span>
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm uppercase text-gray-500 font-medium">Project Categories</h3>
              <button
                onClick={() => setShowNewCategoryModal(true)}
                className="text-[#4a2b40] hover:text-[#4a2b40] flex items-center text-sm font-medium"
              >
                <Plus size={16} className="mr-1" />
                New
              </button>
            </div>

            {projectCategories.length === 0 ? (
              <div className="py-4 px-3 bg-[#f8eece] rounded-md text-center mb-4">
                <p className="text-sm text-gray-500">No categories yet</p>
                <button
                  onClick={() => setShowNewCategoryModal(true)}
                  className="mt-2 text-[#FF8C6B] hover:text-[#ff7a55] text-sm font-medium"
                >
                  Create your first category
                </button>
              </div>
            ) : (
              <ul className="space-y-2 mb-6">
                {projectCategories.map((category) => (
                  <li key={category.id}>
                    <div className="flex items-center">
                      <button
                        onClick={() => selectUserCategory(category.id)}
                        className={`flex items-center w-full px-3 py-2 rounded-md transition-colors ${
                          selectedUserCategory === category.id
                            ? "bg-[#fff0e0] text-[#FF8C6B] font-medium"
                            : "hover:bg-gray-50"
                        }`}
                      >
                        {getCategoryIcon(category.icon)}
                        <span>{category.name}</span>
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          initiateEditCategory(category)
                        }}
                        className="p-1 text-gray-400 hover:text-[#FF8C6B]"
                        title="Edit category"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </div>

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 " style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={() => setShowNewCategoryModal(false)}></div>
          <div className="bg-[#f8eece] rounded-2xl shadow-xl w-full max-w-md relative z-10">
            <div className="px-6 py-4 border-b border-gray-200 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Create New Category</h2>
              <button
                onClick={() => setShowNewCategoryModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Work Projects, School Assignments"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C6B]"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {["briefcase", "user", "book", "search", "heart"].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, icon })}
                      className={`flex items-center justify-center p-2 rounded-md ${
                        newCategory.icon === icon ? "bg-[#fff0e0] text-[#FF8C6B]" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {icon === "briefcase" && <Briefcase size={20} />}
                      {icon === "user" && <User size={20} />}
                      {icon === "book" && <Book size={20} />}
                      {icon === "search" && <Search size={20} />}
                      {icon === "heart" && <Heart size={20} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f8eece] flex justify-end rounded-b-2xl">
              <button
                onClick={() => setShowNewCategoryModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={addNewCategory}
                className="px-4 py-2 bg-[#FF8C6B] text-white rounded-md hover:bg-[#ff7a55]"
                disabled={!newCategory.name.trim()}
              >
                Create Category
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Overlay when menu is open */}
      {isMenuOpen && (
        <div className="fixed inset-0 " style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={() => setIsMenuOpen(false)}></div>
      )}

      {/* Header/Navigation */}
      <header className="bg-[#FF8C6B] shadow-sm">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10 py-5 flex justify-between items-center">
          <div className="flex items-center w-1/3">
            <button
              className="p-2 rounded-md text-white hover:bg-white/20 focus:outline-none menu-button"
              onClick={() => setIsMenuOpen(true)}
            >
              <Menu size={28} />
            </button>
            <h2 className="text-xl font-bold text-white ml-2 mr-4">TabMark</h2>
            <button className="ml-2 px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md flex items-center justify-center text-white font-medium transition-colors">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="mr-1"
              >
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
                <line x1="12" y1="17" x2="12.01" y2="17"></line>
              </svg>
              FAQ
            </button>
          </div>

          {/* Center view toggle buttons with animation - Improved design */}
          <div className="flex items-center justify-center space-x-4 bg-[#FF8C6B] p-1 rounded-lg w-1/3">
            <button
              onClick={() => changeViewMode("list")}
              className={`flex items-center px-4 py-2 rounded-md transition-all duration-300 ${
                viewMode === "list" ? "bg-white text-[#FF8C6B] font-medium shadow-sm" : "text-white hover:bg-white/20"
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2"
              >
                <rect x="4" y="5" width="16" height="2" rx="1" fill="currentColor" />
                <rect x="4" y="11" width="12" height="2" rx="1" fill="currentColor" />
                <rect x="4" y="17" width="14" height="2" rx="1" fill="currentColor" />
              </svg>
              <span>List</span>
            </button>

            <button
              onClick={() => changeViewMode("calendar")}
              className={`flex items-center px-4 py-2 rounded-md transition-all duration-300 ${
                viewMode === "calendar"
                  ? "bg-white text-[#FF8C6B] font-medium shadow-sm"
                  : "text-white hover:bg-white/20"
              }`}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
                className="mr-2"
              >
                <rect x="3" y="4" width="18" height="18" rx="2" stroke="currentColor" strokeWidth="2" />
                <path d="M8 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M16 2V6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <path d="M3 10H21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                <circle cx="8" cy="14" r="1" fill="currentColor" />
                <circle cx="12" cy="14" r="1" fill="currentColor" />
                <circle cx="16" cy="14" r="1" fill="currentColor" />
                <circle cx="8" cy="18" r="1" fill="currentColor" />
                <circle cx="12" cy="18" r="1" fill="currentColor" />
                <circle cx="16" cy="18" r="1" fill="currentColor" />
              </svg>
              <span>Calendar</span>
            </button>
          </div>

          <div className="flex items-center justify-end w-1/3">
            <button className="flex items-center bg-[#FF8C6B] rounded-md py-2 px-3 text-white hover:bg-white/20 transition-colors">
              <div className="w-10 h-10 flex items-center justify-center">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
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
              <span className="font-medium">User</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-8 py-4">
        {/* Display current category name only when a category is selected */}
        {(selectedSystemCategory || selectedUserCategory || (!selectedSystemCategory && !selectedUserCategory)) && (
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold text-[#3B0764]">{getCurrentCategoryName()}</h1>
            {selectedUserCategory && selectedSystemCategory && (
              <p className="text-gray-500 mt-2">
                Viewing {selectedSystemCategory} projects in{" "}
                {projectCategories.find((c) => c.id === selectedUserCategory)?.name}
              </p>
            )}
          </div>
        )}

        {/* Category Boxes - Always visible */}
        <div className="flex justify-center mb-10">
          <div className="flex space-x-12">
            {systemCategories.map((category) => (
              <div
                key={category.id}
                className="flex flex-col items-center cursor-pointer transition-all duration-200"
                onClick={() => selectSystemCategory(category.id)}
                style={{
                  transform: selectedSystemCategory === category.id ? "scale(1.2)" : "scale(1)",
                }}
              >
                <span
                  className={`mb-4 font-medium ${selectedSystemCategory === category.id ? "text-3xl font-bold" : "text-2xl"} text-[#3B0764]`}
                >
                  {category.name}
                </span>
                <div
                  className={`${category.color} rounded-md transition-all duration-200`}
                  style={{
                    width: selectedSystemCategory === category.id ? "60px" : "50px",
                    height: selectedSystemCategory === category.id ? "36px" : "30px",
                  }}
                ></div>
              </div>
            ))}
          </div>
        </div>

        {/* Welcome message when no category is selected */}
        {!selectedSystemCategory && !selectedUserCategory && (
          <div className="text-center py-8 mb-8">
            <h2 className="text-2xl font-bold text-[#FF8C6B] mb-3">Welcome to TabMark</h2>
            <p className="text-purple-950 max-w-2xl mx-auto">
              Select one of the categories above to see your projects sorted by urgency. You can also create custom
              categories from the menu on the left.
            </p>
          </div>
        )}

        {/* New Project button - Compact floating design */}
        <div className="flex justify-center mb-6">
          <button
            onClick={() => setShowNewProjectModal(true)}
            className="flex items-center px-5 py-2 bg-[#FF8C6B] hover:bg-[#ff7a55] text-white rounded-md transition-colors shadow-sm"
          >
            <PlusCircle size={18} className="mr-2" />
            <span className="font-medium">New Project</span>
          </button>
        </div>

        {/* Content with animation */}
        <div className={`transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
          {viewMode === "list" ? (
            <>
              {/* Project Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-4 bg-[#f8eece] border-b border-[#e6d6a6] mb-2 rounded-t-lg">
                <div className="col-span-1"></div>
                <div className="col-span-3 font-medium text-[#3B0764] text-base">Project (Window) Name</div>
                <div className="col-span-3 font-medium text-[#3B0764] text-base">Progress Bar</div>
                <div className="col-span-2 font-medium text-[#3B0764] text-base">Time Left</div>
                <div className="col-span-2 font-medium text-[#3B0764] text-base">Difficulty</div>
                <div className="col-span-1"></div>
              </div>

              {/* Project Rows */}
              {displayProjects.length > 0 ? (
                displayProjects.map((project) => (
                  <div
                    key={project.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-[#e6d6a6] hover:bg-[#f5e5b5] mb-1 bg-[#f8eece] rounded-md"
                  >
                    <div className="col-span-1 flex items-center">
                      <input
                        type="checkbox"
                        checked={project.completed}
                        onChange={() => initiateCompletion(project.id)}
                        className="h-5 w-5 text-[#FF8C6B] rounded border-gray-300 focus:ring-[#FF8C6B] cursor-pointer"
                      />
                    </div>
                    <div className="col-span-3 flex items-center">
                      <span
                        className={`text-base font-medium ${project.completed ? "text-gray-400 line-through" : "text-[#FF8C6B]"}`}
                      >
                        {project.name}
                      </span>
                    </div>
                    <div className="col-span-3 flex items-center">
                      {/* Custom progress slider with rounded corners when at 100% */}
                      <div className="w-full flex items-center">
                        <div className="w-full relative">
                          <div
                            className={`absolute top-0 left-0 h-4 bg-[#FF8C6B] ${project.progress === 100 ? "rounded-md" : "rounded-l-md"}`}
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
                      {project.timeLeft === "Today" && <AlertTriangle size={18} className="ml-2 text-[#ff5f6d]" />}
                    </div>
                    <div className="col-span-2 flex items-center">{getDifficultyIcon(project.difficulty)}</div>
                    <div className="col-span-1 flex items-center justify-end space-x-2">
                      <button
                        onClick={() => initiateEditProject(project)}
                        className="text-gray-400 hover:text-[#FF8C6B] focus:outline-none"
                        title="Edit project"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="20"
                          height="20"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                        </svg>
                      </button>
                      <button
                        onClick={() => initiateDelete(project.id)}
                        className="text-gray-400 hover:text-[#ff5f6d] focus:outline-none"
                        title="Delete project"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 bg-[#f8eece] rounded-lg">
                  <div className="flex flex-col items-center">
                    <div className="mb-4">
                      <svg
                        width="64"
                        height="64"
                        viewBox="0 0 24 24"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                        className="text-gray-300"
                      >
                        <path
                          d="M19 3H5C3.89543 3 3 3.89543 3 5V19C3 20.1046 3.89543 21 5 21H19C20.1046 21 21 20.1046 21 19V5C21 3.89543 20.1046 3 19 3Z"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M12 8V16"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                        <path
                          d="M8 12H16"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </div>
                    <h3 className="text-xl font-medium text-[#FF8C6B] mb-2">No projects yet</h3>
                    <p className="text-gray-500 mb-4">Get started by creating your first project</p>
                    <button
                      onClick={() => setShowNewProjectModal(true)}
                      className="px-4 py-2 bg-[#FF8C6B] text-white rounded-md hover:bg-[#ff7a55]"
                    >
                      Create Project
                    </button>
                  </div>
                </div>
              )}
            </>
          ) : (
            // Calendar view placeholder
            <div className="bg-[#f8eece] rounded-lg p-8 text-center">
              <h2 className="text-2xl font-bold text-[#FF8C6B] mb-4">Calendar View</h2>
              <p className="text-gray-600">Calendar view is coming soon!</p>
            </div>
          )}
        </div>
      </main>

      {/* New Project Modal - Updated with category selection */}
      {showNewProjectModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 " style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={() => setShowNewProjectModal(false)}></div>
          <div className="bg-[#f8eece] rounded-2xl shadow-xl w-full max-w-md relative z-10">
            {/* Modal Header - Centered Project title */}
            <div className="px-6 py-4 text-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Project</h2>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C6B]"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>

              {/* Due Date - with min date validation */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <div className="flex items-center bg-[#f8eece] rounded-md px-3 py-2">
                  <Calendar size={18} className="mr-2 text-[#FF8C6B]" />
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
                <div className="flex items-center bg-[#f8eece] rounded-md px-3 py-2">
                  <Clock size={18} className="mr-2 text-[#FF8C6B]" />
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

              {/* Category Selection - Only show if no user category is selected */}
              {!selectedUserCategory && projectCategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Category</label>
                  <div className="flex items-center bg-[#f8eece] rounded-md px-3 py-2">
                    <Briefcase size={18} className="mr-2 text-[#FF8C6B]" />
                    <select
                      className="bg-transparent focus:outline-none w-full"
                      value={newProject.category || ""}
                      onChange={(e) => setNewProject({ ...newProject, category: e.target.value || null })}
                    >
                      <option value="">No specific category</option>
                      {projectCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}

              {/* Show selected category if user category is selected */}
              {selectedUserCategory && (
                <div className="bg-[#fff0e0] rounded-md p-3 border border-[#ffd0b5]">
                  <div className="flex items-center">
                    <Briefcase size={18} className="mr-2 text-[#FF8C6B]" />
                    <span className="text-sm font-medium text-[#FF8C6B]">
                      Creating in: {projectCategories.find((c) => c.id === selectedUserCategory)?.name}
                    </span>
                  </div>
                </div>
              )}

              {/* Save Current Tabs Option - Orange */}
              <div className="bg-[#fff0e0] rounded-md p-4 border border-[#ffd0b5]">
                <h3 className="text-lg font-medium text-[#FF8C6B] mb-2">Save Current Tabs</h3>
                <p className="text-sm text-[#FF8C6B] mb-3">
                  Would you like to save all currently open browser tabs with this project?
                </p>
                <div className="flex space-x-4">
                  <button
                    className={`px-4 py-2 rounded-md ${newProject.saveTabs ? "bg-[#FF8C6B] text-white hover:bg-[#ff7a55]" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setNewProject({ ...newProject, saveTabs: true })}
                  >
                    Yes
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ${!newProject.saveTabs ? "bg-[#FF8C6B] text-white hover:bg-[#ff7a55]" : "bg-gray-200 text-gray-700"}`}
                    onClick={() => setNewProject({ ...newProject, saveTabs: false })}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            {/* Modal Footer - Just Create Project button */}
            <div className="px-6 py-4 flex justify-end rounded-b-2xl">
              <button
                onClick={addNewProject}
                className="bg-[#FF8C6B] hover:bg-[#ff7a55] text-white px-4 py-2 rounded-md font-medium"
              >
                Create Project
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 " style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={() => setShowDeleteConfirm(false)}></div>
          <div className="bg-[#f8eece] rounded-2xl shadow-xl w-full max-w-md p-6 relative z-10">
            <h3 className="text-lg font-bold text-[#FF8C6B] mb-4">Confirm Deletion</h3>
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
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-[#ff5f6d] text-white rounded-md hover:bg-[#ff4957]"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Completion Confirmation Modal */}
      {showCompletionConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="fixed inset-0 " style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }} onClick={() => setShowCompletionConfirm(false)}></div>
          <div className="bg-[#f8eece] rounded-2xl shadow-xl w-full max-w-md p-6 relative z-10">
            <div className="flex items-center mb-4">
              <Check size={24} className="text-green-500 mr-2" />
              <h3 className="text-lg font-bold text-[#FF8C6B]">Project Completion</h3>
            </div>
            <p className="text-gray-600 mb-6">Have you completed this project? It will be marked as completed.</p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCompletionConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
              >
                No
              </button>
              <button
                onClick={confirmCompletion}
                className="px-4 py-2 bg-[#FF8C6B] text-white rounded-md hover:bg-[#3a1f30]"
              >
                Yes, Complete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Project Modal */}
      {showEditProjectModal && projectToEdit && (
        <div className="fixed inset-0 flex items-center justify-center">
          <div
            className="fixed inset-0"
            style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}
            onClick={() => {
              setShowEditProjectModal(false)
              setProjectToEdit(null)
            }}
          ></div>
          <div className="bg-[#f8eece] rounded-2xl shadow-xl w-full max-w-md relative z-10">
            <div className="px-6 py-4 text-center rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Edit Project</h2>
              <button
                onClick={() => {
                  setShowEditProjectModal(false)
                  setProjectToEdit(null)
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-6">
              {/* Project Name Input */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Project Name</label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C6B]"
                  value={projectToEdit.name}
                  onChange={(e) => setProjectToEdit({ ...projectToEdit, name: e.target.value })}
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Due Date</label>
                <div className="flex items-center bg-[#f8eece] rounded-md px-3 py-2">
                  <Calendar size={18} className="mr-2 text-[#FF8C6B]" />
                  <input
                    type="date"
                    className="bg-transparent focus:outline-none w-full"
                    value={projectToEdit.dueDate}
                    min={today}
                    onChange={(e) => setProjectToEdit({ ...projectToEdit, dueDate: e.target.value })}
                  />
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Difficulty</label>
                <div className="flex items-center bg-[#f8eece] rounded-md px-3 py-2">
                  <Clock size={18} className="mr-2 text-[#FF8C6B]" />
                  <select
                    className="bg-transparent focus:outline-none w-full"
                    value={projectToEdit.difficulty}
                    onChange={(e) => setProjectToEdit({ ...projectToEdit, difficulty: e.target.value })}
                  >
                    <option value="Easy">Easy</option>
                    <option value="Medium">Medium</option>
                    <option value="Hard">Hard</option>
                  </select>
                </div>
              </div>

              {/* Category Selection */}
              {projectCategories.length > 0 && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Project Category</label>
                  <div className="flex items-center bg-[#f8eece] rounded-md px-3 py-2">
                    <Briefcase size={18} className="mr-2 text-[#FF8C6B]" />
                    <select
                      className="bg-transparent focus:outline-none w-full"
                      value={projectToEdit.userCategory || ""}
                      onChange={(e) => {
                        const newCategoryId = e.target.value || null
                        setProjectToEdit({ ...projectToEdit, userCategory: newCategoryId })
                      }}
                    >
                      <option value="">No specific category</option>
                      {projectCategories.map((category) => (
                        <option key={category.id} value={category.id}>
                          {category.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              )}
            </div>

            <div className="px-6 py-4 flex justify-end rounded-b-2xl">
              <button
                onClick={() => {
                  setShowEditProjectModal(false)
                  setProjectToEdit(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedProject}
                className="bg-[#FF8C6B] hover:bg-[#ff7a55] text-white px-4 py-2 rounded-md font-medium"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Category Modal */}
      {showEditCategoryModal && categoryToEdit && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div>
            <div className="fixed inset-0 " style={{ backgroundColor: 'rgba(0, 0, 0, 0.3)' }}>
            onClick={() => {
              setShowEditCategoryModal(false)
              setcategoryToEdit(null)
            }}
          </div>
          <div className="bg-[#f8eece] rounded-2xl shadow-xl w-full max-w-md relative z-10">
            <div className="px-6 py-4 border-b border-gray-200 rounded-t-2xl">
              <h2 className="text-xl font-bold text-white">Edit Category</h2>
              <button
                onClick={() => {
                  setShowEditCategoryModal(false)
                  setcategoryToEdit(null)
                }}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Work Projects, School Assignments"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C6B]"
                  value={categoryToEdit.name}
                  onChange={(e) => setcategoryToEdit({ ...categoryToEdit, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {["briefcase", "user", "book", "search", "heart"].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setcategoryToEdit({ ...categoryToEdit, icon })}
                      className={`flex items-center justify-center p-2 rounded-md ${
                        categoryToEdit.icon === icon ? "bg-[#fff0e0] text-[#FF8C6B]" : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {icon === "briefcase" && <Briefcase size={20} />}
                      {icon === "user" && <User size={20} />}
                      {icon === "book" && <Book size={20} />}
                      {icon === "search" && <Search size={20} />}
                      {icon === "heart" && <Heart size={20} />}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div className="px-6 py-4 bg-[#f8eece] flex justify-end rounded-b-2xl">
              <button
                onClick={() => {
                  setShowEditCategoryModal(false)
                  setcategoryToEdit(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 mr-2 hover:bg-gray-100"
              >
                Cancel
              </button>
              <button
                onClick={saveEditedCategory}
                className="px-4 py-2 bg-[#FF8C6B] text-white rounded-md hover:bg-[#ff7a55]"
                disabled={!categoryToEdit.name.trim()}
              >
                Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  ); // Closing the return statement
}
