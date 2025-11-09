const validPin = 1234
const transactionData = []
let loanBalance = 0 // Track outstanding loan balance
let loanBankName = "" // Track which bank the loan is from
let loanCount = 0 // Track number of loans taken
const maxLoans = 3 // Maximum number of loans allowed
const maxLoanAmount = 5000 // Maximum total loan amount allowed


function getInputValueNumber (id){
    const inputField = document.getElementById(id)
    const inputFieldValue = inputField.value
    const inputFieldValueNumber = parseInt(inputFieldValue)
    return inputFieldValueNumber
}

function getInputValue (id){
    const inputField = document.getElementById(id)
    const inputFieldValue = inputField.value
    return inputFieldValue
}


function getInnerText(id){
    const element = document.getElementById(id)
    const elementValue = element.innerText
    const elementValueNumber = parseInt(elementValue)

    return elementValueNumber
}

function setInnerText(value){
    console.log(value)
    const availableBalanceElement = document.getElementById("available-balance")
    availableBalanceElement.innerText = value
}


function handleToggle(id) {
    const forms = document.getElementsByClassName("form")
    for(const form of forms){
        form.style.display = "none"
    }
    document.getElementById(id).style.display = "block"
}


function handleButtonToggle(id){
    const formBtns = document.getElementsByClassName("form-btn")

    
    for(const btn of formBtns){
        btn.classList.remove("border-[#0874f2]","bg-[#0874f20d]")
        btn.classList.add("border-gray-300")
    }

document.getElementById(id).classList.remove("border-gray-300")
    document.getElementById(id).classList.add("border-[#0874f2]","bg-[#0874f20d]")
}



// add money

document.getElementById("add-money-btn").addEventListener("click",function(e){
    e.preventDefault()
    const bank = getInputValue("bank");
    const accountNumber = document.getElementById("account-number").value

    const amount = getInputValueNumber("add-amount")
    
    if(amount<=0){
        alert("invalid amount")
        return;
    }

    const pinNumber = getInputValueNumber("add-pin")


    const availableBalance = getInnerText("available-balance")


    if(accountNumber.length<11){
        alert("Invalid account Number");
        return;
    }

    if(pinNumber !== validPin){
        alert("Invalid pin Number")
        return;
    }

    const totalNewAvailableBalance = amount+availableBalance;

 
    setInnerText(totalNewAvailableBalance);

    const data = {
        name:"Add Money",
        date:new Date().toLocaleTimeString()
    }

    transactionData.push(data)
    console.log(transactionData)


})


//cashout money 

document.getElementById("withdraw-btn").addEventListener("click",function(e){
    e.preventDefault()
    
    const amount = getInputValueNumber("withdraw-amount")

    const availableBalance =getInnerText("available-balance")

    if(amount<=0 || amount>availableBalance){
        alert("invalid amount")
        return
    }

    const totalNewAvailableBalance = availableBalance - amount

    console.log(totalNewAvailableBalance)

    setInnerText(totalNewAvailableBalance)
    
    const data = {
        name:"Cash Out",
        date:new Date().toLocaleTimeString()
    }

    transactionData.push(data)
    console.log(transactionData)
})


// Transfer Money feature

document.getElementById("transfer-btn").addEventListener("click",function(e){
    e.preventDefault()
    
    const bank = getInputValue("transfer-bank")
    const accountNumber = getInputValue("transfer-account")
    const recipientName = getInputValue("transfer-name")
    const amount = getInputValueNumber("transfer-amount")
    const note = getInputValue("transfer-note")
    const pinNumber = getInputValueNumber("transfer-pin")

    const availableBalance = getInnerText("available-balance")

    // Validation
    if(!bank || bank === ""){
        alert("Please select recipient's bank")
        return
    }

    if(!accountNumber || accountNumber.trim() === ""){
        alert("Please enter recipient's account number")
        return
    }

    if(accountNumber.length < 11){
        alert("Account number must be at least 11 digits")
        return
    }

    if(!recipientName || recipientName.trim() === ""){
        alert("Please enter recipient's name")
        return
    }

    if(amount <= 0){
        alert("Invalid amount")
        return
    }

    if(amount > availableBalance){
        alert("Insufficient balance")
        return
    }

    if(pinNumber !== validPin){
        alert("Invalid PIN number")
        return
    }

    // Process transfer
    const totalNewAvailableBalance = availableBalance - amount
    setInnerText(totalNewAvailableBalance)

    // Record transaction
    const transactionNote = note ? ` - ${note}` : ""
    const data = {
        name: `Transfer to ${recipientName} (${bank})${transactionNote}`,
        date: new Date().toLocaleTimeString()
    }

    transactionData.push(data)
    console.log(transactionData)

    // Clear form
    document.getElementById("transfer-bank").value = ""
    document.getElementById("transfer-account").value = ""
    document.getElementById("transfer-name").value = ""
    document.getElementById("transfer-amount").value = ""
    document.getElementById("transfer-note").value = ""
    document.getElementById("transfer-pin").value = ""

    alert(`Transfer successful!\n\nAmount: $${amount}\nRecipient: ${recipientName}\nBank: ${bank}\nAccount: ${accountNumber}`)
})


