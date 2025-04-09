"use client"

import { useEffect, useState, useRef, useMemo} from "react"
import { auth, storage, db } from "../firebase-config.js"
import { useNavigate } from "react-router-dom"
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth"
import { doc, setDoc, getDoc, getDocs, collection, updateDoc, deleteDoc, arrayUnion, arrayRemove } from "firebase/firestore"
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import { handleProfilePictureUpload, uploadProfilePicture } from "../utils/profilePictureUtils.js"
import {Trash2, Menu, PlusCircle, AlertTriangle, X, Calendar, Clock,
  Check, Plus, Briefcase, User, Book, Search, Heart, Leaf, Eye, EyeClosed , ChevronLeft, ChevronRight, Flower, Sun, Snowflake, DoorClosed, DoorOpen, } from "lucide-react"
import "../styles/globalfonts.css"
import uploadProjectToFirestore from "./UploadProject"
import FetchProjectsFromFirestore from "./FetchProjects"
import deleteProjectFromFirestore from "./DeleteProject"
import modifyProjectInFirestore from "./ModifyProject"
import { saveTabsToFirestore, getTabsFromFirestore } from "../utils/ExtensionUtils.js"
import { calculateTimeLeft, calculateTimeSince } from "./CalculateTimeLeft.jsx"

// helper function for name reformat
function formatDisplayName(name) {
  if (!name) {
      return ""
  } else {
      return name.split(" ")[0].charAt(0).toUpperCase() + name.split(" ")[0].slice(1).toLowerCase()
  }
}

export default function HomePage() {
  // State for menu sidebar
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const sidebarRef = useRef(null)

  // State for view mode (list or calendar)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [profilePicture, setProfilePicture] = useState(null)
  const navigate = useNavigate()

  // console.log("yoo ?")

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
      } else {
        setUser(null)
        navigate("/sign-up"); // Move navigate() inside useEffect
      }
      setLoading(false)
    })},[navigate]);

  const userId = auth.currentUser?.uid
  const userName = auth.currentUser?.displayName
  const userMail = auth.currentUser?.email
    
  // const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
  //   if (currentUser) {
  //     setUser(currentUser)
  //     console.log("User is logged in:", currentUser.displayName)
  //   } else {
  //     // setUser(null)
  //     console.log("No user logged in.")
  //     navigate("/sign-up") 
  //   }
  //   setLoading(false)}
  // );  // when this has been doen i.e user has been logged in OR redirected to sign up page, we can stop the loading screen


  // if (loading) {        // ensures previously logged in user's home page is not flashed - while we make sure what auth state is
  //   return (
  //     <div className="flex items-center justify-center min-h-screen">
  //       <p className="font-jomhuria text-4xl font-jomhuria text-gray-500">Loading...</p>
  //     </div>
  //   );
  // }

  // if(!user){
  //   return null
  // }



  //   return () => unsubscribe(); // Cleanup the listener on unmount
  // }, [navigate]); // Add navigate as a dependency

  // if (!user){
  //   return null
  // }

  // if (loading) {
  //   return <p>Loading...</p>;
  // }


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
    description: "", // Add description field
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
    category: selectedUserCategory || null, // For user category selection
  })

  useEffect(() => {
    setNewProject((prev) => ({
      ...prev,
      category: selectedUserCategory || null, // Update category when selectedUserCategory changes
    }));
  }, [selectedUserCategory]);

  // State for delete confirmation
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [projectToDelete, setProjectToDelete] = useState(null)

  // State for completion confirmation
  const [showCompletionConfirm, setShowCompletionConfirm] = useState(false)
  const [projectToComplete, setProjectToComplete] = useState(null)

  // State for unarchive confirmation
  const [showUnarchiveConfirm, setShowUnarchiveConfirm] = useState(false)
  const [projectToUnarchive, setProjectToUnarchive] = useState(null)

  // Add these new state variables after the other state declarations
  const [showEditProjectModal, setShowEditProjectModal] = useState(false)
  const [projectToEdit, setProjectToEdit] = useState(null)
  const [showEditCategoryModal, setShowEditCategoryModal] = useState(false)
  const [categoryToEdit, setcategoryToEdit] = useState(null)

  // Calendar state
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [selectedDate, setSelectedDate] = useState(new Date())

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

//   const saveTabsForProject = (projectId) => {
//     chrome.runtime.sendMessage({ action: "saveTabs", projectId }, (response) => {
//       if (response.success) {
//         console.log("Tabs saved successfully!");
//       } else {
//         console.error("Failed to save tabs:", response.error);
//       }
//     });
//   };

//   const openTabsForProject = (projectId) => {
//     chrome.runtime.sendMessage({ action: "openTabs", projectId }, (response) => {
//       if (response.success) {
//         console.log("Tabs opened successfully!");
//       } else {
//         console.error("Failed to open tabs:", response.error);
//       }
//     });
//   };

//   import saveTabsToFirestore from "../utils/saveTabsToFirestore";
// import getTabsFromFirestore from "../utils/getTabsFromFirestore";

const saveTabsForProject = (projectId) => {
  chrome.runtime.sendMessage({ action: "saveTabs" }, async (response) => {
    if (response.success) {
      try {
        const tabs = response.tabs.map((tab) => ({ url: tab.url, title: tab.title }));
        await saveTabsToFirestore(user.uid, projectId, tabs);
        console.log("Tabs saved successfully!");
      } catch (error) {
        console.error("Failed to save tabs:", error);
      }
    } else {
      console.error("Failed to retrieve tabs from Chrome extension:", response.error);
    }
  });
};

