// Check if admin is logged in
const token = localStorage.getItem('token');
const isAdmin = localStorage.getItem('isAdmin');
const adminName = localStorage.getItem('adminName') || 'Admin';

if (!token || !isAdmin) {
    window.location.href = './admin-login.html';
}

// Display admin name
document.getElementById('admin-name').textContent = adminName;

// Logout
document.getElementById('logout-btn').addEventListener('click', () => {
    localStorage.clear();
    window.location.href = './admin-login.html';
});

// Tab switching
const tabs = {
    'users-tab': 'users-section',
    'transactions-tab': 'transactions-section',
    'loans-tab': 'loans-section',
    'reports-tab': 'reports-section'
};

Object.keys(tabs).forEach(tabId => {
    document.getElementById(tabId).addEventListener('click', function() {
        // Hide all sections
        Object.values(tabs).forEach(sectionId => {
            document.getElementById(sectionId).style.display = 'none';
        });
        
        // Remove active class from all tabs
        Object.keys(tabs).forEach(id => {
            document.getElementById(id).classList.remove('tab-active');
        });
        
        // Show selected section
        document.getElementById(tabs[tabId]).style.display = 'block';
        this.classList.add('tab-active');
        
        // Load data for the section
        if (tabId === 'users-tab') loadUsers();
        else if (tabId === 'transactions-tab') loadTransactions();
        else if (tabId === 'loans-tab') loadLoans();
    });
});

// Load dashboard stats
async function loadDashboardStats() {
    try {
        const stats = await apiCall('/admin/stats', 'GET');
        if (stats.status === 'success') {
            document.getElementById('total-users').textContent = stats.data.totalUsers || 0;
            document.getElementById('total-transactions').textContent = stats.data.totalTransactions || 0;
            document.getElementById('active-loans').textContent = stats.data.activeLoans || 0;
            document.getElementById('total-balance').textContent = parseFloat(stats.data.totalBalance || 0).toFixed(2);
        }
    } catch (error) {
        console.error('Failed to load stats:', error);
    }
}

// Load users
async function loadUsers() {
    try {
        const result = await apiCall('/admin/users', 'GET');
        const tbody = document.getElementById('users-table-body');
        
        if (result.status === 'success' && result.data.users.length > 0) {
            tbody.innerHTML = result.data.users.map(user => {
                const statusBadge = user.status === 'Active' ? 'badge-success' : 
                                   user.status === 'Frozen' ? 'badge-warning' : 
                                   user.status === 'Pending' ? 'badge-info' : 'badge-error';
                
                return `
                    <tr>
                        <td>${user.accountNo}</td>
                        <td>${user.name}</td>
                        <td>${user.phone}</td>
                        <td class="font-bold text-green-600">৳${parseFloat(user.balance).toFixed(2)}</td>
                        <td><span class="badge ${statusBadge}">${user.status}</span></td>
                        <td>
                            <div class="dropdown dropdown-end">
                                <button class="btn btn-xs btn-ghost" tabindex="0">
                                    <i class="fas fa-ellipsis-v"></i>
                                </button>
                                <ul tabindex="0" class="dropdown-content menu p-2 shadow bg-base-100 rounded-box w-52 z-10">
                                    <li><a onclick="viewUserDetails('${user.accountNo}')"><i class="fas fa-eye"></i> View Details</a></li>
                                    ${user.status === 'Pending' ? `
                                        <li><a onclick="approveAccount('${user.accountNo}')" class="text-success"><i class="fas fa-check"></i> Approve Account</a></li>
                                    ` : ''}
                                    ${user.status === 'Active' ? `
                                        <li><a onclick="freezeAccount('${user.accountNo}', true)" class="text-warning"><i class="fas fa-lock"></i> Freeze Account</a></li>
                                    ` : ''}
                                    ${user.status === 'Frozen' ? `
                                        <li><a onclick="freezeAccount('${user.accountNo}', false)" class="text-success"><i class="fas fa-unlock"></i> Unfreeze Account</a></li>
                                    ` : ''}
                                    ${user.status !== 'Closed' ? `
                                        <li><a onclick="closeAccount('${user.accountNo}')" class="text-error"><i class="fas fa-trash"></i> Delete Account</a></li>
                                    ` : ''}
                                </ul>
                            </div>
                        </td>
                    </tr>
                `;
            }).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No users found</td></tr>';
        }
    } catch (error) {
        console.error('Failed to load users:', error);
        document.getElementById('users-table-body').innerHTML = '<tr><td colspan="6" class="text-center text-red-500">Failed to load users</td></tr>';
    }
}

