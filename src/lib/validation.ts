/**
 * ✅ SECURE INPUT VALIDATION & SANITIZATION
 * Centralized validation to prevent XSS and injection attacks
 */

interface PasswordRequirements {
  minLength: number;
  requireUppercase: boolean;
  requireLowercase: boolean;
  requireNumbers: boolean;
  requireSpecialChars: boolean;
}

class ValidationError extends Error {
  constructor(message: string, public field: string) {
    super(message);
    this.name = 'ValidationError';
  }
}

export class InputValidator {
  private static passwordRequirements: PasswordRequirements = {
    minLength: 12,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
  };

  /**
   * ✅ Sanitize input to prevent XSS
   */
  static sanitizeInput(input: string): string {
    if (!input || typeof input !== 'string') return '';
    
    return input
      .trim()
      .replace(/[<>'"]/g, '') // Basic XSS prevention
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/on\w+=/gi, ''); // Remove event handlers
  }

  /**
   * ✅ Validate and sanitize email
   */
  static validateEmail(email: string): string {
    const sanitized = this.sanitizeInput(email);
    
    if (!sanitized) {
      throw new ValidationError('Email is required', 'email');
    }

    if (sanitized.length > 254) {
      throw new ValidationError('Email is too long', 'email');
    }

    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(sanitized)) {
      throw new ValidationError('Invalid email format', 'email');
    }

    return sanitized.toLowerCase();
  }

  /**
   * ✅ Validate strong password
   */
  static validatePassword(password: string): string {
    if (!password || typeof password !== 'string') {
      throw new ValidationError('Password is required', 'password');
    }

    const { minLength, requireUppercase, requireLowercase, requireNumbers, requireSpecialChars } = this.passwordRequirements;

    if (password.length < minLength) {
      throw new ValidationError(`Password must be at least ${minLength} characters long`, 'password');
    }

    if (requireUppercase && !/[A-Z]/.test(password)) {
      throw new ValidationError('Password must contain at least one uppercase letter', 'password');
    }

    if (requireLowercase && !/[a-z]/.test(password)) {
      throw new ValidationError('Password must contain at least one lowercase letter', 'password');
    }

    if (requireNumbers && !/\d/.test(password)) {
      throw new ValidationError('Password must contain at least one number', 'password');
    }

    if (requireSpecialChars && !/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
      throw new ValidationError('Password must contain at least one special character', 'password');
    }

    // Check for common weak patterns
    const weakPatterns = [
      /(.)\1{2,}/, // Repeated characters (aaa, 111)
      /123456|password|qwerty/i, // Common passwords
      /^[a-z]+$/i, // Only letters
      /^\d+$/, // Only numbers
    ];

    for (const pattern of weakPatterns) {
      if (pattern.test(password)) {
        throw new ValidationError('Password is too weak. Please choose a stronger password.', 'password');
      }
    }

    return password; // Don't sanitize passwords, return as-is
  }

  /**
   * ✅ Validate and sanitize name
   */
  static validateName(name: string): string {
    const sanitized = this.sanitizeInput(name);
    
    if (!sanitized) {
      throw new ValidationError('Name is required', 'name');
    }

    if (sanitized.length < 2) {
      throw new ValidationError('Name must be at least 2 characters long', 'name');
    }

    if (sanitized.length > 50) {
      throw new ValidationError('Name is too long', 'name');
    }

    // Only allow letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (!nameRegex.test(sanitized)) {
      throw new ValidationError('Name contains invalid characters', 'name');
    }

    return sanitized;
  }

  /**
   * ✅ Check password confirmation
   */
  static validatePasswordConfirmation(password: string, confirmPassword: string): void {
    if (password !== confirmPassword) {
      throw new ValidationError('Passwords do not match', 'confirmPassword');
    }
  }

  /**
   * ✅ Get password strength score (0-4)
   */
  static getPasswordStrength(password: string): number {
    let score = 0;
    
    if (password.length >= 8) score++;
    if (password.length >= 12) score++;
    if (/[A-Z]/.test(password) && /[a-z]/.test(password)) score++;
    if (/\d/.test(password)) score++;
    if (/[!@#$%^&*(),.?":{}|<>]/.test(password)) score++;
    
    return Math.min(score, 4);
  }

  /**
   * ✅ Get password strength text
   */
  static getPasswordStrengthText(score: number): string {
    const texts = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
    return texts[score] || 'Very Weak';
  }
}

export { ValidationError };