// Pay bill feature

document.getElementById("pay-bill-btn").addEventListener("click",function(e){
    e.preventDefault()
    
    const billType = getInputValue("bill-type")
    const billAccount = getInputValue("bill-account")
    const amount = getInputValueNumber("bill-amount")
    const pinNumber = getInputValueNumber("bill-pin")

    const availableBalance = getInnerText("available-balance")

    // Validation
    if(!billType || billType === ""){
        alert("Please select a bill type")
        return
    }

    if(!billAccount || billAccount.trim() === ""){
        alert("Please enter bill account/reference number")
        return
    }

    if(amount <= 0){
        alert("Invalid amount")
        return
    }

    if(amount > availableBalance){
        alert("Insufficient balance")
        return
    }

    if(pinNumber !== validPin){
        alert("Invalid pin number")
        return
    }

    // Process payment
    const totalNewAvailableBalance = availableBalance - amount
    setInnerText(totalNewAvailableBalance)

    // Record transaction
    const data = {
        name: `${billType} - ${billAccount}`,
        date: new Date().toLocaleTimeString()
    }

    transactionData.push(data)
    console.log(transactionData)

    // Clear form
    document.getElementById("bill-type").value = ""
    document.getElementById("bill-account").value = ""
    document.getElementById("bill-amount").value = ""
    document.getElementById("bill-pin").value = ""

    alert(`${billType} payment successful! Amount: $${amount}`)
})


// Loan feature - Tab switching

document.getElementById("take-loan-tab").addEventListener("click", function(){
    // Show take loan form
    document.getElementById("take-loan-form").style.display = "block"
    document.getElementById("pay-loan-form").style.display = "none"
    
    // Update tab styling
    document.getElementById("take-loan-tab").classList.remove("bg-gray-300", "text-gray-700")
    document.getElementById("take-loan-tab").classList.add("bg-[#0874F2]", "text-white")
    document.getElementById("pay-loan-tab").classList.remove("bg-[#0874F2]", "text-white")
    document.getElementById("pay-loan-tab").classList.add("bg-gray-300", "text-gray-700")
})

document.getElementById("pay-loan-tab").addEventListener("click", function(){
    // Show pay loan form
    document.getElementById("take-loan-form").style.display = "none"
    document.getElementById("pay-loan-form").style.display = "block"
    
    // Update tab styling
    document.getElementById("pay-loan-tab").classList.remove("bg-gray-300", "text-gray-700")
    document.getElementById("pay-loan-tab").classList.add("bg-[#0874F2]", "text-white")
    document.getElementById("take-loan-tab").classList.remove("bg-[#0874F2]", "text-white")
    document.getElementById("take-loan-tab").classList.add("bg-gray-300", "text-gray-700")
    
    // Update loan balance and bank display
    document.getElementById("loan-balance").innerText = loanBalance
    document.getElementById("loan-bank-display").innerText = loanBankName || "N/A"
    
    // Update bank dropdown
    const payLoanBankDropdown = document.getElementById("pay-loan-bank")
    if(loanBalance > 0 && loanBankName) {
        payLoanBankDropdown.value = loanBankName
        payLoanBankDropdown.disabled = true // Can't change bank after loan is taken
    } else {
        payLoanBankDropdown.value = ""
        payLoanBankDropdown.disabled = true
    }
})

