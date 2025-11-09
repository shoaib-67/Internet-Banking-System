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
        const result = await apiCall(API_CONFIG.ENDPOINTS.TRANSACTION_HISTORY);
        if (result.status === 'success') {
            displayTransactionHistory(result.data.transactions);
        }
    } catch (error) {
        console.error('Failed to load history:', error);
    }
}

function displayTransactionHistory(transactions) {
    const historyContainer = document.getElementById("transaction-history");
    if (!historyContainer) return;
    
    historyContainer.innerHTML = '';
    
    if (!transactions || transactions.length === 0) {
        historyContainer.innerHTML = '<p class="text-center text-gray-500">No transactions yet</p>';
        return;
    }
    
    transactions.forEach(tx => {
        const date = new Date(tx.PaymentDate).toLocaleString();
        const isCredit = tx.Operation === 'Credit';
        const colorClass = isCredit ? 'text-green-600' : 'text-red-600';
        const sign = isCredit ? '+' : '-';
        
        const txElement = document.createElement('div');
        txElement.className = 'p-4 bg-white rounded-lg shadow mb-2';
        txElement.innerHTML = `
            <div class="flex justify-between items-center">
                <div>
                    <p class="font-semibold">${tx.BillType}</p>
                    <p class="text-sm text-gray-500">${date}</p>
                </div>
                <p class="${colorClass} font-bold">${sign}৳${parseFloat(tx.Amount).toFixed(2)}</p>
            </div>
        `;
        historyContainer.appendChild(txElement);
    });
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
        
        const loanType = getInputValue("loan-type");
        const amount = getInputValueNumber("loan-amount");
        const duration = getInputValueNumber("loan-duration");
        
        if (!loanType || amount <= 0 || duration <= 0) {
            alert("Please fill in all loan details");
            return;
        }
        
        takeLoanBtn.disabled = true;
        takeLoanBtn.textContent = "Processing...";
        
        try {
            const result = await apiCall(API_CONFIG.ENDPOINTS.TAKE_LOAN, 'POST', {
                loanType,
                amount,
                duration,
                purpose: "Personal use"
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