const openTabsForProject = async (projectId) => {
  try {
    const tabs = await getTabsFromFirestore(user.uid, projectId);
    const urls = tabs.map((tab) => tab.url);

    console.log("URLs being sent to extension:", urls); // Debugging log

    if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.connect) {
      const TabMarkHelperID = "ombjnnoklkbbmedngjcmbljnlppbdlcf";
      const port = chrome.runtime.connect(TabMarkHelperID, { name: "frontend-connection" });

      port.postMessage({ action: "openTabs", urls });
      port.onMessage.addListener( (response) => {
        if (response?.success) {
          console.log("Tabs opened successfully!");
        } else {
          console.error("Failed to open tabs:", response?.error);
        }
      });
    } else {
      console.error("Chrome runtime is not available. Ensure this is running in a Chrome extension environment.");
    }
  } catch (error) {
    console.error("Failed to retrieve tabs:", error);
  }
};

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
  // const updateProjectCategories = async () => {
  //   try {
  //     // Update general projects
  //     setProjects(
  //       projects.map((project) => {
  //         if (project.completed) return project; // Skip completed projects
  //         const newCategory = determineSystemCategory(project.dueDate);
  //         return { ...project, systemCategory: newCategory };
  //       })
  //     );
  
  //     // Update user category projects
  //     for (const category of projectCategories) {
  //       const categoryRef = doc(db, `projects/${userId}/userCategories`, category.id);
  //       const categorySnapshot = await getDoc(categoryRef);
  
  //       if (categorySnapshot.exists()) {
  //         const categoryData = categorySnapshot.data();
  
  //         const updatedProjects = categoryData.projects.map((projectId) => {
  //           const project = projects.find((p) => p.id === projectId);
  //           if (!project || project.completed) return project; // Skip completed projects
  //           const newCategory = determineSystemCategory(project.dueDate);
  //           return { ...project, systemCategory: newCategory };
  //         });
  
  //         // Update local state
  //         setUserCategoryProjects((prev) => ({
  //           ...prev,
  //           [category.id]: updatedProjects,
  //         }));
  //       }
  //     }
  //   } catch (error) {
  //     console.error("Error updating project categories:", error);
  //   }
  // };

  const updateProjectCategories = () => {
    setProjects((prevProjects) =>
      prevProjects.map((project) => {
        if (project.completed) return project; // Skip completed projects
        const newCategory = determineSystemCategory(project.dueDate);
        return { ...project, systemCategory: newCategory };
      })
    );
  };

  // Update categories when component mounts and daily
  useEffect(() => {
    updateProjectCategories()
    // Set up a daily check to update categories
    const interval = setInterval(updateProjectCategories, 1000 * 60 * 60 * 24) // Once a day
    return () => clearInterval(interval)
  }, [])

  // Function to add a new category
  const addNewCategory = async () => {
    if (newCategory.name.trim() === "") return;
    
    const newId = `category-${Date.now()}`; // Generate a unique ID
    const newUserCategory = {
      id: newId,
      name: newCategory.name,
      icon: newCategory.icon,
      description: newCategory.description || "",
      projects: [], // Initialize with an empty projects array
    };
  
    try {
      // Save the new category to Firestore
      const categoryRef = doc(db, `projects/${userId}/userCategories`, newId);
      await setDoc(categoryRef, newUserCategory);
  
      // Update local state
      setProjectCategories([...projectCategories, newUserCategory]);
  
      // Reset form and close modal
      setNewCategory({
        name: "",
        icon: "briefcase",
        description: "",
      });
      setShowNewCategoryModal(false);
  
      // Automatically select the new category
      setSelectedUserCategory(newId);
      setSelectedSystemCategory(null);
  
      console.log("Category created successfully!");
    } catch (error) {
      console.error("Error creating category:", error);
    }
  };

  // Function to handle selecting a user category
  const selectUserCategory = async (categoryId) => {
    console.log("category id:", categoryId)
    setSelectedUserCategory(categoryId);
    setSelectedSystemCategory(null);
    setIsMenuOpen(false);
  
    try {
      console.log("user:", userId)
      const categoryRef = doc(db, `projects/${userId}/userCategories`, categoryId);
      const categorySnapshot = await getDoc(categoryRef);
  
      if (categorySnapshot.exists()) {
        // Don't modify the projects array here
        // Just set the selected category and let the filteredProjects hook handle it
        
        // You might want to update the category data in your projectCategories state
        const categoryData = categorySnapshot.data();
        setProjectCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === categoryId ? {...cat, projects: categoryData.projects} : cat
          )
        );
        
      } else {
        console.error("Category not found in Firestore.");
      }
    } catch (error) {
      console.error("Error fetching category:", error);
    }
};

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

  const deleteCategory = async (categoryId) => {
    try {
      // Delete the category from Firestore
      const categoryRef = doc(db, `projects/${userId}/userCategories`, categoryId);
      await deleteDoc(categoryRef);
  
      // Remove the category from local state
      setProjectCategories(
        projectCategories.filter((category) => category.id !== categoryId)
      );
  
      console.log("Category deleted successfully!");
    } catch (error) {
      console.error("Error deleting category:", error);
    }
  };

  // Function to delete a project with confirmation
  const initiateDelete = (id) => {
    setProjectToDelete(id)
    setShowDeleteConfirm(true)
  }

  // fujai confirm Delete
  // if (selectedUserCategory) {
  //   // Delete from user category projects
  //   setUserCategoryProjects((prev) => ({
  //     ...prev,
  //     [selectedUserCategory]: prev[selectedUserCategory].filter((project) => project.id !== projectToDelete),
  //   }))
  // } else {
  //   // Delete from all projects regardless of completion status
  //   setProjects(projects.filter((project) => project.id !== projectToDelete))

  //   // Also check and delete from user categories if it's a completed project being viewed in "Completed" section
  //   if (selectedSystemCategory === "Completed") {
  //     Object.keys(userCategoryProjects).forEach((categoryId) => {
  //       setUserCategoryProjects((prev) => ({
  //         ...prev,
  //         [categoryId]: prev[categoryId].filter((project) => project.id !== projectToDelete),
  //       }))
  //     })
  //   }
  // }
  // setShowDeleteConfirm(false)
  // setProjectToDelete(null)

  const confirmDelete = () => {
    if (projectToDelete !== null) {
      deleteProjectFromFirestore({
        userId: user.uid,
        projectId: projectToDelete.toString(),
        onSuccess: () => {
          // Remove the project from local state
          setProjects(projects.filter((project) => project.id !== projectToDelete));
          setShowDeleteConfirm(false);
          setProjectToDelete(null);
        },
        onError: (error) => {
          console.error("Error deleting project:", error);
        },
      })
    }
  }

  const uploadHelper = async (e) => {
    if (e && e.target && e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      handleProfilePictureUpload(file, setProfilePicture); // Update the state with the selected file
    }
    
    if (!profilePicture) {
      toast.error("Please select a profile picture before saving.", {
        position: "top-center",
        autoClose: 3000,
        className: "font-passion-one text-xl",
        style: { backgroundColor: "#f44336", color: "white" },
      });
      return;
    }
  
    try {
      toast.info("Uploading profile picture...", {
        position: "top-center",
        autoClose: false,
        hideProgressBar: false,
        closeOnClick: false,
        pauseOnHover: true,
        draggable: false,
        className: "font-passion-one text-xl",
      });
  
      // Upload the profile picture and get the new photoURL
      const photoURL = await uploadProfilePicture(user.uid, profilePicture, storage);
  
      // Update the user's profile with the new photoURL
      await updateProfile(user, {
        photoURL: photoURL,
      });

      // await updateProfile({ photoURL });
  
      // // Update the user state with the new photoURL
      // setUser({ ...user, photoURL });
  
      toast.dismiss();
      toast.success("Profile picture updated successfully!", {
        position: "top-center",
        autoClose: 3000,
        className: "font-passion-one text-xl",
      });
  
      // Refresh the page to display the updated profile picture
      window.location.reload();
    } catch (error) {
      console.error("Error uploading profile picture:", error);
      toast.dismiss();
      toast.error("Failed to upload profile picture. Please try again.", {
        position: "top-center",
        autoClose: 3000,
        className: "font-passion-one text-xl",
        style: { backgroundColor: "#f44336", color: "white" },
      });
    }
  };

  // Function to initiate project completion
  const initiateCompletion = (id) => {
    setProjectToComplete(id)
    setShowCompletionConfirm(true)
  }

  // Function to confirm project completion and move to Completed
  const confirmCompletion = () => {
    if (projectToComplete !== null) {
      const currentDate = new Date().toISOString().split("T")[0] // Get the current date in YYYY-MM-DD format
  
      // Update the local state
      setProjects(
        projects.map((project) =>
          project.id === projectToComplete
            ? { ...project, systemCategory: "Completed", completed: true, completionDate: currentDate, progress: 100 }
            : project
        )
      )
  
      // Update the project in Firestore
      modifyProjectInFirestore({
        userId: user.uid,
        projectId: projectToComplete.toString(),
        updatedData: { systemCategory: "Completed", completed: true, completionDate: currentDate,  progress: 100 },
        onSuccess: () => {
          console.log("Project marked as completed and updated in Firestore!");
        },
        onError: (error) => {
          console.error("Error updating project completion in Firestore:", error);
        },
      })
  
      // Close the confirmation modal
      setShowCompletionConfirm(false);
      setProjectToComplete(null);
    }
  }

  // Function to update project progress
  const updateProgress = (id, newProgress) => {
      // Find the project to check its systemCategory
    const project = projects.find((project) => project.id === id);

    // If the project is completed, prevent progress updates
    if (project && project.systemCategory === "Completed") {
      console.log("Cannot update progress for a completed project.");
      return;
    }

    // Update the local state
    setProjects(
      projects.map((project) =>
        project.id === id ? { ...project, progress: newProgress } : project
      )
    );
  
    // Update the project in Firestore
    modifyProjectInFirestore({
      userId: user.uid,
      projectId: id.toString(),
      updatedData: { progress: newProgress },
      onSuccess: () => {
        console.log("Progress updated successfully in Firestore!");
      },
      onError: (error) => {
        console.error("Error updating progress in Firestore:", error);
      },
    });

    if (newProgress === 100){
      initiateCompletion(id)
    }
  };

   // Function to add a new project - to the currently selected category
   const addNewProject = async () => {
    if (newProject.name.trim() === "") {
      toast.error("Project name cannot be empty!");
      return;
    }
  
    if (!user.uid) {
      toast.error("User ID is missing. Please log in.");
      return;
    }
  
    const newId = Math.max(...projects.map((p) => p.id), 0) + 1;
  
    const projectData = {
      id: newId,
      name: newProject.name,
      progress: 0,
      dueDate: newProject.dueDate,
      difficulty: newProject.difficulty,
      systemCategory: determineSystemCategory(newProject.dueDate),
      completed: false,
      saveTabs: newProject.saveTabs,
      tabs: [],
    };
  
    // Add the project to the local state
    setProjects([...projects, { ...projectData, timeLeft: calculateTimeLeft(newProject.dueDate) }]);
  
    try {
      // Upload the project to Firestore
      await uploadProjectToFirestore({
        userId,
        userName,
        userMail,
        projectData,
      });
  
      console.log("Project uploaded successfully!");
  
      // If a user category is selected, move the project to that category

      // works for edits
      // if (selectedUserCategory) {
      //   console.log(selectedUserCategory.id)
      //   console.log(newId)
      //   await moveProjectToCategory(newId, selectedUserCategory);
      // }

      const categoryToUse = newProject.category || selectedUserCategory;
    
      // If any category is selected, move the project to that category
      if (categoryToUse) {
        await moveProjectToCategory(newId, categoryToUse);
        console.log("Added to category:", categoryToUse);
      }
  

      // If saveTabs is true, save the tabs to Firestore
      if (newProject.saveTabs) {
        if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.connect) {
          const TabMarkHelperID = "ombjnnoklkbbmedngjcmbljnlppbdlcf";
          const port = chrome.runtime.connect(TabMarkHelperID, { name: "frontend-connection" });
  
          port.postMessage({ action: "saveTabs" });
          port.onMessage.addListener(async (response) => {
            if (response?.success) {
              try {
                const tabs = response.tabs.map((tab) => ({ url: tab.url, title: tab.title }));
                await saveTabsToFirestore(user.uid, newId, tabs); // Save tabs to Firestore
                console.log("Tabs saved successfully!");
              } catch (error) {
                console.error("Failed to save tabs:", error);
              }
            } else {
              console.error("Failed to retrieve tabs from Chrome extension:", response?.error);
            }
          });
        } else {
          console.error("Chrome runtime is not available. Ensure this is running in a Chrome extension environment.");
        }
      }
    } catch (error) {
      console.error("Error uploading project:", error);
    }
  
    // Reset form and close modal
    setNewProject({
      name: "",
      dueDate: today,
      difficulty: "Easy",
      saveTabs: true,
      category: null,
    });
    setShowNewProjectModal(false);
  };

  // console.log("Selected System Category:", selectedSystemCategory);

  // Helper function to calculate time left text
  // const calculateTimeLeft = (dueDate) => {
  //   if (!dueDate) return ""

  //   const due = new Date(dueDate)
  //   const now = new Date()
  //   const diffTime = due.getTime() - now.getTime()
  //   const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

  //   if (diffDays < 0) return "Past due"
  //   if (diffDays === 0) return "Today"
  //   if (diffDays === 1) return "Tomorrow"
  //   if (diffDays < 7) return `${diffDays} days left`
  //   if (diffDays < 14) return "1 week left"
  //   if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks left`
  //   return `${Math.floor(diffDays / 30)} months left`
  // }

  // Helper function to get days difference
  const daysDifference = (dueDate) => {
    if (!dueDate) return 0

    const due = new Date(dueDate)
    const now = new Date()
    const diffTime = due.getTime() - now.getTime()
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  }

  const handleLogout = async () => {
    try {
      await signOut(auth)       // logs the user out, triggerd onAuthStateChagned to set user object to null
      navigate("/sign-up")
      console.log("Logged out successfully")
      toast.success("Logged out successfully", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "font-passion-one text-xl"
      })
    } catch (error){
      console.log("Error logging out: ", error.message)
      toast.error("Error logging out. Please try again momentarily.", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "font-passion-one text-xl",
        style: { backgroundColor: "#f44336", color: "white" }
      })
    }
  }

  // possible conflict

