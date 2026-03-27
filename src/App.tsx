import { BrowserRouter, Routes, Route } from 'react-router-dom'
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
import './index.css'

function App() {
  return (
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
        </Routes>
      </BrowserRouter>
    </AuthProvider>
  )
}

export default App