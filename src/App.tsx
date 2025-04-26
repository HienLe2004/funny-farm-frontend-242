import './App.css'
import { Routes, Route } from 'react-router-dom'
import OverviewPage from './pages/OverviewPage'
import RootLayout from './pages/RootLayout'
import DevicesPage from './pages/DevicesPage'
import DeviceDetailPage from './pages/DeviceDetailPage'
import SchedulePage from './pages/SchedulePage'
import LoginPage from './pages/LoginPage'
import StatisticsPage from './pages/StatisticsPage'

function App() {
  return (
    <div>
      <Routes>
      <Route path="/login" element={<LoginPage/>}></Route>
      <Route path="/" element={<RootLayout><OverviewPage/></RootLayout>}></Route>
      <Route path="/devices" element={<RootLayout><DevicesPage/></RootLayout>}></Route>
      <Route path="/devices/:id" element={<RootLayout><DeviceDetailPage/></RootLayout>}></Route>
      <Route path="/schedule" element={<RootLayout><SchedulePage/></RootLayout>}></Route>
      <Route path="/statistics" element={<RootLayout><StatisticsPage/></RootLayout>}></Route>
      </Routes>
    </div>
  )
}

export default App
