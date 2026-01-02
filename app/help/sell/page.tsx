"use client"

import React, { useState } from 'react'
import Link from 'next/link'
import { ArrowLeft, ChevronDown, ChevronUp, Home, Upload, SearchCheck, PhoneOutgoing } from 'lucide-react'

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
  image: string
}

export default function HelpSellPage() {
  const [faqs, setFaqs] = useState<FAQ[]>([
    {
      id: '1',
      question: 'Is it Free?',
      answer: 'Yes, posting your property ad on our platform is completely free. You can list your property without any charges.',
      isOpen: false
    },
    {
      id: '2',
      question: 'How to post a sell property Ad?',
      answer: '1. Walk to the center of the property you want to sell. 2. Click Post Property Free button. 3. Enter details of property. 4. Upload photos. 5. Submit property Ad',
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
  ])

  // Reuse the steps from the post property page (timeline design preserved)
  const timelineSteps: TimelineStep[] = [
    {
      id: '1',
      title: 'Walk to the center of the property you want to sell/rent',
      description: 'This is very important as we place the property location on map',
      icon: <Home className="w-6 h-6" />,
      color: '#10B981',
      image: '/images/steps/undraw_experience_design_re_dmqq.svg'
    },
    {
      id: '2',
      title: 'Post your Property Ad',
      description: 'Enter all details like locality name, amenities along with uploading Photos',
      icon: <Upload className="w-6 h-6" />,
      color: '#F59E0B',
      image: '/images/steps/undraw_messenger_re_8bky.svg'
    },
    {
      id: '3',
      title: 'Receive calls from Buyer/Tenant',
      description: 'Get access to Buyer/Tenant contact details & connect easily',
      icon: <PhoneOutgoing className="w-6 h-6" />,
      color: '#3B82F6',
      image: '/images/steps/undraw_online_test_re_kyfx (1).svg'
    },
    {
      id: '4',
      title: 'Sell/Rent faster with instant Connect',
      description: 'Negotiate with your prospective Buyer/Tenant & mutually close the deal (site-visit)',
      icon: <SearchCheck className="w-6 h-6" />,
      color: '#EF4444',
      image: '/images/steps/undraw_undraw_undraw_search_engines_041x_-2-_cl95_fiwb.svg'
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
            <h1 className="text-xl md:text-2xl font-bold text-gray-900">Sell Property</h1>
          </div>
          <p className="text-sm md:text-base text-gray-600 text-center">Complete guide to selling your property</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 pt-8 pb-28">

        <div className="bg-white rounded-lg shadow-sm p-4 md:p-8 mb-8">
          <div className="hidden md:block">
            <div className="relative max-w-6xl mx-auto">
              <div className="absolute top-0 left-0 right-0 h-px bg-gray-300" />

              <div className="flex items-start justify-between pt-8">
                {timelineSteps.map((step, index) => (
                  <div key={step.id} className="flex-1 text-center relative" style={{ maxWidth: '220px' }}>
                    <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 flex flex-col items-center">
                      <div className="h-8 border-l-2 border-dashed border-gray-300" />
                      <div className={`w-3 h-3 rounded-full ${isCentralMarker(index, timelineSteps.length) ? 'bg-cyan-400' : 'bg-gray-500'}`} />
                    </div>
                    <div className="mt-6 mb-6 flex justify-center">
                      <div className="w-24 h-20 lg:w-32 lg:h-24 rounded-lg overflow-hidden border border-gray-200 relative bg-white">
                        <img 
                          src={step.image}
                          alt={step.title}
                          className="w-full h-full object-contain p-2"
                        />
                      </div>
                    </div>
                    <div className="px-1">
                      <h3 className="font-bold text-gray-900 mb-3 text-xs lg:text-sm leading-tight">{step.title}</h3>
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
                      className="w-12 h-12 rounded-full mx-auto flex items-center justify-center text-white"
                      style={{ backgroundColor: step.color }}
                    >
                      {step.icon}
                    </div>
                    {index < timelineSteps.length - 1 && (
                      <div className="absolute top-12 left-1/2 w-0.5 h-6 bg-gray-300 transform -translate-x-1/2" />
                    )}
                  </div>
                  <div className="mb-4 flex justify-center">
                    <div className="w-24 h-20 rounded-lg overflow-hidden border border-gray-200 bg-white flex items-center justify-center">
                      <img 
                        src={step.image}
                        alt={step.title}
                        className="w-full h-full object-contain p-2"
                      />
                    </div>
                  </div>
                  <div className="px-2">
                    <h3 className="font-bold text-gray-900 mb-2 text-sm">{step.title}</h3>
                    <p className="text-xs text-gray-600 leading-relaxed">{step.description}</p>
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
