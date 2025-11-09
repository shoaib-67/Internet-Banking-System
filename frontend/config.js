// API Configuration
const API_CONFIG = {
  BASE_URL: 'http://localhost:5000/api',
  ENDPOINTS: {
    // Auth
    LOGIN: '/auth/login',
    REGISTER: '/auth/register',
    ADMIN_LOGIN: '/auth/admin-login',
    
    // Transactions
    BALANCE: '/transactions/balance',
    ADD_MONEY: '/transactions/add-money',
    CASH_OUT: '/transactions/cash-out',
    TRANSFER: '/transactions/transfer',
    TRANSACTION_HISTORY: '/transactions/history',
    
    // Loans
    LOAN_ELIGIBILITY: '/loans/eligibility',
    TAKE_LOAN: '/loans/take-loan',
    ACTIVE_LOANS: '/loans/active',
    PAY_LOAN: '/loans/pay-loan',
    LOAN_HISTORY: '/loans/history',
    
    // Bills
    PAY_BILL: '/bills/pay',
    BILL_HISTORY: '/bills/history',
    
    // Health Check
    HEALTH: '/health'
  }
};

// Helper function to make API calls
const apiCall = async (endpoint, method = 'GET', data = null) => {
  const token = localStorage.getItem('token');
  
  const options = {
    method,
    headers: {
      'Content-Type': 'application/json'
    }
  };
  
  // Add authorization header if token exists
  if (token) {
    options.headers['Authorization'] = `Bearer ${token}`;
  }
  
  // Add body for POST, PUT requests
  if (data && (method === 'POST' || method === 'PUT')) {
    options.body = JSON.stringify(data);
  }
  
  try {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, options);
    const result = await response.json();
    
    if (!response.ok) {
      throw new Error(result.message || 'API request failed');
    }
    
    return result;
  } catch (error) {
    console.error('API Call Error:', error);
    throw error;
  }
};

// Export for use in other files
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { API_CONFIG, apiCall };
}
