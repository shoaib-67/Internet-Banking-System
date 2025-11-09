// Check if user is logged in
if (!localStorage.getItem('token')) {
    window.location.href = './index.html';
}

// Display user info
const customerName = localStorage.getItem('customerName') || 'User';
const accountNo = localStorage.getItem('accountNo') || '';
document.addEventListener('DOMContentLoaded', () => {
    loadBalance();
    loadTransactionHistory();
});

// Logout function
function logout() {
    localStorage.clear();
    window.location.href = './index.html';
}

// Attach logout event listener
document.getElementById("logout-btn")?.addEventListener("click", logout);

// Helper functions
function getInputValue(id) {
    return document.getElementById(id)?.value || '';
}

function getInputValueNumber(id) {
    const value = document.getElementById(id)?.value;
    return parseFloat(value) || 0;
}

function setInnerText(value) {
    const element = document.getElementById("available-balance");
    if (element) {
        element.innerText = parseFloat(value).toFixed(2);
    }
}

function handleToggle(id) {
    const forms = document.getElementsByClassName("form");
    for (const form of forms) {
        form.style.display = "none";
    }
    const targetForm = document.getElementById(id);
    if (targetForm) {
        targetForm.style.display = "block";
    }
}

function handleButtonToggle(id) {
    const formBtns = document.getElementsByClassName("form-btn");
    for (const btn of formBtns) {
        btn.classList.remove("border-[#0874f2]", "bg-[#0874f20d]");
        btn.classList.add("border-gray-300");
    }
    const targetBtn = document.getElementById(id);
    if (targetBtn) {
        targetBtn.classList.remove("border-gray-300");
        targetBtn.classList.add("border-[#0874f2]", "bg-[#0874f20d]");
    }
}

// Load balance from API
async function loadBalance() {
    try {
        const result = await apiCall(API_CONFIG.ENDPOINTS.BALANCE);
        if (result.status === 'success') {
            setInnerText(result.data.balance);
            localStorage.setItem('balance', result.data.balance);
        }
    } catch (error) {
        console.error('Failed to load balance:', error);
    }
}

