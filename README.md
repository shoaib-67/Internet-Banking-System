# Payooo - Internet Banking System

A full-stack banking web app with separate portals for customers, managers, and admins. Built with Node.js, Express, MySQL, and a vanilla JS frontend.

## Portals

- Customer: account access, transactions, bills, and loans
- Manager: read-only monitoring and reports
- Admin: full user and system control(frzee, unfrzee and delete)

## Key Features

- Account registration and login
- Add money, cash out, transfers, and bill payments
- Loan eligibility, application, and repayment
- Transaction history and reporting
- Role-based access with JWT

## Tech Stack

- Backend: Node.js, Express, MySQL, JWT
- Frontend: HTML, Tailwind CSS, DaisyUI, Vanilla JS

## Quick Start

1. Start MySQL in XAMPP.
2. From the backend folder, install dependencies and run the server:

```bash
cd backend
npm install
npm run dev
```

3. Open the frontend in a browser (for example, open frontend/index.html).

## Demo Credentials

- Admin: admin / admin123
- Manager: manager / manager123

## Screenshots

![Screenshot 2026-04-03 161329](UI%20SS/Screenshot%202026-04-03%20161329.png)
![Screenshot 2026-04-03 161524](UI%20SS/Screenshot%202026-04-03%20161524.png)
![Screenshot 2026-04-03 161535](UI%20SS/Screenshot%202026-04-03%20161535.png)
![Screenshot 2026-04-03 161553](UI%20SS/Screenshot%202026-04-03%20161553.png)
![Screenshot 2026-04-03 161607](UI%20SS/Screenshot%202026-04-03%20161607.png)
![Screenshot 2026-04-03 161625](UI%20SS/Screenshot%202026-04-03%20161625.png)
![Screenshot 2026-04-03 161646](UI%20SS/Screenshot%202026-04-03%20161646.png)
![Screenshot 2026-04-03 161655](UI%20SS/Screenshot%202026-04-03%20161655.png)
![Screenshot 2026-04-03 161721](UI%20SS/Screenshot%202026-04-03%20161721.png)
![Screenshot 2026-04-03 161732](UI%20SS/Screenshot%202026-04-03%20161732.png)
![Screenshot 2026-04-03 161837](UI%20SS/Screenshot%202026-04-03%20161837.png)
![Screenshot 2026-04-03 161902](UI%20SS/Screenshot%202026-04-03%20161902.png)
![Screenshot 2026-04-03 161918](UI%20SS/Screenshot%202026-04-03%20161918.png)
![Screenshot 2026-04-03 161929](UI%20SS/Screenshot%202026-04-03%20161929.png)
![Screenshot 2026-04-03 161941](UI%20SS/Screenshot%202026-04-03%20161941.png)
![Screenshot 2026-04-03 162006](UI%20SS/Screenshot%202026-04-03%20162006.png)
![Screenshot 2026-04-03 162019](UI%20SS/Screenshot%202026-04-03%20162019.png)
![Screenshot 2026-04-03 162101](UI%20SS/Screenshot%202026-04-03%20162101.png)

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
