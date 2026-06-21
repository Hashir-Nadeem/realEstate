'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Eye, EyeOff, ArrowLeft, ChevronDown } from 'lucide-react'
import { useAuth } from '@/contexts/AuthContext'


const COUNTRY_CODES = [
  { code: '+1', country: 'US', name: 'United States' },
  { code: '+1', country: 'CA', name: 'Canada' },
  { code: '+52', country: 'MX', name: 'Mexico' },

  { code: '+44', country: 'GB', name: 'United Kingdom' },
  { code: '+49', country: 'DE', name: 'Germany' },
  { code: '+33', country: 'FR', name: 'France' },
  { code: '+39', country: 'IT', name: 'Italy' },
  { code: '+34', country: 'ES', name: 'Spain' },
  { code: '+31', country: 'NL', name: 'Netherlands' },
  { code: '+32', country: 'BE', name: 'Belgium' },
  { code: '+41', country: 'CH', name: 'Switzerland' },
  { code: '+43', country: 'AT', name: 'Austria' },
  { code: '+46', country: 'SE', name: 'Sweden' },
  { code: '+47', country: 'NO', name: 'Norway' },
  { code: '+45', country: 'DK', name: 'Denmark' },
  { code: '+48', country: 'PL', name: 'Poland' },
  { code: '+420', country: 'CZ', name: 'Czech Republic' },
  { code: '+351', country: 'PT', name: 'Portugal' },
  { code: '+353', country: 'IE', name: 'Ireland' },

  { code: '+91', country: 'IN', name: 'India' },
  { code: '+92', country: 'PK', name: 'Pakistan' },
  { code: '+93', country: 'AF', name: 'Afghanistan' },
  { code: '+94', country: 'LK', name: 'Sri Lanka' },
  { code: '+880', country: 'BD', name: 'Bangladesh' },
  { code: '+977', country: 'NP', name: 'Nepal' },

  { code: '+86', country: 'CN', name: 'China' },
  { code: '+81', country: 'JP', name: 'Japan' },
  { code: '+82', country: 'KR', name: 'South Korea' },
  { code: '+84', country: 'VN', name: 'Vietnam' },
  { code: '+66', country: 'TH', name: 'Thailand' },
  { code: '+65', country: 'SG', name: 'Singapore' },
  { code: '+60', country: 'MY', name: 'Malaysia' },
  { code: '+62', country: 'ID', name: 'Indonesia' },
  { code: '+63', country: 'PH', name: 'Philippines' },

  { code: '+971', country: 'AE', name: 'United Arab Emirates' },
  { code: '+966', country: 'SA', name: 'Saudi Arabia' },
  { code: '+974', country: 'QA', name: 'Qatar' },
  { code: '+965', country: 'KW', name: 'Kuwait' },
  { code: '+968', country: 'OM', name: 'Oman' },
  { code: '+973', country: 'BH', name: 'Bahrain' },
  { code: '+972', country: 'IL', name: 'Israel' },
  { code: '+962', country: 'JO', name: 'Jordan' },
  { code: '+961', country: 'LB', name: 'Lebanon' },

  { code: '+61', country: 'AU', name: 'Australia' },
  { code: '+64', country: 'NZ', name: 'New Zealand' },

  { code: '+55', country: 'BR', name: 'Brazil' },
  { code: '+54', country: 'AR', name: 'Argentina' },
  { code: '+56', country: 'CL', name: 'Chile' },
  { code: '+57', country: 'CO', name: 'Colombia' },
  { code: '+58', country: 'VE', name: 'Venezuela' },
  { code: '+51', country: 'PE', name: 'Peru' },

  { code: '+27', country: 'ZA', name: 'South Africa' },
  { code: '+20', country: 'EG', name: 'Egypt' },
  { code: '+234', country: 'NG', name: 'Nigeria' },
  { code: '+254', country: 'KE', name: 'Kenya' },
  { code: '+251', country: 'ET', name: 'Ethiopia' },
  { code: '+212', country: 'MA', name: 'Morocco' },
  { code: '+216', country: 'TN', name: 'Tunisia' },
  { code: '+213', country: 'DZ', name: 'Algeria' }
]
export default function SignupPage() {
  const router = useRouter()
  const { signup, login } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    countryCode: '+91',
    role: 'User' 
  })
 
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [isLoading, setIsLoading] = useState(false)

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
  }

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim())
      newErrors.name = 'Name is required'

    if (!formData.email.trim())
      newErrors.email = 'Email is required'
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email))
      newErrors.email = 'Invalid email address'

    if (!formData.phone.trim())
      newErrors.phone = 'Phone is required'

    if (!formData.password)
      newErrors.password = 'Password is required'
    else if (formData.password.length < 6)
      newErrors.password = 'Minimum 6 characters required'

    if (!formData.confirmPassword)
      newErrors.confirmPassword = 'Please confirm your password'
    else if (formData.password !== formData.confirmPassword)
      newErrors.confirmPassword = 'Passwords do not match'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }
