"use client"

import { useState, useEffect, useRef } from "react"

import {
  GoogleAuthProvider,
  GithubAuthProvider,
  signInWithPopup,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  fetchSignInMethodsForEmail,
  setPersistence,
  browserSessionPersistence,
  updateProfile,
  sendEmailVerification,
  sendPasswordResetEmail,
  signInWithEmailLink
} from "firebase/auth"

import {
  ref,
  uploadBytes,
  getDownloadURL,
  uploadBytesResumable
} from "firebase/storage"

import { auth } from "../firebase-config.js"
import { storage } from "../firebase-config.js"
// import { getStorage, ref, upload}
import { useNavigate } from "react-router-dom"      
import Swal from 'sweetalert2'// for really cool custom alerts - default were drab
import { ToastContainer, toast } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

// note : new imports always mess up prev dependencies/imports - have to look into this

export default function Signup() {
  const navigate = useNavigate()
  const [isLoginView, setIsLoginView] = useState(false)
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [termsAccepted, setTermsAccepted] = useState(false)
  const [profilePicture, setProfilePicture] = useState(null)
  const [isForgotPasswordMode, setIsForgotPasswordMode] = useState(false)

  const signInWithGoogle = async () => {
    // need navigate hook from react-router-dom, only works in react coponents
    const provider = new GoogleAuthProvider()
    try {
      const result = await signInWithPopup(auth, provider)
      const user = result.user
      console.log("User loggin in:", user.displayName)
      toast.success("Successfully logged in.", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "font-passion-one text-xl",
        onClose: () => navigate("/dashboard")
      })
    } catch (error) {
      console.error("Error logging in with Google:", error.message)
      toast.error("Error logging in with Google. Please try again.", {
        position: "top-center",
        autoClose: 3000,
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

  const signInWithGitHub = async () => {
    // clears any previous auth state - so we dont have same user persisting
    await auth.signOut();
    
    // clear any stored credentials in localStorage
    localStorage.removeItem("pendingCredential");
    
    // clear browser session storage that might be caching the auth state
    sessionStorage.clear();
    
    // forces Firebase to forget previous auth sessions - FIXED VERSION ~ persists for GitHub but not Google for some reason
    try {
      await setPersistence(auth, browserSessionPersistence);
    } catch (error) {
      console.error("Error setting persistence:", error);
    }
    
    const provider = new GithubAuthProvider();
    
    // forces re-consent by adding a custom parameter
    provider.setCustomParameters({
      prompt: 'consent',   // forces consent screen every time
      login: ' ',       // forces to show login screen
      state: `github-auth-${Date.now()}`,    // unique state parameter 
      allow_signup: 'true',   // forces signup uption for new users
    });
    
    try {
      const result = await signInWithPopup(auth, provider);
      console.log("User logged in with GitHub:", result.user.displayName);
      toast.success("Logged in successfully", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "font-passion-one text-xl",
        onClose: () => navigate("/dashboard")
      })
      
      navigate("/dashboard");
    } catch (error) {
      console.error("GitHub auth error code:", error.code);
      
      if (error.code === "auth/account-exists-with-different-credential") {
        // Extract the email from the error
        const email = error.customData?.email;
        if (email) {
          toast.error(`An account already exists with the email ${email}.`, {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            className: "font-passion-one text-xl",
            style: { backgroundColor: "#f44336", color: "white" }
          })
        } else {
          toast.error("An account already exists with a different sign-in method.", {
            position: "top-center",
            autoClose: 3000,
            hideProgressBar: false,
            closeOnClick: true,
            pauseOnHover: true,
            draggable: true,
            progress: undefined,
            className: "font-passion-one text-xl",
            style: { backgroundColor: "#f44336", color: "white" }
          })
        }
      } else {
        console.error("Error logging in with GitHub:", error.message);
        toast.error("Unable to sign in with GitHub. Please try again later.", {
          position: "top-center",
          autoClose: 3000,
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
  };

  const validateInputs = () => {             // validates email and password
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/   // regex pattern to validate email
    if (!emailRegex.test(email)){
      setError("Invalid email format. Try again.")
      toast.error("Invalid email format. Try again.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "font-passion-one text-xl",
        style: { backgroundColor: "#f44336", color: "white" }
      })
      return false
    }
    if(password.length < 8){
      setError("Password must be minimum 8 characters long. Try again.")
      toast.error("Password must be minimum 8 characters long. Try again.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "font-passion-one text-xl",
        style: { backgroundColor: "#f44336", color: "white" }
      })
      return false
    }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)){  // experimental
      setError("Password must contain an uppercase, lowercase and a number.")
      toast.error("Password must contain an uppercase, lowercase and a number.", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "font-passion-one text-xl",
        style: { backgroundColor: "#f44336", color: "white" }
      })
      return false
    }
    return true
  }

  const handleSignup = async (e) => {
    e.preventDefault()
    console.log("Signup form submitted");
    setError("")

    if (!validateInputs()) {
      console.log("Validation failed")
      return
    }

    if (!termsAccepted){
      setError("You must agree to the Terms & Conditions to make an account")
      toast.error("You must agree to the Terms & Conditions", {
        position: "top-center",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "font-passion-one text-xl",
        style: { backgroundColor: "#f44336", color: "white" }
      })
      return
    }

    try{  // check for if account with email already exists
      const methods = await fetchSignInMethodsForEmail(auth, email)
      if (methods.length > 0){
        setError("An account with this email already exists. Please log in")
        toast.error("An account with this email already exists. Please log in", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "font-passion-one text-xl",
          style: { backgroundColor: "#f44336", color: "white" }
        })
        console.log("Email already exists")
        return
      }

      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user
      
  
      console.log("User created:", user)

      let photoURL = null
      if (profilePicture){
        try{
          toast.info("Uploading profile picture...", {
            position: "top-center",
            autoClose: false,
            hideProgressBar: false,
            closeOnClick: false,
            pauseOnHover: true,
            draggable: false,
            progress: undefined,
            className: "font-passion-one text-xl",
          })
          photoURL = await uploadProfilePicture(user.uid, profilePicture)
          toast.dismiss()
        } catch ( uploadError ){
          console.error("Profile picture upload failed:", uploadError);
          toast.error("Profile picture upload failed, but account was created", {
            position: "top-center",
            autoClose: 3000,
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


      await updateProfile(user, {
        displayName: `${firstName} ${lastName}`,
        photoURL: photoURL,
      });

      await sendEmailVerification(user)
      console.log("Verification email sent")
      toast.success("A verification email has been sent to your account", {
        position: "top-center",
        autoClose: 4000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "font-passion-one text-xl",
      })

      await auth.signOut()


    } catch (error){
      console.error("Error creating account:", error.message)
      setError("Failed to create account. Please try again")
      toast.error("Failed to create account. Please try again.", {
        position: "top-center",
        autoClose: 3000,
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

  const handleLogin = async (e) => {
    e.preventDefault()
    console.log("Login form submitted")
    setError("")

    if (!validateInputs()) {
      console.log("Validation failed")
      return
    }

    try{
      const userCredential = await signInWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      if (!user.emailVerified){
        setError("Please verify your email before logging in")
        toast.error("Please verify your email before logging in.", {
          position: "top-center",
          autoClose: 3000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          className: "font-passion-one text-xl",
          style: { backgroundColor: "#f44336", color: "white" }
        })
        console.log("Email not verified")
        await auth.signOut()
        return
      }

      console.log("User logged in:", userCredential.user)
      toast.success("Login successful!", {
        position: "top-center",
        autoClose: 1000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        progress: undefined,
        className: "font-passion-one text-xl",
        onClose: () => navigate("/dashboard")
      })
    } catch(error){
      console.error("Error loggin in::", error.message)
      setError("Invalid email or password. Please try again")
      toast.error("Invalid email or password", {
        position: "top-center",
        autoClose: 3000,
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

const handleProfilePictureUpload = (e) => {
  const file = e.target.files[0]
  if(!file){
    return
  }

  if (!file.type.match('image.*')){
    setError("Pleast select an image file")
    toast.error("Please select an image file", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: "font-passion-one text-xl",
      style: { backgroundColor: "#f44336", color: "white" }
    })
    return
  }

  if (!file.size > (10 * 1024 * 1024)){   // bigger than 10 MB
    setError("Profile picture must be less than 10MB")
    toast.error("Profile picture must be less than 10MB", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: "font-passion-one text-xl",
      style: { backgroundColor: "#f44336", color: "white" }
    })
    return
  }

  setProfilePicture(file)
  e.target.value = null       // clears input value to allow re-uploads of same file
}

const uploadProfilePicture = async (userId, file) => {
  if (!file){
    return null
  }

  // creates storage reference
  const storageRef = ref(storage, `profileImages/${userId}/${Date.now()}-${file.name}`)
  // simply references a particular custom directory and file path name in the storage
  const uploadTask = uploadBytesResumable(storageRef, file)
  // uploads the file in question, i.e image hre, to that file path

  return new Promise((resolve, reject) =>{
    uploadTask.on(
      "state_change",
      (snapshot) => {
        const progress = (snapshot.bytesTransferred/snapshot.totalBytes)
        console.log(`Upload progress: ${progress.toFixed(2)}`)
      },
      (error) => {
        console.error("Upload failed:", erorr)
        reject(error)
      },
      async() => {
        const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
        console.log("File available at:", downloadURL)
        resolve(downloadURL)
      }
    )
  })
}

// (e) => {e.preventDefault()} IMPORTANT for many cases

const handleForgotPassword = async (e) => {
  e.preventDefault()

  if (!email){
    setError("Please enter your email address to reset your password")
    console.log("Email prompt")
    return
  }

  try {
    await sendPasswordResetEmail(auth, email)

    toast.success("A password reset email has been sent to your email address", {
      position: "top-center",
      autoClose: 4000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: "font-passion-one text-xl",
    })
    console.log("Reset password mail sent")
    resetForgotPasswordMode()
  } catch (error) {
    console.error("Error sending password reset email:", error.message)
    toast.error("Failed to send password reset email. Please try again.", {
      position: "top-center",
      autoClose: 3000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      className: "font-passion-one text-xl",
      style: { backgroundColor: "#f44336", color: "white" }
    })
    setError("Failed to send password reset email. Please try again.");
  }
}

const resetForgotPasswordMode = () => {
  setIsForgotPasswordMode(false)
  setError("")
};

  const [showPassword, setShowPassword] = useState(false)
  const [currentSlide, setCurrentSlide] = useState(0)
  const [isTransitioning, setIsTransitioning] = useState(false)

  // Use a ref to track the interval to prevent it from being reset
  const intervalRef = useRef(null)

  // Function to reset the auto-rotation timer
  const resetTimer = () => {
    if (intervalRef.current) {
      clearInterval(intervalRef.current)
    }

    intervalRef.current = setInterval(() => {
      changeSlide((currentSlide + 1) % 3, false)
    }, 5000)
  }

  // Set up initial auto-rotation
  useEffect(() => {
    resetTimer()

    // Clean up on component unmount
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [currentSlide]) // Depend on currentSlide to reset timer when it changes

  // Function to handle smooth slide transitions
  const changeSlide = (newSlide, isManual = true) => {
    if (isTransitioning || newSlide === currentSlide) return

    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentSlide(newSlide)
      setTimeout(() => {
        setIsTransitioning(false)
      }, 500)

      // If this was a manual change, reset the timer
      if (isManual) {
        resetTimer()
      }
    }, 300)
  }

  // Slide content
  const slides = [
    {
      content: (
        <>
          <div className="mb-6 flex justify-center">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/picsvg_download%281%29-WLRJbkhN8j1vRZV86VoyVzusKLAtI0.svg"
              alt="TabMark Organization"
              className="w-84 h-84 object-contain mb-4 rounded-t-lg"
            />
          </div>
          <div className="max-w-md mx-auto text-center">
            <p className="text-xl mb-6 font-spline-sans-tab">
              Ever lose a window's worth of progress?
            </p>
            <p className="text-4xl font-chela-one-regular">
              Save windows of tabs, with dedicated due dates!
            </p>
          </div>
        </>
      ),
    },
    {
      content: (
        <>
          <div className="mb-6 flex justify-center">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/picsvg_download%285%29-mKXFFQgAu3Yo2FbunDcKMlfJk8RZyW.svg"
              alt="Research Organization"
              className="w-86 h-86 object-contain mb-4 rounded-t-lg"
            />
          </div>
          <div className="max-w-md mx-auto text-center">
            <p className="text-xl mb-6 font-spline-sans-tab">
              Ever been overwhelmed with assignments?
            </p>
            <p className="text-4xl font-chela-one-regular">
              Schedule and categorize projects!
            </p>
          </div>
        </>
      ),
    },
    {
      content: (
        <>
          <div className="mb-6 flex justify-center">
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/picsvg_download%284%29-MJVuszWkszyBYOFXjqym2Jx20wKPWo.svg"
              alt="Sharing Collections"
              className="w-84 h-84 object-contain mb-4 rounded-t-lg"
            />
          </div>
          <div className="max-w-md mx-auto text-center">
            <p className="text-xl mb-6 font-spline-sans-tab">
              Ever had an assignment creep up on you?
            </p>
            <p className="text-4xl font-chela-one-regular">
              Daily reminders, and weekly motivational reports.
            </p>
          </div>
        </>
      ),
    },
  ]

  // Toggle between login and signup views
  const toggleView = (e) => {
    e.preventDefault()
    setIsLoginView(!isLoginView)
    setError("")
  }

  return (
    <>
      {/* Import Google Fonts */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Jomhuria&family=Chela+One&family=Lobster&family=Nova+Square&family=Abril+Fatface&family=Boldonse&family=Passion+One:wght@400;700;900&family=Spline+Sans:wght@300..700&display=swap');
        
        .font-jomhuria {
          font-family: 'Jomhuria', cursive;
        }
        
        .font-lobster {
          font-family: 'Lobster', cursive;
        }

        .font-abril-fatface {
          font-family: 'Abril Fatface', cursive;
        }

        .font-boldonse {
          font-family: 'Boldonse', cursive;
        }

        .font-nova-square-regular {
          font-family: "Nova Square", sans-serif;
        }
        
        .font-spline-sans-tab {
          font-family: "Spline Sans", sans-serif;
        }

        .font-chela-one-regular {
          font-family: "Chela One", system-ui;
        }

        .font-passion-one {
          font-family: 'Passion One', sans-serif;
          font-weight: 100;
          font-style: normal;
        }
        
        .font-kanit {
          font-family: 'Kanit', sans-serif;
        }

        .text-shadow {
          text-shadow: 2px 2px 4px rgba(0, 0, 0, 0.1);
        }
      `}</style>

      <ToastContainer 
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        theme="light"
        style={{ zIndex: 9999 }}
      />

      <div className="flex flex-col md:flex-row min-h-screen">
        {/* Left column with gradient background and rotating slides */}
        <div className="w-full md:w-1/2 flex flex-col items-center justify-start text-center p-10 bg-gradient-to-r from-[#ff5f6d] to-[#ffc371] text-white">
          {/* Title and tagline moved to the top with negative margin */}
          <div className="w-full max-w-md -mt-4 mb-4">
            <h1 className="text-9xl font-bold mb-0 font-jomhuria tracking-wide text-shadow">TabMark</h1>
            <p className="text-4xl font-lobster -mt-6">Bookmarks, But Smarter</p>
          </div>

          <div className="max-w-[85%] flex flex-col items-center mt-8">
            {/* Rotating slide content */}
            <div className="min-h-[42vh] w-full flex items-center justify-center relative">
              <div
                className={`slide-content w-full transition-opacity duration-500 ease-in-out ${
                  isTransitioning ? "opacity-0" : "opacity-100"
                }`}
              >
                {slides[currentSlide].content}
              </div>
            </div>
          </div>

          {/* Slide indicators as buttons - keeping the same size */}
          <div className="flex justify-center gap-4 mt-auto mt-6">
            {[0, 1, 2].map((index) => (
              <button
                key={index}
                onClick={() => changeSlide(index)}
                className={`h-3 rounded-full transition-all duration-300 cursor-pointer hover:opacity-100 ${
                  currentSlide === index ? "bg-white opacity-80 w-16" : "bg-white opacity-30 w-12 hover:opacity-50"
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>
        </div>

        {/* Right column with signup/login form */}
        <div className="w-full md:w-1/2 flex items-center justify-center p-8 bg-[#f8eece]">
          <div className="w-full max-w-[90%] lg:max-w-[70%]">
            {/* Fixed header section with logo and title */}
            <div className="flex flex-col items-center h-[220px]">
              {/* TabMark Logo - fixed size */}
              <div className="h-[110px] flex items-center justify-center -mt-4 mb-6">
                <img
                  src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bookmark-64-VzKKVpB39vMeN9d3EyRBWofXUPNhoW.png"
                  alt="TabMark Logo"
                  className="w-20 h-20 text-[#ff9a8b]"
                />
              </div>

              {/* Title section - fixed height */}
              <div className="h-[110px] flex flex-col items-center justify-start">
                <h2 className="text-4xl font-bold text-purple-950 mb-3 font-abril-fatface">
                  {isLoginView ? "Welcome back" : "Create an account"}
                </h2>
                <p className="text-lg text-gray-600">
                  {isLoginView ? (
                    <>
                      Don't have an account?{" "}
                      <a href="#" onClick={toggleView} className="text-[#FF8C6B] hover:underline cursor-pointer">
                        Sign up
                      </a>
                    </>
                  ) : (
                    <>
                      Already have an account?{" "}
                      <a href="#" onClick={toggleView} className="text-[#FF8C6B] hover:underline cursor-pointer">
                        Log in
                      </a>
                    </>
                  )}
                </p>
              </div>
            </div>

            {isLoginView ? (
              // Login Form
            <form onSubmit={isForgotPasswordMode ? handleForgotPassword : handleLogin} className="space-y-5">
              <div>
                <input
                  type="email"
                  placeholder="Email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C6B] focus:border-transparent bg-white text-base"
                  required
                />
              </div>

              {/* Conditionally render the password input */}
              {!isForgotPasswordMode && (
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C6B] focus:border-transparent bg-white pr-12 text-base"
                    required
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
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
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                        <line x1="2" x2="22" y1="2" y2="22"></line>
                      </svg>
                    ) : (
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
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>
              )}

              <div className="flex justify-end">
                {!isForgotPasswordMode && (
                  <a
                  href="#"
                  onClick={(e) => {
                    e.preventDefault();
                    setIsForgotPasswordMode(true)
                    setError("")
                  }}
                  className="text-sm text-[#FF8C6B] hover:underline"
                >
                  Forgot password?
                </a>
                )}
              </div>

              <button
                type="submit"
                className="w-full py-3 px-4 bg-[#FF8C6B] hover:bg-[#ff7a55] text-white font-medium rounded-md transition duration-200 text-lg cursor-pointer"
              >
                {isForgotPasswordMode ? "Reset password" : "Log in"}
              </button>


                <div className="relative flex items-center justify-center mt-6 mb-6">
                  <div className="border-t border-gray-300 w-full"></div>
                  <span className="bg-[#f8eece] px-4 text-base text-gray-500 absolute">Or login with</span>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <button
                    onClick={signInWithGoogle}
                    type="button"
                    className="flex items-center justify-center py-3 px-4 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition duration-200 text-base font-light font-passion-one cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" width="22" height="22" className="mr-3">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </button>
                  <button
                    onClick={signInWithGitHub}
                    type="button"
                    className="flex items-center justify-center py-3 px-4 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition duration-200 text-base font-light font-passion-one cursor-pointer"
                  >
                    {/* GitHub Icon */}
                    <svg viewBox="0 0 24 24" width="22" height="22" className="mr-3">
                      <path
                        fill="currentColor"
                        d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                      />
                    </svg>
                    GitHub
                  </button>
                </div>
              </form>
            ) : (
              // Signup Form
              <form onSubmit={handleSignup} className="space-y-5">
                <div className="grid grid-cols-2 gap-5">
                  <div>
                    <input
                      type="text"
                      placeholder="First name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C6B] focus:border-transparent bg-white text-base"
                    />
                  </div>
                  <div>
                    <input
                      type="text"
                      placeholder="Last name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C6B] focus:border-transparent bg-white text-base"
                    />
                  </div>
                </div>

                <div>
                  <input
                    type="email"
                    placeholder="Email"
                    value={email}
                    onChange = {(e) => setEmail(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C6B] focus:border-transparent bg-white text-base"
                  />
                </div>

                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#FF8C6B] focus:border-transparent bg-white pr-12 text-base"
                  />
                  <button
                    type="button"
                    className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 cursor-pointer"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
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
                        <path d="M9.88 9.88a3 3 0 1 0 4.24 4.24"></path>
                        <path d="M10.73 5.08A10.43 10.43 0 0 1 12 5c7 0 10 7 10 7a13.16 13.16 0 0 1-1.67 2.68"></path>
                        <path d="M6.61 6.61A13.526 13.526 0 0 0 2 12s3 7 10 7a9.74 9.74 0 0 0 5.39-1.61"></path>
                        <line x1="2" x2="22" y1="2" y2="22"></line>
                      </svg>
                    ) : (
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
                        <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                      </svg>
                    )}
                  </button>
                </div>

                <div className="mt-4">
                  <label className="block text-gray-600 mb-2">Upload a Profile Picture!</label>
                  <div
                    className="relative w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-md text-center cursor-pointer hover:border-[#FF8C6B] transition"
                    onClick={() => document.getElementById("profilePictureInput").click()}
                  >
                    {profilePicture ? (
                      <div className="relative">
                        {/* Image Preview */}
                        <img
                          src={URL.createObjectURL(profilePicture)}
                          alt="Profile Preview"
                          className="w-24 h-24 mx-auto rounded-full object-cover mb-2"
                        />
                        {/*button to cancel out image*/}
                        <button
                          type="button"
                          className="absolute top-0 right-0 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-sm hover:bg-red-600 transition"
                          onClick={(e) => {
                            e.stopPropagation(); // Prevent triggering the file input click
                            setProfilePicture(null); // Clear the selected image
                          }}
                        >
                          &times;
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-500">Drag & drop or click to upload</p>
                    )}
                  </div>
                  <input
                    id="profilePictureInput"
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleProfilePictureUpload(e)}
                    className="hidden"
                  />
                </div>

                <div className="flex items-center space-x-3">
                  <input
                    type="checkbox"
                    id="terms"
                    checked={termsAccepted}
                    onChange={(e) => setTermsAccepted(e.target.checked)}
                    className="h-5 w-5 text-[#FF8C6B] border-gray-400 rounded focus:ring-[#FF8C6B] cursor-pointer"
                  />
                  <label htmlFor="terms" className="text-base text-gray-600 cursor-pointer">
                    I agree to the{" "}
                    <a href="/terms" className="text-[#FF8C6B] hover:underline cursor-pointer">
                      Terms & Conditions
                    </a>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-[#FF8C6B] hover:bg-[#ff7a55] text-white font-medium rounded-md transition duration-200 text-lg cursor-pointer"
                >
                  Create account
                </button>

                <div className="relative flex items-center justify-center mt-6 mb-6">
                  <div className="border-t border-gray-300 w-full"></div>
                  <span className="bg-[#f8eece] px-4 text-base text-gray-500 absolute">Or register with</span>
                </div>

                <div className="grid grid-cols-2 gap-5">
                  <button
                    onClick={signInWithGoogle}
                    type="button"
                    className="flex items-center justify-center py-3 px-4 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition duration-200 text-base font-light font-passion-one cursor-pointer"
                  >
                    <svg viewBox="0 0 24 24" width="22" height="22" className="mr-3">
                      <path
                        fill="#4285F4"
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                      />
                    </svg>
                    Google
                  </button>
                  <button
                    onClick={signInWithGitHub}
                    type="button"
                    className="flex items-center justify-center py-3 px-4 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition duration-200 text-base font-light font-passion-one cursor-pointer"
                  >
                    {/* GitHub Icon */}
                    <svg viewBox="0 0 24 24" width="22" height="22" className="mr-3">
                    <path
                      fill="currentColor"
                      d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"
                    />
                  </svg>
                    GitHub
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

