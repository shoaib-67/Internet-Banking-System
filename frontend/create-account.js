// Create Account 
document.getElementById("create-account-btn").addEventListener("click", function(e) {
    e.preventDefault()
    
    // Get all input 
    const fullName = document.getElementById("full-name").value.trim()
    const email = document.getElementById("email").value.trim()
    const mobile = document.getElementById("create-mobile").value.trim()
    const pin = document.getElementById("create-pin").value
    const confirmPin = document.getElementById("confirm-pin").value
    
    // Validation
    if(!fullName) {
        alert("Please enter your full name!")
        return
    }
    
    if(!email) {
        alert("Please enter your email address!")
        return
    }
    
    // Basic email validation
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if(!emailPattern.test(email)) {
        alert("Please enter a valid email address!")
        return
    }
    
    if(!mobile) {
        alert("Please enter your mobile number!")
        return
    }
    
    if(mobile.length < 11) {
        alert("Mobile number must be at least 11 digits!")
        return
    }
    
    if(!pin) {
        alert("Please create a 4-digit PIN!")
        return
    }
    
    if(pin.length !== 4) {
        alert("PIN must be exactly 4 digits!")
        return
    }
    
    if(isNaN(pin)) {
        alert("PIN must contain only numbers!")
        return
    }
    
    if(!confirmPin) {
        alert("Please confirm your PIN!")
        return
    }
    
    if(pin !== confirmPin) {
        alert("PINs do not match!")
        return
    }
    
    // Success
    const accountData = {
        name: fullName,
        email: email,
        mobile: mobile,
        pin: pin,
        balance: 5000
    }
    

    localStorage.setItem("userAccount", JSON.stringify(accountData))
    
    alert(`Account created successfully!\n\nName: ${fullName}\nMobile: ${mobile}\nEmail: ${email}\n\nYour starting balance is $5000.\n\nRedirecting to login page...`)
    
    
    window.location.href = "index.html"
})
