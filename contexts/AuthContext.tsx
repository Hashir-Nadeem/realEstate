'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'
import { 
  User, 
  AuthState, 
  getStoredUser, 
  saveUser, 
  logoutUser,
  getPendingVerification,
  savePendingVerification,
  clearPendingVerification,
  generateOTP,
  getUserByPhone,
  getUserByPhoneFromCSV,
  saveUserToCSV,
  addUserToList,
  validatePassword,
  validatePhone,
  validateEmail,
  isOTPExpired
} from '@/lib/auth'

interface AuthContextType {
  // State
  isAuthenticated: boolean
  user: User | null
  pendingVerification: AuthState['pendingVerification']
  loading: boolean
  
  // Actions
  login: (phone: string, password: string) => Promise<{ success: boolean; message: string; needsVerification?: boolean }>
  signup: (data: { name: string; email: string; phone: string; password: string }) => Promise<{ success: boolean; message: string; needsVerification?: boolean }>
  verifyOTP: (otp: string) => Promise<{ success: boolean; message: string }>
  resendOTP: () => Promise<{ success: boolean; message: string }>
  logout: () => void
  clearErrors: () => void
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [user, setUser] = useState<User | null>(null)
  const [pendingVerification, setPendingVerification] = useState<AuthState['pendingVerification']>(null)
  const [loading, setLoading] = useState(true)

  // Initialize auth state on mount
  useEffect(() => {
    const storedUser = getStoredUser()
    const pending = getPendingVerification()
    
    if (storedUser) {
      setUser(storedUser)
      setIsAuthenticated(true)
    }
    
    if (pending) {
      // Check if pending OTP is expired
      if (isOTPExpired(pending.expiresAt)) {
        clearPendingVerification()
      } else {
        setPendingVerification(pending)
      }
    }
    
    setLoading(false)
  }, [])

  const login = async (phone: string, password: string): Promise<{ success: boolean; message: string; needsVerification?: boolean }> => {
    try {
      // Import test user check
      const { isTestUser, TEST_USER } = await import('@/lib/auth')
      
      // Check if this is the test user - direct login without OTP
      if (isTestUser(phone) && password === TEST_USER.password) {
        // For test user, login directly without OTP verification
        setUser(TEST_USER.user)
        setIsAuthenticated(true)
        saveUser(TEST_USER.user)
        clearPendingVerification()
        setPendingVerification(null)
        
        return { success: true, message: 'Login successful!' }
      }
      
      // Validate inputs
      if (!validatePhone(phone)) {
        return { success: false, message: 'Please enter a valid phone number' }
      }
      
      if (!password) {
        return { success: false, message: 'Password is required' }
      }

      // Find user by phone - first check local storage, then CSV
      let existingUser = getUserByPhone(phone)
      
      if (!existingUser) {
        // Check CSV for user
        try {
          existingUser = await getUserByPhoneFromCSV(phone)
        } catch (error) {
          console.error('Error checking CSV for user:', error)
        }
      }
      
      if (!existingUser) {
        return { success: false, message: 'User not found. Please sign up first.' }
      }

      // For demo purposes, we'll check password against stored password if available
      // In production, you'd hash and compare passwords
      if (existingUser.password && password !== existingUser.password) {
        return { success: false, message: 'Invalid password' }
      } else if (!existingUser.password && !validatePassword(password)) {
        return { success: false, message: 'Invalid password' }
      }

      // Login successful
      setUser(existingUser)
      setIsAuthenticated(true)
      saveUser(existingUser)
      
      return { success: true, message: 'Login successful' }
    } catch (error) {
      return { success: false, message: 'Login failed. Please try again.' }
    }
  }

  const signup = async (data: { name: string; email: string; phone: string; password: string }): Promise<{ success: boolean; message: string; needsVerification?: boolean }> => {
    try {
      const { name, email, phone, password } = data

      // Validate inputs
      if (!name.trim()) {
        return { success: false, message: 'Name is required' }
      }
      
      if (!validateEmail(email)) {
        return { success: false, message: 'Please enter a valid email address' }
      }
      
      if (!validatePhone(phone)) {
        return { success: false, message: 'Please enter a valid phone number' }
      }
      
      if (!validatePassword(password)) {
        return { success: false, message: 'Password must be at least 6 characters long' }
      }

      // Check if user already exists - check both local storage and CSV
      let existingUser = getUserByPhone(phone)
      
      if (!existingUser) {
        try {
          existingUser = await getUserByPhoneFromCSV(phone)
        } catch (error) {
          console.error('Error checking CSV for existing user:', error)
        }
      }
      
      if (existingUser) {
        return { success: false, message: 'User with this phone number already exists' }
      }

      // Generate OTP and set expiry (40 seconds)
      const otp = generateOTP()
      const expiresAt = Date.now() + 40 * 1000 // 40 seconds

      // Store pending verification
      const pendingData = {
        phone,
        name,
        email,
        password,
        otp,
        expiresAt
      }
      
      setPendingVerification(pendingData)
      savePendingVerification(pendingData)

      console.log(`📱 OTP sent to ${phone}: ${otp} (expires in 40 seconds)`)
      
      return { 
        success: true, 
        message: `OTP sent to ${phone}`, 
        needsVerification: true 
      }
    } catch (error) {
      return { success: false, message: 'Signup failed. Please try again.' }
    }
  }

