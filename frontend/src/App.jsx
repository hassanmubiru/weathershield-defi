import { Routes, Route } from 'react-router-dom'
import Layout from './components/Layout'
import Home from './pages/Home'
import Dashboard from './pages/Dashboard'
import CreatePolicy from './pages/CreatePolicy'
import PolicyDetails from './pages/PolicyDetails'
import Claims from './pages/Claims'
import About from './pages/About'

function App() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Home />} />
        <Route path="dashboard" element={<Dashboard />} />
        <Route path="create-policy" element={<CreatePolicy />} />
        <Route path="policy/:id" element={<PolicyDetails />} />
        <Route path="claims" element={<Claims />} />
        <Route path="about" element={<About />} />
      </Route>
    </Routes>
  )
}

export default App
