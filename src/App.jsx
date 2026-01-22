import Home from './components/page/Home.jsx'
import Login from './components/page/Login.jsx'
import Signup from './components/page/Signup.jsx'
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom'
import ViewPost from './components/page/ViewPost.jsx'
import './App.css'


function App() {
  

  return (
    <>
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        <Route path="/post/:id" element={<ViewPost />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