  const verifyOTP = async (otp: string): Promise<{ success: boolean; message: string }> => {
    try {
      if (!pendingVerification) {
        return { success: false, message: 'No pending verification found' }
      }

      if (isOTPExpired(pendingVerification.expiresAt)) {
        clearPendingVerification()
        setPendingVerification(null)
        return { success: false, message: 'OTP has expired. Please request a new one.' }
      }

      // Import test user utilities
      const { isTestUser, TEST_USER } = await import('@/lib/auth')
      
      // Check if this is for test user login
      if (isTestUser(pendingVerification.phone)) {
        // For test user, accept any OTP
        const testUser = TEST_USER.user
        
        setUser(testUser)
        setIsAuthenticated(true)
        saveUser(testUser)
        
        // Clear pending verification
        clearPendingVerification()
        setPendingVerification(null)
        
        return { success: true, message: 'Login successful!' }
      }

      // Accept any OTP for demo purposes (not just the generated one)
      // This makes it work like you requested - user can enter any random code
      if (!otp || otp.trim().length === 0) {
        return { success: false, message: 'Please enter the OTP' }
      }

      // For actual verification, we'll accept any non-empty OTP
      // In production, you would verify against pendingVerification.otp

      // Create user with password included
      const newUser: User = {
        id: Date.now().toString(),
        name: pendingVerification.name,
        email: pendingVerification.email,
        phone: pendingVerification.phone,
        password: pendingVerification.password, // Include password in user object
        createdAt: new Date().toISOString()
      }

      // Save user to CSV via API
      try {
        const csvResult = await saveUserToCSV({
          name: pendingVerification.name,
          email: pendingVerification.email,
          phone: pendingVerification.phone,
          password: pendingVerification.password
        })

        if (!csvResult.success) {
          console.error('Failed to save user to CSV:', csvResult.message)
          // Continue anyway for better user experience
        } else {
          console.log('✅ User successfully saved to CSV with ID:', csvResult.userId)
        }
      } catch (error) {
        console.error('Error saving user to CSV:', error)
        // Continue anyway for better user experience
      }

      // Save user to local storage as well
      setUser(newUser)
      setIsAuthenticated(true)
      saveUser(newUser)
      addUserToList(newUser)

      // Clear pending verification
      clearPendingVerification()
      setPendingVerification(null)

      return { success: true, message: 'Account created successfully!' }
    } catch (error) {
      return { success: false, message: 'Verification failed. Please try again.' }
    }
  }

  const resendOTP = async (): Promise<{ success: boolean; message: string }> => {
    try {
      if (!pendingVerification) {
        return { success: false, message: 'No pending verification found' }
      }

      // Generate new OTP and extend expiry
      const newOTP = generateOTP()
      const newExpiresAt = Date.now() + 40 * 1000

      const updatedPending = {
        ...pendingVerification,
        otp: newOTP,
        expiresAt: newExpiresAt
      }

      setPendingVerification(updatedPending)
      savePendingVerification(updatedPending)

      console.log(`📱 New OTP sent to ${pendingVerification.phone}: ${newOTP} (expires in 40 seconds)`)

      return { success: true, message: `New OTP sent to ${pendingVerification.phone}` }
    } catch (error) {
      return { success: false, message: 'Failed to resend OTP. Please try again.' }
    }
  }

  const logout = () => {
    setUser(null)
    setIsAuthenticated(false)
    setPendingVerification(null)
    logoutUser()
  }

  const clearErrors = () => {
    // This can be used to clear any error states if needed
  }

  const value: AuthContextType = {
    isAuthenticated,
    user,
    pendingVerification,
    loading,
    login,
    signup,
    verifyOTP,
    resendOTP,
    logout,
    clearErrors
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}