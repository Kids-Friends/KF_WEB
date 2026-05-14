import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom'
import { CallProvider } from './context/CallContext.jsx'
import App from './App.jsx'
import RoleSelectPage from './pages/RoleSelectPage.jsx'
import AdminLoginPage from './pages/AdminLoginPage.jsx'
import AdminDashboardPage from './pages/AdminDashboardPage.jsx'
import KioskPage from './pages/KioskPage.jsx'
import AdminLayout from './pages/admin/AdminLayout.jsx'
import MainDashboardPage from './pages/admin/MainDashboardPage.jsx'
import MembersPage from './pages/admin/MembersPage.jsx'
import RobotsPage from './pages/admin/RobotsPage.jsx'
import CallsPage from './pages/admin/CallsPage.jsx'
import ChatsPage from './pages/admin/ChatsPage.jsx'
import PhotosPage from './pages/admin/PhotosPage.jsx'
import SettingsPage from './pages/admin/SettingsPage.jsx'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <CallProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<RoleSelectPage />} />
          <Route path="/visitor" element={<App />} />
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route path="/admin/old-dashboard" element={<AdminDashboardPage />} />
          <Route path="/admin" element={<AdminLayout />}>
            <Route path="dashboard" element={<MainDashboardPage />} />
            <Route path="members" element={<MembersPage />} />
            <Route path="robots" element={<RobotsPage />} />
            <Route path="calls" element={<CallsPage />} />
            <Route path="chats" element={<ChatsPage />} />
            <Route path="photos" element={<PhotosPage />} />
            <Route path="settings" element={<SettingsPage />} />
          </Route>
          <Route path="/kiosk" element={<KioskPage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </CallProvider>
  </React.StrictMode>,
)
