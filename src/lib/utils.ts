import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Helper para fazer fetch com token automaticamente
export async function fetchWithAuth(url: string, options: RequestInit = {}) {
  const token = typeof window !== 'undefined' ? localStorage.getItem('auth_token') : null
  
  const headers = {
    ...options.headers,
    ...(token && { Authorization: `Bearer ${token}` })
  }
  
  return fetch(url, { ...options, headers })
}