// Replace the existing filteredProjects definition with this more comprehensive version
const filteredProjects = useMemo(() => {
  if (!selectedUserCategory && !selectedSystemCategory) {
    // Show all projects except completed ones
    return projects.filter((project) => project.systemCategory !== "Completed");
  }

  if (selectedUserCategory) {
    const category = projectCategories.find((cat) => cat.id === selectedUserCategory);
    if (!category) return [];

    const categoryProjects = projects.filter((project) =>
      category.projects.includes(project.id)
    );

    if (selectedSystemCategory) {
      return categoryProjects.filter(
        (project) => project.systemCategory === selectedSystemCategory
      );
    }

    return categoryProjects;
  }

  if (selectedSystemCategory) {
    return projects.filter((project) => project.systemCategory === selectedSystemCategory);
  }

  return [];
}, [projects, selectedUserCategory, selectedSystemCategory, projectCategories]);

  // Get projects to display based on selected categories
  // const getDisplayProjects = () => {
  //   if (selectedUserCategory) {
  //     // Get projects from the selected user category
  //     const categoryProjects = userCategoryProjects[selectedUserCategory] || []

  //     // If a system category is also selected, filter by that too
  //     if (selectedSystemCategory) {
  //       return categoryProjects.filter((project) => project.systemCategory === selectedSystemCategory)
  //     }

  //     return categoryProjects
  //   } else if (selectedSystemCategory) {
  //     // Get all projects with the selected system category

  //     // From general projects
  //     const generalProjects = projects.filter((project) => project.systemCategory === selectedSystemCategory)

  //     // From all user categories
  //     const userProjects = Object.values(userCategoryProjects)
  //       .flat()
  //       .filter((project) => project.systemCategory === selectedSystemCategory)

  //     return [...generalProjects, ...userProjects]
  //   }

  //   // If no categories selected, return all projects EXCEPT completed ones
  //   const allProjects = [
  //     ...projects.filter((project) => !project.completed),
  //     ...Object.values(userCategoryProjects)
  //       .flat()
  //       .filter((project) => !project.completed),
  //   ]

  //   return allProjects
  // }


  const getDisplayProjects = () => {
    if (selectedUserCategory) {
      const categoryProjects = userCategoryProjects[selectedUserCategory] || [];
  
      // Filter by system category if selected
      if (selectedSystemCategory) {
        return categoryProjects.filter(
          (project) => project.systemCategory === selectedSystemCategory
        );
      }
  
      return categoryProjects;
    } else if (selectedSystemCategory) {
      return projects.filter(
        (project) => project.systemCategory === selectedSystemCategory
      );
    }
  
    // Default: Show all projects except completed ones
    return projects.filter((project) => !project.completed);
  };

  // Get all projects for calendar view (no filtering)
  const getAllProjects = () => {
    return [...projects, ...Object.values(userCategoryProjects).flat()]
  }

  // const displayProjects = getDisplayProjects()

  // Static images for difficulty levels
  const getDifficultyIcon = (difficulty) => {
    switch (difficulty) {
      case "Easy":
        return (
          <div className="flex items-center">
          <div className="mr-3 relative w-12 h-12 flex items-center justify-center">
            <img 
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/output-onlinegiftools-zVXDeNPuWheOjfSfHgpv3R96ceiRG8.gif" 
              alt="Running figure - Easy difficulty" 
              className="w-full h-full object-contain"
            />
          </div>
            <span className="text-base text-gray-500">Easy</span>
          </div>
        )
      case "Medium":
        return (
          <div className="flex items-center">
            <div className="mr-3 relative w-12 h-12 flex items-center justify-center">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/climbingFix-TXH4C1kG5ydMgrc8LZALJ2JrQwfngh.gif" 
                alt="Climbing figure - Medium difficulty" 
                className="w-full h-full object-contain"
              />
            </div>
            <span className="text-base text-gray-500">Medium</span>
          </div>
        )
      case "Hard":
        return (
          <div className="flex items-center">
            <div className="mr-3 relative w-12 h-12 flex items-center justify-center">
              <img 
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/drowningFix-eiWzjCgLQJkbPA60x0JrFS9FVguKWh.gif" 
                alt="Drowning hand - Hard difficulty" 
                className="w-full h-full object-contain"
              />
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
    { id: "Completed", name: "Completed", color: "bg-green-500" },
  ]


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
      return userCategory ? userCategory.name : ""
    } else if (selectedUserCategory) {
      const category = projectCategories.find((cat) => cat.id === selectedUserCategory)
      return category ? category.name : ""
    } else if (selectedSystemCategory) {
      const category = systemCategories.find((cat) => cat.id === selectedSystemCategory)
      return "All Projects"
    }
    return "All Projects"
  }

  useEffect(() => {
    const fetchCategoriesFromFirestore = async () => {
      try {
        if (!userId) return;
  
        const categoriesRef = collection(db, `projects/${userId}/userCategories`);
        const snapshot = await getDocs(categoriesRef);
  
        if (!snapshot.empty) {
          const categories = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data(),
          }));
  
          setProjectCategories(categories);
          console.log("Categories fetched successfully:", categories);
        } else {
          console.log("No categories found in Firestore.");
        }
      } catch (error) {
        console.error("Error fetching categories from Firestore:", error);
      }
    };
  
    fetchCategoriesFromFirestore();
  }, [userId]);

  // Add this function to handle editing a project
  const initiateEditProject = (id) => {
    const project = projects.find(p => p.id === id);
    if (project) {
      // Log project properties to help debug
      console.log("Editing project:", project);
      
      setProjectToEdit({
        ...project,
        // Use BOTH category properties for consistency
        category: project.userCategory || project.category || null,
        userCategory: project.userCategory || project.category || null,
        previousCategory: project.userCategory || project.category || null
      });
      setShowEditProjectModal(true);
    } else {
      console.error("Project not found:", id);
    }
  }
    // Function to confirm project completion and move to Completed
