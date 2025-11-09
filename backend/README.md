# Internet Banking System - Backend API

## 🚀 Setup Instructions

### 1. Install Dependencies
```bash
cd backend
npm install
```

### 2. Configure Database
- Make sure MySQL is installed and running
- Update `.env` file with your database credentials:
  ```
  DB_HOST=localhost
  DB_USER=root
  DB_PASSWORD=your_password
  DB_NAME=banking_system
  ```

### 3. Create Database & Tables
Run the SQL schema file in MySQL:
```bash
mysql -u root -p < database/schema.sql
```

Or manually run the SQL file in MySQL Workbench/phpMyAdmin.

### 4. Start the Server
```bash
# Development mode (with auto-reload)
npm run dev

# Production mode
npm start
```

Server will run on: `http://localhost:5000`

---

## 📋 API Endpoints

### Authentication Routes (`/api/auth`)

#### Register
- **POST** `/api/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "mobile": "1234567890",
    "pin": "1234",
    "confirmPin": "1234"
  }
  ```

#### User Login
- **POST** `/api/auth/login`
- **Body:**
  ```json
  {
    "mobile": "12345678910",
    "pin": "1234"
  }
  ```

#### Admin Login
- **POST** `/api/auth/admin-login`
- **Body:**
  ```json
  {
    "username": "admin",
    "password": "admin123"
  }
  ```

---

### Transaction Routes (`/api/transactions`)
*All routes require JWT authentication (Bearer token)*

#### Get Balance
- **GET** `/api/transactions/balance`
- **Headers:** `Authorization: Bearer <token>`

#### Add Money
- **POST** `/api/transactions/add-money`
- **Body:**
  ```json
  {
    "amount": 1000,
    "pin": "1234"
  }
  ```

#### Cash Out
- **POST** `/api/transactions/cash-out`
- **Body:**
  ```json
  {
    "amount": 500,
    "pin": "1234"
  }
  ```

#### Transfer Money
- **POST** `/api/transactions/transfer`
- **Body:**
  ```json
  {
    "recipientMobile": "9876543210",
    "amount": 300,
    "bank": "Bkash",
    "pin": "1234"
  }
  ```

#### Get Transaction History
- **GET** `/api/transactions/history`

---

### Loan Routes (`/api/loans`)
*All routes require JWT authentication*

#### Check Loan Eligibility
- **GET** `/api/loans/eligibility`

#### Take Loan
- **POST** `/api/loans/take-loan`
- **Body:**
  ```json
  {
    "bankName": "Brac Bank",
    "loanType": "Personal Loan",
    "amount": 5000,
    "duration": 12,
    "purpose": "Business expansion",
    "pin": "1234"
  }
  ```

#### Get Active Loan
- **GET** `/api/loans/active`

#### Pay Loan
- **POST** `/api/loans/pay-loan`
- **Body:**
  ```json
  {
    "amount": 1000,
    "pin": "1234"
  }
  ```

#### Get Loan History
- **GET** `/api/loans/history`

---

### Bill Payment Routes (`/api/bills`)
*All routes require JWT authentication*

#### Pay Bill
- **POST** `/api/bills/pay`
- **Body:**
  ```json
  {
    "billType": "Electricity",
    "amount": 150,
    "referenceNumber": "REF123456",
    "pin": "1234"
  }
  ```

#### Get Bill Payment History
- **GET** `/api/bills/history`

---

## 🔐 Authentication

All protected routes require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

Get the token from login/register response and include it in subsequent requests.

---

## 📊 Database Schema

### Tables:
1. **users** - User accounts and balances
2. **transactions** - All transaction records
3. **loans** - Loan applications and details
4. **loan_payments** - Individual loan payment records
5. **bill_payments** - Bill payment history

---

## 🛠 Technology Stack

- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **MySQL2** - Database driver
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-origin resource sharing
- **dotenv** - Environment variables

---

## 📝 Default Credentials

### Test User:
- Mobile: `12345678910`
- PIN: `1234`

### Admin:
- Username: `admin`
- Password: `admin123`

---

## 🐛 Troubleshooting

1. **Database connection failed:**
   - Check if MySQL is running
   - Verify database credentials in `.env`
   - Make sure `banking_system` database exists

2. **Port already in use:**
   - Change PORT in `.env` file
   - Kill process using port 5000: `netstat -ano | findstr :5000`

3. **JWT errors:**
   - Generate a new JWT_SECRET in `.env`
   - Make sure token is sent in Authorization header

---

## 📦 Project Structure

```
backend/
├── config/
│   └── database.js          # MySQL connection
├── middleware/
│   └── auth.js              # JWT authentication
├── routes/
│   ├── auth.js              # Login/Register
│   ├── transactions.js      # Money operations
│   ├── loans.js             # Loan management
│   └── bills.js             # Bill payments
├── database/
│   └── schema.sql           # Database schema
├── .env                     # Environment variables
├── .gitignore
├── package.json
├── server.js                # Main server file
└── README.md
```

---

## 🚀 Next Steps

1. Install dependencies: `npm install`
2. Create database from `schema.sql`
3. Configure `.env` with your settings
4. Start server: `npm run dev`
5. Test API with Postman/Thunder Client
6. Connect frontend to backend APIs

---

## 📞 Support

For issues or questions, check the console logs for detailed error messages.
