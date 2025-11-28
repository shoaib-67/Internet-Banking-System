
document.getElementById("admin-login-submit").addEventListener("click", async function(e) {
    e.preventDefault()
    
    const employeeId = document.getElementById("admin-username").value.trim()
    const name = document.getElementById("admin-password").value
    
    if(!employeeId) {
        alert("Please enter your Employee ID!")
        return
    }
    
    if(!name) {
        alert("Please enter your Name/Password!")
        return
    }
    
    const btn = document.getElementById("admin-login-submit");
    btn.disabled = true;
    btn.textContent = "Logging in...";
    
    try {
        const result = await apiCall(API_CONFIG.ENDPOINTS.ADMIN_LOGIN, 'POST', {
            employeeId,
            name
        });
        
        if (result.status === 'success') {
            // Store credentials
            localStorage.setItem('token', result.data.token);
            localStorage.setItem('isAdmin', 'true');
            localStorage.setItem('adminName', result.data.employee.name);
            localStorage.setItem('employeeId', result.data.employee.id);
            
            window.location.href = './admin-dashboard.html';
        }
    } catch (error) {
        alert(error.message || 'Login failed!');
        document.getElementById("admin-password").value = "";
    } finally {
        btn.disabled = false;
        btn.textContent = "Login";
    }
})

document.getElementById("admin-password").addEventListener("keypress", function(e) {
    if(e.key === "Enter") {
        document.getElementById("admin-login-submit").click()
    }
})
