'use client'

import React, { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'

  const { login, isAuthenticated } = useAuth()

  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: false
  })

  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo)
    }
  }, [isAuthenticated, router, redirectTo])

  const handleInputChange = (field: string, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))

    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.email.trim())
      newErrors.email = 'Email is required'

    if (!formData.password)
      newErrors.password = 'Password is required'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

 const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsLoading(true);

  try {
    const result = await login(
      formData.email,
      formData.password,
      formData.rememberMe
    );

    if (!result?.success) {
      setErrors({
        general: result?.message ?? "Something went wrong"
      });
      return;
    }
    // ✅ Safety: ensure role exists
    const user =
  result.user 
  JSON.parse(localStorage.getItem('user') || '{}');

    if (user?.role?.toLowerCase() === 'admin') {
      router.replace('/admin/dashboard');
    } else {
      router.replace('/users/dashboard');
    }

  } catch (error) {
    setErrors({ general: 'Something went wrong. Please try again.' });
  } finally {
    setIsLoading(false);
  }
};

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">

        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>

          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Welcome Back
          </h1>
          <p className="text-gray-600">
            Sign in to your account
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Email */}
          <div className="space-y-2">
            <Label>Email Address</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            {errors.email && (
              <p className="text-red-600 text-sm">{errors.email}</p>
            )}
          </div>

          {/* Password */}
          <div className="space-y-2">
            <Label>Password</Label>
            <div className="relative">
              <Input
                type={showPassword ? 'text' : 'password'}
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-2"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Remember Me */}
          <div className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={formData.rememberMe}
              onChange={(e) =>
                handleInputChange('rememberMe', e.target.checked)
              }
              className="w-4 h-4"
            />
            <span className="text-sm text-gray-600">
              Remember Me
            </span>
          </div>

          {/* Forgot Password */}
          <div className="text-right">
            <Link
              href="/forgot-password"
              className="text-sm text-red-600 hover:text-red-700 font-medium"
            >
              Forgot Password?
            </Link>
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link href="/signup" className="text-red-600">
              Create Account
            </Link>
          </p>
        </div>

      </div>
    </div>
  )
}
