'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuantitySelectorProps {
  value: number
  onChange: (value: number) => void
  min?: number
  max?: number
  step?: number
  disabled?: boolean
  size?: 'sm' | 'md' | 'lg'
  variant?: 'default' | 'compact' | 'inline'
  className?: string
}

export function QuantitySelector({
  value,
  onChange,
  min = 1,
  max = 99,
  step = 1,
  disabled = false,
  size = 'md',
  variant = 'default',
  className
}: QuantitySelectorProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [inputValue, setInputValue] = useState(value.toString())

  const handleDecrease = () => {
    const newValue = Math.max(min, value - step)
    onChange(newValue)
  }

  const handleIncrease = () => {
    const newValue = Math.min(max, value + step)
    onChange(newValue)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value
    setInputValue(newValue)
    
    if (newValue === '') return
    
    const numValue = parseInt(newValue)
    if (!isNaN(numValue)) {
      const clampedValue = Math.max(min, Math.min(max, numValue))
      onChange(clampedValue)
    }
  }

  const handleInputBlur = () => {
    setIsEditing(false)
    setInputValue(value.toString())
  }

  const handleInputFocus = () => {
    setIsEditing(true)
    setInputValue(value.toString())
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur()
    }
    if (e.key === 'Escape') {
      setInputValue(value.toString())
      setIsEditing(false)
    }
  }

  const sizeClasses = {
    sm: {
      button: 'h-7 w-7',
      input: 'h-7 w-12 text-sm',
      icon: 'h-3 w-3'
    },
    md: {
      button: 'h-9 w-9',
      input: 'h-9 w-16 text-base',
      icon: 'h-4 w-4'
    },
    lg: {
      button: 'h-11 w-11',
      input: 'h-11 w-20 text-lg',
      icon: 'h-5 w-5'
    }
  }

  const currentSize = sizeClasses[size]

  if (variant === 'inline') {
    return (
      <div className={cn('flex items-center gap-1 bg-gray-50 rounded-lg p-1 border border-gray-200', className)}>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleDecrease}
          disabled={disabled || value <= min}
          className="h-6 w-6 p-0 rounded-full disabled:opacity-50 hover:bg-transparent"
        >
          <Minus className="h-3 w-3 text-gray-600" />
        </Button>
        
        {isEditing ? (
          <Input
            type="number"
            value={inputValue}
            onChange={handleInputChange}
            onBlur={handleInputBlur}
            onFocus={handleInputFocus}
            onKeyDown={handleKeyDown}
            min={min}
            max={max}
            step={step}
            disabled={disabled}
            className="h-6 w-8 text-center text-sm font-bold focus:ring-2 focus:ring-primary border-0 bg-transparent text-primary"
            autoFocus
          />
        ) : (
          <span
            className="h-6 w-8 text-center text-sm font-bold cursor-pointer rounded px-1 flex items-center justify-center text-primary"
            onClick={() => setIsEditing(true)}
          >
            {value}
          </span>
        )}
        
        <Button
          variant="ghost"
          size="sm"
          onClick={handleIncrease}
          disabled={disabled || value >= max}
          className="h-6 w-6 p-0 rounded-full disabled:opacity-50 hover:bg-transparent"
        >
          <Plus className="h-3 w-3 text-gray-600" />
        </Button>
      </div>
    )
  }

  return (
    <div className={cn(
      'flex items-center border-2 border-gray-200 rounded-xl bg-white',
      className
    )}>
      <Button
        variant="ghost"
        size={size}
        onClick={handleDecrease}
        disabled={disabled || value <= min}
        className="rounded-r-none border-r-0 focus:z-10 disabled:opacity-50 hover:bg-transparent"
      >
        <Minus className={cn(currentSize.icon, 'text-gray-600')} />
      </Button>
      
      {isEditing ? (
        <Input
          type="number"
          value={inputValue}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onFocus={handleInputFocus}
          onKeyDown={handleKeyDown}
          min={min}
          max={max}
          step={step}
          disabled={disabled}
          className={cn(
            'text-center font-bold border-x-0 rounded-none focus:ring-2 focus:ring-primary focus:border-primary bg-transparent text-primary',
            currentSize.input
          )}
          autoFocus
        />
      ) : (
        <div
          className={cn(
            'flex items-center justify-center font-bold cursor-pointer border-x-0 text-primary',
            currentSize.input
          )}
          onClick={() => setIsEditing(true)}
        >
          {value}
        </div>
      )}
      
      <Button
        variant="ghost"
        size={size}
        onClick={handleIncrease}
        disabled={disabled || value >= max}
        className="rounded-l-none border-l-0 focus:z-10 disabled:opacity-50 hover:bg-transparent"
      >
        <Plus className={cn(currentSize.icon, 'text-gray-600')} />
      </Button>
    </div>
  )
}
