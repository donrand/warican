import { Routes, Route } from 'react-router-dom'
import ProjectList from './components/ProjectList.jsx'
import ProjectDetailPage from './components/ProjectDetailPage.jsx'
import './App.css'

function App() {
  return (
    <Routes>
      <Route path="/" element={<ProjectList />} />
      <Route path="/project/:id" element={<ProjectDetailPage />} />
    </Routes>
  )
}

export default App
