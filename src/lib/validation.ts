// Input Validation Utilities for Security
// Prevents SQL injection, XSS, and invalid data

export interface ValidationResult {
  valid: boolean;
  errors: string[];
}

export const validators = {
  // Email validation
  email: (value: string): ValidationResult => {
    const errors: string[] = [];
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    if (!value || value.trim() === '') {
      errors.push('Email is required');
    } else if (!emailRegex.test(value)) {
      errors.push('Invalid email format');
    } else if (value.length > 254) {
      errors.push('Email is too long');
    }
    
    return { valid: errors.length === 0, errors };
  },

  // Password validation (with strength requirements)
  password: (value: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!value || value.trim() === '') {
      errors.push('Password is required');
    } else if (value.length < 8) {
      errors.push('Password must be at least 8 characters');
    } else if (value.length > 128) {
      errors.push('Password is too long');
    }
    
    // Check for complexity (at least 1 uppercase, 1 lowercase, 1 number)
    const hasUpperCase = /[A-Z]/.test(value);
    const hasLowerCase = /[a-z]/.test(value);
    const hasNumber = /[0-9]/.test(value);
    
    if (value.length >= 8 && (!hasUpperCase || !hasLowerCase || !hasNumber)) {
      errors.push('Password must contain uppercase, lowercase, and number');
    }
    
    return { valid: errors.length === 0, errors };
  },

  // Phone validation
  phone: (value: string): ValidationResult => {
    const errors: string[] = [];
    const phoneRegex = /^[\d\s\-\+\(\)]{10,20}$/;
    
    if (value && !phoneRegex.test(value)) {
      errors.push('Invalid phone number format');
    }
    
    return { valid: errors.length === 0, errors };
  },

  // Name validation
  name: (value: string): ValidationResult => {
    const errors: string[] = [];
    
    if (!value || value.trim() === '') {
      errors.push('Name is required');
    } else if (value.length < 2) {
      errors.push('Name is too short');
    } else if (value.length > 100) {
      errors.push('Name is too long');
    }
    
    // Check for valid characters (letters, spaces, hyphens, apostrophes)
    const nameRegex = /^[a-zA-Z\s\-']+$/;
    if (value && !nameRegex.test(value)) {
      errors.push('Name contains invalid characters');
    }
    
    return { valid: errors.length === 0, errors };
  },

  // General text/sanitize (prevents XSS)
  sanitizeText: (value: string): string => {
    if (!value) return '';
    
    return value
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#x27;')
      .replace(/\//g, '&#x2F;')
      .trim();
  },

  // URL validation
  url: (value: string): ValidationResult => {
    const errors: string[] = [];
    
    if (value) {
      try {
        const url = new URL(value);
        if (!['http:', 'https:'].includes(url.protocol)) {
          errors.push('URL must use HTTP or HTTPS');
        }
      } catch {
        errors.push('Invalid URL format');
      }
    }
    
    return { valid: errors.length === 0, errors };
  },

  // Number/rating validation
  number: (value: number, min: number, max: number): ValidationResult => {
    const errors: string[] = [];
    
    if (typeof value !== 'number' || isNaN(value)) {
      errors.push('Invalid number');
    } else if (value < min || value > max) {
      errors.push(`Number must be between ${min} and ${max}`);
    }
    
    return { valid: errors.length === 0, errors };
  },

  // JSON object validation
  jsonObject: (value: any): ValidationResult => {
    const errors: string[] = [];
    
    if (!value || typeof value !== 'object') {
      errors.push('Invalid JSON object');
    } else if (Array.isArray(value)) {
      errors.push('Expected object, got array');
    }
    
    return { valid: errors.length === 0, errors };
  }
};

// Form-specific validators
export const formValidators = {
  application: (data: any) => {
    const errors: string[] = [];
    
    const nameResult = validators.name(data.user_name);
    errors.push(...nameResult.errors);
    
    const emailResult = validators.email(data.user_email);
    errors.push(...emailResult.errors);
    
    const phoneResult = validators.phone(data.user_phone);
    errors.push(...phoneResult.errors);
    
    if (!data.mentor_type) {
      errors.push('Mentor type is required');
    }
    
    if (!data.goals || data.goals.length < 10) {
      errors.push('Goals must be at least 10 characters');
    }
    
    const seriousnessResult = validators.number(data.seriousness, 1, 10);
    errors.push(...seriousnessResult.errors);
    
    return { valid: errors.length === 0, errors };
  },
  
  auth: (data: any, isSignup: boolean) => {
    const errors: string[] = [];
    
    const emailResult = validators.email(data.email);
    errors.push(...emailResult.errors);
    
    const passwordResult = validators.password(data.password);
    errors.push(...passwordResult.errors);
    
    if (isSignup && data.fullName) {
      const nameResult = validators.name(data.fullName);
      errors.push(...nameResult.errors);
    }
    
    return { valid: errors.length === 0, errors };
  },
  
  booking: (data: any) => {
    const errors: string[] = [];
    
    if (!data.date) {
      errors.push('Date is required');
    }
    
    if (!data.time) {
      errors.push('Time is required');
    }
    
    return { valid: errors.length === 0, errors };
  }
};