'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, ArrowLeft } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'
import OTPVerification from '@/components/auth/OTPVerification'

export default function LoginPage() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectTo = searchParams.get('redirect') || '/'
  
  const { login, isAuthenticated, pendingVerification } = useAuth()
  
  const [formData, setFormData] = useState({
    phone: '',
    password: ''
  })
  
  const [showPassword, setShowPassword] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)
  const [showOTPVerification, setShowOTPVerification] = useState(false)

  // Check if we should show OTP verification on mount
  React.useEffect(() => {
    if (pendingVerification) {
      setShowOTPVerification(true)
    }
  }, [pendingVerification])

  // Redirect if already authenticated
  React.useEffect(() => {
    if (isAuthenticated) {
      router.replace(redirectTo)
    }
  }, [isAuthenticated, router, redirectTo])

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.phone.trim()) {
      newErrors.phone = 'Phone number is required'
    } else {
      // Clean phone number of any non-digits for validation
      const cleanPhone = formData.phone.replace(/\D/g, '')
      
      // Check if it's the test user phone number
      if (formData.phone === '+919876543210') {
        // Always allow test user phone
      } else if (cleanPhone.length < 6) {
        newErrors.phone = 'Phone number must be at least 6 digits'
      } else if (cleanPhone.length > 15) {
        newErrors.phone = 'Phone number cannot be more than 15 digits'
      }
    }

    if (!formData.password) {
      newErrors.password = 'Password is required'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) return

    setIsLoading(true)
    
    try {
      const result = await login(formData.phone, formData.password)
      
      if (result.success && result.needsVerification) {
        setShowOTPVerification(true)
      } else if (result.success) {
        router.replace(redirectTo)
      } else {
        setErrors({ general: result.message })
      }
    } catch (error) {
      setErrors({ general: 'Something went wrong. Please try again.' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleOTPSuccess = () => {
    router.replace(redirectTo)
  }

  const handleBackFromOTP = () => {
    setShowOTPVerification(false)
  }

  if (showOTPVerification) {
    return (
      <OTPVerification
        phone={formData.phone}
        onSuccess={handleOTPSuccess}
        onBack={handleBackFromOTP}
      />
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="mb-6">
          <button 
            onClick={() => router.back()}
            className="flex items-center text-gray-600 hover:text-gray-800 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back</h1>
          <p className="text-gray-600">Sign in to your account to continue</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* General Error */}
          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Phone Field */}
          <div className="space-y-2">
            <Label htmlFor="phone" className="text-sm font-medium text-gray-700">
              Phone Number
            </Label>
            <Input
              id="phone"
              type="tel"
              placeholder="Enter your mobile number"
              value={formData.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              className={`${errors.phone ? 'border-red-300 focus:border-red-500' : ''}`}
            />
            {errors.phone && (
              <p className="text-red-600 text-sm">{errors.phone}</p>
            )}
          </div>

          {/* Password Field */}
          <div className="space-y-2">
            <Label htmlFor="password" className="text-sm font-medium text-gray-700">
              Password
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`pr-10 ${errors.password ? 'border-red-300 focus:border-red-500' : ''}`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700"
              >
                {showPassword ? (
                  <EyeOff className="w-5 h-5" />
                ) : (
                  <Eye className="w-5 h-5" />
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-600 text-sm">{errors.password}</p>
            )}
          </div>

          {/* Forgot Password Link */}
          <div className="text-right">
            <button
              type="button"
              className="text-sm text-red-600 hover:text-red-700 font-medium"
              onClick={() => {
                // For now, just show an alert - you can implement forgot password later
                alert('Forgot password feature coming soon!')
              }}
            >
              Forgot Password?
            </button>
          </div>

          {/* Submit Button */}
          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg mt-6 disabled:bg-gray-400"
          >
            {isLoading ? 'Signing In...' : 'Sign In'}
          </Button>
        </form>

        {/* Signup Link */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-600 text-sm">
            Don't have an account?{' '}
            <Link 
              href="/signup" 
              className="text-red-600 font-medium hover:text-red-700"
            >
              Create Account
            </Link>
          </p>
        </div>

        {/* Demo Instructions */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <p className="text-blue-800 text-sm font-medium mb-2">Demo Instructions:</p>
          <p className="text-blue-700 text-xs">
            To test the app, first create an account using the "Create Account" link above.
            After signup and OTP verification, you can login with your phone number and password.
          </p>
        </div>
      </div>
    </div>
  )
}