// Load transaction history
async function loadTransactionHistory() {
    try {
        console.log('Loading transaction history...');
        const result = await apiCall(API_CONFIG.ENDPOINTS.TRANSACTION_HISTORY);
        console.log('History result:', result);
        if (result.status === 'success') {
            console.log('Transactions:', result.data.transactions);
            displayTransactionHistory(result.data.transactions);
        }
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

function displayTransactionHistory(transactions) {
    console.log('Displaying transactions:', transactions);
    const historyContainer = document.getElementById("transaction-container");
    console.log('History container:', historyContainer);
    
    if (!historyContainer) {
        console.error('Transaction container not found!');
        return;
    }
    
    historyContainer.innerHTML = '';
    
    if (!transactions || transactions.length === 0) {
        console.log('No transactions to display');
        historyContainer.innerHTML = '<p class="text-center text-gray-500 py-4">No transactions yet</p>';
        return;
    }
    
    console.log(`Displaying ${transactions.length} transactions`);
    
    transactions.forEach(tx => {
        const date = new Date(tx.date).toLocaleString();
        const isCredit = tx.operation === 'Credit';
        const colorClass = isCredit ? 'text-green-600' : 'text-red-600';
        const sign = isCredit ? '+' : '-';
        
        const txElement = document.createElement('div');
        txElement.className = 'p-4 bg-white rounded-lg shadow mb-2';
        txElement.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <p class="font-semibold">${tx.billType}</p>
                    <p class="text-sm text-gray-500">${date}</p>
                    ${tx.receiver !== 'Self' ? `<p class="text-xs text-gray-400">To: ${tx.receiver}</p>` : ''}
                </div>
                <p class="${colorClass} font-bold">${sign}৳${parseFloat(tx.amount).toFixed(2)}</p>
            </div>
        `;
        historyContainer.appendChild(txElement);
    });
    
    console.log('Transactions displayed successfully');
}

// ADD MONEY
const addMoneyBtn = document.getElementById("add-money-btn");
if (addMoneyBtn) {
    addMoneyBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        
        const amount = getInputValueNumber("add-amount");
        
        if (amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        
        addMoneyBtn.disabled = true;
        addMoneyBtn.textContent = "Processing...";
        
        try {
            const result = await apiCall(API_CONFIG.ENDPOINTS.ADD_MONEY, 'POST', { amount });
            
            if (result.status === 'success') {
                alert(`Successfully added ৳${amount}`);
                setInnerText(result.data.newBalance);
                loadTransactionHistory();
                document.getElementById("add-amount").value = '';
            }
        } catch (error) {
            alert(error.message || 'Failed to add money');
        } finally {
            addMoneyBtn.disabled = false;
            addMoneyBtn.textContent = "Add Money";
        }
    });
}

// CASH OUT
const withdrawBtn = document.getElementById("withdraw-btn");
if (withdrawBtn) {
    withdrawBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        
        const amount = getInputValueNumber("withdraw-amount");
        
        if (amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        
        withdrawBtn.disabled = true;
        withdrawBtn.textContent = "Processing...";
        
        try {
            const result = await apiCall(API_CONFIG.ENDPOINTS.CASH_OUT, 'POST', { amount });
            
            if (result.status === 'success') {
                alert(`Successfully withdrew ৳${amount}`);
                setInnerText(result.data.newBalance);
                loadTransactionHistory();
                document.getElementById("withdraw-amount").value = '';
            }
        } catch (error) {
            alert(error.message || 'Failed to withdraw money');
        } finally {
            withdrawBtn.disabled = false;
            withdrawBtn.textContent = "Cash Out";
        }
    });
}

// TRANSFER MONEY
const transferBtn = document.getElementById("transfer-btn");
if (transferBtn) {
    transferBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        
        const recipientAccountNo = getInputValue("transfer-account");
        const amount = getInputValueNumber("transfer-amount");
        const phone = getInputValue("transfer-phone") || localStorage.getItem('phone');
        
        if (!recipientAccountNo) {
            alert("Please enter recipient's account number");
            return;
        }
        
        if (amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        
        transferBtn.disabled = true;
        transferBtn.textContent = "Processing...";
        
        try {
            const result = await apiCall(API_CONFIG.ENDPOINTS.TRANSFER, 'POST', {
                recipientAccountNo,
                amount,
                phone
            });
            
            if (result.status === 'success') {
                alert(`Successfully transferred ৳${amount} to ${recipientAccountNo}`);
                setInnerText(result.data.newBalance);
                loadTransactionHistory();
                document.getElementById("transfer-account").value = '';
                document.getElementById("transfer-amount").value = '';
            }
        } catch (error) {
            alert(error.message || 'Transfer failed');
        } finally {
            transferBtn.disabled = false;
            transferBtn.textContent = "Transfer";
        }
    });
}

// PAY BILL
const payBillBtn = document.getElementById("pay-bill-btn");
if (payBillBtn) {
    payBillBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        
        const billType = getInputValue("bill-type");
        const billerId = getInputValue("biller-id");
        const amount = getInputValueNumber("bill-amount");
        
        if (!billType) {
            alert("Please select bill type");
            return;
        }
        
        if (!billerId) {
            alert("Please enter biller ID");
            return;
        }
        
        if (amount <= 0) {
            alert("Please enter a valid amount");
            return;
        }
        
        payBillBtn.disabled = true;
        payBillBtn.textContent = "Processing...";
        
        try {
            const result = await apiCall(API_CONFIG.ENDPOINTS.PAY_BILL, 'POST', {
                billType,
                billerId,
                amount
            });
            
            if (result.status === 'success') {
                alert(`Successfully paid ${billType} bill of ৳${amount}`);
                setInnerText(result.data.newBalance);
                loadTransactionHistory();
                document.getElementById("bill-type").value = '';
                document.getElementById("biller-id").value = '';
                document.getElementById("bill-amount").value = '';
            }
        } catch (error) {
            alert(error.message || 'Bill payment failed');
        } finally {
            payBillBtn.disabled = false;
            payBillBtn.textContent = "Pay Bill";
        }
    });
}

// LOAN SECTION
async function checkLoanEligibility() {
    try {
        const result = await apiCall(API_CONFIG.ENDPOINTS.LOAN_ELIGIBILITY);
        if (result.status === 'success') {
            const eligibilityMsg = document.getElementById("loan-eligibility-message");
            if (eligibilityMsg) {
                if (result.data.canApply) {
                    eligibilityMsg.textContent = "You are eligible to apply for a loan!";
                    eligibilityMsg.className = "text-green-600";
                } else {
                    eligibilityMsg.textContent = `Loan not available. Active loans: ${result.data.loanCount}/${result.data.maxLoans}`;
                    eligibilityMsg.className = "text-red-600";
                }
            }
            return result.data.canApply;
        }
    } catch (error) {
        console.error('Failed to check eligibility:', error);
        return false;
    }
}

const takeLoanBtn = document.getElementById("take-loan-btn");
if (takeLoanBtn) {
    takeLoanBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        
        const bank = getInputValue("loan-bank");
        const loanType = getInputValue("loan-type");
        const amount = getInputValueNumber("loan-amount");
        const duration = getInputValueNumber("loan-duration");
        const purpose = getInputValue("loan-purpose");
        
        if (!bank || !loanType || amount <= 0 || duration <= 0) {
            alert("Please fill in all loan details including bank selection");
            return;
        }
        
        takeLoanBtn.disabled = true;
        takeLoanBtn.textContent = "Processing...";
        
        try {
            const result = await apiCall(API_CONFIG.ENDPOINTS.TAKE_LOAN, 'POST', {
                bank,
                loanType,
                amount,
                duration,
                purpose: purpose || "Personal use"
            });
            
            if (result.status === 'success') {
                alert(`Loan of ৳${amount} approved! Interest rate: ${result.data.interestRate}%`);
                setInnerText(result.data.newBalance);
                loadTransactionHistory();
                checkLoanEligibility();
                document.getElementById("loan-type").value = '';
                document.getElementById("loan-amount").value = '';
                document.getElementById("loan-duration").value = '';
            }
        } catch (error) {
            alert(error.message || 'Loan application failed');
        } finally {
            takeLoanBtn.disabled = false;
            takeLoanBtn.textContent = "Apply for Loan";
        }
    });
}

// Initialize eligibility check on page load
if (document.getElementById("loan-eligibility-message")) {
    checkLoanEligibility();
}

// LOAN TAB SWITCHING
const takeLoanTab = document.getElementById("take-loan-tab");
const payLoanTab = document.getElementById("pay-loan-tab");
const takeLoanForm = document.getElementById("take-loan-form");
const payLoanForm = document.getElementById("pay-loan-form");

if (takeLoanTab && payLoanTab && takeLoanForm && payLoanForm) {
    takeLoanTab.addEventListener("click", function() {
        takeLoanForm.style.display = "block";
        payLoanForm.style.display = "none";
        takeLoanTab.classList.remove("bg-gray-300", "text-gray-700");
        takeLoanTab.classList.add("bg-[#0874F2]", "text-white");
        payLoanTab.classList.remove("bg-[#0874F2]", "text-white");
        payLoanTab.classList.add("bg-gray-300", "text-gray-700");
    });

    payLoanTab.addEventListener("click", async function() {
        takeLoanForm.style.display = "none";
        payLoanForm.style.display = "block";
        payLoanTab.classList.remove("bg-gray-300", "text-gray-700");
        payLoanTab.classList.add("bg-[#0874F2]", "text-white");
        takeLoanTab.classList.remove("bg-[#0874F2]", "text-white");
        takeLoanTab.classList.add("bg-gray-300", "text-gray-700");
        
        // Load active loan details
        await loadActiveLoan();
    });
}

// LOAD ACTIVE LOAN
async function loadActiveLoan() {
    try {
        const result = await apiCall(API_CONFIG.ENDPOINTS.ACTIVE_LOANS);
        console.log('Active loan result:', result);
        
        if (result.status === 'success' && result.data) {
            const loan = result.data;
            document.getElementById("loan-balance").textContent = parseFloat(loan.outstandingBalance || 0).toFixed(2);
            document.getElementById("loan-bank-display").textContent = loan.loanType || "N/A";
            
            const payLoanBank = document.getElementById("pay-loan-bank");
            if (payLoanBank) {
                payLoanBank.disabled = false;
            }
        } else {
            document.getElementById("loan-balance").textContent = "0";
            document.getElementById("loan-bank-display").textContent = "N/A";
            const payLoanBank = document.getElementById("pay-loan-bank");
            if (payLoanBank) {
                payLoanBank.disabled = true;
            }
        }
    } catch (error) {
        console.error('Failed to load active loan:', error);
        document.getElementById("loan-balance").textContent = "0";
        document.getElementById("loan-bank-display").textContent = "N/A";
    }
}

// PAY LOAN
const payLoanBtn = document.getElementById("pay-loan-btn");
if (payLoanBtn) {
    payLoanBtn.addEventListener("click", async function (e) {
        e.preventDefault();
        
        const amount = getInputValueNumber("pay-loan-amount");
        
        if (amount <= 0) {
            alert("Please enter a valid payment amount");
            return;
        }
        
        if (amount < 100) {
            alert("Minimum payment amount is ৳100");
            return;
        }
        
        payLoanBtn.disabled = true;
        payLoanBtn.textContent = "Processing...";
        
        try {
            const result = await apiCall(API_CONFIG.ENDPOINTS.PAY_LOAN, 'POST', { amount });
            
            if (result.status === 'success') {
                alert(`Loan payment of ৳${amount} successful!`);
                setInnerText(result.data.newBalance);
                loadTransactionHistory();
                loadActiveLoan();
                document.getElementById("pay-loan-amount").value = '';
            }
        } catch (error) {
            alert(error.message || 'Loan payment failed');
        } finally {
            payLoanBtn.disabled = false;
            payLoanBtn.textContent = "Pay Loan";
        }
    });
}

// Form switching event listeners
document.getElementById("add-button")?.addEventListener("click", function() {
    handleToggle("add-money-parent");
    handleButtonToggle("add-button");
});

document.getElementById("cash-out-button")?.addEventListener("click", function() {
    handleToggle("cash-out-parent");
    handleButtonToggle("cash-out-button");
});

document.getElementById("transfer-button")?.addEventListener("click", function() {
    handleToggle("transfer-money-parent");
    handleButtonToggle("transfer-button");
});

document.getElementById("bonus-button")?.addEventListener("click", function() {
    handleToggle("get-bonus-parent");
    handleButtonToggle("bonus-button");
});

document.getElementById("bill-button")?.addEventListener("click", function() {
    handleToggle("pay-bill-parent");
    handleButtonToggle("bill-button");
});

document.getElementById("transactions-button")?.addEventListener("click", function() {
    handleToggle("transactions-parent");
    handleButtonToggle("transactions-button");
});
