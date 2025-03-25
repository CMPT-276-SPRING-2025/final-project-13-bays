"use client"

import { useState, useEffect, useRef } from "react"

export default function Signup() {
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
              src="[PLEASE PROVIDE IMAGE URL]"
              alt="TabMark Organization"
              className="w-48 h-48 object-contain mb-4"
            />
          </div>
          <p className="mb-6">
            Have you ever lost a window's worth of project resources and thought the world was over? Well, lucky you!
            Because we are here to make sure that never happens again!
          </p>
          <p>
            The idea of this website is to save our windows of tabs into separate folders for different projects and put
            them in categories based on their due dates.
          </p>
        </>
      ),
    },
    {
      content: (
        <>
          <div className="mb-6 flex justify-center">
            <img
              src="/placeholder.svg?height=192&width=192"
              alt="Research Organization"
              className="w-48 h-48 object-contain mb-4"
            />
          </div>
          <p className="mb-6">
            TabMark helps you organize your research efficiently. Save entire browser sessions with a single click and
            access them whenever you need.
          </p>
          <p>
            Our smart categorization system automatically groups related tabs, making it easier to find what you're
            looking for.
          </p>
        </>
      ),
    },
    {
      content: (
        <>
          <div className="mb-6 flex justify-center">
            <img
              src="/placeholder.svg?height=192&width=192"
              alt="Sharing Collections"
              className="w-48 h-48 object-contain mb-4"
            />
          </div>
          <p className="mb-6">
            Share your collections with teammates or keep them private. TabMark syncs across all your devices so your
            bookmarks are always available.
          </p>
          <p>
            With our powerful search feature, finding that important article or resource you saved weeks ago is just a
            few keystrokes away.
          </p>
        </>
      ),
    },
  ]

  return (
    <div className="flex flex-col md:flex-row min-h-screen">
      {/* Left column with gradient background and rotating slides */}
      <div className="w-full md:w-1/2 flex flex-col items-center justify-center text-center p-10 bg-gradient-to-r from-[#ff5f6d] to-[#ffc371] text-white">
        <div className="max-w-md flex flex-col items-center">
          {/* App title and tagline - moved up and made bigger with different font */}
          <div className="mb-16">
            <h1 className="text-6xl font-bold mb-3 font-title">TabMark</h1>
            <p className="text-2xl font-light">Bookmarks, But Smarter</p>
          </div>

          {/* Rotating slide content */}
          <div className="min-h-[380px] flex items-center relative overflow-hidden">
            <div
              className={`slide-content w-full transition-opacity duration-500 ease-in-out ${
                isTransitioning ? "opacity-0" : "opacity-100"
              }`}
            >
              {slides[currentSlide].content}
            </div>
          </div>
        </div>

        {/* Slide indicators as buttons */}
        <div className="flex justify-center gap-2 mt-20">
          {[0, 1, 2].map((index) => (
            <button
              key={index}
              onClick={() => changeSlide(index)}
              className={`w-8 h-1 rounded-full transition-all duration-300 cursor-pointer hover:opacity-100 ${
                currentSlide === index ? "bg-white opacity-80 w-10" : "bg-white opacity-30 w-8 hover:opacity-50"
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      </div>

      {/* Right column with signup form - made bigger */}
      <div className="w-full md:w-1/2 flex items-center justify-center py-10 px-8 bg-[#f8eece]">
        <div className="w-full max-w-lg">
          <div className="flex flex-col items-center mb-10">
            {/* TabMark Logo */}
            <img
              src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bookmark-64-VzKKVpB39vMeN9d3EyRBWofXUPNhoW.png"
              alt="TabMark Logo"
              className="w-20 h-20 text-[#ff9a8b] mb-6"
            />

            <h2 className="text-3xl font-bold text-[#4a2b40] mb-2">Create an account</h2>
            <p className="text-base text-gray-600 mt-1">
              Already have an account?{" "}
              <a href="/login" className="text-[#ff6b6b] hover:underline cursor-pointer">
                Log in
              </a>
            </p>
          </div>

          <form className="space-y-5">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="text"
                  placeholder="First name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff9a8b] focus:border-transparent bg-white text-base"
                />
              </div>
              <div>
                <input
                  type="text"
                  placeholder="Last name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff9a8b] focus:border-transparent bg-white text-base"
                />
              </div>
            </div>

            <div>
              <input
                type="email"
                placeholder="Email"
                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff9a8b] focus:border-transparent bg-white text-base"
              />
            </div>

            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                className="w-full px-4 py-3 border border-gray-200 rounded-md focus:outline-none focus:ring-2 focus:ring-[#ff9a8b] focus:border-transparent bg-white pr-12 text-base"
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

            <div className="flex items-center space-x-3">
              <input
                type="checkbox"
                id="terms"
                className="h-5 w-5 text-[#ff6b6b] border-gray-400 rounded focus:ring-[#ff6b6b] cursor-pointer"
              />
              <label htmlFor="terms" className="text-base text-gray-600 cursor-pointer">
                I agree to the{" "}
                <a href="/terms" className="text-[#ff6b6b] hover:underline cursor-pointer">
                  Terms & Conditions
                </a>
              </label>
            </div>

            <button
              type="submit"
              className="w-full py-3 px-4 bg-[#ff9a8b] hover:bg-[#ff6b6b] text-white font-medium rounded-md transition duration-200 text-lg cursor-pointer"
            >
              Create account
            </button>

            <div className="relative flex items-center justify-center mt-8 mb-8">
              <div className="border-t border-gray-300 w-full"></div>
              <span className="bg-[#f8eece] px-4 text-sm text-gray-500 absolute">Or register with</span>
            </div>

            <div className="grid grid-cols-2 gap-6">
              <button
                type="button"
                className="flex items-center justify-center py-3 px-4 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition duration-200 text-base cursor-pointer"
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
                type="button"
                className="flex items-center justify-center py-3 px-4 bg-white border border-gray-200 rounded-md hover:bg-gray-50 transition duration-200 text-base cursor-pointer"
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
        </div>
      </div>
    </div>
  )
}

