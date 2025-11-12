"use client"

import React, { useState } from 'react'
import { X, Check, MessageCircle, ChevronDown } from 'lucide-react'

// Country codes data
const COUNTRY_CODES = [
  { code: '+1', country: 'US', name: 'United States' },
  { code: '+1', country: 'CA', name: 'Canada' },
  { code: '+7', country: 'RU', name: 'Russia' },
  { code: '+20', country: 'EG', name: 'Egypt' },
  { code: '+27', country: 'ZA', name: 'South Africa' },
  { code: '+30', country: 'GR', name: 'Greece' },
  { code: '+31', country: 'NL', name: 'Netherlands' },
  { code: '+32', country: 'BE', name: 'Belgium' },
  { code: '+33', country: 'FR', name: 'France' },
  { code: '+34', country: 'ES', name: 'Spain' },
  { code: '+36', country: 'HU', name: 'Hungary' },
  { code: '+39', country: 'IT', name: 'Italy' },
  { code: '+40', country: 'RO', name: 'Romania' },
  { code: '+41', country: 'CH', name: 'Switzerland' },
  { code: '+43', country: 'AT', name: 'Austria' },
  { code: '+44', country: 'GB', name: 'United Kingdom' },
  { code: '+45', country: 'DK', name: 'Denmark' },
  { code: '+46', country: 'SE', name: 'Sweden' },
  { code: '+47', country: 'NO', name: 'Norway' },
  { code: '+48', country: 'PL', name: 'Poland' },
  { code: '+49', country: 'DE', name: 'Germany' },
  { code: '+51', country: 'PE', name: 'Peru' },
  { code: '+52', country: 'MX', name: 'Mexico' },
  { code: '+53', country: 'CU', name: 'Cuba' },
  { code: '+54', country: 'AR', name: 'Argentina' },
  { code: '+55', country: 'BR', name: 'Brazil' },
  { code: '+56', country: 'CL', name: 'Chile' },
  { code: '+57', country: 'CO', name: 'Colombia' },
  { code: '+58', country: 'VE', name: 'Venezuela' },
  { code: '+60', country: 'MY', name: 'Malaysia' },
  { code: '+61', country: 'AU', name: 'Australia' },
  { code: '+62', country: 'ID', name: 'Indonesia' },
  { code: '+63', country: 'PH', name: 'Philippines' },
  { code: '+64', country: 'NZ', name: 'New Zealand' },
  { code: '+65', country: 'SG', name: 'Singapore' },
  { code: '+66', country: 'TH', name: 'Thailand' },
  { code: '+81', country: 'JP', name: 'Japan' },
  { code: '+82', country: 'KR', name: 'South Korea' },
  { code: '+84', country: 'VN', name: 'Vietnam' },
  { code: '+86', country: 'CN', name: 'China' },
  { code: '+90', country: 'TR', name: 'Turkey' },
  { code: '+91', country: 'IN', name: 'India' },
  { code: '+92', country: 'PK', name: 'Pakistan' },
  { code: '+93', country: 'AF', name: 'Afghanistan' },
  { code: '+94', country: 'LK', name: 'Sri Lanka' },
  { code: '+95', country: 'MM', name: 'Myanmar' },
  { code: '+98', country: 'IR', name: 'Iran' },
  { code: '+212', country: 'MA', name: 'Morocco' },
  { code: '+213', country: 'DZ', name: 'Algeria' },
  { code: '+216', country: 'TN', name: 'Tunisia' },
  { code: '+218', country: 'LY', name: 'Libya' },
  { code: '+220', country: 'GM', name: 'Gambia' },
  { code: '+221', country: 'SN', name: 'Senegal' },
  { code: '+222', country: 'MR', name: 'Mauritania' },
  { code: '+223', country: 'ML', name: 'Mali' },
  { code: '+224', country: 'GN', name: 'Guinea' },
  { code: '+225', country: 'CI', name: 'Ivory Coast' },
  { code: '+226', country: 'BF', name: 'Burkina Faso' },
  { code: '+227', country: 'NE', name: 'Niger' },
  { code: '+228', country: 'TG', name: 'Togo' },
  { code: '+229', country: 'BJ', name: 'Benin' },
  { code: '+230', country: 'MU', name: 'Mauritius' },
  { code: '+231', country: 'LR', name: 'Liberia' },
  { code: '+232', country: 'SL', name: 'Sierra Leone' },
  { code: '+233', country: 'GH', name: 'Ghana' },
  { code: '+234', country: 'NG', name: 'Nigeria' },
  { code: '+235', country: 'TD', name: 'Chad' },
  { code: '+236', country: 'CF', name: 'Central African Republic' },
  { code: '+237', country: 'CM', name: 'Cameroon' },
  { code: '+238', country: 'CV', name: 'Cape Verde' },
  { code: '+239', country: 'ST', name: 'São Tomé and Príncipe' },
  { code: '+240', country: 'GQ', name: 'Equatorial Guinea' },
  { code: '+241', country: 'GA', name: 'Gabon' },
  { code: '+242', country: 'CG', name: 'Republic of the Congo' },
  { code: '+243', country: 'CD', name: 'Democratic Republic of the Congo' },
  { code: '+244', country: 'AO', name: 'Angola' },
  { code: '+245', country: 'GW', name: 'Guinea-Bissau' },
  { code: '+246', country: 'IO', name: 'British Indian Ocean Territory' },
  { code: '+248', country: 'SC', name: 'Seychelles' },
  { code: '+249', country: 'SD', name: 'Sudan' },
  { code: '+250', country: 'RW', name: 'Rwanda' },
  { code: '+251', country: 'ET', name: 'Ethiopia' },
  { code: '+252', country: 'SO', name: 'Somalia' },
  { code: '+253', country: 'DJ', name: 'Djibouti' },
  { code: '+254', country: 'KE', name: 'Kenya' },
  { code: '+255', country: 'TZ', name: 'Tanzania' },
  { code: '+256', country: 'UG', name: 'Uganda' },
  { code: '+257', country: 'BI', name: 'Burundi' },
  { code: '+258', country: 'MZ', name: 'Mozambique' },
  { code: '+260', country: 'ZM', name: 'Zambia' },
  { code: '+261', country: 'MG', name: 'Madagascar' },
  { code: '+262', country: 'RE', name: 'Réunion' },
  { code: '+263', country: 'ZW', name: 'Zimbabwe' },
  { code: '+264', country: 'NA', name: 'Namibia' },
  { code: '+265', country: 'MW', name: 'Malawi' },
  { code: '+266', country: 'LS', name: 'Lesotho' },
  { code: '+267', country: 'BW', name: 'Botswana' },
  { code: '+268', country: 'SZ', name: 'Eswatini' },
  { code: '+269', country: 'KM', name: 'Comoros' },
  { code: '+290', country: 'SH', name: 'Saint Helena' },
  { code: '+291', country: 'ER', name: 'Eritrea' },
  { code: '+297', country: 'AW', name: 'Aruba' },
  { code: '+298', country: 'FO', name: 'Faroe Islands' },
  { code: '+299', country: 'GL', name: 'Greenland' },
  { code: '+350', country: 'GI', name: 'Gibraltar' },
  { code: '+351', country: 'PT', name: 'Portugal' },
  { code: '+352', country: 'LU', name: 'Luxembourg' },
  { code: '+353', country: 'IE', name: 'Ireland' },
  { code: '+354', country: 'IS', name: 'Iceland' },
  { code: '+355', country: 'AL', name: 'Albania' },
  { code: '+356', country: 'MT', name: 'Malta' },
  { code: '+357', country: 'CY', name: 'Cyprus' },
  { code: '+358', country: 'FI', name: 'Finland' },
  { code: '+359', country: 'BG', name: 'Bulgaria' },
  { code: '+370', country: 'LT', name: 'Lithuania' },
  { code: '+371', country: 'LV', name: 'Latvia' },
  { code: '+372', country: 'EE', name: 'Estonia' },
  { code: '+373', country: 'MD', name: 'Moldova' },
  { code: '+374', country: 'AM', name: 'Armenia' },
  { code: '+375', country: 'BY', name: 'Belarus' },
  { code: '+376', country: 'AD', name: 'Andorra' },
  { code: '+377', country: 'MC', name: 'Monaco' },
  { code: '+378', country: 'SM', name: 'San Marino' },
  { code: '+380', country: 'UA', name: 'Ukraine' },
  { code: '+381', country: 'RS', name: 'Serbia' },
  { code: '+382', country: 'ME', name: 'Montenegro' },
  { code: '+383', country: 'XK', name: 'Kosovo' },
  { code: '+385', country: 'HR', name: 'Croatia' },
  { code: '+386', country: 'SI', name: 'Slovenia' },
  { code: '+387', country: 'BA', name: 'Bosnia and Herzegovina' },
  { code: '+389', country: 'MK', name: 'North Macedonia' },
  { code: '+420', country: 'CZ', name: 'Czech Republic' },
  { code: '+421', country: 'SK', name: 'Slovakia' },
  { code: '+423', country: 'LI', name: 'Liechtenstein' },
  { code: '+500', country: 'FK', name: 'Falkland Islands' },
  { code: '+501', country: 'BZ', name: 'Belize' },
  { code: '+502', country: 'GT', name: 'Guatemala' },
  { code: '+503', country: 'SV', name: 'El Salvador' },
  { code: '+504', country: 'HN', name: 'Honduras' },
  { code: '+505', country: 'NI', name: 'Nicaragua' },
  { code: '+506', country: 'CR', name: 'Costa Rica' },
  { code: '+507', country: 'PA', name: 'Panama' },
  { code: '+508', country: 'PM', name: 'Saint Pierre and Miquelon' },
  { code: '+509', country: 'HT', name: 'Haiti' },
  { code: '+590', country: 'GP', name: 'Guadeloupe' },
  { code: '+591', country: 'BO', name: 'Bolivia' },
  { code: '+592', country: 'GY', name: 'Guyana' },
  { code: '+593', country: 'EC', name: 'Ecuador' },
  { code: '+594', country: 'GF', name: 'French Guiana' },
  { code: '+595', country: 'PY', name: 'Paraguay' },
  { code: '+596', country: 'MQ', name: 'Martinique' },
  { code: '+597', country: 'SR', name: 'Suriname' },
  { code: '+598', country: 'UY', name: 'Uruguay' },
  { code: '+599', country: 'CW', name: 'Curaçao' },
  { code: '+670', country: 'TL', name: 'East Timor' },
  { code: '+672', country: 'NF', name: 'Norfolk Island' },
  { code: '+673', country: 'BN', name: 'Brunei' },
  { code: '+674', country: 'NR', name: 'Nauru' },
  { code: '+675', country: 'PG', name: 'Papua New Guinea' },
  { code: '+676', country: 'TO', name: 'Tonga' },
  { code: '+677', country: 'SB', name: 'Solomon Islands' },
  { code: '+678', country: 'VU', name: 'Vanuatu' },
  { code: '+679', country: 'FJ', name: 'Fiji' },
  { code: '+680', country: 'PW', name: 'Palau' },
  { code: '+681', country: 'WF', name: 'Wallis and Futuna' },
  { code: '+682', country: 'CK', name: 'Cook Islands' },
  { code: '+683', country: 'NU', name: 'Niue' },
  { code: '+684', country: 'AS', name: 'American Samoa' },
  { code: '+685', country: 'WS', name: 'Samoa' },
  { code: '+686', country: 'KI', name: 'Kiribati' },
  { code: '+687', country: 'NC', name: 'New Caledonia' },
  { code: '+688', country: 'TV', name: 'Tuvalu' },
  { code: '+689', country: 'PF', name: 'French Polynesia' },
  { code: '+690', country: 'TK', name: 'Tokelau' },
  { code: '+691', country: 'FM', name: 'Federated States of Micronesia' },
  { code: '+692', country: 'MH', name: 'Marshall Islands' },
  { code: '+850', country: 'KP', name: 'North Korea' },
  { code: '+852', country: 'HK', name: 'Hong Kong' },
  { code: '+853', country: 'MO', name: 'Macau' },
  { code: '+855', country: 'KH', name: 'Cambodia' },
  { code: '+856', country: 'LA', name: 'Laos' },
  { code: '+880', country: 'BD', name: 'Bangladesh' },
  { code: '+886', country: 'TW', name: 'Taiwan' },
  { code: '+960', country: 'MV', name: 'Maldives' },
  { code: '+961', country: 'LB', name: 'Lebanon' },
  { code: '+962', country: 'JO', name: 'Jordan' },
  { code: '+963', country: 'SY', name: 'Syria' },
  { code: '+964', country: 'IQ', name: 'Iraq' },
  { code: '+965', country: 'KW', name: 'Kuwait' },
  { code: '+966', country: 'SA', name: 'Saudi Arabia' },
  { code: '+967', country: 'YE', name: 'Yemen' },
  { code: '+968', country: 'OM', name: 'Oman' },
  { code: '+970', country: 'PS', name: 'Palestine' },
  { code: '+971', country: 'AE', name: 'United Arab Emirates' },
  { code: '+972', country: 'IL', name: 'Israel' },
  { code: '+973', country: 'BH', name: 'Bahrain' },
  { code: '+974', country: 'QA', name: 'Qatar' },
  { code: '+975', country: 'BT', name: 'Bhutan' },
  { code: '+976', country: 'MN', name: 'Mongolia' },
  { code: '+977', country: 'NP', name: 'Nepal' },
  { code: '+992', country: 'TJ', name: 'Tajikistan' },
  { code: '+993', country: 'TM', name: 'Turkmenistan' },
  { code: '+994', country: 'AZ', name: 'Azerbaijan' },
  { code: '+995', country: 'GE', name: 'Georgia' },
  { code: '+996', country: 'KG', name: 'Kyrgyzstan' },
  { code: '+998', country: 'UZ', name: 'Uzbekistan' },
]