// Replace the existing confirmEdit function with this version
  const confirmEdit = () => {
    if (!projectToEdit) return;

    if (!projectToEdit.saveTabs && projectToEdit.tabs && projectToEdit.tabs.length > 0) {
      projectToEdit.saveTabs = true; // Revert saveTabs to true if tabs exist
    }
    
    // Update the local state - projectToEdit is already the full project object
    setProjects(
      projects.map((project) =>
        project.id === projectToEdit.id // Compare IDs here
          ? { 
              ...project, 
              name: projectToEdit.name, 
              dueDate: projectToEdit.dueDate, 
              difficulty: projectToEdit.difficulty,
              timeLeft: calculateTimeLeft(projectToEdit.dueDate),
              systemCategory: determineSystemCategory(projectToEdit.dueDate)
            }
          : project
      )
    );

    // Update the project in Firestore
    modifyProjectInFirestore({
      userId: user.uid,
      projectId: projectToEdit.id.toString(), // Use projectToEdit.id here
      updatedData: { 
        name: projectToEdit.name, 
        dueDate: projectToEdit.dueDate, 
        difficulty: projectToEdit.difficulty
      },
      onSuccess: () => {
        console.log("Project edited and updated in Firestore!");
        if (projectToEdit.saveTabs) {
          if (typeof chrome !== "undefined" && chrome.runtime && chrome.runtime.connect) {
            const TabMarkHelperID = "ombjnnoklkbbmedngjcmbljnlppbdlcf";
            const port = chrome.runtime.connect(TabMarkHelperID, { name: "frontend-connection" });
  
            port.postMessage({ action: "saveTabs" });
            port.onMessage.addListener(async (response) => {
              if (response?.success) {
                try {
                  const tabs = response.tabs.map((tab) => ({
                    url: tab.url,
                    title: tab.title,
                  }));
                  await saveTabsToFirestore(user.uid, projectToEdit.id, tabs); // Save tabs to Firestore
                  console.log("Tabs saved successfully!");
                } catch (error) {
                  console.error("Failed to save tabs:", error);
                }
              } else {
                console.error("Failed to retrieve tabs from Chrome extension:", response?.error);
              }
            });
          } else {
            console.error("Chrome runtime is not available. Ensure this is running in a Chrome extension environment.");
          }
        }

        if (projectToEdit.category !== projectToEdit.previousCategory) {
          moveProjectToCategory(projectToEdit.id, projectToEdit.category);
          console.log("Moved to category with ID: ", projectToEdit.category)
        }

        // Close the modal after successful update
        setShowEditProjectModal(false);
        setProjectToEdit(null);
      },
      onError: (error) => {
        console.error("Error updating project in Firestore:", error);
      },
    });
  };

  // Add this function to save edited project
  // const saveEditedProject = () => {
  //   if (!projectToEdit) return

  //   // Preserve the system category if it's "Completed", otherwise recalculate
  //   const systemCategory =
  //     projectToEdit.systemCategory === "Completed" ? "Completed" : determineSystemCategory(projectToEdit.dueDate)

  //   // Recalculate time left
  //   const timeLeft = calculateTimeLeft(projectToEdit.dueDate)

  //   const updatedProject = {
  //     ...projectToEdit,
  //     timeLeft,
  //     systemCategory,
  //     alert: timeLeft === "Today" && systemCategory !== "Completed",
  //   }

  //   // First, find and remove the project from its original location
  //   let originalCategory = null
  //   let found = false

  //   // Check if it's in the general projects
  //   const updatedProjects = projects.filter((p) => {
  //     if (p.id === updatedProject.id) {
  //       found = true
  //       return false // Remove it
  //     }
  //     return true
  //   })

  //   if (found) {
  //     setProjects(updatedProjects)
  //   } else {
  //     // Check in user categories
  //     for (const categoryId in userCategoryProjects) {
  //       if (userCategoryProjects[categoryId].some((p) => p.id === updatedProject.id)) {
  //         originalCategory = categoryId
  //         break
  //       }
  //     }

  //     if (originalCategory) {
  //       setUserCategoryProjects((prev) => ({
  //         ...prev,
  //         [originalCategory]: prev[originalCategory].filter((p) => p.id !== updatedProject.id),
  //       }))
  //     }
  //   }

  //   // Then add the project to its new location
  //   if (updatedProject.userCategory) {
  //     // Add to user category
  //     setUserCategoryProjects((prev) => ({
  //       ...prev,
  //       [updatedProject.userCategory]: [...(prev[updatedProject.userCategory] || []), updatedProject],
  //     }))
  //   } else {
  //     // Add to general projects
  //     setProjects((prev) => [...prev, updatedProject])
  //   }

    // setShowEditProjectModal(false)
    // setProjectToEdit(null)
  // }

  // Add this function to handle editing a category
  const initiateEditCategory = (category) => {
    setcategoryToEdit({
      ...category,
      description: category.description || "", // Ensure description exists
    })
    setShowEditCategoryModal(true)
  }

  // Add this function to save edited category
  const saveEditedCategory = async () => {
    if (!categoryToEdit || categoryToEdit.name.trim() === "") return;
  
    try {
      // Update the category in Firestore
      const categoryRef = doc(db, `projects/${userId}/userCategories`, categoryToEdit.id);
      await updateDoc(categoryRef, {
        name: categoryToEdit.name,
        description: categoryToEdit.description,
        icon: categoryToEdit.icon,
      });
  
      // Update local state
      setProjectCategories(
        projectCategories.map((category) =>
          category.id === categoryToEdit.id ? categoryToEdit : category
        )
      );
  
      setShowEditCategoryModal(false);
      setcategoryToEdit(null);
  
      console.log("Category updated successfully!");
    } catch (error) {
      console.error("Error updating category:", error);
    }
  };

  // Add this function to move a project to a different category
  // const moveProjectToCategory = (projectId, newCategoryId) => {
  //   // Find the project in all possible locations
  //   let projectToMove = null
  //   let sourceCategory = null

  //   // Check in general projects
  //   const generalProject = projects.find((p) => p.id === projectId)
  //   if (generalProject) {
  //     projectToMove = { ...generalProject }
  //     sourceCategory = null
  //   } else {
  //     // Check in user categories
  //     for (const [categoryId, categoryProjects] of Object.entries(userCategoryProjects)) {
  //       const foundProject = categoryProjects.find((p) => p.id === projectId)
  //       if (foundProject) {
  //         projectToMove = { ...foundProject }
  //         sourceCategory = categoryId
  //         break
  //       }
  //     }
  //   }

  //   if (!projectToMove) return

  //   // Remove from source
  //   if (sourceCategory) {
  //     setUserCategoryProjects((prev) => ({
  //       ...prev,
  //       [sourceCategory]: prev[sourceCategory].filter((p) => p.id !== projectId),
  //     }))
  //   } else {
  //     setProjects(projects.filter((p) => p.id !== projectId))
  //   }

  //   // Add to destination
  //   if (newCategoryId) {
  //     projectToMove.userCategory = newCategoryId
  //     setUserCategoryProjects((prev) => ({
  //       ...prev,
  //       [newCategoryId]: [...(prev[newCategoryId] || []), projectToMove],
  //     }))
  //   } else {
  //     projectToMove.userCategory = null
  //     setProjects([...projects, projectToMove])
  //   }
  // }

  const moveProjectToCategory = async (projectId, newCategoryId) => {
    // Find the project in the current state
    const project = projects.find((p) => p.id === projectId);
    if (!project) {
      console.error("Project not found:", projectId);
      return;
    }
    
    console.log("Moving project:", projectId);
    
    try {
      // 1. First check if the new category exists before attempting any changes
      if (newCategoryId) {
        const newCategoryRef = doc(db, `projects/${userId}/userCategories`, newCategoryId);
        const newCategoryDoc = await getDoc(newCategoryRef);
        
        if (!newCategoryDoc.exists()) {
          console.error("Target category doesn't exist:", newCategoryId);
          toast.error("Selected category doesn't exist");
          return;
        }
      }
      
      // 2. Only then try to remove from old category if it exists
      const oldCategoryId = project.category || project.userCategory;
      if (oldCategoryId) {
        try {
          const oldCategoryRef = doc(db, `projects/${userId}/userCategories`, oldCategoryId);
          const oldCategoryDoc = await getDoc(oldCategoryRef);
          
          if (oldCategoryDoc.exists()) {
            await updateDoc(oldCategoryRef, {
              projects: arrayRemove(projectId),
            });
            console.log("Removed from previous category:", oldCategoryId);
            setProjectCategories(prevCategories => 
              prevCategories.map(cat => 
                cat.id === oldCategoryId 
                  ? {...cat, projects: cat.projects.filter(id => id !== projectId)} 
                  : cat
              )
            );
          }
        } catch (removeError) {
          console.log("Error removing from category - continuing anyway:", removeError);
          // Continue with the rest of the function even if this fails
        }
      }
  
      // 3. Add to new category
      if (newCategoryId) {
        const newCategoryRef = doc(db, `projects/${userId}/userCategories`, newCategoryId);
        await updateDoc(newCategoryRef, {
          projects: arrayUnion(projectId),
        });
        console.log("Added to new category:", newCategoryId);

        setProjectCategories(prevCategories => 
          prevCategories.map(cat => 
            cat.id === newCategoryId 
              ? {...cat, projects: [...(cat.projects || []), projectId]} 
              : cat
          )
        );
      }
  
      // 4. Update the project in Firestore to track its category
      await modifyProjectInFirestore({
        userId: user.uid,
        projectId: projectId.toString(),
        updatedData: { 
          category: newCategoryId,
          userCategory: newCategoryId
        },
        onSuccess: () => {
          console.log("Project category updated in Firestore");
        },
        onError: (error) => {
          console.error("Error updating project category in Firestore:", error);
        }
      });
  
      // 5. Update local state
      setProjects(
        projects.map((p) =>
          p.id === projectId ? { 
            ...p, 
            userCategory: newCategoryId,
            category: newCategoryId
          } : p
        )
      );
  
      console.log("Project moved successfully!");
    } catch (error) {
      console.error("Error moving project:", error);
      toast.error("Failed to move project: " + error.message);
    }
  };

    // Calendar helper functions
    const daysInMonth = (month, year) => {
      return new Date(year, month + 1, 0).getDate()
    }
  
    const firstDayOfMonth = (month, year) => {
      return new Date(year, month, 1).getDay()
    }
  
    const prevMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1))
    }
  
    const nextMonth = () => {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1))
    }
  
    // Get projects for a specific date
    const getProjectsForDate = (date) => {
      const allProjects = getAllProjects()
      return allProjects.filter((project) => {
        if (!project.dueDate) return false
        const dueDate = new Date(project.dueDate + 'T00:00:00') // need to specify midnight due date to counteract timezone differences
        return (
          dueDate.getDate() === date.getDate() &&
          dueDate.getMonth() === date.getMonth() &&
          dueDate.getFullYear() === date.getFullYear()
        )
      })
    }
  
    // Format date as YYYY-MM-DD
    const formatDate = (date) => {
      const year = date.getFullYear()
      const month = String(date.getMonth() + 1).padStart(2, "0")
      const day = String(date.getDate()).padStart(2, "0")
      return `${year}-${month}-${day}`
    }
  
    // Check if a date is today
    const isToday = (date) => {
      const today = new Date()
      return (
        date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear()
      )
    }
  
    // Render calendar
    const renderCalendar = () => {
      const month = currentMonth.getMonth()
      const year = currentMonth.getFullYear()
      const daysCount = daysInMonth(month, year)
      const firstDay = firstDayOfMonth(month, year)
  
      const monthNames = [
        "January",
        "February",
        "March",
        "April",
        "May",
        "June",
        "July",
        "August",
        "September",
        "October",
        "November",
        "December",
      ]

      const monthIcons = {     // cool little icons for each month
        January: <Flower size={32} className="text-[#FF8C6B] animate-spin" style={{ animationDuration: '3s' }} />,
        February: <Flower size={32} className="text-[#FF8C6B] animate-spin" style={{ animationDuration: '3s' }} />,
        March: <Flower size={32} className="text-[#FF8C6B] animate-spin" style={{ animationDuration: '3s' }} />,
        April: <Flower size={32} className="text-[#FF8C6B] animate-spin" style={{ animationDuration: '3s' }} />,
        May: <Sun size={32} className="text-[#FF8C6B] animate-spin" style={{ animationDuration: '3s' }} />,
        June: <Sun size={32} className="text-[#FF8C6B] animate-spin" style={{ animationDuration: '3s' }} />,
        July: <Sun size={32} className="text-[#FF8C6B] animate-spin" style={{ animationDuration: '3s' }} />,
        August: <Sun size={32} className="text-[#FF8C6B] animate-spin" style={{ animationDuration: '3s' }} />,
        September: <Snowflake size={32} className="text-[#FF8C6B] animate-spin" style={{ animationDuration: '3s' }} />,
        October: <Snowflake size={32} className="text-[#FF8C6B] animate-spin" style={{ animationDuration: '3s' }} />,
        November: <Snowflake size={32} className="text-[#FF8C6B] animate-spin" style={{ animationDuration: '3s' }} />,
        December: <Snowflake size={32} className="text-[#FF8C6B] animate-spin" style={{ animationDuration: '3s' }} />,
      }
  
      const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
  
      // Create calendar days
      const days = []
  
      // Add empty cells for days before the first day of the month
      for (let i = 0; i < firstDay; i++) {
        days.push(<div key={`empty-${i}`} className="h-24 border border-gray-200 bg-gray-50"></div>)
      }
  
      // Add cells for each day of the month
      for (let day = 1; day <= daysCount; day++) {
        const date = new Date(year, month, day)
        const dateString = formatDate(date)
        const projectsForDay = getProjectsForDate(date)
  
        days.push(
          <div
            key={day}
            className={`h-24 border border-gray-200 p-1 overflow-y-auto ${isToday(date) ? "bg-[#fff0e0]" : "bg-white"}`}
          >
            <div className="mb-1">
              <span className={`text-sm font-medium ${isToday(date) ? "text-[#FF8C6B]" : ""}`}>{day}</span>
            </div>
            <div className="space-y-1">
              {projectsForDay.map((project) => {
                // Determine background and text color based on system category
                let bgColor = "bg-[#ffece3]"
                let textColor = "text-[#FF8C6B]"
  
                if (project.completed) {
                  bgColor = "bg-green-100"
                  textColor = "text-green-800"
                } else if (project.systemCategory === "Urgent") {
                  bgColor = "bg-red-200"
                  textColor = "text-red-800"
                } else if (project.systemCategory === "Upcoming") {
                  bgColor = "bg-orange-200"
                  textColor = "text-orange-800"
                } else if (project.systemCategory === "Trivial") {
                  bgColor = "bg-yellow-200"
                  textColor = "text-yellow-800"
                }
  
                return (
                  <div
                  key={project.id}
                  className={`text-lg p-1 rounded truncate font-passion-one ${bgColor} ${textColor} ${project.completed ? "line-through" : ""}`}
                  title={project.name}
                >
                  {project.name}
                </div>
                )
              })}
            </div>
          </div>,
        )
      }
  
      return (
        <div className="bg-[#f8eece] rounded-lg p-4">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center space-x-6">
              <h2 className="text-3xl font-bold text-[#FF8C6B] font-abril-fatface">
                {monthNames[month]} {year}
              </h2>
              {monthIcons[monthNames[month]]}
            </div>
            <div className="flex space-x-2 mt-0">
              <button onClick={prevMonth} className="p-2 rounded-md hover:bg-[#f5e5b5] text-[#FF8C6B]">
                <ChevronLeft size={28} />
              </button>
              <button onClick={nextMonth} className="p-2 rounded-md hover:bg-[#f5e5b5] text-[#FF8C6B]">
                <ChevronRight size={28} />
              </button>
            </div>
          </div>
  
          <div className="grid grid-cols-7 gap-1">
            {/* Day headers */}
            {dayNames.map((day) => (
              <div key={day} className="text-center text-3xl font-jomhuria font-medium py-2 text-[#3B0764]">
                {day}
              </div>
            ))}
  
            {/* Calendar days */}
            {days}
          </div>
  
          {getAllProjects().length === 0 && (
            <div className="mt-6 text-center py-8">
              <p className="text-gray-500 mb-4">Your projects will appear here when you add them.</p>
              <button
                onClick={() => setShowNewProjectModal(true)}
                className="px-4 py-2 bg-[#FF8C6B] text-white rounded-md hover:bg-[#ff7a55]"
              >
                Create Project
              </button>
            </div>
          )}
          <div className = "mt-5">
            <p className = "racing-sans-one-regular text-[#FF8C6B]">Note: Calendar View is global - shows projects of all categories</p>
          </div>
        </div>
      )
    }

  if (loading || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="font-jomhuria text-4xl text-gray-500">
          {loading ? "Loading..." : "Redirecting..."}
        </p>
      </div>
    );
  } else {
  return (
    <div className="min-h-screen bg-[#f8eece] relative overflow-x-hidden [&_button]:cursor-pointer">
      {/* Fetch projects from Firestore */}
      <FetchProjectsFromFirestore
          userId={user.uid}
          onProjectsFetched={(fetchedProjects) => {
            setProjects(fetchedProjects);
          }}
        />
      {/* Sidebar Menu */}
      <div
        ref={sidebarRef}
        className={`fixed top-0 left-0 h-full w-64 bg-[#f8eece] shadow-lg z-50 transform transition-transform duration-300 ease-in-out ${
          isMenuOpen ? "translate-x-0" : "-translate-x-full"
        } flex flex-col justify-between`}
      >
        <div className="p-6">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-5xl font-bold font-jomhuria tracking-wide text-[#FF8C6B] mt-3">TabMark</h2>
            <img
                src="../public/bookmark-64.png"
                alt="TabMark Logo"
                className="h-8 w-8 mr-4 mt-1"
              />
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
              className="flex items-center justify-center w-full px-3 py-2 rounded-md transition-colors text-xl racing-sans-one-regular bg-[#FF8C6B] hover:bg-[#f5e5b5] text-[#f8eece] hover:text-[#FF8C6B] font-medium"
            >
              <span>All Projects</span>
            </button>
          </div>

          <div>
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-m uppercase text-[#4a2b40] font-passion-one font-medium">Project Categories</h3>
              <button
                onClick={() => setShowNewCategoryModal(true)}
                className="bg-[#FF8C6B] text-white hover:bg-[#ff7a55] flex items-center text-sm font-abril-fatface font-medium px-3 py-1 rounded-md"
              >
                <Plus size={16} className="mr-1" />
                New
              </button>
            </div>

            {projectCategories.length === 0 ? (
                <div className="py-4 px-3 bg-[#f8eece] rounded-md text-center mb-4">
                  <p className="text-sm text-gray-500 oleo-script-regular">No categories yet</p>
                  <button
                    onClick={() => setShowNewCategoryModal(true)}
                    className="mt-2 text-[#FF8C6B] hover:text-[#ff7a55] text-sm font-medium font-passion-one"
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
                              ? "bg-[#fff0e0] text-[#FF8C6B] text-sm font-chela-one-regular"
                              : "hover:bg-[#f5e5b5] text-[#4a2b40] text-sm font-chela-one-regular"
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
                        className="p-0 text-gray-400 hover:text-[#FF8C6B]"
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
        <div className="p-4 flex items-center justify-start">
          <p className="text-lg racing-sans-one-regular text-[#FF8C6B] flex items-center gap-4">
            Bays Inc. 2025 ©
            <Leaf size={22} className="text-[#FF8C6B] translate-y-0" />
          </p>
        </div>
      </div>

      {/* New Category Modal */}
      {showNewCategoryModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 "
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            onClick={() => setShowNewCategoryModal(false)}
          ></div>
          <div className="bg-[#f8eece] rounded-2xl shadow-xl w-full max-w-md relative z-10">
            <div className="px-6 py-4 border-b border-gray-200 rounded-t-2xl">
              <h2 className="text-5xl tracking-wide font-bold text-[#3B0764] font-jomhuria">Create New Category</h2>
              <button
                onClick={() => setShowNewCategoryModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-4 space-y-4">
              <div>
                <label className="block text-lg font-medium text-[#3B0764] mb-1 font-passion-one">Category Name</label>
                <input
                  type="text"
                  placeholder="e.g. Work Projects, School Assignments"
                  className="w-full text-xs font-spline-sans-tab px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C6B]"
                  value={newCategory.name}
                  onChange={(e) => setNewCategory({ ...newCategory, name: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-[#3B0764] mb-1 font-passion-one">Description</label>
                <textarea
                  placeholder="Enter a description for this category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-xs font-spline-sans-tab focus:outline-none focus:ring-2 focus:ring-[#FF8C6B] min-h-[80px]"
                  value={newCategory.description}
                  onChange={(e) => setNewCategory({ ...newCategory, description: e.target.value })}
                />
              </div>

              <div>
                <label className="block text-lg font-medium text-[#3B0764] mb-1 font-passion-one">Icon</label>
                <div className="grid grid-cols-5 gap-2">
                  {["briefcase", "user", "book", "search", "heart"].map((icon) => (
                    <button
                      key={icon}
                      type="button"
                      onClick={() => setNewCategory({ ...newCategory, icon })}
                      className={`flex items-center justify-center p-2 rounded-md ${
                        newCategory.icon === icon ? "bg-[#f5e5b5] text-[#FF8C6B]" : "bg-[#f8eece]  text-gray-600"
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
                className="px-4 py-2 border border-gray-300 rounded-md text-[#3B0764] mr-2 hover:bg-gray-100 text-sm font-abril-fatface"
              >
                Cancel
              </button>
              <button
                onClick={addNewCategory}
                className="px-4 py-2 bg-[#FF8C6B] text-white rounded-md hover:bg-[#ff7a55] text-sm font-abril-fatface"
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
        <div
          className="fixed inset-0 "
          style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
          onClick={() => setIsMenuOpen(false)}
        ></div>
      )}

      {/* Header/Navigation */}
 <header className="bg-[#FF8C6B] shadow-sm">
  <div className="max-w-8xl mx-auto px-6 sm:px-8 lg:px-10 py-3 flex items-center">
    {/* Left section - fixed width */}
    <div className="flex items-center w-1/3">
      <button
        className="p-2 rounded-md text-white hover:bg-white/20 focus:outline-none menu-button mr-2"
        onClick={() => setIsMenuOpen(true)}
      >
        <Menu size={24} />
      </button>
      <h2 className="text-5xl font-bold font-jomhuria text-[#f8eece] tracking-wide mt-2 mr-2">TabMark</h2>
      <img
        src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bookmark-64%281%29-caVEaypHq7HypkUQUhgXo9jXEtcCaE.png"
        alt="TabMark Logo"
        className="h-6 w-6 mr-3"
      />
      <button className="px-3 py-1 bg-white/20 hover:bg-white/30 rounded-md flex items-center justify-center text-white font-passion-one font-medium transition-colors">
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
          className="mr-1"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3"></path>
          <line x1="12" y1="17" x2="12.01" y2="17"></line>
        </svg>
        FAQ
      </button>
    </div>

    {/* Center view toggle buttons - fixed width and centered */}
    <div className="flex items-center justify-center w-1/3">
      <div className="flex items-center justify-center space-x-2 bg-white/10 p-1 rounded-lg">
        <button
          onClick={() => changeViewMode("list")}
          className={`flex items-center px-3 py-1 rounded-md transition-all duration-300 ${
            viewMode === "list" ? "bg-white text-[#FF8C6B] font-medium text-xl shadow-sm font-passion-one" : "text-white text-lg hover:bg-white/20 font-passion-one"
          }`}
        >
          <svg
            width="16"
            height="16"
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
          className={`flex items-center px-3 py-1 rounded-md transition-all duration-300 ${
            viewMode === "calendar"
              ? "bg-white text-[#FF8C6B] font-medium text-xl shadow-sm font-passion-one"
              : "text-white hover:bg-white/20 text-lg font-passion-one"
          }`}
        >
          <svg
            width="16"
            height="16"
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
    </div>

    {/* Right section - Profile and Logout */}
    <div className="flex items-center justify-end w-1/3">
      {/* Profile Section - all elements in a single row */}
      <div className="flex items-center space-x-4">
        {/* 1. User Profile Picture */}
        {user && user.photoURL ? (
          <img
            src={user.photoURL}
            alt={`${user.displayName}'s profile`}
            className="w-12 h-12 rounded-full"
          />
        ) : (
          <div className="w-12 h-12 rounded-full flex items-center justify-center bg-gray-200">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              onClick={() => document.getElementById("profilePictureInput").click()}
              className="cursor-pointer"
            >
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
            <input
              id="profilePictureInput"
              type="file"
              accept="image/*"
              className="hidden"
              onChange={(e) => uploadHelper(e)}
            />
          </div>
        )}

        {/* 2. User Display Name */}
        {user ? (
          <span className="font-chela-one-regular text-[#f8eece] text-lg">{formatDisplayName(user.displayName)}</span>
        ) : (
          <span className="font-chela-one-regular text-[#f8eece] text-lg">Loading...</span>
        )}

                      <div className="flex items-center space-x-4 group">
                        {/* dynamic door icon - opens with user hovers over logout page*/}
                        <div className="relative w-7 h-7">
                          {/* default sate */}
                          <DoorClosed
                            size={28}
                            className="text-[#f8eece] absolute inset-0 opacity-100 transition-opacity duration-200 group-hover:opacity-0"
                          />
                          {/* hover state */}
                          <DoorOpen
                            size={28}
                            className="text-[#f8eece] absolute inset-0 opacity-0 transition-opacity duration-200 group-hover:opacity-100"
                          />
                        </div>

                        <button
                          onClick={handleLogout}
                          className="px-4 py-2 bg-red-500 text-white font-passion-one font-medium rounded-md hover:bg-red-600 transition-all"
                        >
                          Logout
                        </button>
                      </div>
      </div>
    </div>
  </div>
</header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
        <p className = "font-passion-one text-red-600"> <span className = "text-4xl font-jomhuria"> IMPORTANT: </span>  Please ensure you have the Tabmark Helper extension!</p>   {/* add hyperlink to TabMark Helper when done*/}
        {/* Display current category name only when a category is selected */}
        {viewMode === "list" &&
          (selectedSystemCategory || selectedUserCategory || (!selectedSystemCategory && !selectedUserCategory)) && (
            <div className="mb-4 text-center">
              <h1 className="text-5xl font-bold font-jomhuria tracking-wide text-[#3B0764]">{getCurrentCategoryName()}</h1>
              {selectedUserCategory && (
                <p className="text-gray-600 mt-1 mb-6 text-lg font-passion-one">
                  {projectCategories.find((c) => c.id === selectedUserCategory)?.description || ""}
                </p>
              )}
            </div>
          )}

        {/* Left and Right Images - Only visible in list view */}
        {viewMode === "list" && (
          <div className="flex justify-between items-start mb-6">
            <div className="w-1/6 max-w-[150px]">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/picsvg_download%286%29-YnAo935qL7fcgF7c5yShnlNFY58SW5.svg"
                alt="Left Decoration"
                className="w-full h-auto object-contain"
              />
            </div>
            <div className="w-4/6 px-4">
              {/* Category Boxes - Only visible in list view */}
              <div className="flex justify-center mb-6">
                <div className="flex space-x-8 sm:space-x-12">
                  {systemCategories.map((category) => (
                    <div
                    key={category.id}
                    className="flex flex-col items-center cursor-pointer transition-all duration-200 group"
                    onClick={() => selectSystemCategory(category.id)}
                  >
                    <span
                      className={`mb-2 font-medium ${
                        selectedSystemCategory === category.id ? "text-3xl font-bold" : "text-xl"
                      } racing-sans-one-regular text-[#3B0764]`}
                    >
                      {category.name}
                    </span>
                    <div
                      className={`${category.color} rounded-md transition-all duration-200 flex items-center justify-center`}
                      style={{
                        width: selectedSystemCategory === category.id ? "60px" : "50px",
                        height: selectedSystemCategory === category.id ? "36px" : "30px",
                      }}
                    >
                      {/* Icon for selected state */}
                      {selectedSystemCategory === category.id && (
                        <Eye size={28} className="text-[#f8eece]" />
                      )}
                  
                      {/* Icon for non-selected state with blinking effect */}
                      {selectedSystemCategory !== category.id && (
                        <div className="relative">
                          <EyeClosed
                            size={22}
                            className="text-[#f8eece] group-hover:opacity-0 transition-opacity duration-100"
                          />
                          <Eye
                            size={22}
                            className="text-[#f8eece] absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-100"
                          />
                        </div>
                      )}
                    </div>
                  </div>
                  ))}
                </div>
              </div>

              {!selectedSystemCategory && !selectedUserCategory && (
                <div className="text-center py-8 mb-8">
                  <h2 className="text-5xl font-passion-one font-bold text-[#FF8C6B] mb-3">Welcome to TabMark!</h2>
                  <p className="text-purple-950 max-w-2xl mx-auto text-lg font-chela-one-regular">
                    Select one of the categories above to see your projects sorted by urgency. You can also create custom
                    categories from the menu on the left.
                  </p>
                </div>
              )}

              {/* New Project button - Centered design */}
              <div className="flex justify-center mb-6 mt-10">
                <button
                  onClick={() => setShowNewProjectModal(true)}
                  className="flex items-center px-4 py-2 bg-[#FF8C6B] hover:bg-[#ff7a55] text-white rounded-md transition-colors shadow-sm"
                >
                  <PlusCircle size={16} className="mr-2" />
                  <span className="font-medium font-abril-fatface">New Project</span>
                </button>
              </div>
            </div>
            <div className="w-1/6 max-w-[150px]">
              <img
                src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/picsvg_download%288%29-UPk4380C1vou3OkvSWYeyUGBKctqjV.svg"
                alt="Right Decoration"
                className="w-full h-auto object-contain"
              />
            </div>
          </div>
        )}

        {/* Content with animation */}
        <div className={`transition-opacity duration-300 ${isAnimating ? "opacity-0" : "opacity-100"}`}>
          {viewMode === "list" ? (
            <>
              {/* Project Table Header */}
              <div className="grid grid-cols-12 gap-4 px-6 py-3 border-b border-[#e6d6a6] mb-2">
                <div className="col-span-1"></div>
                <div className="col-span-3 font-medium text-xl text-[#3B0764] text-base font-passion-one">Project (Window) Name</div>
                <div className="col-span-3 font-medium text-xl text-[#3B0764] text-base font-passion-one">Progress Bar</div>
                <div className="col-span-2 font-medium text-xl text-[#3B0764] text-base font-passion-one flex items-center justify-center mr-2">{selectedSystemCategory === "Completed" ? `Elapsed Time ` : `Time Left`}</div>
                <div className="col-span-2 font-medium text-xl text-[#3B0764] text-base font-passion-one flex items-center justify-center mr-10">Difficulty</div>
                <div className="col-span-1"></div>
              </div>

              {/* Project Rows */}
              {filteredProjects.length > 0 ? (
                filteredProjects.map((project) => (
                  <div
                    key={project.id}
                    className="grid grid-cols-12 gap-4 px-6 py-4 border-b border-gray-200 hover:bg-[#f5e5b5] mb-1"
                  >
                    <div className="col-span-1 flex items-center">
                    {project.systemCategory === "Completed" ? (
                      <Check size={24} className="text-green-500 mr-6" />
                    ) : (
                      <input
                      type="checkbox"
                      checked={project.completed}
                      onChange={() => initiateCompletion(project.id)}
                      className="h-5 w-5 text-[#FF8C6B] rounded border-gray-300 focus:ring-[#FF8C6B] cursor-pointer"/>
                    )}
                    </div>
                    <div className="col-span-3 flex items-center">
                    <span
                      className={`text-base font-medium text-xl font-abril-fatface cursor-pointer ${
                        project.completed ? "text-gray-400 line-through" : "text-[#FF8C6B]"
                      }`}
                      onClick={() => openTabsForProject(project.id)}
                      title="Click to open saved tabs for this project"
                    >
                      {project.name}
                    </span>
                  </div>
                    <div className="col-span-3 flex items-center">
                      {/* Custom progress slider with rounded corners when at 100% */}
                      <div className="w-full flex items-center">
                        <div className="w-full relative">
                          <div
                            className={`absolute top-0 left-0 h-4 ${
                              project.systemCategory === "Completed"
                                ? "rounded-md bg-green-500"
                                : project.timeLeft.includes("Past due")
                                ? "rounded-md bg-red-500"
                                : "rounded-l-md bg-[#FF8C6B]"
                            }`}
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
                        <span className="ml-2 text-gray-500 text-xl font-passion-one">{project.progress}%</span>
                      </div>
                    </div>
                    <div className="col-span-2 flex items-center justify-center">
                    <span className="text-base text-gray-700 text-xl font-passion-one flex items-center gap-2">
                      {selectedSystemCategory === "Completed" ? calculateTimeSince(project.completionDate) : project.timeLeft}
                      {project.timeLeft === "Today" && selectedSystemCategory !== "Completed" && (
                        <AlertTriangle size={18} className="text-[#ff5f6d]" />
                      )}
                    </span>
                  </div>
                    <div className="col-span-2 flex items-center text-xl oleo-script-regular">{getDifficultyIcon(project.difficulty)}</div>
                    <div className="col-span-1 flex items-center justify-end space-x-2 ">
                      <button
                        onClick={() => initiateEditProject(project.id)}
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
                <div className="text-center py-8 rounded-lg">
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
                    {selectedSystemCategory === "Completed" ? (
                      <>
                        <h3 className="text-xl font-medium text-[#FF8C6B] mb-2 font-nova-square-regular">
                          No project completed yet
                        </h3>
                        <p className="text-gray-500 mb-4 font-chela-one-regular">
                          Let's get to completing projects!
                        </p>
                      </>
                    ) : (
                      <>
                        <h3 className="text-xl font-medium text-[#FF8C6B] mb-2 font-nova-square-regular">
                          No projects yet
                        </h3>
                        <p className="text-gray-500 mb-4 font-chela-one-regular">
                          Get started by creating your first project
                        </p>
                        <button
                          onClick={() => setShowNewProjectModal(true)}
                          className="px-4 py-2 bg-[#FF8C6B] text-white font-abril-fatface rounded-md hover:bg-[#ff7a55]"
                        >
                          Create Project
                        </button>
                      </>
                    )}
                  </div>
                </div>
              )}
            </>
          ) : (
            // Calendar view
            renderCalendar()
          )}
        </div>
      </main>

      {/* New Project Modal - Updated with category selection */}
      {showNewProjectModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0 "
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            onClick={() => setShowNewProjectModal(false)}
          ></div>
          <div className="bg-[#f8eece] rounded-2xl shadow-xl w-full max-w-md relative z-10">
            {/* Modal Header - Centered Project title */}
            <div className="px-6 py-4 text-center rounded-t-2xl">
              <h2 className="text-5xl font-jomhuria font-bold text-[#3B0764]">Project</h2>
              <button
                onClick={() => setShowNewProjectModal(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            {/* Modal Body */}
            <div className="px-6 py-1 space-y-4">
              {/* Project Name Input */}
              <div>
                <label className="block text-lg font-medium text-[#3B0764] mb-1 font-passion-one">Project Name</label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 border border-purple-950 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C6B] font-spline-sans-tab text-sm"
                  value={newProject.name}
                  onChange={(e) => setNewProject({ ...newProject, name: e.target.value })}
                />
              </div>

              {/* Due Date - with min date validation */}
              <div>
                <label className="block font-medium text-[#3B0764] mb-1 text-lg font-passion-one">Due Date</label>
                <div className="bg-[#fff0e0] rounded-md p-1 border border-[#ffd0b5]">
                  <div className="flex items-center bg-white rounded-md px-3 py-2">
                    <Calendar size={18} className="mr-2 text-[#FF8C6B]" />
                    <input
                      type="date"
                      className="bg-transparent focus:outline-none w-full font-spline-sans-tab text-sm"
                      value={newProject.dueDate}
                      min={today} // Prevent selecting dates before today
                      onChange={(e) => setNewProject({ ...newProject, dueDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block font-medium text-[#3B0764] mb-1 text-lg font-passion-one">Difficulty</label>
                <div className="bg-[#fff0e0] rounded-md p-1 border border-[#ffd0b5]">
                  <div className="flex items-center bg-white rounded-md px-3 py-2">
                    <Clock size={18} className="mr-2 text-[#FF8C6B]" />
                    <select
                      className="bg-transparent focus:outline-none w-full font-spline-sans-tab text-sm"
                      value={newProject.difficulty}
                      onChange={(e) => setNewProject({ ...newProject, difficulty: e.target.value })}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category Selection - will fix and add later */}

              {/* {!selectedUserCategory && projectCategories.length > 0 && (
                <div>
                  <label className="block font-medium text-[#3B0764] mb-1 text-lg font-passion-one">Project Category</label>
                  <div className="bg-[#fff0e0] rounded-md p-1 border border-[#ffd0b5]">
                    <div className="flex items-center bg-white rounded-md px-3 py-2">
                      {newProject.category && getCategoryIcon(projectCategories.find((c) => c.id === newProject.category)?.icon || "briefcase")}
                      <select
                        className="bg-transparent focus:outline-none w-full font-spline-sans-tab text-sm"
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
                </div>
              )}

              {selectedUserCategory && (
                <div className="bg-[#fff0e0] rounded-md p-3 border border-[#ffd0b5]">
                  <div className="flex items-center">
                    {getCategoryIcon(projectCategories.find((c) => c.id === selectedUserCategory)?.icon || "briefcase")}
                    <span className="text-lg font-passion-one font-medium text-[#FF8C6B]">
                      Creating in: {projectCategories.find((c) => c.id === selectedUserCategory)?.name || "Selected Category"}
                    </span>
                  </div>
                </div>
              )}  */}

              {/* Save Current Tabs Option - Orange */}
              <div className="bg-[#fff0e0] rounded-md p-4 border border-[#ffd0b5]">
                <h3 className="text-lg font-medium text-[#FF8C6B] mb-2 racing-sans-one-regular">Save Current Tabs</h3>
                <p className="font-spline-sans-tab text-sm text-[#FF8C6B] mb-3">
                  Would you like to save all currently open browser tabs with this project?
                </p>
                <div className="flex space-x-4">
                  <button
                    className={`px-4 py-2 rounded-md ${newProject.saveTabs ? "bg-[#FF8C6B] text-white hover:bg-[#ff7a55] font-passion-one" : "bg-gray-200 text-purple-950 font-passion-one"}`}
                    onClick={() => setNewProject({ ...newProject, saveTabs: true })}
                    >
                    Yes
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ${!newProject.saveTabs ? "bg-[#FF8C6B] text-white hover:bg-[#ff7a55] font-passion-one" : "bg-gray-200 text-purple-950 font-passion-one"}`}
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
                className="bg-[#FF8C6B] hover:bg-[#ff7a55] text-white px-4 py-2 rounded-md font-medium font-abril-fatface"
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
          <div
            className="fixed inset-0 "
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            onClick={() => setShowDeleteConfirm(false)}
          ></div>
          <div className="bg-[#f8eece] rounded-2xl shadow-xl w-full max-w-md p-6 relative z-10">
            <div className="flex items-center mb-4">
              <X size={24} className="text-red-500 mr-2" />
              <h3 className="text-lg racing-sans-one-regular font-bold text-[#FF8C6B]">Confirm Deletion</h3>
            </div>
            <p className="text-gray-600 mb-6 font-passion-one">
              Are you sure you want to delete this project? This action cannot be undone.
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowDeleteConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 font-abril-fatface"
              >
                Cancel
              </button>
              <button
                onClick={confirmDelete}
                className="px-4 py-2 bg-[#ff5f6d] text-white rounded-md hover:bg-[#ff4957] font-abril-fatface"
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
          <div
            className="fixed inset-0 "
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            onClick={() => setShowCompletionConfirm(false)}
          ></div>
          <div className="bg-[#f8eece] rounded-2xl shadow-xl w-full max-w-md p-6 relative z-10">
            <div className="flex items-center mb-4">
              <Check size={24} className="text-green-500 mr-2" />
              <h3 className="text-lg racing-sans-one-regular font-bold text-[#FF8C6B]">Project Completion</h3>
            </div>
            <p className="text-gray-600 mb-6 font-passion-one">Have you completed this project? It will be marked as completed.</p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowCompletionConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-[#3B0764] rounded-md hover:bg-gray-300 font-abril-fatface"
              >
                No
              </button>
              <button
                onClick={confirmCompletion}
                className="px-4 py-2 bg-[#FF8C6B] text-white rounded-md hover:bg-[#3a1f30] font-abril-fatface"
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
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            onClick={() => {
              setShowEditProjectModal(false)
              setProjectToEdit(null)
            }}
          ></div>
          <div className="bg-[#f8eece] rounded-2xl shadow-xl w-full max-w-md relative z-10">
            <div className="px-6 py-4 text-center rounded-t-2xl">
              <h2 className="text-4xl font-bold text-purple-950 font-jomhuria">Edit Project</h2>
              <button
                onClick={() => {
                  setShowEditProjectModal(false)
                  setProjectToEdit(null)
                }}
                className="absolute top-4 right-4 text-purple-950 hover:text-gray-500"
              >
                <X size={20} />
              </button>
            </div>

            <div className="px-6 py-1 space-y-6">
              {/* Project Name Input */}
              <div>
                <label className="block text-lg font-passion-one font-medium text-[#3B0764] mb-1 ">Project Name</label>
                <input
                  type="text"
                  placeholder="Enter project name"
                  className="w-full px-3 py-2 text-sm font-spline-sans-tab border border-purple-950 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C6B]"
                  value={projectToEdit.name}
                  onChange={(e) => setProjectToEdit({ ...projectToEdit, name: e.target.value })}
                />
              </div>

              {/* Due Date */}
              <div>
                <label className="block text-lg font-passion-one font-medium text-[#3B0764] mb-1">Due Date</label>
                <div className="bg-[#fff0e0] rounded-md p-1 border border-[#ffd0b5]">
                  <div className="flex items-center bg-white rounded-md px-3 py-2">
                    <Calendar size={18} className="mr-2 text-[#FF8C6B]" />
                    <input
                      type="date"
                      className="bg-transparent focus:outline-none w-full text-sm font-spline-sans-tab"
                      value={projectToEdit.dueDate}
                      min={today}
                      onChange={(e) => setProjectToEdit({ ...projectToEdit, dueDate: e.target.value })}
                    />
                  </div>
                </div>
              </div>

              {/* Difficulty */}
              <div>
                <label className="block text-lg font-passion-one font-medium text-[#3B0764] mb-1">Difficulty</label>
                <div className="bg-[#fff0e0] rounded-md p-1 border border-[#ffd0b5]">
                  <div className="flex items-center bg-white rounded-md px-3 py-2">
                    <Clock size={18} className="mr-2 text-[#FF8C6B]" />
                    <select
                      className="bg-transparent focus:outline-none w-full text-sm font-spline-sans-tab"
                      value={projectToEdit.difficulty}
                      onChange={(e) => setProjectToEdit({ ...projectToEdit, difficulty: e.target.value })}
                    >
                      <option value="Easy">Easy</option>
                      <option value="Medium">Medium</option>
                      <option value="Hard">Hard</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Category Selection */}
              {projectCategories.length > 0 && (
                <div>
                  <label className="block text-lg font-passion-one font-medium text-[#3B0764] mb-1">Project Category</label>
                  <div className="bg-[#fff0e0] rounded-md p-1 border border-[#ffd0b5]">
                    <div className="flex items-center bg-white rounded-md px-3 py-2">
                      {getCategoryIcon(projectCategories.find(c => c.id === projectToEdit.userCategory)?.icon || "briefcase")}
                      <select
                        className="bg-transparent focus:outline-none w-full text-sm font-spline-sans-tab"
                        value={projectToEdit.userCategory || ""}
                        onChange={(e) => {
                          const newCategoryId = e.target.value || null;
                          setProjectToEdit({ 
                            ...projectToEdit, 
                            previousCategory: projectToEdit.userCategory,
                            userCategory: newCategoryId,
                            category: newCategoryId 
                          });
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
                </div>
              )}

              <div className="bg-[#fff0e0] rounded-md p-1 border border-[#ffd0b5]">
                <h3 className="text-lg font-medium text-[#FF8C6B] mb-2 racing-sans-one-regular">Save Current Tabs</h3>
                <p className="font-spline-sans-tab text-sm text-[#FF8C6B] mb-3">
                Replace the saved tabs for this project with your currently open tabs?
                </p>
                <div className="flex space-x-4">
                  <button
                    className={`px-4 py-2 rounded-md ${!projectToEdit.saveTabs ? "bg-[#f8eece] text-purple-950 hover:bg-[#ff7a55] font-passion-one" : "bg-[#FF8C6B] text-xl text-white font-passion-one"}`}
                    onClick={() => setProjectToEdit({ ...projectToEdit, saveTabs: true })}
                    >
                    Yes
                  </button>
                  <button
                    className={`px-4 py-2 rounded-md ${projectToEdit.saveTabs ? "bg-[#f8eece] text-purple-950 hover:bg-[#ff7a55] font-passion-one" : "bg-[#FF8C6B] text-xl text-white font-passion-one"}`}
                    onClick={() => setProjectToEdit({ ...projectToEdit, saveTabs: false})}
                  >
                    No
                  </button>
                </div>
              </div>

            </div>

            <div className="px-6 py-4 flex justify-end rounded-b-2xl">
              <button
                onClick={() => {
                  setShowEditProjectModal(false)
                  setProjectToEdit(null)
                }}
                className="px-4 py-2 border border-gray-300 rounded-md text-purple-950 mr-2 hover:bg-gray-100 font-abril-fatface"
              >
                Cancel
              </button>
              <button
                onClick={confirmEdit}
                className="bg-[#FF8C6B] hover:bg-[#ff7a55] text-white px-4 py-2 rounded-md font-medium font-abril-fatface"
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
            <div className="fixed inset-0 " style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
              onClick={() => {
                setShowEditCategoryModal(false)
                setcategoryToEdit(null)
              }}>
            </div>
            <div className="bg-[#f8eece] rounded-2xl shadow-xl w-full max-w-md relative z-10">
              <div className="px-6 py-4 border-b border-gray-200 rounded-t-2xl">
                <h2 className="text-5xl font-jomhuria font-bold text-purple-950">Edit Category</h2>
                <button
                  onClick={() => {
                    setShowEditCategoryModal(false)
                    setcategoryToEdit(null)
                  }}
                  className="absolute top-4 right-4 text-purple-950 hover:text-gray-500"
                >
                  <X size={20} />
                </button>
              </div>

              <div className="px-6 py-4 space-y-4">
                <div>
                  <label className="block text-lg font-passion-one font-medium text-purple-950 mb-1">Category Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Work Projects, School Assignments"
                    className="w-full px-3 py-2 text-xs font-spline-sans-tab border border-purple-950 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C6B]"
                    value={categoryToEdit.name}
                    onChange={(e) => setcategoryToEdit({ ...categoryToEdit, name: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-lg font-passion-one font-medium text-purple-950 mb-1">Description</label>
                  <textarea
                    placeholder="Enter a description for this category"
                    className="w-full px-3 py-2 text-xs font-spline-sans-tab  border border-purple-950 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C6B] min-h-[80px]"
                    value={categoryToEdit.description || ""}
                    onChange={(e) => setcategoryToEdit({ ...categoryToEdit, description: e.target.value })}
                  />
                </div>

                <div>
                  <label className="block text-lg font-passion-one font-medium text-purple-950 mb-1">Icon</label>
                  <div className="grid grid-cols-5 gap-2">
                    {["briefcase", "user", "book", "search", "heart"].map((icon) => (
                      <button
                        key={icon}
                        type="button"
                        onClick={() => setcategoryToEdit({ ...categoryToEdit, icon })}
                        className={`flex items-center justify-center p-2 rounded-md ${
                          categoryToEdit.icon === icon ? "bg-[#f5e5b5] text-[#FF8C6B]" : "bg-[#f8eece]  text-gray-600"
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
                  className="px-4 py-2 border border-purple-950 rounded-md text-purple-950 mr-2 hover:bg-gray-100 text-sm font-abril-fatface"
                >
                  Cancel
                </button>
                <button
                  onClick={saveEditedCategory}
                  className="px-4 py-2 bg-[#FF8C6B] text-white rounded-md hover:bg-[#ff7a55] text-sm font-abril-fatface"
                  disabled={!categoryToEdit.name.trim()}
                >
                  Save Changes
                </button>
              </div>
            </div>
        </div>
      )}
      {/* Unarchive Confirmation Modal */}
      {showUnarchiveConfirm && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div
            className="fixed inset-0"
            style={{ backgroundColor: "rgba(0, 0, 0, 0.3)" }}
            onClick={() => setShowUnarchiveConfirm(false)}
          ></div>
          <div className="bg-[#f8eece] rounded-2xl shadow-xl w-full max-w-md p-6 relative z-10">
            <div className="flex items-center mb-4">
              <h3 className="text-lg font-bold text-[#FF8C6B]">Unarchive Project</h3>
            </div>
            <p className="text-gray-600 mb-6">
              Do you want to mark this project as incomplete and move it back to its original category?
            </p>

            <div className="flex justify-end space-x-4">
              <button
                onClick={() => setShowUnarchiveConfirm(false)}
                className="px-4 py-2 bg-gray-200 text-[#3B0764] rounded-md hover:bg-gray-300"
              >
                No
              </button>
              <button
                onClick={confirmUnarchive}
                className="px-4 py-2 bg-[#FF8C6B] text-white rounded-md hover:bg-[#ff7a55]"
              >
                Yes, Unarchive
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  ) // Closing the return statement
 }
}
