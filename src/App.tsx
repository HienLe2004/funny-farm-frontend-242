import './App.css'
import { Routes, Route } from 'react-router-dom'
import OverviewPage from './pages/OverviewPage'
import RootLayout from './pages/RootLayout'

function App() {
  return (
    <div>
      <Routes>
        <Route path="/*" element={<RootLayout><OverviewPage/></RootLayout>}></Route>
      </Routes>
    </div>
  )
}

export default App
