"use client"

import { useEffect, useState } from "react"
import { onAuthStateChanged, signOut } from "firebase/auth"
import { auth } from "../firebase-config.js"
import { useNavigate } from "react-router-dom"

// helper function for name reformat
function formatDisplayName(name) {
    if (!name) {
        return ""
    } else {
        return name.split(" ").map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()).join(" ")
    } // splits all the diff names i.e first, middle, last, then formats them and joins back together
  }

export default function Dashboard() {
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // Check if the user is logged in
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser)
      } else {
        // Redirect to the signup page if not logged in
        navigate("/signup")
      }
    })

    return () => unsubscribe() // Cleanup the listener on unmount
  }, [navigate])

  // Handle logout
  const handleLogout = async () => {
    try {
      await signOut(auth)
      navigate("/signup") // Redirect to signup page after logout
    } catch (error) {
      console.error("Error logging out:", error.message);
    }
  }

  if (!user) {
    return <p>Loading...</p>; // Show a loading message while checking auth state
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-100">
      <div className="bg-white shadow-md rounded-lg p-8 max-w-md w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Welcome, {formatDisplayName(user.displayName)}! Looking good down there.</h1>
        {user.photoURL && (
          <img
            src={user.photoURL}
            alt={`${user.displayName}'s profile`}
            className="w-24 h-24 rounded-full mx-auto mb-6"
          />
        )}
        <p className="text-gray-600 mb-6">Welcome to your projects!</p>
        <button
          onClick={handleLogout}
          className="w-full py-3 px-4 bg-red-500 hover:bg-red-600 text-white font-medium font-spline-sans-tab rounded-md transition duration-200"
        >
          Logout
        </button>
      </div>
    </div>
  )
}