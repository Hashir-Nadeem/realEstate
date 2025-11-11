"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronUp, Home, Upload, FileText, SearchCheck } from 'lucide-react'

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

export default function HelpRentPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: '1',
      question: 'Is it Free?',
      answer: 'Yes, posting your rental property ad is completely free. Start earning rental income without any listing fees.',
      isOpen: false
    },
    {
      id: '2',
      question: 'How to post a rental property Ad?',
      answer: '1. Walk to the center of the property you want to rent. 2. Click Post Property Free button. 3. Enter details of property. 4. Upload photos. 5. Submit property Ad',
      isOpen: false
    },
    {
      id: '3',
      question: 'Can I edit my rental Ad?',
      answer: 'Yes, you can edit your rental listing anytime, including updating rent amount, availability dates, and property details.',
      isOpen: false
    }
  ])

  const timelineSteps: TimelineStep[] = [
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

  const toggleFAQ = (id: string) => {
    setFaqs(prev => prev.map(faq => 
      faq.id === id ? { ...faq, isOpen: !faq.isOpen } : faq
    ))
  }

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
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 py-4 md:py-6">
          <div className="flex items-center mb-2">
            <Link href="/help" className="mr-4 p-2 hover:bg-gray-100 rounded-lg transition-colors">
              <ArrowLeft className="w-5 h-5 text-gray-600" />
            </Link>
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Help - Rent Property</h1>
          </div>
          <p className="text-sm md:text-base text-gray-600 text-center">Complete guide to renting out your property</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8 pb-28">
        <div className="flex justify-end mb-8 md:mb-12">
          <div className="bg-white border-2 border-black px-6 py-3 rounded-lg shadow-sm">
            <h2 className="text-xl md:text-2xl font-bold text-black">
              It is Free
            </h2>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-8 mb-8">
          <div className="hidden md:block">
            <div className="relative max-w-6xl mx-auto">
              <div className="absolute top-0 left-0 right-0 h-px bg-gray-300" />

              <div className="flex items-start justify-between pt-8">
                {timelineSteps.map((step, index) => (
                  <div key={step.id} className="flex-1 text-center relative" style={{ maxWidth: '200px' }}>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                      <div className="h-8 border-l-2 border-dashed border-gray-300" />
                      <div className={`w-3 h-3 rounded-full ${isCentralMarker(index, timelineSteps.length) ? 'bg-cyan-400' : 'bg-gray-500'}`} />
                    </div>
                  
                    <div className="mt-6 mb-6 flex justify-center">
                      <div className="w-24 h-20 lg:w-32 lg:h-24 rounded-lg overflow-hidden border border-gray-200 relative">
                        {index === 0 && (
                          <img 
                            src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=300&auto=format&fit=crop" 
                            alt="Rental property location"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {index === 1 && (
                          <img 
                            src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=300&auto=format&fit=crop" 
                            alt="Post property button"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {index === 2 && (
                          <img 
                            src="https://images.unsplash.com/photo-1434626881859-194d67b2b86f?q=80&w=300&auto=format&fit=crop" 
                            alt="Property details form"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {index === 3 && (
                          <img 
                            src="https://images.unsplash.com/photo-1493396650640-2e11eebeac2b?q=80&w=300&auto=format&fit=crop" 
                            alt="Upload photos"
                            className="w-full h-full object-cover"
                          />
                        )}
                        {index === 4 && (
                          <img 
                            src="https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?q=80&w=300&auto=format&fit=crop" 
                            alt="Submit rental ad"
                            className="w-full h-full object-cover"
                          />
                        )}
                      </div>
                    </div>
                    
                    <div className="px-1">
                      <h3 className="font-bold text-gray-900 mb-3 text-sm lg:text-base leading-tight">{step.title}</h3>
                      <p className="text-xs lg:text-sm text-gray-600 leading-relaxed">{step.description}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="block md:hidden">
            <div className="space-y-6 max-w-sm mx-auto">
              {timelineSteps.map((step, index) => (
                <div key={step.id} className="text-center relative">
                  <div className="relative mb-4">
                    <div 
                      className="w-12 h-12 rounded-full mx-auto"
                      style={{ backgroundColor: step.color }}
                    />
                    {index < timelineSteps.length - 1 && (
                      <div className="absolute top-12 left-1/2 w-0.5 h-6 bg-gray-300 transform -translate-x-1/2" />
                    )}
                  </div>
                  
                  <div className="mb-4 flex justify-center">
                    <div className="w-24 h-18 rounded-lg overflow-hidden border border-gray-200 relative">
                      {index === 0 && (
                        <img 
                          src="https://images.unsplash.com/photo-1582407947304-fd86f028f716?q=80&w=200&auto=format&fit=crop" 
                          alt="Rental property location"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {index === 1 && (
                        <img 
                          src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=200&auto=format&fit=crop" 
                          alt="Post property button"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {index === 2 && (
                        <img 
                          src="https://images.unsplash.com/photo-1434626881859-194d67b2b86f?q=80&w=200&auto=format&fit=crop" 
                          alt="Property details form"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {index === 3 && (
                        <img 
                          src="https://images.unsplash.com/photo-1493396650640-2e11eebeac2b?q=80&w=200&auto=format&fit=crop" 
                          alt="Upload photos"
                          className="w-full h-full object-cover"
                        />
                      )}
                      {index === 4 && (
                        <img 
                          src="https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?q=80&w=200&auto=format&fit=crop" 
                          alt="Submit rental ad"
                          className="w-full h-full object-cover"
                        />
                      )}
                    </div>
                  </div>
                  
                  <div className="px-2">
                    <h3 className="font-bold text-gray-900 mb-2 text-base">{step.title}</h3>
                    <p className="text-sm text-gray-600 leading-relaxed">{step.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm">
          <div className="p-4 md:p-6 border-b border-gray-200">
            <h2 className="text-lg md:text-xl font-semibold text-gray-900">
              Frequently Asked Questions
            </h2>
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
                      {faq.question === 'Is it Free?' && <span className="ml-2"><ChevronDown className="w-4 h-4" /></span>}
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
