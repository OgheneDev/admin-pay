import React from 'react'
import AdminDashboard from '../components/AdminDashboard'
import { UserContextProvider } from '../context/UserContext'

const Dashboard = () => {
  return (
    <>
      <UserContextProvider>
      <AdminDashboard />
      </UserContextProvider>
    </>
  )
}

export default Dashboard
