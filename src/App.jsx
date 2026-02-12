import Home from './components/page/Home.jsx'
import Login from './components/page/Login.jsx'
import Signup from './components/page/Signup.jsx'
import MemberPage from './components/page/MemberPage.jsx'
import MemberResetPassword from './components/page/MemberResetPassword.jsx'
import AdminLogin from './components/page/AdminLogin.jsx'
import Dashboard from './components/page/Dashborad.jsx'
import CreateArticle from './components/page/CreateArticle.jsx'
import CategoryManagement from './components/page/CategoryManagement.jsx'
import CreateCategory from './components/page/CreateCategory.jsx'
import Profile from './components/page/Profile.jsx'
import Notification from './components/page/Notification.jsx'
import ResetPassword from './components/page/ResetPassword.jsx'
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
        <Route path="/member/reset-password" element={<MemberResetPassword />} />
        <Route path="/admin-login" element={<AdminLogin />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/dashboard/create" element={<CreateArticle />} />
        <Route path="/dashboard/edit/:id" element={<CreateArticle />} />
        <Route path="/dashboard/categories" element={<CategoryManagement />} />
        <Route path="/dashboard/categories/create" element={<CreateCategory />} />
        <Route path="/dashboard/categories/edit/:id" element={<CreateCategory />} />
        <Route path="/dashboard/profile" element={<Profile />} />
        <Route path="/dashboard/notification" element={<Notification />} />
        <Route path="/dashboard/reset-password" element={<ResetPassword />} />
      </Routes>
    </Router>
    </>
  )
}

export default App
