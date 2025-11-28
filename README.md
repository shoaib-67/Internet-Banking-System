# Payooo - Internet Banking System

A comprehensive full-stack web-based banking application built with Node.js, Express.js, MySQL, and vanilla JavaScript. The system provides separate portals for customers, managers, and administrators with role-based access control.

---

##  Features

###  Customer Portal

#### Account Management
- **User Registration**: Create new accounts with personal information (name, email, phone, address, date of birth)
- **Secure Login**: Phone number and account number-based authentication
- **Account Dashboard**: View real-time account balance and account details
- **Profile Management**: View customer information

#### Financial Transactions
- **Add Money**: Deposit funds using bank details (bank name, account number, amount)
- **Cash Out**: Withdraw money through agent system with agent number verification
- **Money Transfer**: Send money to other Payooo accounts using account numbers
- **Transaction History**: View complete transaction history with detailed information
  - Transaction type indicators (Add Money, Cash Out, Loan Taken, Loan Payment)
  - Color-coded amounts (green for credit, red for debit)
  - Visual icons (+ for credits, - for debits)
  - Date and status information

#### Bill Payment System
- **Pay Bills**: Pay utility bills and other services
- **Reference Number**: Track payments with unique reference numbers
- **Bill History**: View all past bill payments

#### Loan Management
- **Loan Eligibility Check**: Check eligibility before applying
  - Maximum 3 active loans allowed simultaneously
  - Maximum total outstanding balance: 3,000
  - Available credit display
- **Loan Application**: Apply for different types of loans
  - Personal loans
  - Business loans
  - Education loans
  - Interest rates calculated automatically
- **Active Loans View**: Monitor all active loans with:
  - Loan amount
  - Remaining balance
  - Interest rate
  - Loan type and status
- **Loan Repayment**: Pay loan installments or full amounts
- **Loan History**: Complete history of all loans taken

---

### Manager Portal

#### View-Only Dashboard
- **Dashboard Statistics**:
  - Total users count
  - Total transactions processed
  - Active loans count
  - Total system balance

#### User Management (Read-Only)
- View all customer accounts
- Search functionality (by name, phone, or account number)
- View customer details including:
  - Account information
  - Transaction history (last 10 transactions)
  - Active loans
  - Balance statistics

#### Transaction Monitoring
- View all system transactions (last 100)
- Filter and search transactions
- Transaction details with amounts and dates

#### Loan Monitoring
- View all active loans in the system
- Loan details including amounts and remaining balances

#### Report Generation
- **Daily Reports**: Today's transaction summary
- **Monthly Reports**: Current month's transaction analysis with type breakdown
- **User Reports**: Complete user list with balances and statistics
- **Loan Reports**: Active loans summary with type analysis
- **Download Reports**: Export reports as text files

---

### Admin Portal

#### Full Administrative Control
- **Dashboard Statistics**: Same as Manager plus additional metrics
- **Complete System Overview**: Monitor entire banking operations

#### Advanced User Management
- **View All Users**: Complete customer list with status indicators
- **Account Status Management**:
  - **Freeze Account**: Temporarily suspend account access (converts to "Frozen" status)
  - **Unfreeze Account**: Restore frozen accounts to active status
  - **Approve Account**: Activate pending new accounts
  - **Delete Account**: Permanently remove accounts and all associated data
    - Deletes transactions, loans, repayments, and customer records
    - Requires double confirmation (type "DELETE")
    - Uses database transactions for data integrity
- **Search & Filter**: Find users by account number, name, or phone
- **User Details Modal**: View comprehensive customer information

#### Transaction Management
- View all system transactions
- Monitor transaction status and operations
- Transaction history with full details

#### Loan Management
- View all active loans
- Monitor loan statuses
- Track remaining balances

#### Report Generation
- Same comprehensive reporting as Manager
- Additional administrative insights

---

## Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MySQL (via XAMPP)
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **Middleware**: CORS enabled for cross-origin requests

