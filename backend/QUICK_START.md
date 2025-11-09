# Quick Start Guide - Internet Banking System Backend

## ✅ Step 1: Install MySQL (if not already installed)

Download and install MySQL from: https://dev.mysql.com/downloads/installer/

During installation:
- Set root password (remember it!)
- Keep default port 3306

---

## ✅ Step 2: Create Database

Open MySQL Command Line or MySQL Workbench and run:

```sql
CREATE DATABASE banking_system;
```

Then import the schema:
```bash
mysql -u root -p banking_system < database/schema.sql
```

Or manually copy-paste the content of `database/schema.sql` into MySQL Workbench/phpMyAdmin.

---

## ✅ Step 3: Configure Environment

Edit `.env` file and update your MySQL password:

```env
DB_PASSWORD=your_mysql_root_password
```

---

## ✅ Step 4: Start Backend Server

```bash
npm run dev
```

You should see:
```
✅ MySQL Database connected successfully!
🚀 Server running on http://localhost:5000
```

---

## ✅ Step 5: Test the API

Open browser and visit:
```
http://localhost:5000/api/health
```

You should see:
```json
{
  "status": "success",
  "message": "Internet Banking API is running!",
  "timestamp": "..."
}
```

---

## 🔗 Connect Frontend to Backend

In your frontend JavaScript files, replace localStorage logic with API calls:

### Example: Login
```javascript
async function login(mobile, pin) {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ mobile, pin })
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    localStorage.setItem('token', data.data.token);
    localStorage.setItem('user', JSON.stringify(data.data.user));
    window.location.href = 'home.html';
  } else {
    alert(data.message);
  }
}
```

### Example: Add Money
```javascript
async function addMoney(amount, pin) {
  const token = localStorage.getItem('token');
  
  const response = await fetch('http://localhost:5000/api/transactions/add-money', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ amount, pin })
  });
  
  const data = await response.json();
  
  if (data.status === 'success') {
    alert(`Money added! New balance: $${data.data.newBalance}`);
  } else {
    alert(data.message);
  }
}
```

---

## 🎯 API Testing with Postman/Thunder Client

### 1. Register User
```
POST http://localhost:5000/api/auth/register
Body:
{
  "name": "Test User",
  "email": "test@example.com",
  "mobile": "1234567890",
  "pin": "1234",
  "confirmPin": "1234"
}
```

### 2. Login
```
POST http://localhost:5000/api/auth/login
Body:
{
  "mobile": "1234567890",
  "pin": "1234"
}
```

Copy the `token` from response.

### 3. Add Money (with token)
```
POST http://localhost:5000/api/transactions/add-money
Headers:
Authorization: Bearer <paste-token-here>
Body:
{
  "amount": 1000,
  "pin": "1234"
}
```

---

## 🔧 Common Commands

```bash
# Install dependencies
npm install

# Start development server (auto-reload)
npm run dev

# Start production server
npm start

# View running processes
netstat -ano | findstr :5000

# Stop MySQL (if needed)
net stop MySQL80
```

---

## 📝 Important Notes

1. ✅ Backend is now installed and ready
2. ⚠️ You need to install MySQL and create the database
3. ⚠️ Update `.env` with your MySQL password
4. ⚠️ Frontend needs to be updated to use these APIs
5. ✅ All your banking features are now API-ready!

---

## 🚨 Troubleshooting

**Error: "Cannot connect to database"**
- Make sure MySQL is running
- Check password in `.env`
- Verify database `banking_system` exists

**Error: "Port 5000 already in use"**
- Change PORT in `.env` to 5001
- Or kill the process: `Stop-Process -Id (Get-NetTCPConnection -LocalPort 5000).OwningProcess`

**Error: "JWT token invalid"**
- Token expired (24 hours)
- Get new token by logging in again

---

## ✨ What's Next?

1. ✅ Backend setup complete
2. 📱 Update frontend to use API calls
3. 🔐 Replace localStorage with JWT tokens
4. 🎨 Add loading states in frontend
5. 🚀 Deploy to production (Heroku/Railway for backend, Netlify/Vercel for frontend)

---

**Need help? Check the full documentation in `README.md`**
