# Internet Banking System - Quick Start Guide

## 🚀 How to Run the Project

### Option 1: Double-click START.bat
Simply double-click the `START.bat` file in the project root directory. It will:
- Start the backend server (port 5000)
- Start the frontend server (port 8080)
- Open the login page in your browser

### Option 2: Manual Start

#### Step 1: Start Backend
```bash
cd backend
node server.js
```
(Keep this terminal window open)

#### Step 2: Start Frontend (in a new terminal)
```bash
cd frontend
npx http-server -p 8080 --cors -c-1
```
(Keep this terminal window open)

#### Step 3: Open Browser
Navigate to: http://127.0.0.1:8080/index.html

---

## 🔑 Test Credentials

**Customer Account:**
- Phone: `01712345678`
- Account: `ACC1001`

**Admin Account:**
- Employee ID: `EMP001`
- Name: `Shoaib`

---

## 🎯 Features

✅ **Login** - Customer and Admin authentication
✅ **Add Money** - Deposit funds to your account
✅ **Cash Out** - Withdraw money
✅ **Transfer** - Send money to another account
✅ **Pay Bills** - Pay utility bills
✅ **Take Loan** - Apply for various types of loans
✅ **Pay Loan** - Repay outstanding loans
✅ **Transaction History** - View all your transactions
✅ **Logout** - Securely end your session

---

## 📊 Database Structure

**Tables:**
- `customer` - Customer information
- `account` - Bank accounts
- `loan` - Loan details
- `takes` - Loan-Account relationship
- `repayment` - Loan repayment records
- `payment_service` - Payment transactions
- `records` - Transaction history (NEW)
- `employee` - Staff information

---

## ⚠️ Important Notes

1. **Always use http://127.0.0.1:8080** (not file://)
2. **Keep both terminal windows open** while using the app
3. **Refresh browser (Ctrl+R)** after any code changes
4. **MySQL must be running** (start XAMPP)

---

## 🐛 Troubleshooting

### Backend not working?
```bash
# Check if backend is running
netstat -ano | findstr :5000

# If nothing shows, start backend:
cd backend
node server.js
```

### Frontend not showing?
```bash
# Check if frontend server is running
netstat -ano | findstr :8080

# If nothing shows, start frontend:
cd frontend
npx http-server -p 8080 --cors -c-1
```

### Features not working?
1. Open Browser DevTools (F12)
2. Check Console tab for errors
3. Make sure you're logged in
4. Verify both servers are running

---

## 📝 API Endpoints

- `POST /api/auth/login` - Customer login
- `POST /api/auth/register` - Create account
- `GET /api/transactions/balance` - Get balance
- `POST /api/transactions/add-money` - Add money
- `POST /api/transactions/cash-out` - Cash out
- `POST /api/transactions/transfer` - Transfer money
- `GET /api/transactions/history` - Transaction history
- `POST /api/loans/take-loan` - Apply for loan
- `POST /api/loans/pay-loan` - Pay loan
- `POST /api/bills/pay` - Pay bills

---

## 📞 Support

If something doesn't work:
1. Check both servers are running
2. Check browser console (F12) for errors
3. Verify MySQL is running
4. Make sure you're using http://127.0.0.1:8080 URL

---

**Happy Banking! 🏦**