### Frontend
- **HTML5**: Semantic markup
- **CSS Framework**: Tailwind CSS
- **Component Library**: DaisyUI
- **Icons**: Font Awesome
- **JavaScript**: Vanilla ES6+
- **API Communication**: Fetch API with async/await

### Database
- **MySQL Database**: team06
- **Tables**: 
  - `customer` - User information
  - `account` - Account details and balances
  - `loan` - Loan information
  - `takes` - Loan assignment records
  - `repayment` - Loan repayment tracking
  - `payment_service` - Transaction records
  - `records` - Transaction history
  - `employee` - Staff credentials

---

## Security Features

- JWT-based authentication with token expiration (24 hours)
- Role-based access control (Customer, Manager, Admin)
- Password validation and secure login
- Protected API routes with authentication middleware
- Phone number and account number validation
- Email format validation
- Transaction authorization checks
- Separate authentication for each user type

---

## Transaction System

### Transaction Types
1. **Deposit** (Add Money)
   - Credit operation
   - Requires bank details
   - Updates account balance

2. **Withdrawal** (Cash Out)
   - Debit operation
   - Requires agent verification
   - PIN validation

3. **Transfer** (Send Money)
   - Debit from sender, credit to receiver
   - Requires valid account numbers
   - Real-time balance updates

4. **Loan Approval**
   - Credit operation
   - Loan amount added to balance
   - Creates repayment schedule

5. **Loan Repayment**
   - Debit operation
   - Updates remaining loan balance
   - Tracks payment history

6. **Bills**
   - Payment processing
   - Reference number tracking
   - Payment history maintenance

---

## Loan System Rules

- **Maximum Active Loans**: 3 loans at any time
- **Maximum Total Balance**: 3,000 across all active loans
- **Available Credit**: Calculated as (3,000 - current outstanding balance)
- **Interest Rates**: Varies by loan type (Personal, Business, Education)
- **Repayment Tracking**: Real-time remaining balance updates
- **Eligibility Check**: Automatic validation before loan approval

---

## User Roles & Credentials

### Customer
- **Login**: Phone number + Account number
- **Registration**: Open to public
- **Format**: 
  - Phone: 01XXXXXXXXX (11 digits)
  - Account: ACC0000 (ACC + 4 digits)

### Manager
- **Login**: manager / manager123
- **Permissions**: View-only access to all data
- **Alternative**: Any employee credentials from employee table

### Admin
- **Login**: admin / admin123
- **Permissions**: Full system control
- **Alternative**: Any employee credentials from employee table

---

## User Interface Features

- Responsive design for all screen sizes
- Modern card-based layout with DaisyUI components
- Color-coded transaction indicators
- Modal dialogs for detailed views
- Dropdown menus for user actions
- Search and filter functionality
- Loading states and error handling
- Success/error notifications
- Confirmation dialogs for critical actions

---

## Dashboard Features

### Customer Dashboard
- Balance display card
- Quick action buttons (Add Money, Cash Out, Transfer, Pay Bills)
- Loan management section
- Transaction history table with filters
- Logout functionality

### Manager Dashboard
- 4 statistics cards
- Tabbed interface (Users, Transactions, Loans, Reports)
- Search functionality
- Report generation tools
- User details modal

### Admin Dashboard
- Same as Manager Dashboard
- Plus: User management dropdown actions
- Account status controls (Freeze/Unfreeze/Approve/Delete)
- Enhanced user details view

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Customer registration
- `POST /api/auth/login` - Customer login
- `POST /api/auth/admin-login` - Admin login
- `POST /api/auth/manager-login` - Manager login

### Transactions
- `GET /api/transactions/balance` - Get account balance
- `POST /api/transactions/add-money` - Deposit funds
- `POST /api/transactions/cash-out` - Withdraw funds
- `POST /api/transactions/transfer` - Transfer money
- `GET /api/transactions/history` - Transaction history

