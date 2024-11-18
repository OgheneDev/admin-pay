import React from 'react'
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import Dashboard from './pages/Dashboard'
import LoginPage from './pages/LoginPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <LoginPage />,
  },
  {
    path: '/dashboard',
    element: <Dashboard />
  }
]);

const App = () => {
  return (
    <>
      <RouterProvider router={router} />
    </>
  )
}

export default App