// Load transactions
async function loadTransactions() {
    try {
        const result = await apiCall('/admin/transactions', 'GET');
        const tbody = document.getElementById('transactions-table-body');
        
        if (result.status === 'success' && result.data.transactions.length > 0) {
            tbody.innerHTML = result.data.transactions.map(tx => `
                <tr>
                    <td>${new Date(tx.date).toLocaleString()}</td>
                    <td>${tx.accountNo}</td>
                    <td><span class="badge badge-primary">${tx.type}</span></td>
                    <td class="font-bold ${tx.operation === 'Credit' ? 'text-green-600' : 'text-red-600'}">
                        ${tx.operation === 'Credit' ? '+' : '-'}৳${parseFloat(tx.amount).toFixed(2)}
                    </td>
                    <td><span class="badge badge-success">${tx.status}</span></td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="5" class="text-center">No transactions found</td></tr>';
        }
    } catch (error) {
        console.error('Failed to load transactions:', error);
        document.getElementById('transactions-table-body').innerHTML = '<tr><td colspan="5" class="text-center text-red-500">Failed to load transactions</td></tr>';
    }
}

// Load loans
async function loadLoans() {
    try {
        const result = await apiCall('/admin/loans', 'GET');
        const tbody = document.getElementById('loans-table-body');
        
        if (result.status === 'success' && result.data.loans.length > 0) {
            tbody.innerHTML = result.data.loans.map(loan => `
                <tr>
                    <td>${loan.loanId}</td>
                    <td>${loan.accountNo}</td>
                    <td>${loan.type}</td>
                    <td class="font-bold">৳${parseFloat(loan.amount).toFixed(2)}</td>
                    <td class="font-bold text-orange-600">৳${parseFloat(loan.remaining).toFixed(2)}</td>
                    <td><span class="badge badge-warning">${loan.status}</span></td>
                </tr>
            `).join('');
        } else {
            tbody.innerHTML = '<tr><td colspan="6" class="text-center">No active loans</td></tr>';
        }
    } catch (error) {
        console.error('Failed to load loans:', error);
        document.getElementById('loans-table-body').innerHTML = '<tr><td colspan="6" class="text-center text-red-500">Failed to load loans</td></tr>';
    }
}

// View user details
async function viewUserDetails(accountNo) {
    const modal = document.getElementById('user-details-modal');
    const content = document.getElementById('user-details-content');
    
    // Show loading
    content.innerHTML = '<div class="loading loading-spinner loading-lg mx-auto"></div>';
    modal.showModal();
    
    try {
        // Fetch all data
        const [usersResult, transactionsResult, loansResult] = await Promise.all([
            apiCall('/admin/users', 'GET'),
            apiCall('/admin/transactions', 'GET'),
            apiCall('/admin/loans', 'GET')
        ]);
        
        const user = usersResult.data.users.find(u => u.accountNo === accountNo);
        if (!user) {
            content.innerHTML = '<div class="alert alert-error"><span>User not found</span></div>';
            return;
        }
        
        const userTransactions = transactionsResult.data.transactions.filter(t => 
            t.accountNo === accountNo
        );
        
        const userLoans = loansResult.data.loans.filter(l => 
            l.accountNo === accountNo
        );
        
        // Calculate total transaction amount
        const totalDebit = userTransactions
            .filter(t => t.operation === 'Debit')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        const totalCredit = userTransactions
            .filter(t => t.operation === 'Credit')
            .reduce((sum, t) => sum + parseFloat(t.amount), 0);
        
        // Display user details
        content.innerHTML = `
            <div class="bg-blue-50 p-4 rounded-lg">
                <h4 class="font-semibold mb-2">Account Information</h4>
                <div class="grid grid-cols-2 gap-2 text-sm">
                    <div><strong>Account Number:</strong> ${user.accountNo}</div>
                    <div><strong>Name:</strong> ${user.name}</div>
                    <div><strong>Phone:</strong> ${user.phone}</div>
                    <div><strong>Balance:</strong> <span class="text-green-600 font-bold">৳${parseFloat(user.balance).toFixed(2)}</span></div>
                </div>
            </div>
            
            <div class="stats shadow w-full">
                <div class="stat">
                    <div class="stat-title">Total Transactions</div>
                    <div class="stat-value text-primary text-2xl">${userTransactions.length}</div>
                </div>
                <div class="stat">
                    <div class="stat-title">Total Credit</div>
                    <div class="stat-value text-success text-2xl">৳${totalCredit.toFixed(2)}</div>
                </div>
                <div class="stat">
                    <div class="stat-title">Total Debit</div>
                    <div class="stat-value text-error text-2xl">৳${totalDebit.toFixed(2)}</div>
                </div>
            </div>
            
            <div class="bg-yellow-50 p-4 rounded-lg">
                <h4 class="font-semibold mb-2">Recent Transactions (Last 10)</h4>
                <div class="overflow-x-auto max-h-64">
                    <table class="table table-sm table-zebra">
                        <thead class="sticky top-0 bg-yellow-100">
                            <tr>
                                <th>Date</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${userTransactions.slice(0, 10).map(t => `
                                <tr>
                                    <td>${new Date(t.date).toLocaleDateString()}</td>
                                    <td><span class="badge badge-sm badge-primary">${t.type}</span></td>
                                    <td class="${t.operation === 'Credit' ? 'text-green-600' : 'text-red-600'} font-bold">
                                        ${t.operation === 'Credit' ? '+' : '-'}৳${parseFloat(t.amount).toFixed(2)}
                                    </td>
                                    <td><span class="badge badge-sm badge-success">${t.status}</span></td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" class="text-center">No transactions</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
            
            <div class="bg-red-50 p-4 rounded-lg">
                <h4 class="font-semibold mb-2">Active Loans</h4>
                <div class="overflow-x-auto">
                    <table class="table table-sm table-zebra">
                        <thead>
                            <tr>
                                <th>Loan ID</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Remaining</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${userLoans.map(l => `
                                <tr>
                                    <td>${l.loanId}</td>
                                    <td>${l.type}</td>
                                    <td>৳${parseFloat(l.amount).toFixed(2)}</td>
                                    <td class="text-orange-600 font-bold">৳${parseFloat(l.remaining).toFixed(2)}</td>
                                    <td><span class="badge badge-sm badge-warning">${l.status}</span></td>
                                </tr>
                            `).join('') || '<tr><td colspan="5" class="text-center">No active loans</td></tr>'}
                        </tbody>
                    </table>
                </div>
            </div>
        `;
        
    } catch (error) {
        console.error('Error loading user details:', error);
        content.innerHTML = `
            <div class="alert alert-error">
                <span>Failed to load user details. Please try again.</span>
            </div>
        `;
    }
}

// Store report data for download
let currentReportData = null;
let currentReportTitle = '';

// Generate reports
async function generateReport(type) {
    const reportOutput = document.getElementById('report-output');
    const reportTitle = document.getElementById('report-title');
    const reportContent = document.getElementById('report-content');
    
    reportOutput.style.display = 'block';
    reportTitle.textContent = 'Generating Report...';
    reportContent.innerHTML = '<div class="loading loading-spinner loading-lg mx-auto"></div>';
    
    try {
        const [usersResult, transactionsResult, loansResult] = await Promise.all([
            apiCall('/admin/users', 'GET'),
            apiCall('/admin/transactions', 'GET'),
            apiCall('/admin/loans', 'GET')
        ]);
        
        const users = usersResult.data.users;
        const transactions = transactionsResult.data.transactions;
        const loans = loansResult.data.loans;
        
        let reportHTML = '';
        let reportData = '';
        
        const today = new Date();
        const todayStr = today.toLocaleDateString();
        
        if (type === 'daily') {
            currentReportTitle = `Daily Report - ${todayStr}`;
            reportTitle.textContent = currentReportTitle;
            
            const todayTransactions = transactions.filter(t => {
                const txDate = new Date(t.date);
                return txDate.toDateString() === today.toDateString();
            });
            
            const totalAmount = todayTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const creditAmount = todayTransactions.filter(t => t.operation === 'Credit').reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const debitAmount = todayTransactions.filter(t => t.operation === 'Debit').reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            reportHTML = `
                <div class="stats stats-vertical lg:stats-horizontal shadow w-full mb-4">
                    <div class="stat">
                        <div class="stat-title">Total Transactions</div>
                        <div class="stat-value text-primary">${todayTransactions.length}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Total Credit</div>
                        <div class="stat-value text-success">৳${creditAmount.toFixed(2)}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Total Debit</div>
                        <div class="stat-value text-error">৳${debitAmount.toFixed(2)}</div>
                    </div>
                </div>
                <div class="overflow-x-auto max-h-96">
                    <table class="table table-sm table-zebra">
                        <thead class="sticky top-0 bg-base-200">
                            <tr>
                                <th>Time</th>
                                <th>Account</th>
                                <th>Type</th>
                                <th>Amount</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${todayTransactions.map(t => `
                                <tr>
                                    <td>${new Date(t.date).toLocaleTimeString()}</td>
                                    <td>${t.accountNo}</td>
                                    <td><span class="badge badge-sm">${t.type}</span></td>
                                    <td class="${t.operation === 'Credit' ? 'text-green-600' : 'text-red-600'}">
                                        ${t.operation === 'Credit' ? '+' : '-'}৳${parseFloat(t.amount).toFixed(2)}
                                    </td>
                                </tr>
                            `).join('') || '<tr><td colspan="4" class="text-center">No transactions today</td></tr>'}
                        </tbody>
                    </table>
                </div>
            `;
            
            reportData = `Daily Report - ${todayStr}\n\n`;
            reportData += `Total Transactions: ${todayTransactions.length}\n`;
            reportData += `Total Credit: ৳${creditAmount.toFixed(2)}\n`;
            reportData += `Total Debit: ৳${debitAmount.toFixed(2)}\n\n`;
            reportData += `Time\tAccount\tType\tAmount\n`;
            todayTransactions.forEach(t => {
                reportData += `${new Date(t.date).toLocaleTimeString()}\t${t.accountNo}\t${t.type}\t${t.operation === 'Credit' ? '+' : '-'}৳${parseFloat(t.amount).toFixed(2)}\n`;
            });
            
        } else if (type === 'monthly') {
            const currentMonth = today.getMonth();
            const currentYear = today.getFullYear();
            currentReportTitle = `Monthly Report - ${today.toLocaleString('default', { month: 'long', year: 'numeric' })}`;
            reportTitle.textContent = currentReportTitle;
            
            const monthTransactions = transactions.filter(t => {
                const txDate = new Date(t.date);
                return txDate.getMonth() === currentMonth && txDate.getFullYear() === currentYear;
            });
            
            const totalAmount = monthTransactions.reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const creditAmount = monthTransactions.filter(t => t.operation === 'Credit').reduce((sum, t) => sum + parseFloat(t.amount), 0);
            const debitAmount = monthTransactions.filter(t => t.operation === 'Debit').reduce((sum, t) => sum + parseFloat(t.amount), 0);
            
            // Group by type
            const typeStats = {};
            monthTransactions.forEach(t => {
                if (!typeStats[t.type]) {
                    typeStats[t.type] = { count: 0, amount: 0 };
                }
                typeStats[t.type].count++;
                typeStats[t.type].amount += parseFloat(t.amount);
            });
            
            reportHTML = `
                <div class="stats stats-vertical lg:stats-horizontal shadow w-full mb-4">
                    <div class="stat">
                        <div class="stat-title">Total Transactions</div>
                        <div class="stat-value text-primary">${monthTransactions.length}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Total Credit</div>
                        <div class="stat-value text-success">৳${creditAmount.toFixed(2)}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Total Debit</div>
                        <div class="stat-value text-error">৳${debitAmount.toFixed(2)}</div>
                    </div>
                </div>
                <h4 class="font-bold mb-2">Transaction Types Summary</h4>
                <div class="grid grid-cols-2 md:grid-cols-4 gap-2 mb-4">
                    ${Object.entries(typeStats).map(([type, stats]) => `
                        <div class="card bg-base-100 shadow-sm">
                            <div class="card-body p-3">
                                <h5 class="text-xs font-semibold">${type}</h5>
                                <p class="text-sm">Count: ${stats.count}</p>
                                <p class="text-sm font-bold">৳${stats.amount.toFixed(2)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
            `;
            
            reportData = `Monthly Report - ${today.toLocaleString('default', { month: 'long', year: 'numeric' })}\n\n`;
            reportData += `Total Transactions: ${monthTransactions.length}\n`;
            reportData += `Total Credit: ৳${creditAmount.toFixed(2)}\n`;
            reportData += `Total Debit: ৳${debitAmount.toFixed(2)}\n\n`;
            reportData += `Transaction Types:\n`;
            Object.entries(typeStats).forEach(([type, stats]) => {
                reportData += `${type}: ${stats.count} transactions, ৳${stats.amount.toFixed(2)}\n`;
            });
            
        } else if (type === 'users') {
            currentReportTitle = `Users Report - ${todayStr}`;
            reportTitle.textContent = currentReportTitle;
            
            const totalBalance = users.reduce((sum, u) => sum + parseFloat(u.balance), 0);
            const avgBalance = users.length > 0 ? totalBalance / users.length : 0;
            
            reportHTML = `
                <div class="stats stats-vertical lg:stats-horizontal shadow w-full mb-4">
                    <div class="stat">
                        <div class="stat-title">Total Users</div>
                        <div class="stat-value text-primary">${users.length}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Total Balance</div>
                        <div class="stat-value text-success">৳${totalBalance.toFixed(2)}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Average Balance</div>
                        <div class="stat-value text-info">৳${avgBalance.toFixed(2)}</div>
                    </div>
                </div>
                <div class="overflow-x-auto max-h-96">
                    <table class="table table-sm table-zebra">
                        <thead class="sticky top-0 bg-base-200">
                            <tr>
                                <th>Account</th>
                                <th>Name</th>
                                <th>Phone</th>
                                <th>Balance</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${users.map(u => `
                                <tr>
                                    <td>${u.accountNo}</td>
                                    <td>${u.name}</td>
                                    <td>${u.phone}</td>
                                    <td class="font-bold text-green-600">৳${parseFloat(u.balance).toFixed(2)}</td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            reportData = `Users Report - ${todayStr}\n\n`;
            reportData += `Total Users: ${users.length}\n`;
            reportData += `Total Balance: ৳${totalBalance.toFixed(2)}\n`;
            reportData += `Average Balance: ৳${avgBalance.toFixed(2)}\n\n`;
            reportData += `Account\tName\tPhone\tBalance\n`;
            users.forEach(u => {
                reportData += `${u.accountNo}\t${u.name}\t${u.phone}\t৳${parseFloat(u.balance).toFixed(2)}\n`;
            });
            
        } else if (type === 'loans') {
            currentReportTitle = `Loans Report - ${todayStr}`;
            reportTitle.textContent = currentReportTitle;
            
            const totalLoanAmount = loans.reduce((sum, l) => sum + parseFloat(l.amount), 0);
            const totalRemaining = loans.reduce((sum, l) => sum + parseFloat(l.remaining), 0);
            const totalRepaid = totalLoanAmount - totalRemaining;
            
            // Group by type
            const loansByType = {};
            loans.forEach(l => {
                if (!loansByType[l.type]) {
                    loansByType[l.type] = { count: 0, amount: 0, remaining: 0 };
                }
                loansByType[l.type].count++;
                loansByType[l.type].amount += parseFloat(l.amount);
                loansByType[l.type].remaining += parseFloat(l.remaining);
            });
            
            reportHTML = `
                <div class="stats stats-vertical lg:stats-horizontal shadow w-full mb-4">
                    <div class="stat">
                        <div class="stat-title">Active Loans</div>
                        <div class="stat-value text-primary">${loans.length}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Total Loan Amount</div>
                        <div class="stat-value text-warning">৳${totalLoanAmount.toFixed(2)}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Total Remaining</div>
                        <div class="stat-value text-error">৳${totalRemaining.toFixed(2)}</div>
                    </div>
                    <div class="stat">
                        <div class="stat-title">Total Repaid</div>
                        <div class="stat-value text-success">৳${totalRepaid.toFixed(2)}</div>
                    </div>
                </div>
                <h4 class="font-bold mb-2">Loans by Type</h4>
                <div class="grid grid-cols-2 md:grid-cols-3 gap-2 mb-4">
                    ${Object.entries(loansByType).map(([type, stats]) => `
                        <div class="card bg-base-100 shadow-sm">
                            <div class="card-body p-3">
                                <h5 class="text-xs font-semibold">${type}</h5>
                                <p class="text-sm">Count: ${stats.count}</p>
                                <p class="text-sm">Amount: ৳${stats.amount.toFixed(2)}</p>
                                <p class="text-sm text-error">Remaining: ৳${stats.remaining.toFixed(2)}</p>
                            </div>
                        </div>
                    `).join('')}
                </div>
                <div class="overflow-x-auto max-h-96">
                    <table class="table table-sm table-zebra">
                        <thead class="sticky top-0 bg-base-200">
                            <tr>
                                <th>Loan ID</th>
                                <th>Account</th>
                                <th>Type</th>
                                <th>Amount</th>
                                <th>Remaining</th>
                                <th>Status</th>
                            </tr>
                        </thead>
                        <tbody>
                            ${loans.map(l => `
                                <tr>
                                    <td>${l.loanId}</td>
                                    <td>${l.accountNo}</td>
                                    <td>${l.type}</td>
                                    <td>৳${parseFloat(l.amount).toFixed(2)}</td>
                                    <td class="font-bold text-orange-600">৳${parseFloat(l.remaining).toFixed(2)}</td>
                                    <td><span class="badge badge-sm badge-warning">${l.status}</span></td>
                                </tr>
                            `).join('')}
                        </tbody>
                    </table>
                </div>
            `;
            
            reportData = `Loans Report - ${todayStr}\n\n`;
            reportData += `Active Loans: ${loans.length}\n`;
            reportData += `Total Loan Amount: ৳${totalLoanAmount.toFixed(2)}\n`;
            reportData += `Total Remaining: ৳${totalRemaining.toFixed(2)}\n`;
            reportData += `Total Repaid: ৳${totalRepaid.toFixed(2)}\n\n`;
            reportData += `Loans by Type:\n`;
            Object.entries(loansByType).forEach(([type, stats]) => {
                reportData += `${type}: ${stats.count} loans, Amount: ৳${stats.amount.toFixed(2)}, Remaining: ৳${stats.remaining.toFixed(2)}\n`;
            });
            reportData += `\nLoan ID\tAccount\tType\tAmount\tRemaining\tStatus\n`;
            loans.forEach(l => {
                reportData += `${l.loanId}\t${l.accountNo}\t${l.type}\t৳${parseFloat(l.amount).toFixed(2)}\t৳${parseFloat(l.remaining).toFixed(2)}\t${l.status}\n`;
            });
        }
        
        reportContent.innerHTML = reportHTML;
        currentReportData = reportData;
        
    } catch (error) {
        console.error('Error generating report:', error);
        reportTitle.textContent = 'Error';
        reportContent.innerHTML = '<div class="alert alert-error"><span>Failed to generate report. Please try again.</span></div>';
    }
}

// Download report as text file
function downloadReport() {
    if (!currentReportData) {
        alert('No report data available to download');
        return;
    }
    
    const blob = new Blob([currentReportData], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${currentReportTitle.replace(/\s+/g, '_')}.txt`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);
}

// Freeze/Unfreeze account
async function freezeAccount(accountNo, freeze) {
    const action = freeze ? 'freeze' : 'unfreeze';
    if (!confirm(`Are you sure you want to ${action} account ${accountNo}?`)) {
        return;
    }
    
    try {
        const result = await apiCall(`/admin/users/${accountNo}/freeze`, 'PUT', { freeze });
        
        if (result.status === 'success') {
            alert(result.message);
            loadUsers(); // Reload users table
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Freeze account error:', error);
        alert('Failed to update account status');
    }
}

// Approve account
async function approveAccount(accountNo) {
    if (!confirm(`Approve account ${accountNo}?`)) {
        return;
    }
    
    try {
        const result = await apiCall(`/admin/users/${accountNo}/approve`, 'PUT');
        
        if (result.status === 'success') {
            alert(result.message);
            loadUsers(); // Reload users table
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Approve account error:', error);
        alert('Failed to approve account');
    }
}

// Delete account permanently
async function closeAccount(accountNo) {
    if (!confirm(`⚠️ WARNING: This will PERMANENTLY DELETE account ${accountNo} and ALL associated data (transactions, loans, customer info). This action CANNOT be undone!`)) {
        return;
    }
    
    const confirmText = prompt('Type "DELETE" to confirm permanent deletion:');
    if (confirmText !== 'DELETE') {
        alert('Account deletion cancelled');
        return;
    }
    
    try {
        const result = await apiCall(`/admin/users/${accountNo}`, 'DELETE');
        
        if (result.status === 'success') {
            alert(result.message);
            loadUsers(); // Reload users table
            loadDashboardStats(); // Reload stats
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        console.error('Delete account error:', error);
        alert('Failed to delete account: ' + error.message);
    }
}

// Search users
document.getElementById('search-users').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const rows = document.querySelectorAll('#users-table-body tr');
    
    rows.forEach(row => {
        const text = row.textContent.toLowerCase();
        row.style.display = text.includes(searchTerm) ? '' : 'none';
    });
});

// Initialize
loadDashboardStats();
loadUsers();
