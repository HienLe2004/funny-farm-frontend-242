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
import StatisticsPage from './pages/StatisticsPage'

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
      <div className="min-h-screen">
        <Routes>
          <Route path="/auth" element={<AuthPage/>}></Route>
          <Route path="/" element={<RootLayout><OverviewPage/></RootLayout>}></Route>
          <Route path="/devices" element={<RootLayout><DevicesPage/></RootLayout>}></Route>
          <Route path="/devices/:id" element={<RootLayout><DeviceDetailPage/></RootLayout>}></Route>
          <Route path="/schedule" element={<RootLayout><SchedulePage/></RootLayout>}></Route>
          <Route path="/devices/add" element={<RootLayout><DeviceFormPage /></RootLayout>} />
          <Route path="/devices/edit/:id" element={<RootLayout><DeviceFormPage /></RootLayout>} />
          <Route path="/devices/:id" element={<RootLayout><DeviceDetailPage /></RootLayout>} />
          <Route path="/rooms" element={<RootLayout><RoomsPage /></RootLayout>} />
          <Route path="/rooms/:roomId/devices" element={<RootLayout><RoomDevicesPage /></RootLayout>} />
          <Route path="/triggers" element={<RootLayout><TriggersPage /></RootLayout>} />
          <Route path="/logs" element={<RootLayout><LogsPage /></RootLayout>} />
          <Route path="*" element={isAuthenticated() ? <Navigate to="/" /> : <Navigate to="/auth" />} />
          <Route path="/statistics" element={<RootLayout><StatisticsPage/></RootLayout>}></Route>
      </Routes>
         {/* {isAuthenticated() && <SideBar />}
         <div className="flex-1">
            <Routes>
            </Routes>
         </div> */}
      </div>
    // </BrowserRouter> // Close BrowserRouter
  )
}

export default App
