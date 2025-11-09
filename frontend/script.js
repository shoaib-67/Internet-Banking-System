// Login with API
document.getElementById("loginButton").addEventListener("click", async function (e) {
    e.preventDefault();
    
    const phoneNumber = document.getElementById("phone-number").value.trim();
    const accountNumber = document.getElementById("account-number").value.trim();
    
    // Basic validation
    if (!phoneNumber || !accountNumber) {
        alert("Please enter both phone number and account number");
        return;
    }
    
    // Disable button during login
    const loginButton = document.getElementById("loginButton");
    loginButton.disabled = true;
    loginButton.textContent = "Logging in...";
    
    try {
        // Make API call
        const response = await fetch(`${API_CONFIG.BASE_URL}${API_CONFIG.ENDPOINTS.LOGIN}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                phone: phoneNumber,
                accountNo: accountNumber
            })
        });
        
        const result = await response.json();
        
        if (response.ok && result.status === 'success') {
            // Save token and user info
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('customerName', result.data.name);
            localStorage.setItem('accountNo', result.data.accountNo);
            localStorage.setItem('phone', result.data.phone);
            localStorage.setItem('balance', result.data.balance);
            
            // Redirect to dashboard
            window.location.href = "./home.html";
        } else {
            alert(result.message || "Login failed");
        }
        
    } catch (error) {
        console.error("Login error:", error);
        alert("Unable to connect to server. Please make sure the backend is running.");
    } finally {
        // Re-enable button
        loginButton.disabled = false;
        loginButton.textContent = "Login";
    }
});