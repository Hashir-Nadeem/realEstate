// Auth utilities for local storage management and OTP generation

export interface User {
  id: string
  name: string
  email: string
  phone: string
  createdAt: string
}

export interface AuthState {
  isAuthenticated: boolean
  user: User | null
  pendingVerification: {
    phone: string
    name: string
    email: string
    password: string
    otp: string
    expiresAt: number
  } | null
}

// Hardcoded test user for demo purposes
export const TEST_USER = {
  phone: '+919876543210',
  password: 'test123',
  user: {
    id: 'test-user-001',
    name: 'Test User',
    email: 'test@example.com',
    phone: '+919876543210',
    createdAt: new Date().toISOString()
  }
}

// Generate a random 3-digit OTP
export function generateOTP(): string {
  return Math.floor(100 + Math.random() * 900).toString()
}

// Save user credentials to localStorage
export function saveUser(user: User): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_user', JSON.stringify(user))
  }
}

// Get user from localStorage
export function getStoredUser(): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('auth_user')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// Save pending verification data
export function savePendingVerification(data: AuthState['pendingVerification']): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('auth_pending', JSON.stringify(data))
  }
}

// Get pending verification data
export function getPendingVerification(): AuthState['pendingVerification'] | null {
  if (typeof window === 'undefined') return null
  
  try {
    const stored = localStorage.getItem('auth_pending')
    return stored ? JSON.parse(stored) : null
  } catch {
    return null
  }
}

// Clear pending verification
export function clearPendingVerification(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_pending')
  }
}

// Check if user exists by phone (for login)
export function getUserByPhone(phone: string): User | null {
  if (typeof window === 'undefined') return null
  
  try {
    const users = getAllUsers()
    return users.find(user => user.phone === phone) || null
  } catch {
    return null
  }
}

// Get all registered users
export function getAllUsers(): User[] {
  if (typeof window === 'undefined') return []
  
  try {
    const users = localStorage.getItem('auth_all_users')
    return users ? JSON.parse(users) : []
  } catch {
    return []
  }
}

// Add user to users list
export function addUserToList(user: User): void {
  if (typeof window !== 'undefined') {
    const users = getAllUsers()
    const updatedUsers = [...users.filter(u => u.id !== user.id), user]
    localStorage.setItem('auth_all_users', JSON.stringify(updatedUsers))
  }
}

// Validate password (simple validation)
export function validatePassword(password: string): boolean {
  return password.length >= 6
}

// Validate phone number (Indian format)
export function validatePhone(phone: string): boolean {
  const phoneRegex = /^[\+]?[91]?[6789]\d{9}$/
  return phoneRegex.test(phone.replace(/\s/g, ''))
}

// Validate email
export function validateEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

// Check if OTP is expired
export function isOTPExpired(expiresAt: number): boolean {
  return Date.now() > expiresAt
}

// Check if phone number is the test user
export function isTestUser(phone: string): boolean {
  return phone === TEST_USER.phone
}

// Logout user
export function logoutUser(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem('auth_user')
    clearPendingVerification()
  }
}