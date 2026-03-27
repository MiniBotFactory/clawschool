import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { HelmetProvider } from 'react-helmet-async'
import { AuthProvider } from './contexts/AuthContext'
import Home from './pages/Home'
import Resources from './pages/Resources'
import CourseSets from './pages/CourseSets'
import Skills from './pages/Skills'
import Learning from './pages/Learning'
import CourseDetail from './pages/CourseDetail'
import Evaluation from './pages/Evaluation'
import User from './pages/User'
import UserEvaluations from './pages/UserEvaluations'
import UserCollections from './pages/UserCollections'
import AdminDashboard from './pages/admin/AdminDashboard'
import AdminConfig from './pages/admin/AdminConfig'
import AdminJobs from './pages/admin/AdminJobs'
import AdminCollection from './pages/admin/AdminCollection'
import AdminAdmins from './pages/admin/AdminAdmins'
import './index.css'

function App() {
  return (
    <HelmetProvider>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/resources" element={<Resources />} />
            <Route path="/course-sets" element={<CourseSets />} />
            <Route path="/skills" element={<Skills />} />
            <Route path="/learning" element={<Learning />} />
            <Route path="/course/:id" element={<CourseDetail />} />
            <Route path="/evaluation" element={<Evaluation />} />
            <Route path="/user" element={<User />} />
            <Route path="/user/evaluations" element={<UserEvaluations />} />
            <Route path="/user/collections" element={<UserCollections />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/admin/config" element={<AdminConfig />} />
            <Route path="/admin/jobs" element={<AdminJobs />} />
            <Route path="/admin/collection" element={<AdminCollection />} />
            <Route path="/admin/admins" element={<AdminAdmins />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </HelmetProvider>
  )
}

export default App