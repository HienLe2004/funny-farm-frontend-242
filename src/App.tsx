import './App.css'
// Change this import: remove Router and import BrowserRouter
import { Routes, Route, Navigate, BrowserRouter } from 'react-router-dom'
import OverviewPage from './pages/OverviewPage'
import RootLayout from './pages/RootLayout'
import DevicesPage from './pages/DevicesPage'
import DeviceDetailPage from './pages/DeviceDetailPage'
import SchedulePage from './pages/SchedulePage'
import { JSX } from 'react'
import SideBar from './components/SideBar'
import AuthPage from './pages/AuthPage'
import DeviceFormPage from './pages/DeviceFromPage'
import RoomsPage from './pages/RoomsPage'
import RoomDevicesPage from './pages/RoomDevicesPage'
import TriggersPage from './pages/TriggersPage'
import LogsPage from './pages/LogsPage'

const isAuthenticated = () => !!localStorage.getItem('authToken');

const ProtectedRoute = ({ children }: { children: JSX.Element }) => {
  if (!isAuthenticated()) {
      return <Navigate to="/auth" replace />;
  }
  return children;
};


function App() {
  return (

    // <BrowserRouter>
      <div className="flex min-h-screen">
         {isAuthenticated() && <SideBar />}
         <div className="flex-1">
            <Routes>
               <Route path="/auth" element={<AuthPage />} />
               <Route path="/" element={<ProtectedRoute><OverviewPage /></ProtectedRoute>} />
               <Route path="/schedule" element={<ProtectedRoute><SchedulePage /></ProtectedRoute>} />
               <Route path="/devices" element={<ProtectedRoute><DevicesPage /></ProtectedRoute>} />
               <Route path="/devices/add" element={<ProtectedRoute><DeviceFormPage /></ProtectedRoute>} />
               <Route path="/devices/edit/:id" element={<ProtectedRoute><DeviceFormPage /></ProtectedRoute>} />
               <Route path="/devices/:id" element={<ProtectedRoute><DeviceDetailPage /></ProtectedRoute>} />
               <Route path="/rooms" element={<ProtectedRoute><RoomsPage /></ProtectedRoute>} />
               <Route path="/rooms/:roomId/devices" element={<RoomDevicesPage />} />
               <Route path="/triggers" element={<TriggersPage />} />
               <Route path="/logs" element={<LogsPage />} />
               <Route path="*" element={isAuthenticated() ? <Navigate to="/" /> : <Navigate to="/auth" />} />
            </Routes>
         </div>
      </div>
    // </BrowserRouter> // Close BrowserRouter
  )
}

export default App