interface Props {
  isOpen: boolean
  onClose: () => void
  ownerContact?: string
  propertyId?: string | number
}

interface FormData {
  name: string
  email: string
  whatsapp: string
  countryCode: string
  agreeToTerms: boolean
}

export const ContactOwnerDialog: React.FC<Props> = ({ isOpen, onClose, ownerContact, propertyId }) => {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    email: '',
    whatsapp: '',
    countryCode: '+91',
    agreeToTerms: false
  })
  const [errors, setErrors] = useState<Partial<FormData>>({})
  const [showContact, setShowContact] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [showCountryDropdown, setShowCountryDropdown] = useState(false)

  const validatePhone = (phone: string, countryCode: string) => {
    // Basic phone number validation - should be at least 6 digits and max 15 digits
    const phoneRegex = /^\d{6,15}$/
    return phoneRegex.test(phone)
  }

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    return emailRegex.test(email)
  }

  const handleInputChange = (field: keyof FormData, value: string | boolean) => {
    setFormData(prev => ({ ...prev, [field]: value }))
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }))
    }
  }

  const handleContinue = async () => {
    const newErrors: Partial<FormData> = {}

    // Validate name
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required'
    }

    // Validate email
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required'
    } else if (!validateEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email'
    }

    // Validate WhatsApp number
    if (!formData.whatsapp.trim()) {
      newErrors.whatsapp = 'WhatsApp number is required'
    } else if (!validatePhone(formData.whatsapp, formData.countryCode)) {
      newErrors.whatsapp = 'Enter a valid phone number'
    }

    // Validate terms agreement
    if (!formData.agreeToTerms) {
      // Don't set error in newErrors, just prevent submission
      // The visual feedback will be through the checkbox state
    }

    if (Object.keys(newErrors).length > 0 || !formData.agreeToTerms) {
      setErrors(newErrors)
      return
    }

    setIsLoading(true)

    try {
      // Since we're using hardcoded values and don't have actual backend,
      // just log the lead data and proceed to show contact details
      console.log('Lead data collected:', {
        propertyId,
        name: formData.name,
        email: formData.email,
        whatsapp: `${formData.countryCode}${formData.whatsapp}`,
        type: 'contact_request',
        timestamp: new Date().toISOString()
      })

      // Simulate API call delay for better UX
      await new Promise(resolve => setTimeout(resolve, 1000))

      // Always show contact details since we're using hardcoded values
      setShowContact(true)

    } catch (error) {
      console.error('Error:', error)
      // Still show contact for demo purposes
      setShowContact(true)
    } finally {
      setIsLoading(false)
    }
  }

  const handleClose = () => {
    setFormData({ name: '', email: '', whatsapp: '', countryCode: '+91', agreeToTerms: false })
    setErrors({})
    setShowContact(false)
    setShowCountryDropdown(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <>
      {/* Backdrop to close dropdown */}
      {showCountryDropdown && (
        <div 
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            zIndex: 999
          }}
          onClick={() => setShowCountryDropdown(false)}
        />
      )}
      
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16
      }}>
        <div style={{
          backgroundColor: 'white',
          borderRadius: 12,
          maxWidth: 400,
          width: '100%',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative'
        }}>
        {/* Close button */}
        <button
          onClick={handleClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: '#666',
            zIndex: 1
          }}
        >
          <X size={24} />
        </button>

        {showContact ? (
          // Contact details view
          <div style={{ padding: 24, textAlign: 'center' }}>
            <div style={{
              backgroundColor: '#f0f9ff',
              borderRadius: 50,
              width: 80,
              height: 80,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 20px'
            }}>
              <Check size={40} color="#0369a1" />
            </div>
            
            <h3 style={{
              fontSize: 20,
              fontWeight: 600,
              marginBottom: 8,
              color: '#1f2937'
            }}>
              Contact Details
            </h3>
            
            <p style={{
              color: '#6b7280',
              marginBottom: 24,
              fontSize: 14
            }}>
              Here are the owner's contact details:
            </p>

            <div style={{
              backgroundColor: '#f9fafb',
              padding: 16,
              borderRadius: 8,
              marginBottom: 24
            }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
                marginBottom: 8
              }}>
                <MessageCircle size={20} color="#059669" />
                <span style={{ fontWeight: 600 }}>Owner Contact</span>
              </div>
              <p style={{
                fontSize: 18,
                fontWeight: 700,
                color: '#1f2937'
              }}>
                {ownerContact || '+91 98765 43210'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <button
                onClick={() => {
                  const phone = ownerContact || '+91 98765 43210'
                  window.open(`tel:${phone}`, '_blank')
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#059669',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                Call Now
              </button>
              <button
                onClick={() => {
                  const phone = (ownerContact || '+91 98765 43210').replace(/[^\d]/g, '')
                  window.open(`https://wa.me/${phone}`, '_blank')
                }}
                style={{
                  flex: 1,
                  backgroundColor: '#25d366',
                  color: 'white',
                  border: 'none',
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontWeight: 600,
                  cursor: 'pointer'
                }}
              >
                WhatsApp
              </button>
            </div>
          </div>
        ) : (
          // Contact form view
          <div style={{ padding: 24 }}>
            {/* Header with WhatsApp icon */}
            <div style={{
              backgroundColor: '#f0f9ff',
              borderRadius: 12,
              padding: 16,
              marginBottom: 24,
              display: 'flex',
              alignItems: 'center',
              gap: 12
            }}>
              <div style={{
                backgroundColor: '#25d366',
                borderRadius: '50%',
                padding: 8,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                <MessageCircle size={24} color="white" />
              </div>
              <div>
                <h3 style={{
                  fontSize: 18,
                  fontWeight: 600,
                  marginBottom: 4,
                  color: '#1f2937'
                }}>
                  Enter your WhatsApp No. to get Contact Details of the Owner
                </h3>
              </div>
            </div>

            {/* Form fields */}
            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 8,
                color: '#6b7280'
              }}>
                Your Name
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 12px',
                    border: errors.name ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="Bobby"
                />
                {!errors.name && formData.name && (
                  <Check 
                    size={20} 
                    color="#10b981" 
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                )}
              </div>
              {errors.name && (
                <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                  {errors.name}
                </p>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 8,
                color: '#6b7280'
              }}>
                Email
              </label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  style={{
                    width: '100%',
                    padding: '12px 40px 12px 12px',
                    border: errors.email ? '2px solid #ef4444' : '1px solid #d1d5db',
                    borderRadius: 8,
                    fontSize: 16,
                    outline: 'none',
                    boxSizing: 'border-box'
                  }}
                  placeholder="bobby@gmail.com"
                />
                {!errors.email && formData.email && validateEmail(formData.email) && (
                  <Check 
                    size={20} 
                    color="#10b981" 
                    style={{
                      position: 'absolute',
                      right: 12,
                      top: '50%',
                      transform: 'translateY(-50%)'
                    }}
                  />
                )}
              </div>
              {errors.email && (
                <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                  {errors.email}
                </p>
              )}
            </div>

            <div style={{ marginBottom: 20 }}>
              <label style={{
                display: 'block',
                fontSize: 14,
                fontWeight: 500,
                marginBottom: 8,
                color: '#6b7280'
              }}>
                Your WhatsApp Number
              </label>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ position: 'relative' }}>
                  <button
                    type="button"
                    onClick={() => setShowCountryDropdown(!showCountryDropdown)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                      padding: '12px',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      outline: 'none',
                      backgroundColor: 'white',
                      cursor: 'pointer',
                      minWidth: 120
                    }}
                  >
                    <span>{COUNTRY_CODES.find(c => c.code === formData.countryCode)?.country || 'IN'} {formData.countryCode}</span>
                    <ChevronDown size={16} />
                  </button>
                  
                  {showCountryDropdown && (
                    <div style={{
                      position: 'absolute',
                      top: '100%',
                      left: 0,
                      right: 0,
                      backgroundColor: 'white',
                      border: '1px solid #d1d5db',
                      borderRadius: 8,
                      boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
                      zIndex: 1000,
                      maxHeight: 200,
                      overflowY: 'auto'
                    }}>
                      {COUNTRY_CODES.map((country, index) => (
                        <button
                          key={`${country.code}-${country.country}-${index}`}
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, countryCode: country.code }))
                            setShowCountryDropdown(false)
                          }}
                          style={{
                            width: '100%',
                            padding: '8px 12px',
                            textAlign: 'left',
                            border: 'none',
                            backgroundColor: formData.countryCode === country.code ? '#f3f4f6' : 'white',
                            cursor: 'pointer',
                            fontSize: 14,
                            borderBottom: index === COUNTRY_CODES.length - 1 ? 'none' : '1px solid #f3f4f6'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.backgroundColor = '#f3f4f6'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.backgroundColor = formData.countryCode === country.code ? '#f3f4f6' : 'white'
                          }}
                        >
                          {country.country} {country.code}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
                
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="tel"
                    value={formData.whatsapp}
                    onChange={(e) => {
                      const value = e.target.value.replace(/\D/g, '')
                      handleInputChange('whatsapp', value)
                    }}
                    style={{
                      width: '100%',
                      padding: '12px 40px 12px 12px',
                      border: errors.whatsapp ? '2px solid #ef4444' : '1px solid #d1d5db',
                      borderRadius: 8,
                      fontSize: 16,
                      outline: 'none',
                      boxSizing: 'border-box'
                    }}
                    placeholder="1234567890"
                  />
                  {!errors.whatsapp && formData.whatsapp && validatePhone(formData.whatsapp, formData.countryCode) && (
                    <Check 
                      size={20} 
                      color="#10b981" 
                      style={{
                        position: 'absolute',
                        right: 12,
                        top: '50%',
                        transform: 'translateY(-50%)'
                      }}
                    />
                  )}
                </div>
              </div>
              {errors.whatsapp && (
                <p style={{ color: '#ef4444', fontSize: 12, marginTop: 4 }}>
                  {errors.whatsapp}
                </p>
              )}
            </div>

            {/* Terms */}
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              marginBottom: 24,
              fontSize: 12,
              color: '#6b7280'
            }}>
              <input
                type="checkbox"
                id="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={(e) => handleInputChange('agreeToTerms', e.target.checked)}
                style={{
                  width: 16,
                  height: 16,
                  cursor: 'pointer'
                }}
              />
              <label 
                htmlFor="agreeToTerms" 
                style={{ 
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 4
                }}
              >
                <span>I Agree to</span>
                <button 
                  type="button"
                  style={{
                    background: 'none',
                    border: 'none',
                    color: '#3b82f6',
                    textDecoration: 'underline',
                    cursor: 'pointer',
                    fontSize: 12,
                    padding: 0
                  }}
                >
                  Terms of Use
                </button>
              </label>
            </div>

            {/* Continue button */}
            <button
              onClick={handleContinue}
              disabled={isLoading || !formData.agreeToTerms}
              style={{
                width: '100%',
                backgroundColor: (!formData.agreeToTerms || isLoading) ? '#9ca3af' : '#dc2626',
                color: 'white',
                border: 'none',
                borderRadius: 24,
                padding: '16px',
                fontSize: 16,
                fontWeight: 600,
                cursor: (isLoading || !formData.agreeToTerms) ? 'not-allowed' : 'pointer',
                opacity: (isLoading || !formData.agreeToTerms) ? 0.7 : 1,
                transition: 'background-color 0.2s, opacity 0.2s'
              }}
            >
              {isLoading ? 'Please wait...' : 'Continue'}
            </button>
          </div>
        )}
        </div>
      </div>
    </>
  )
}

export default ContactOwnerDialog