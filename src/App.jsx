import Home from './components/page/Home.jsx'
import Login from './components/page/Login.jsx'
import Signup from './components/page/Signup.jsx'
import MemberPage from './components/page/MemberPage.jsx'
import AdminLogin from './components/page/AdminLogin.jsx'
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
        <Route path="/member" element={<MemberPage />} />
        <Route path="/admin-login" element={<AdminLogin />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
