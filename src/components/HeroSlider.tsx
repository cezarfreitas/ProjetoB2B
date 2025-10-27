'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import HeroSliderSkeleton from './HeroSliderSkeleton'

interface Slide {
  id: string
  name: string
  imageDesktop: string
  imageMobile: string
  link: string
  order: number
  isActive: boolean
}

export default function HeroSlider() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [slides, setSlides] = useState<Slide[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [viewedSlides, setViewedSlides] = useState<Set<string>>(new Set())

  useEffect(() => {
    const fetchSlides = async () => {
      try {
        const response = await fetch('/api/hero-slides')
        if (response.ok) {
          const data = await response.json()
          setSlides(data.slides || [])
        }
      } catch (error) {
        console.error('Erro ao buscar slides:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchSlides()
  }, [])

  // Registrar impressão quando um slide é exibido
  useEffect(() => {
    if (slides.length === 0 || isLoading) return

    const currentSlideData = slides[currentSlide]
    if (!currentSlideData) return

    // Registrar apenas uma vez por slide por sessão
    if (!viewedSlides.has(currentSlideData.id)) {
      setViewedSlides(prev => new Set(prev).add(currentSlideData.id))
      
      // Registrar impressão
      fetch(`/api/hero-slides/${currentSlideData.id}/impression`, {
        method: 'POST'
      }).catch(error => {
        console.error('Erro ao registrar impressão:', error)
      })
    }
  }, [currentSlide, slides, isLoading, viewedSlides])

  useEffect(() => {
    if (isLoading || slides.length === 0) return

    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length)
    }, 5000)
    return () => clearInterval(interval)
  }, [slides.length, isLoading])

  const next = () => setCurrentSlide((prev) => (prev + 1) % slides.length)
  const prev = () => setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)

  const handleSlideClick = async (slideId: string, link: string) => {
    // Registrar clique
    try {
      await fetch(`/api/hero-slides/${slideId}/click`, { method: 'POST' })
    } catch (error) {
      console.error('Erro ao registrar clique:', error)
    }
    // Navegar
    window.location.href = link
  }

  if (isLoading) {
    return <HeroSliderSkeleton />
  }

  if (slides.length === 0) {
    return null
  }

  return (
    <div className="relative w-full h-96 md:h-[500px] rounded-2xl overflow-hidden animate-in fade-in duration-500">
      {slides.map((slide, index) => (
        <div
          key={slide.id}
          className={`absolute inset-0 transition-opacity duration-1000 cursor-pointer ${
            index === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'
          }`}
          onClick={() => handleSlideClick(slide.id, slide.link)}
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={slide.imageDesktop}
              alt={slide.name}
              fill
              className="object-cover hidden md:block"
              priority={index === 0}
            />
            <Image
              src={slide.imageMobile || slide.imageDesktop}
              alt={slide.name}
              fill
              className="object-cover md:hidden"
              priority={index === 0}
            />
          </div>
        </div>
      ))}

      {/* Setas */}
      <button
        onClick={(e) => {
          e.stopPropagation()
          prev()
        }}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all"
        aria-label="Anterior"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>
      <button
        onClick={(e) => {
          e.stopPropagation()
          next()
        }}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-white/20 hover:bg-white/30 text-white p-2 rounded-full backdrop-blur-sm transition-all"
        aria-label="Próximo"
      >
        <ChevronRight className="w-6 h-6" />
      </button>

      {/* Dots */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {slides.map((_, index) => (
          <button
            key={index}
            onClick={(e) => {
              e.stopPropagation()
              setCurrentSlide(index)
            }}
            className={`rounded-full transition-all ${
              index === currentSlide ? 'w-8 h-2 bg-white' : 'w-2 h-2 bg-white/50'
            }`}
            aria-label={`Slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
