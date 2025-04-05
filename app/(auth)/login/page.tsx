import { LoginForm } from '@/components/auth'
import React from 'react'

const Login = () => {
    return (
        <div className="flex min-h-screen items-center justify-center bg-gradient-to-b from-sky-400 to-sky-200 p-4">
            <div className="w-full max-w-md">
                <LoginForm />
            </div>
        </div>
    )
}

export default Login