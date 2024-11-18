import React from 'react'
import { SignUpContextProvider } from '../context/LogInContext'
import LoginForm from '../components/LoginForm'

const LoginPage = () => {
  return (
    <div>
      <SignUpContextProvider>
        <LoginForm />
      </SignUpContextProvider>
    </div>
  )
}

export default LoginPage