// Take Loan feature

document.getElementById("take-loan-btn").addEventListener("click", function(e){
    e.preventDefault()
    
    const loanBank = getInputValue("loan-bank")
    const loanType = getInputValue("loan-type")
    const loanAmount = getInputValueNumber("loan-amount")
    const loanDuration = getInputValue("loan-duration")
    const loanPurpose = getInputValue("loan-purpose")
    const pinNumber = getInputValueNumber("take-loan-pin")
    
    const availableBalance = getInnerText("available-balance")
    
    // Validation
    if(!loanBank || loanBank === ""){
        alert("Please select a bank for the loan")
        return
    }
    
    if(!loanType || loanType === ""){
        alert("Please select a loan type")
        return
    }
    
    if(loanAmount <= 0){
        alert("Invalid loan amount")
        return
    }
    
    if(loanAmount < 1000){
        alert("Minimum loan amount is $1000")
        return
    }
    
    if(loanAmount > 50000){
        alert("Maximum loan amount is $50000")
        return
    }
    
    if(!loanDuration || loanDuration === ""){
        alert("Please select loan duration")
        return
    }
    
    if(!loanPurpose || loanPurpose.trim() === ""){
        alert("Please enter purpose of loan")
        return
    }
    
    if(pinNumber !== validPin){
        alert("Invalid PIN number")
        return
    }
    
    if(loanBalance > 0){
        alert("You already have an outstanding loan. Please pay it off before taking a new loan.")
        return
    }
    
    // Check loan eligibility restrictions
    if(loanCount >= maxLoans){
        alert(`Loan application denied!\n\nYou have reached the maximum limit of ${maxLoans} loans.\nPlease pay off existing loans before applying for a new one.`)
        return
    }
    
    if(loanAmount > maxLoanAmount){
        alert(`Loan application denied!\n\nThe requested amount ($${loanAmount}) exceeds the maximum loan limit of $${maxLoanAmount}.\nPlease apply for a lower amount.`)
        return
    }
    
    // Show processing message
    const originalButton = document.getElementById("take-loan-btn")
    const originalText = originalButton.innerText
    const checkMessage = document.getElementById("loan-check-message")
    
    originalButton.disabled = true
    originalButton.innerText = "Processing..."
    checkMessage.classList.remove("hidden")
    
    // Simulate bank checking eligibility with delay
    setTimeout(() => {
        // Hide checking message
        checkMessage.classList.add("hidden")
        // Calculate interest based on loan type
        let interestRate = 0
        if(loanType.includes("Personal")) interestRate = 0.05
        else if(loanType.includes("Business")) interestRate = 0.07
        else if(loanType.includes("Education")) interestRate = 0.03
        else if(loanType.includes("Home")) interestRate = 0.06
        
        const interestAmount = loanAmount * interestRate
        const totalLoanAmount = loanAmount + interestAmount
        
        // Add loan amount to balance
        const newBalance = availableBalance + loanAmount
        setInnerText(newBalance)
        
        // Update loan balance, bank, and count
        loanBalance = totalLoanAmount
        loanBankName = loanBank // Save which bank the loan is from
        loanCount++ // Increment loan count
        document.getElementById("loan-balance").innerText = loanBalance
        
        // Record transaction
        const data = {
            name: `Loan Approved - ${loanType} (${loanBank})`,
            date: new Date().toLocaleTimeString()
        }
        
        transactionData.push(data)
        console.log(transactionData)
        
        // Clear form
        document.getElementById("loan-bank").value = ""
        document.getElementById("loan-type").value = ""
        document.getElementById("loan-amount").value = ""
        document.getElementById("loan-duration").value = ""
        document.getElementById("loan-purpose").value = ""
        document.getElementById("take-loan-pin").value = ""
        
        // Re-enable button
        originalButton.disabled = false
        originalButton.innerText = originalText
        
        alert(`Loan approved!\n\nBank: ${loanBank}\nLoan Type: ${loanType}\nLoan Amount: $${loanAmount}\nInterest (${interestRate*100}%): $${interestAmount}\nTotal to Repay: $${totalLoanAmount}\nDuration: ${loanDuration} months\nLoans Taken: ${loanCount}/${maxLoans}\n\nThe loan amount has been added to your balance.`)
    }, 2500) // 2.5 second delay for eligibility check
})