const searchParams = useSearchParams();

const handleAutoLogin = async () => {
  try {
    const loginResult = await login(
      formData.email,
       formData.password,
      true,
    );

    console.log("Auto login result:", loginResult);


    if (!loginResult.success) {
      setErrors({
        general: loginResult.message ?? "Login failed after signup",
      });
      return false;
    }


    const user =
      loginResult.user ||
      JSON.parse(localStorage.getItem("user") || "{}");


    console.log("Auto login user:", user);

    return true;

  } catch (error) {

    console.error("Auto login error:", error);

    setErrors({
      general: "Login failed after signup",
    });

    return false;
  }
};
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();

  if (!validateForm()) return;

  setIsLoading(true);
  setErrors({});

  try {

    // 1. Create account
    const signupResult = await signup({
      name: formData.name,
      email: formData.email,
      phone: `${formData.countryCode}${formData.phone}`,
      password: formData.password,
      role: "User",
    });


    if (!signupResult.success) {
      setErrors({
        general: signupResult.message ?? "Signup failed",
      });
      return;
    }


    // 2. Auto login
    const loggedIn = await handleAutoLogin();

    // 3. Redirect
    const params = new URLSearchParams(window.location.search);
    const redirect = params.get("redirect");
    if (redirect) {
      window.location.href = redirect;
    } else {
      window.location.href = "/users/dashboard";
    }


    router.refresh();


  } catch (error) {

    console.error("Signup error:", error);

    setErrors({
      general: "Something went wrong. Please try again.",
    });

  } finally {

    setIsLoading(false);

  }
};
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-sm border p-6">

        <div className="mb-6">
          <button
            onClick={() => router.back()}
            className="flex items-center text-gray-600 mb-4"
          >
            <ArrowLeft className="w-5 h-5 mr-1" />
            Back
          </button>

          <h1 className="text-2xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-600">Join our platform</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">

          {errors.general && (
            <div className="p-3 bg-red-50 border border-red-200 rounded">
              <p className="text-red-600 text-sm">{errors.general}</p>
            </div>
          )}

          {/* Name */}
          <div>
            <Label>Full Name</Label>
            <Input
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
            />
            {errors.name && <p className="text-red-600 text-sm">{errors.name}</p>}
          </div>

          {/* Email */}
          <div>
            <Label>Email</Label>
            <Input
              type="email"
              value={formData.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
            />
            {errors.email && <p className="text-red-600 text-sm">{errors.email}</p>}
          </div>

          {/* Phone */}
          <div>
            <Label>Phone</Label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                className="px-3 border rounded"
              >
                {formData.countryCode}
              </button>

              {showCountryDropdown && (
                <div className="absolute bg-white border rounded shadow mt-10 z-10">
                  {COUNTRY_CODES.map((c, i) => (
                    <button
                      key={i}
                      type="button"
                      className="block px-4 py-2 text-left w-full hover:bg-gray-100"
                      onClick={() => {
                        setFormData(prev => ({ ...prev, countryCode: c.code }))
                        setShowCountryDropdown(false)
                      }}
                    >
                      {c.country} {c.code}
                    </button>
                  ))}
                </div>
              )}

              <Input
                value={formData.phone}
                onChange={(e) =>
                  handleInputChange('phone', e.target.value.replace(/\D/g, ''))
                }
              />
            </div>
            {errors.phone && <p className="text-red-600 text-sm">{errors.phone}</p>}
          </div>

          {/* Password */}
          <div>
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

          {/* Confirm Password */}
          <div>
            <Label>Confirm Password</Label>
            <div className="relative">
              <Input
                type={showConfirmPassword ? 'text' : 'password'}
                value={formData.confirmPassword}
                onChange={(e) => handleInputChange('confirmPassword', e.target.value)}
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-2"
              >
                {showConfirmPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-red-600 text-sm">{errors.confirmPassword}</p>
            )}
          </div>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full bg-red-600 hover:bg-red-700 text-white"
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        <div className="text-center mt-6 border-t pt-6">
          <p className="text-sm">
            Already have an account?{' '}
            <Link href="/login" className="text-red-600">
              Log In
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
