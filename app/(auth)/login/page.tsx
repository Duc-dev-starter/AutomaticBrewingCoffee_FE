import { LoginForm } from '@/components/auth'
import React from 'react'

const Login = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-primary-200 to-primary-300 p-4">
            <div className="w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    )
}

export default Login