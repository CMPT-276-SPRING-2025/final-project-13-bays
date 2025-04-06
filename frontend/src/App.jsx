// import { useState } from 'react'
// import reactLogo from './assets/react.svg'
// import viteLogo from '/vite.svg'
// import './App.css'
// import Signup from "./components/Signup";
// import TestDashboard from "./components/TestDashboard"

// function App() {
//   return <Signup />;
//   return <TestDashboard/>;
// }

// export default App;


import { useState } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import Signup from "./components/Signup"
import HomePage from './components/home-page'
import TestDashboard from "./components/TestDashboard"
import { BrowserRouter, Routes, Route } from "react-router-dom"


function App() {
  return(
    <BrowserRouter>  {/* sets up all our browser routes*/}
      <Routes>
        {/* main signup page route */}
        <Route path = "/signup" element = {<Signup/>} />
        {/* test dashboard page route */}
        <Route path = "/home-page" element = {<HomePage/>} />
        {/* default page route - signup page */}
        <Route path = "*" element = {<Signup/>} />   
      </Routes>
    </BrowserRouter>
  )
}

export default App


