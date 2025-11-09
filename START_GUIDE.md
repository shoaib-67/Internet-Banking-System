# 🚀 Internet Banking System - Quick Start Guide

## ✅ Project Status: RUNNING

### 📡 Backend Server
- **Status:** ✅ RUNNING
- **URL:** http://localhost:5000
- **API Health:** http://localhost:5000/api/health
- **Database:** team06 (MySQL via XAMPP)
- **Port:** 5000

### 🌐 Frontend
- **Location:** `frontend/index.html`
- **Open in Browser:** Double-click the file or right-click → Open with → Browser

---

## 🔐 Test Login Credentials

### Customer Login
- **Phone Number:** `01521498148`
- **Account Number:** `ACC1001`

### Admin Login
- **Employee ID:** `1`
- **Name:** `John Admin`

---

## 📋 Available Features

### 💰 Transactions
- ✅ Add Money
- ✅ Cash Out
- ✅ Transfer Money
- ✅ View Balance
- ✅ Transaction History

### 💳 Bills Payment
- ✅ Electricity (DESCO)
- ✅ Internet (ISP)
- ✅ Water (WASA)
- ✅ Gas
- ✅ Mobile Recharge
- ✅ TV (Cable)

### 🏦 Loans
- ✅ Check Eligibility
- ✅ Take Loan (Max ₹5000)
- ✅ View Active Loans
- ✅ Pay Loan
- ✅ Loan History

### 👤 Account Management
- ✅ Create New Account
- ✅ View Profile
- ✅ Admin Dashboard

---

## 🛠️ How to Run

### 1. Start MySQL (XAMPP)
```bash
# MySQL must be running first!
# Open XAMPP Control Panel → Start MySQL
```

### 2. Start Backend Server
```bash
cd backend
npm run dev
```

### 3. Open Frontend
- Navigate to `frontend/index.html`
- Open in any modern browser

---

## 🔧 Troubleshooting

### Backend won't start?
- ✅ Check if MySQL is running in XAMPP
- ✅ Verify `.env` file exists in backend folder
- ✅ Database name should be `team06`

### Can't login?
- ✅ Make sure backend is running (http://localhost:5000)
- ✅ Check browser console for errors (F12)
- ✅ Verify credentials match database

### Transaction not working?
- ✅ Check if you're logged in
- ✅ Verify JWT token in localStorage
- ✅ Check backend terminal for errors

---

## 📊 API Endpoints

### Authentication
- `POST /api/auth/register` - Create new account
- `POST /api/auth/login` - Customer login
- `POST /api/auth/admin-login` - Admin login

### Transactions
- `GET /api/transactions/balance` - Get balance
- `POST /api/transactions/add-money` - Add money
- `POST /api/transactions/cash-out` - Withdraw
- `POST /api/transactions/transfer` - Transfer money
- `GET /api/transactions/history` - Transaction history

### Loans
- `GET /api/loans/eligibility` - Check eligibility
- `POST /api/loans/take-loan` - Apply for loan
- `GET /api/loans/active` - Active loans
- `POST /api/loans/pay-loan` - Pay loan
- `GET /api/loans/history` - Loan history

### Bills
- `POST /api/bills/pay` - Pay bills
- `GET /api/bills/history` - Bill payment history

### Employees (Admin)
- `GET /api/employees` - All employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

---

## 🎯 Next Steps

1. **Login** with test credentials
2. **Add Money** to test database updates
3. **Try Transfers** between accounts
4. **Check Transaction History** to see real data
5. **Test Loan System** (max 3 loans, ₹5000 each)

---

## 💡 Important Notes

- ✅ All transactions are saved to MySQL database
- ✅ JWT authentication is required for all operations
- ✅ Phone numbers must be 11 digits (01XXXXXXXXX)
- ✅ Account numbers follow format: ACC0000
- ✅ Input validation is applied on both frontend & backend
- ✅ Database connection is tested before server starts

---

**Enjoy using your Internet Banking System! 🎉**
