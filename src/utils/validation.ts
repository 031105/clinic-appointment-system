// Admin Interface Validation Utilities
// 专门为admin界面提供的前端validation函数

export interface ValidationResult {
  isValid: boolean;
  error?: string;
}

// 基础validation函数
export const validateRequired = (value: string | number | null | undefined, fieldName: string): ValidationResult => {
  if (value === null || value === undefined || String(value).trim() === '') {
    return { isValid: false, error: `${fieldName} is required` };
  }
  return { isValid: true };
};

export const validateLength = (value: string, min: number, max: number, fieldName: string): ValidationResult => {
  const trimmed = value.trim();
  if (trimmed.length < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min} characters` };
  }
  if (trimmed.length > max) {
    return { isValid: false, error: `${fieldName} must be less than ${max} characters` };
  }
  return { isValid: true };
};

// 邮箱验证
export const validateEmail = (email: string): ValidationResult => {
  const trimmed = email.trim();
  if (!trimmed) {
    return { isValid: false, error: 'Email is required' };
  }
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(trimmed)) {
    return { isValid: false, error: 'Please enter a valid email address' };
  }
  
  if (trimmed.length > 255) {
    return { isValid: false, error: 'Email must be less than 255 characters' };
  }
  
  return { isValid: true };
};

// 马来西亚电话号码验证
export const validateMalaysiaPhone = (phone: string, required: boolean = false): ValidationResult => {
  const trimmed = phone.trim();
  
  if (!trimmed) {
    if (required) {
      return { isValid: false, error: 'Phone number is required' };
    }
    return { isValid: true };
  }
  
  // 马来西亚电话号码格式
  // 手机号：01X-XXX XXXX 或 +60 1X-XXX XXXX
  // 固定电话：0X-XXXX XXXX 或 +60 X-XXXX XXXX
  const mobileRegex = /^(\+60\s?1[0-9]|01[0-9])[\s-]?\d{3}[\s-]?\d{4}$/;
  const landlineRegex = /^(\+60\s?[3-9]|0[3-9])[\s-]?\d{3}[\s-]?\d{4}$/;
  
  if (!mobileRegex.test(trimmed) && !landlineRegex.test(trimmed)) {
    return { 
      isValid: false, 
      error: 'Please enter a valid Malaysia phone number (e.g., 012-345 6789 or +60 12-345 6789)' 
    };
  }
  
  return { isValid: true };
};

// 姓名验证 (支持字母、空格、连字符)
export const validateName = (name: string, fieldName: string, required: boolean = true): ValidationResult => {
  if (required) {
    const requiredCheck = validateRequired(name, fieldName);
    if (!requiredCheck.isValid) return requiredCheck;
  }
  
  const trimmed = name.trim();
  if (!trimmed && !required) return { isValid: true };
  
  const lengthCheck = validateLength(trimmed, 1, 100, fieldName);
  if (!lengthCheck.isValid) return lengthCheck;
  
  // 只允许字母、空格、连字符、撇号
  const nameRegex = /^[a-zA-Z\s\-']+$/;
  if (!nameRegex.test(trimmed)) {
    return { 
      isValid: false, 
      error: `${fieldName} can only contain letters, spaces, hyphens, and apostrophes` 
    };
  }
  
  return { isValid: true };
};

// 密码验证
export const validatePassword = (password: string, fieldName: string = 'Password'): ValidationResult => {
  const requiredCheck = validateRequired(password, fieldName);
  if (!requiredCheck.isValid) return requiredCheck;
  
  if (password.length < 6) {
    return { isValid: false, error: `${fieldName} must be at least 6 characters` };
  }
  
  if (password.length > 128) {
    return { isValid: false, error: `${fieldName} must be less than 128 characters` };
  }
  
  return { isValid: true };
};

// 数值验证
export const validateNumber = (
  value: string | number, 
  min: number, 
  max: number, 
  fieldName: string,
  required: boolean = true,
  allowDecimals: boolean = true
): ValidationResult => {
  const stringValue = String(value).trim();
  
  if (!stringValue) {
    if (required) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true };
  }
  
  const numValue = Number(stringValue);
  
  if (isNaN(numValue)) {
    return { isValid: false, error: `${fieldName} must be a valid number` };
  }
  
  if (!allowDecimals && !Number.isInteger(numValue)) {
    return { isValid: false, error: `${fieldName} must be a whole number` };
  }
  
  if (numValue < min) {
    return { isValid: false, error: `${fieldName} must be at least ${min}` };
  }
  
  if (numValue > max) {
    return { isValid: false, error: `${fieldName} cannot exceed ${max}` };
  }
  
  return { isValid: true };
};

// 日期验证
export const validateDate = (date: string, fieldName: string, allowPast: boolean = true, allowFuture: boolean = true): ValidationResult => {
  const requiredCheck = validateRequired(date, fieldName);
  if (!requiredCheck.isValid) return requiredCheck;
  
  const dateObj = new Date(date);
  
  if (isNaN(dateObj.getTime())) {
    return { isValid: false, error: `${fieldName} must be a valid date` };
  }
  
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const inputDate = new Date(date);
  inputDate.setHours(0, 0, 0, 0);
  
  if (!allowPast && inputDate < today) {
    return { isValid: false, error: `${fieldName} cannot be in the past` };
  }
  
  if (!allowFuture && inputDate > today) {
    return { isValid: false, error: `${fieldName} cannot be in the future` };
  }
  
  return { isValid: true };
};

// 时间验证
export const validateTime = (time: string, fieldName: string = 'Time'): ValidationResult => {
  const requiredCheck = validateRequired(time, fieldName);
  if (!requiredCheck.isValid) return requiredCheck;
  
  const timeRegex = /^([01]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(time)) {
    return { isValid: false, error: `${fieldName} must be in HH:MM format` };
  }
  
  return { isValid: true };
};

// 文件验证
export const validateFile = (
  file: File, 
  allowedTypes: string[], 
  maxSizeMB: number, 
  fieldName: string = 'File'
): ValidationResult => {
  if (!allowedTypes.includes(file.type)) {
    return { 
      isValid: false, 
      error: `${fieldName} must be one of: ${allowedTypes.join(', ')}` 
    };
  }
  
  const maxSizeBytes = maxSizeMB * 1024 * 1024;
  if (file.size > maxSizeBytes) {
    return { 
      isValid: false, 
      error: `${fieldName} size cannot exceed ${maxSizeMB}MB` 
    };
  }
  
  return { isValid: true };
};

// 年龄验证 (基于出生日期)
export const validateAge = (dateOfBirth: string, minAge: number = 0, maxAge: number = 150): ValidationResult => {
  const dateCheck = validateDate(dateOfBirth, 'Date of birth', true, false);
  if (!dateCheck.isValid) return dateCheck;
  
  const birthDate = new Date(dateOfBirth);
  const today = new Date();
  const age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  let actualAge = age;
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    actualAge--;
  }
  
  if (actualAge < minAge) {
    return { isValid: false, error: `Age must be at least ${minAge} years` };
  }
  
  if (actualAge > maxAge) {
    return { isValid: false, error: `Age cannot exceed ${maxAge} years` };
  }
  
  return { isValid: true };
};

// JSON验证
export const validateJSON = (jsonString: string, fieldName: string, required: boolean = false): ValidationResult => {
  if (!jsonString.trim()) {
    if (required) {
      return { isValid: false, error: `${fieldName} is required` };
    }
    return { isValid: true };
  }
  
  try {
    JSON.parse(jsonString);
    return { isValid: true };
  } catch (error) {
    return { isValid: false, error: `${fieldName} must be valid JSON format` };
  }
};

// Emoji验证
export const validateEmoji = (emoji: string, fieldName: string = 'Emoji'): ValidationResult => {
  if (!emoji.trim()) {
    return { isValid: true }; // emoji是可选的
  }
  
  // 基础emoji检测正则表达式 - 使用ES5兼容格式
  const emojiRegex = /[\uD800-\uDBFF][\uDC00-\uDFFF]|[\u2600-\u26FF]|[\u2700-\u27BF]|[\uD83C][\uDF00-\uDFFF]|[\uD83D][\uDC00-\uDE4F]|[\uD83D][\uDE80-\uDEFF]/;
  
  if (emoji.length > 4) { // 调整长度检查，因为emoji可能是2个字符的组合
    return { isValid: false, error: `${fieldName} must be a single emoji character` };
  }
  
  if (!emojiRegex.test(emoji)) {
    return { isValid: false, error: `${fieldName} must be a valid emoji` };
  }
  
  return { isValid: true };
};

// 搜索查询验证 (防止恶意输入)
export const validateSearchQuery = (query: string): ValidationResult => {
  if (!query.trim()) {
    return { isValid: true };
  }
  
  if (query.length > 100) {
    return { isValid: false, error: 'Search query must be less than 100 characters' };
  }
  
  // 防止SQL注入和XSS的基础过滤
  const dangerousChars = /<script|javascript:|onload=|onerror=|eval\(|exec\(/i;
  if (dangerousChars.test(query)) {
    return { isValid: false, error: 'Invalid characters in search query' };
  }
  
  return { isValid: true };
};

// 文本清理函数
export const sanitizeText = (text: string): string => {
  return text.trim().replace(/\s+/g, ' ');
};

// 格式化电话号码
export const formatMalaysiaPhone = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  
  // 如果以60开头，加上+号
  if (cleaned.startsWith('60')) {
    const number = cleaned.substring(2);
    if (number.length === 9 || number.length === 8) {
      return `+60 ${number.substring(0, number.length === 9 ? 2 : 1)}-${number.substring(number.length === 9 ? 2 : 1, number.length === 9 ? 5 : 4)} ${number.substring(number.length === 9 ? 5 : 4)}`;
    }
  }
  
  // 本地格式
  if (cleaned.length === 10 || cleaned.length === 9) {
    return `${cleaned.substring(0, cleaned.length === 10 ? 3 : 2)}-${cleaned.substring(cleaned.length === 10 ? 3 : 2, cleaned.length === 10 ? 7 : 5)} ${cleaned.substring(cleaned.length === 10 ? 7 : 5)}`;
  }
  
  return phone; // 返回原始输入如果无法格式化
};

// 批量验证函数
export const validateFields = (validations: { [key: string]: ValidationResult }): { isValid: boolean; errors: { [key: string]: string } } => {
  const errors: { [key: string]: string } = {};
  let isValid = true;
  
  Object.keys(validations).forEach(key => {
    if (!validations[key].isValid && validations[key].error) {
      errors[key] = validations[key].error!;
      isValid = false;
    }
  });
  
  return { isValid, errors };
}; 