### Loans
- `GET /api/loans/eligibility` - Check loan eligibility
- `POST /api/loans/take-loan` - Apply for loan
- `GET /api/loans/active` - Get active loans
- `POST /api/loans/pay-loan` - Make loan payment
- `GET /api/loans/history` - Loan history

### Bills
- `POST /api/bills/pay` - Pay bills
- `GET /api/bills/history` - Bill payment history

### Admin
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/users` - All users
- `GET /api/admin/transactions` - All transactions
- `GET /api/admin/loans` - All loans
- `PUT /api/admin/users/:accountNo/freeze` - Freeze/unfreeze account
- `PUT /api/admin/users/:accountNo/approve` - Approve account
- `DELETE /api/admin/users/:accountNo` - Delete account

### Manager
- `GET /api/manager/stats` - Dashboard statistics
- `GET /api/manager/users` - All users (read-only)
- `GET /api/manager/transactions` - All transactions (read-only)
- `GET /api/manager/loans` - All loans (read-only)

---

## Project Structure

```
Internet_Banking_System/
├── backend/
│   ├── config/
│   │   └── database.js          # MySQL connection
│   ├── middleware/
│   │   └── auth.js              # JWT authentication middleware
│   ├── routes/
│   │   ├── auth.js              # Authentication routes
│   │   ├── transactions.js      # Transaction routes
│   │   ├── loans.js             # Loan routes
│   │   ├── bills.js             # Bill payment routes
│   │   ├── admin.js             # Admin routes
│   │   ├── manager.js           # Manager routes
│   │   └── employees.js         # Employee routes
│   ├── utils/
│   │   └── validation.js        # Input validation utilities
│   ├── .env                     # Environment variables
│   ├── server.js                # Express server entry point
│   └── package.json             # Backend dependencies
│
├── frontend/
│   ├── assets/                  # Images and static files
│   ├── index.html               # Customer login page
│   ├── script.js                # Customer login logic
│   ├── create-account.html      # Registration page
│   ├── home.html                # Customer dashboard
│   ├── home.js                  # Customer dashboard logic
│   ├── admin-login.html         # Admin login page
│   ├── admin-login.js           # Admin login logic
│   ├── admin-dashboard.html     # Admin dashboard
│   ├── admin-dashboard.js       # Admin dashboard logic
│   ├── manager-login.html       # Manager login page
│   ├── manager-login.js         # Manager login logic
│   ├── manager-dashboard.html   # Manager dashboard
│   ├── manager-dashboard.js     # Manager dashboard logic
│   ├── config.js                # API configuration
│   └── tailwind.config.js       # Tailwind CSS config
│
└── README.md                    # This file
```

---

## Features Summary

### Implemented Features
- [x] User registration and authentication
- [x] Customer dashboard with balance display
- [x] Money transactions (Add, Cash Out, Transfer)
- [x] Bill payment system
- [x] Loan management with eligibility checks
- [x] Transaction history with visual indicators
- [x] Manager portal with view-only access
- [x] Admin portal with full control
- [x] User management (Freeze/Unfreeze/Approve/Delete)
- [x] Report generation (Daily/Monthly/User/Loan)
- [x] Role-based access control
- [x] JWT authentication
- [x] Responsive design
- [x] Search and filter functionality
- [x] Modal dialogs for detailed views
- [x] Confirmation dialogs for critical actions

---

## 🔮 Future Enhancements

- Email notifications for transactions
- OTP-based authentication
- Transaction limits and spending controls
- Multiple account types (Savings, Current)
- Interest calculation for savings accounts
- Scheduled/recurring payments
- Export reports to PDF/CSV
- Advanced analytics dashboard
- Mobile app development
- Biometric authentication
- Multi-language support

---

## License

This project is developed for educational purposes.

---

## Notes

- All monetary values are stored with 2 decimal precision
- Transactions use database transactions for atomicity
- Foreign key constraints ensure data integrity
- JWT tokens expire after 24 hours
- Default starting balance: 1,000
- Account numbers auto-generated: ACC0001, ACC0002, etc.

---
