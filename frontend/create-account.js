// Create Account 
document.getElementById("create-account-btn").addEventListener("click", async function(e) {
    e.preventDefault()
    
    // Get all input 
    const fullName = document.getElementById("full-name").value.trim()
    const email = document.getElementById("email").value.trim()
    const mobile = document.getElementById("create-mobile").value.trim()
    const address = document.getElementById("address").value.trim()
    const dob = document.getElementById("dob").value
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
    
    if(mobile.length !== 11) {
        alert("Phone number must be exactly 11 digits (e.g., 01XXXXXXXXX)!")
        return
    }
    
    if(!mobile.startsWith('01')) {
        alert("Phone number must start with 01!")
        return
    }
    
    if(!address) {
        alert("Please enter your address!")
        return
    }
    
    if(!dob) {
        alert("Please enter your date of birth!")
        return
    }
    
    // Check if user is at least 18 years old
    const birthDate = new Date(dob)
    const today = new Date()
    let age = today.getFullYear() - birthDate.getFullYear()
    const monthDiff = today.getMonth() - birthDate.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
    }
    
    if (age < 18) {
        alert("You must be at least 18 years old to create an account!")
        return
    }
    
    // Note: PIN is no longer used in the backend, but we keep validation for UX
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
    
    // Disable button during registration
    const createBtn = document.getElementById("create-account-btn")
    createBtn.disabled = true
    createBtn.textContent = "Creating Account..."
    
    try {
        // Call backend API to register
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.REGISTER}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                name: fullName,
                email: email,
                phone: mobile,
                address: address,
                dob: dob
            })
        })
        
        const result = await response.json()
        
        if (response.ok && result.status === 'success') {
            // Success - account created in database
            alert(`✅ Account created successfully!\n\nName: ${fullName}\nPhone: ${mobile}\nEmail: ${email}\nAccount Number: ${result.data.accountNo}\n\nYour starting balance is ₹1000.\n\nRedirecting to login page...`)
            
            // Redirect to login
            window.location.href = "index.html"
        } else {
            // Error from backend
            alert(`❌ Registration failed:\n${result.message}`)
        }
        
    } catch (error) {
        console.error("Registration error:", error)
        alert("❌ Unable to connect to server. Please make sure the backend is running.")
    } finally {
        // Re-enable button
        createBtn.disabled = false
        createBtn.textContent = "Create Account"
    }
})
