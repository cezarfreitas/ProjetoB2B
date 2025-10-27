import bcrypt from 'bcryptjs'

export type PasswordValidation = {
  valid: boolean
  errors: string[]
  score: number
}

// Hash password
export async function hashPassword(password: string): Promise<string> {
  const salt = await bcrypt.genSalt(10)
  return bcrypt.hash(password, salt)
}

// Verify password
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword)
}

// Simple, dependency-free password strength validator
export function validatePasswordStrength(password: string, context?: { email?: string; name?: string }): PasswordValidation {
  const errors: string[] = []

  if (typeof password !== 'string') {
    return { valid: false, errors: ['Senha inválida'], score: 0 }
  }

  const length = password.length
  if (length < 10) errors.push('Mínimo de 10 caracteres')
  if (length > 128) errors.push('Máximo de 128 caracteres')
  if (/\s/.test(password)) errors.push('Não pode conter espaços')

  const hasLower = /[a-z]/.test(password)
  const hasUpper = /[A-Z]/.test(password)
  const hasDigit = /[0-9]/.test(password)
  const hasSpecial = /[^\w\s]/.test(password)

  const categories = [hasLower, hasUpper, hasDigit, hasSpecial].filter(Boolean).length
  if (categories < 3) errors.push('Use ao menos 3 tipos: minúscula, MAIÚSCULA, número, símbolo')

  // avoid trivial sequences and repeats
  if (/^(.)\1{5,}$/.test(password)) errors.push('Evite caracteres repetidos')
  if (/1234|abcd|qwer|password|senha/i.test(password)) errors.push('Evite sequências óbvias')

  // avoid including personal info
  if (context?.email) {
    const user = context.email.split('@')[0]
    if (user && password.toLowerCase().includes(user.toLowerCase())) {
      errors.push('Não inclua seu email na senha')
    }
  }
  if (context?.name) {
    const tokens = context.name.split(/\s+/).filter(Boolean)
    for (const t of tokens) {
      if (t.length >= 3 && password.toLowerCase().includes(t.toLowerCase())) {
        errors.push('Não inclua seu nome na senha')
        break
      }
    }
  }

  // Basic score: length + diversity
  const score = Math.min(100, length * 4 + categories * 10 + (hasSpecial ? 10 : 0))

  return { valid: errors.length === 0, errors, score }
}


