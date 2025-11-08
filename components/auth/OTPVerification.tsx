'use client'

import React, { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { MessageSquare } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'

interface OTPVerificationProps {
  phone: string
  onSuccess: () => void
  onBack: () => void
}

export default function OTPVerification({ phone, onSuccess, onBack }: OTPVerificationProps) {
  const [otp, setOTP] = useState(['', '', ''])
  const [timeLeft, setTimeLeft] = useState(40)
  const [isExpired, setIsExpired] = useState(false)
  const [error, setError] = useState('')
  const [isVerifying, setIsVerifying] = useState(false)
  const [canResend, setCanResend] = useState(false)

  const { verifyOTP, resendOTP, pendingVerification } = useAuth()

  // Timer countdown
  useEffect(() => {
    if (timeLeft > 0 && !isExpired) {
      const timer = setTimeout(() => {
        setTimeLeft(timeLeft - 1)
      }, 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0) {
      setIsExpired(true)
      setCanResend(true)
    }
  }, [timeLeft, isExpired])

  // Reset timer when pending verification changes (new OTP sent)
  useEffect(() => {
    if (pendingVerification) {
      const remaining = Math.max(0, Math.floor((pendingVerification.expiresAt - Date.now()) / 1000))
      setTimeLeft(remaining)
      setIsExpired(remaining <= 0)
      setCanResend(remaining <= 0)
    }
  }, [pendingVerification])

  const handleOTPChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return // Only allow digits
    
    const newOTP = [...otp]
    newOTP[index] = value.slice(-1) // Only take the last digit
    setOTP(newOTP)
    setError('')

    // Auto-focus next input
    if (value && index < 2) {
      const nextInput = document.getElementById(`otp-${index + 1}`)
      nextInput?.focus()
    }

    // Auto-verify when all 3 digits are entered
    if (newOTP.every(digit => digit !== '') && newOTP.join('').length === 3) {
      handleVerify(newOTP.join(''))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      const prevInput = document.getElementById(`otp-${index - 1}`)
      prevInput?.focus()
    }
  }

  const handleVerify = async (otpValue?: string) => {
    const otpToVerify = otpValue || otp.join('')
    
    if (otpToVerify.length !== 3) {
      setError('Please enter the complete OTP')
      return
    }

    if (isExpired) {
      setError('OTP has expired. Please request a new one.')
      return
    }

    setIsVerifying(true)
    setError('')

    try {
      const result = await verifyOTP(otpToVerify)
      
      if (result.success) {
        onSuccess()
      } else {
        setError(result.message)
        if (result.message.includes('expired')) {
          setIsExpired(true)
          setCanResend(true)
        }
      }
    } catch (error) {
      setError('Verification failed. Please try again.')
    } finally {
      setIsVerifying(false)
    }
  }

  const handleResend = async () => {
    try {
      const result = await resendOTP()
      
      if (result.success) {
        setOTP(['', '', ''])
        setTimeLeft(40)
        setIsExpired(false)
        setCanResend(false)
        setError('')
        
        // Focus first input
        const firstInput = document.getElementById('otp-0')
        firstInput?.focus()
      } else {
        setError(result.message)
      }
    } catch (error) {
      setError('Failed to resend OTP. Please try again.')
    }
  }

  const formatTime = (seconds: number) => {
    return seconds.toString().padStart(2, '0')
  }

  const maskedPhone = phone.length > 6 
    ? `+91-${phone.slice(-10, -6)}****${phone.slice(-4)}`
    : phone

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            Verify your number
          </h1>
          
          <div className="flex items-center justify-center gap-2">
            <span className="font-medium text-gray-900">
              WhatsApp no. {maskedPhone}
            </span>
            <button 
              onClick={onBack}
              className="text-red-500 text-sm font-medium hover:text-red-600"
            >
              Edit
            </button>
          </div>
          
        </div>

        {/* OTP Input */}
        <div className="flex justify-center gap-4 mb-8">
          {otp.map((digit, index) => (
            <input
              key={index}
              id={`otp-${index}`}
              type="text"
              inputMode="numeric"
              maxLength={1}
              value={digit}
              onChange={(e) => handleOTPChange(index, e.target.value)}
              onKeyDown={(e) => handleKeyDown(index, e)}
              className={`w-16 h-16 text-center text-2xl font-semibold border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${
                error ? 'border-red-300 bg-red-50' : 'border-gray-300'
              } ${isExpired ? 'bg-gray-100' : 'bg-white'}`}
              disabled={isExpired || isVerifying}
            />
          ))}
        </div>

        {/* Error Message */}
        {error && (
          <div className="text-center mb-4">
            <p className="text-red-600 text-sm">{error}</p>
          </div>
        )}

        {/* Verify Button */}
        <Button 
          onClick={() => handleVerify()}
          disabled={isVerifying || isExpired || otp.some(digit => !digit)}
          className="w-full bg-red-600 hover:bg-red-700 text-white font-medium py-3 rounded-lg mb-6 disabled:bg-gray-300 disabled:cursor-not-allowed"
        >
          {isVerifying ? 'Verifying...' : 'Verify'}
        </Button>

        {/* Timer and Resend */}
        <div className="text-center">
          {!isExpired ? (
            <p className="text-gray-600 text-sm mb-4">
              Not received the OTP yet? Try again in{' '}
              <span className="text-red-600 font-medium">{formatTime(timeLeft)}</span> sec
            </p>
          ) : (
            <p className="text-red-600 text-sm mb-4">
              OTP has expired. Please request a new one.
            </p>
          )}

          {/* Resend Button */}
          <button
            onClick={handleResend}
            disabled={!canResend}
            className={`w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg border font-medium transition-colors ${
              canResend
                ? 'border-gray-300 text-gray-700 hover:bg-gray-50 bg-white'
                : 'border-gray-200 text-gray-400 bg-gray-50 cursor-not-allowed'
            }`}
          >
            <MessageSquare className="w-5 h-5 text-green-600" />
            Resend on WhatsApp
          </button>
        </div>

        {/* Support */}
        <div className="text-center mt-6 pt-6 border-t border-gray-200">
          <p className="text-gray-500 text-sm">
            Facing Issue?{' '}
            <button className="text-red-500 font-medium hover:text-red-600">
              Chat with us
            </button>
          </p>
        </div>
      </div>
    </div>
  )
}