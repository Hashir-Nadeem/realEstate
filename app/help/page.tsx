"use client"

import React, { useState } from 'react'
import { ChevronDown, ChevronUp, Home, ClipboardCheck, CreditCard, Key, FileText, SearchCheck, Upload, DollarSign } from 'lucide-react'

type TabType = 'sell' | 'buy' | 'rent'

interface FAQ {
  id: string
  question: string
  answer: string
  isOpen: boolean
}

interface TimelineStep {
  id: string
  title: string
  description: string
  icon: React.ReactNode
  color: string
}

export default function HelpPage() {
  const [selectedTab, setSelectedTab] = useState<TabType>('buy')
  const [faqs, setFaqs] = useState<FAQ[]>([])

  // Timeline steps based on the selected tab
  const getTimelineSteps = (tab: TabType): TimelineStep[] => {
    switch (tab) {
      case 'buy':
        return [
          {
            id: '1',
            title: 'Finalize a property',
            description: 'Find the property you want to buy & negotiate on the final price',
            icon: <Home className="w-6 h-6" />,
            color: '#10B981'
          },
          {
            id: '2',
            title: 'Documents verification',
            description: 'Let experts verify the documents before you close the deal',
            icon: <ClipboardCheck className="w-6 h-6" />,
            color: '#F59E0B'
          },
          {
            id: '3',
            title: 'Apply for a Home Loan',
            description: 'After the verification of documents, apply for a home loan',
            icon: <CreditCard className="w-6 h-6" />,
            color: '#3B82F6'
          },
          {
            id: '4',
            title: 'Move in',
            description: 'Take complete possession of the property',
            icon: <Key className="w-6 h-6" />,
            color: '#8B5CF6'
          }
        ]
      case 'sell':
        return [
          {
            id: '1',
            title: 'Finalize a property',
            description: 'Find the property you want to sell. We collect your location information.',
            icon: <Home className="w-6 h-6" />,
            color: '#10B981'
          },
          {
            id: '2',
            title: 'Click Post Property Free button',
            description: 'Click the post property button to start listing your property',
            icon: <Upload className="w-6 h-6" />,
            color: '#F59E0B'
          },
          {
            id: '3',
            title: 'Enter details of property',
            description: 'Fill in all the necessary details about your property',
            icon: <FileText className="w-6 h-6" />,
            color: '#3B82F6'
          },
          {
            id: '4',
            title: 'Upload photos, you can upload later',
            description: 'Add high-quality photos of your property to attract buyers',
            icon: <Upload className="w-6 h-6" />,
            color: '#8B5CF6'
          },
          {
            id: '5',
            title: 'Submit property Ad',
            description: 'Submit your property listing and start receiving inquiries',
            icon: <SearchCheck className="w-6 h-6" />,
            color: '#EF4444'
          }
        ]
      case 'rent':
        return [
          {
            id: '1',
            title: 'Finalize a property',
            description: 'Find the property you want to rent. We collect your location information.',
            icon: <Home className="w-6 h-6" />,
            color: '#10B981'
          },
          {
            id: '2',
            title: 'Click Post Property Free button',
            description: 'Click the post property button to start listing your rental property',
            icon: <Upload className="w-6 h-6" />,
            color: '#F59E0B'
          },
          {
            id: '3',
            title: 'Enter details of property',
            description: 'Fill in all the necessary details about your rental property',
            icon: <FileText className="w-6 h-6" />,
            color: '#3B82F6'
          },
          {
            id: '4',
            title: 'Upload photos, you can upload later',
            description: 'Add high-quality photos of your property to attract tenants',
            icon: <Upload className="w-6 h-6" />,
            color: '#8B5CF6'
          },
          {
            id: '5',
            title: 'Submit property Ad',
            description: 'Submit your rental listing and start receiving tenant inquiries',
            icon: <SearchCheck className="w-6 h-6" />,
            color: '#EF4444'
          }
        ]
      default:
        return []
    }
  }

  // FAQ data based on the selected tab
  const getFAQs = (tab: TabType): FAQ[] => {
    switch (tab) {
      case 'sell':
        return [
          {
            id: '1',
            question: 'Is it Free?',
            answer: 'Yes, posting your property ad on our platform is completely free. You can list your property without any charges.',
            isOpen: false
          },
          {
            id: '2',
            question: 'How post a sell property Ad on lakshmiland.com?',
            answer: '1. Walk to the center of the property you want to sell. We collect your location information.\n2. Click Post Property Free button [image]\n3. Enter details of property\n4. Upload photos, you can upload later\n5. Submit property Ad',
            isOpen: false
          },
          {
            id: '3',
            question: 'Why do I need to walk to the center of property?',
            answer: 'Walking to the center of the property helps us accurately capture the location coordinates, which ensures your property appears in the correct location on our map for potential buyers.',
            isOpen: false
          },
          {
            id: '4',
            question: 'Can I edit my Ad?',
            answer: 'Yes, you can edit your property ad anytime after posting. Simply go to your dashboard and make the necessary changes.',
            isOpen: false
          }
        ]
      case 'buy':
        return [
          {
            id: '1',
            question: 'Is it Free?',
            answer: 'Yes, browsing and searching for properties is completely free. You only pay when you decide to purchase a property.',
            isOpen: false
          },
          {
            id: '2',
            question: 'How to buy a property on lakshmiland.com?',
            answer: '1. Walk to the center of the property you want to buy. We collect your location information.\n2. Click Post Property Free button [image]\n3. Enter details of property\n4. Upload photos, you can upload later\n5. Submit property Ad',
            isOpen: false
          },
          {
            id: '3',
            question: 'Why do I need to walk to the center of property?',
            answer: 'This helps us show you properties in your preferred location and provides accurate distance measurements from your current location.',
            isOpen: false
          },
          {
            id: '4',
            question: 'Can I edit my search preferences?',
            answer: 'Yes, you can modify your search criteria anytime to find properties that better match your requirements.',
            isOpen: false
          }
        ]
      case 'rent':
        return [
          {
            id: '1',
            question: 'Is it Free?',
            answer: 'Yes, posting your rental property ad is completely free. Start earning rental income without any listing fees.',
            isOpen: false
          },
          {
            id: '2',
            question: 'How post a rental property Ad on lakshmiland.com?',
            answer: '1. Walk to the center of the property you want to rent. We collect your location information.\n2. Click Post Property Free button [image]\n3. Enter details of property\n4. Upload photos, you can upload later\n5. Submit property Ad',
            isOpen: false
          },
          {
            id: '3',
            question: 'Why do I need to walk to the center of property?',
            answer: 'Accurate location helps tenants find your property easily and ensures it appears in relevant search results for the area.',
            isOpen: false
          },
          {
            id: '4',
            question: 'Can I edit my rental Ad?',
            answer: 'Yes, you can edit your rental listing anytime, including updating rent amount, availability dates, and property details.',
            isOpen: false
          }
        ]
      default:
        return []
    }
  }

  // Initialize FAQs when tab changes
  React.useEffect(() => {
    setFaqs(getFAQs(selectedTab))
  }, [selectedTab])

  const toggleFAQ = (id: string) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === id ? { ...faq, isOpen: !faq.isOpen } : faq
    ))
  }

  const timelineSteps = getTimelineSteps(selectedTab)

  // Determine which markers are central. If even number of steps, highlight the two central markers.
  // If odd, highlight the middle three markers.
  const isCentralMarker = (index: number, total: number) => {
    if (total <= 0) return false
    if (total % 2 === 0) {
      return index === total / 2 - 1 || index === total / 2
    }
    const center = Math.floor(total / 2)
    return Math.abs(index - center) <= 1
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          <h1 className="text-xl md:text-2xl font-bold text-gray-900 text-center mb-2">Help & Support</h1>
          <p className="text-sm md:text-base text-gray-600 text-center">Find answers to your questions about buying, selling, and renting properties</p>
        </div>
      </div>

  <div className="max-w-6xl mx-auto px-4 pt-8 pb-28">
        {/* "It is FREE" Banner - Clean design with lines above and below */}
        <div className="text-center mb-8 md:mb-12">
          <div className="max-w-4xl mx-auto">
            {/* Horizontal line above */}
            <div className="w-full h-0.5 bg-black mb-4 md:mb-6"></div>
            
            {/* FREE text */}
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold text-black tracking-wide mb-4 md:mb-6">
              It is FREE
            </h2>
            
            {/* Horizontal line below */}
            <div className="w-full h-0.5 bg-black"></div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="flex bg-white rounded-lg shadow-sm overflow-hidden w-full max-w-md">
            {(['sell', 'buy', 'rent'] as TabType[]).map((tab) => (
              <button
                key={tab}
                onClick={() => setSelectedTab(tab)}
                className={`flex-1 px-4 py-3 md:px-6 md:py-4 font-medium transition-all duration-200 text-sm md:text-base ${
                  selectedTab === tab
                    ? 'bg-red-500 text-white border-2 border-red-500'
                    : 'bg-white text-gray-700 border-2 border-gray-200 hover:bg-gray-50'
                } ${tab === 'sell' ? 'rounded-l-lg' : tab === 'rent' ? 'rounded-r-lg' : ''}`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Timeline Section */}
        <div className="bg-white rounded-lg shadow-sm p-4 md:p-8 mb-8">
          {/* Desktop Timeline - Horizontal */}
          <div className="hidden md:block">
            <div className="relative max-w-6xl mx-auto">
              {/* Top horizontal line */}
              <div className="absolute top-0 left-0 right-0 h-px bg-gray-300" />

              {/* Timeline Steps */}
              <div className="flex items-start justify-between pt-8">
                {timelineSteps.map((step, index) => (
                  <div key={step.id} className="flex-1 text-center relative" style={{ maxWidth: '280px' }}>
                    {/* Vertical connector and dot - all aligned to same position */}
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                      {/* Vertical dashed line from top line down */}
                      <div className="h-8 border-l-2 border-dashed border-gray-300" />
                      {/* Small dot - highlight central marker(s) */}
                      <div className={`w-3 h-3 rounded-full ${isCentralMarker(index, timelineSteps.length) ? 'bg-cyan-400' : 'bg-gray-500'}`} />
                    </div>
                  
                    {/* Large Image Placeholder */}
                    <div className="mt-6 mb-6 flex justify-center">
                      <div className="w-32 h-24 lg:w-40 lg:h-28 bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-gray-200">
                        <div className="w-12 h-12 lg:w-14 lg:h-14 bg-gray-300 rounded mb-2"></div>
                        <div className="text-gray-400 text-xs lg:text-sm">Image</div>
                      </div>
                    </div>
                    
                    {/* Step Content */}
                    <div className="px-2">
                      <h3 className="font-bold text-gray-900 mb-3 text-base lg:text-lg leading-tight">{step.title}</h3>
                      <p className="text-sm lg:text-base text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Mobile Timeline - Vertical */}
          <div className="block md:hidden">
            <div className="space-y-6 max-w-sm mx-auto">
              {timelineSteps.map((step, index) => (
                <div key={step.id} className="text-center relative">
                  {/* Solid Colored Circle */}
                  <div className="relative mb-4">
                    <div 
                      className="w-12 h-12 rounded-full mx-auto"
                      style={{ backgroundColor: step.color }}
                    />
                    {/* Single connector line to next step */}
                    {index < timelineSteps.length - 1 && (
                      <div 
                        className="absolute top-12 left-1/2 w-0.5 h-6 bg-gray-300 transform -translate-x-1/2"
                      />
                    )}
                  </div>
                  
                  {/* Image Placeholder - smaller for mobile */}
                  <div className="mb-4 flex justify-center">
                    <div className="w-24 h-18 bg-gray-100 rounded-lg flex flex-col items-center justify-center border border-gray-200">
                      <div className="w-8 h-8 bg-gray-300 rounded mb-1"></div>
                      <div className="text-gray-400 text-xs">Image</div>
                    </div>
                  </div>
                  
                  {/* Step Content */}
                  <div className="px-2">
                    <h3 className="font-bold text-gray-900 mb-2 text-base">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              {selectedTab === 'sell' && 'When sell selected'}
              {selectedTab === 'buy' && 'When Buy selected'}
              {selectedTab === 'rent' && 'When Rent selected'}
            </h2>
            <p className="text-xs md:text-sm text-red-500 mt-1">
              Create an image here same as buy section. Use images and text from post proper page bottom section.
            </p>
          </div>

          <div className="p-4 md:p-6">
            <div className="space-y-4">
              {faqs.map((faq) => (
                <div key={faq.id} className="border-b border-gray-200 pb-4">
                  <button
                    onClick={() => toggleFAQ(faq.id)}
                    className="flex justify-between items-center w-full text-left"
                  >
                    <h3 className="text-base md:text-lg font-medium text-gray-900 flex items-center pr-4">
                      {faq.question}
                      <span className="ml-2">
                        {faq.question === 'Is it Free?' && <ChevronDown className="w-4 h-4" />}
                      </span>
                    </h3>
                    <div className="flex-shrink-0">
                      {faq.isOpen ? (
                        <ChevronUp className="w-5 h-5 text-gray-500" />
                      ) : (
                        <ChevronDown className="w-5 h-5 text-gray-500" />
                      )}
                    </div>
                  </button>
                  {faq.isOpen && (
                    <div className="mt-3 text-gray-600 text-sm md:text-base">
                      {faq.answer.split('\n').map((line, index) => (
                        <p key={index} className={index > 0 ? 'mt-1' : ''}>
                          {line}
                        </p>
                      ))}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}