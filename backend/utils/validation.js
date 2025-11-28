

// Validate phone no
const validatePhone = (phone) => {
  if (!phone) return { valid: false, message: 'Phone number is required' };
  
  const phoneStr = String(phone).trim();
  const phoneRegex = /^01[0-9]{9}$/; 
  
  if (!phoneRegex.test(phoneStr)) {
    return { 
      valid: false, 
      message: 'Invalid phone number. Must be 11 digits starting with 01' 
    };
  }
  
  return { valid: true };
};

// Validate account no
const validateAccountNumber = (accountNo) => {
  if (!accountNo) return { valid: false, message: 'Account number is required' };
  
  const accountRegex = /^ACC\d{4}$/;
  
  if (!accountRegex.test(accountNo)) {
    return { 
      valid: false, 
      message: 'Invalid account number format. Expected format: ACC0000' 
    };
  }
  
  return { valid: true };
};

// Validate amount 
const validateAmount = (amount, min = 1, max = 1000000) => {
  if (amount === undefined || amount === null) {
    return { valid: false, message: 'Amount is required' };
  }
  
  const numAmount = parseFloat(amount);
  
  if (isNaN(numAmount)) {
    return { valid: false, message: 'Amount must be a valid number' };
  }
  
  if (numAmount < min) {
    return { 
      valid: false, 
      message: `Amount must be at least ₹${min}` 
    };
  }
  
  if (numAmount > max) {
    return { 
      valid: false, 
      message: `Amount cannot exceed ₹${max}` 
    };
  }
  
  return { valid: true, value: numAmount };
};

// Validate email
const validateEmail = (email) => {
  if (!email) return { valid: false, message: 'Email is required' };
  
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  
  if (!emailRegex.test(email)) {
    return { valid: false, message: 'Invalid email format' };
  }
  
  return { valid: true };
};

// Validate name 
const validateName = (name) => {
  if (!name) return { valid: false, message: 'Name is required' };
  
  const nameStr = String(name).trim();
  
  if (nameStr.length < 2 || nameStr.length > 100) {
    return { 
      valid: false, 
      message: 'Name must be between 2 and 100 characters' 
    };
  }
  
  const nameRegex = /^[a-zA-Z\s]+$/;
  
  if (!nameRegex.test(nameStr)) {
    return { 
      valid: false, 
      message: 'Name can only contain letters and spaces' 
    };
  }
  
  return { valid: true, value: nameStr };
};

// Validate date of birth 
const validateDOB = (dob) => {
  if (!dob) return { valid: true }; 
  
  const birthDate = new Date(dob);
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  
  if (age < 18) {
    return { 
      valid: false, 
      message: 'Must be at least 18 years old to register' 
    };
  }
  
  return { valid: true };
};

// Validate loan amount 
const validateLoanAmount = (amount) => {
  const result = validateAmount(amount, 100, 5000);
  
  if (!result.valid) {
    return result;
  }
  
  return { valid: true, value: result.value };
};

module.exports = {
  validatePhone,
  validateAccountNumber,
  validateAmount,
  validateEmail,
  validateName,
  validateDOB,
  validateLoanAmount
};
