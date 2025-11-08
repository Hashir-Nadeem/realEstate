// Auth utilities for local storage management and OTP generation

export interface User {
  id: string
  name: string
  email: string
  phone: string
  password?: string // Optional for backwards compatibility, but required for new registrations
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

// Get users from CSV via API (for server-side or real-time data)
export async function getUsersFromCSV(): Promise<User[]> {
  try {
    const response = await fetch('/api/register-user')
    const data = await response.json()
    return data.users || []
  } catch (error) {
    console.error('Failed to fetch users from CSV:', error)
    return []
  }
}

// Get user by phone from CSV via API
export async function getUserByPhoneFromCSV(phone: string): Promise<User | null> {
  try {
    const users = await getUsersFromCSV()
    return users.find(user => user.phone === phone) || null
  } catch (error) {
    console.error('Failed to get user by phone from CSV:', error)
    return null
  }
}

// Save user registration to CSV via API
export async function saveUserToCSV(userData: {
  name: string
  email: string
  phone: string
  password: string
}): Promise<{ success: boolean; message: string; userId?: string }> {
  try {
    const userRegistration = {
      id: Date.now().toString(),
      name: userData.name,
      email: userData.email,
      phone: userData.phone,
      password: userData.password, // In production, this should be hashed
      createdAt: new Date().toISOString()
    }

    const response = await fetch('/api/register-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(userRegistration),
    })

    const result = await response.json()

    if (response.ok) {
      return {
        success: true,
        message: result.message,
        userId: result.userId
      }
    } else {
      return {
        success: false,
        message: result.message || 'Failed to save user registration'
      }
    }
  } catch (error) {
    console.error('Error saving user to CSV:', error)
    return {
      success: false,
      message: 'Failed to save user registration'
    }
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

// Validate phone number (International format)
export function validatePhone(phone: string): boolean {
  // Remove spaces, dashes, and other formatting characters
  const cleanPhone = phone.replace(/[\s\-\(\)]/g, '')
  
  // Accept international format: +countrycode followed by digits
  // Minimum 7 digits (some countries), maximum 15 digits (E.164 standard)
  const phoneRegex = /^\+\d{1,4}\d{6,14}$/
  
  // Also accept numbers without + prefix but with country code
  const phoneRegexNoPlus = /^\d{7,15}$/
  
  return phoneRegex.test(cleanPhone) || phoneRegexNoPlus.test(cleanPhone)
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