// Pay Loan feature

document.getElementById("pay-loan-btn").addEventListener("click", function(e){
    e.preventDefault()
    
    const paymentAmount = getInputValueNumber("pay-loan-amount")
    const pinNumber = getInputValueNumber("pay-loan-pin")
    
    const availableBalance = getInnerText("available-balance")
    
    // Validation
    if(loanBalance <= 0){
        alert("You don't have any outstanding loan")
        return
    }
    
    if(paymentAmount <= 0){
        alert("Invalid payment amount")
        return
    }
    
    if(paymentAmount < 100){
        alert("Minimum payment amount is $100")
        return
    }
    
    if(paymentAmount > loanBalance){
        alert(`Payment amount cannot exceed loan balance ($${loanBalance})`)
        return
    }
    
    if(paymentAmount > availableBalance){
        alert("Insufficient balance")
        return
    }
    
    if(pinNumber !== validPin){
        alert("Invalid PIN number")
        return
    }
    
    // Process payment
    const newBalance = availableBalance - paymentAmount
    setInnerText(newBalance)
    
    // Update loan balance
    loanBalance = loanBalance - paymentAmount
    document.getElementById("loan-balance").innerText = loanBalance
    
    // Record transaction
    const data = {
        name: `Loan Payment to ${loanBankName} - $${paymentAmount}`,
        date: new Date().toLocaleTimeString()
    }
    
    transactionData.push(data)
    console.log(transactionData)
    
    // Clear form
    document.getElementById("pay-loan-amount").value = ""
    document.getElementById("pay-loan-pin").value = ""
    
    if(loanBalance === 0){
        alert(`Loan payment successful!\n\nPaid: $${paymentAmount} to ${loanBankName}\n\nCongratulations! Your loan is fully paid off!\nYou can now apply for new loans. (${loanCount}/${maxLoans} loans used)`)
        loanBankName = "" // Clear bank name when loan is fully paid
        // Note: loanCount is NOT reset - it tracks total loans taken in lifetime
    } else {
        alert(`Loan payment successful!\n\nPaid: $${paymentAmount} to ${loanBankName}\nRemaining Loan Balance: $${loanBalance}`)
    }
})


document.getElementById("transactions-button").addEventListener("click",function(){
    const transactionContainer = document.getElementById("transaction-container")

    for(const data of transactionData){
        const div = document.createElement("div")
        div.innerHTML=`
        <div class=" bg-white rounded-xl p-3 flex justify-between items-center mt-3">
              <div class="flex items-center">
                  <div class="p-3 rounded-full bg-[#f4f5f7]">
                    <img src="./assets/wallet1.png" class="mx-auto" alt="" />
                  </div>
                  <div class="ml-3">
                    <h1>${data.name}</h1>
                    <p>${data.date}</p>
                  </div>
              </div>
      
              <i class="fa-solid fa-ellipsis-vertical"></i>
            </div>
        `

        transactionContainer.appendChild(div)


    }
})


// toggling feature

document.getElementById("add-button").addEventListener("click",function(e){
    handleToggle("add-money-parent")

    handleButtonToggle("add-button")

})
document.getElementById("cash-out-button").addEventListener("click",function(){
    handleToggle("cash-out-parent")
    handleButtonToggle("cash-out-button")
 
})

document.getElementById("transfer-button").addEventListener("click",function(){

    handleToggle("transfer-money-parent")
    handleButtonToggle("transfer-button")
})
document.getElementById("bonus-button").addEventListener("click",function(){
    handleToggle("get-bonus-parent")
    handleButtonToggle("bonus-button")
})
document.getElementById("bill-button").addEventListener("click",function(){
    handleToggle("pay-bill-parent")
    handleButtonToggle("bill-button")
})
document.getElementById("transactions-button").addEventListener("click",function(){
    handleToggle("transactions-parent")
    handleButtonToggle("transactions-button")
})

// Logout
document.getElementById("logout-btn").addEventListener("click",function(){
    window.location.href = "index.html";
})
