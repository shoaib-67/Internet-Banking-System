// Manager Login Logic
const loginForm = document.getElementById('manager-login-form');
const errorMessage = document.getElementById('error-message');
const errorText = document.getElementById('error-text');
const loginBtn = document.getElementById('login-btn');

loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const employeeId = document.getElementById('employee-id').value.trim();
    const password = document.getElementById('password').value;
    
    // Hide previous errors
    errorMessage.classList.add('hidden');
    loginBtn.disabled = true;
    loginBtn.innerHTML = '<span class="loading loading-spinner"></span> Logging in...';
    
    try {
        const response = await apiCall('/auth/manager-login', 'POST', {
            employeeId,
            name: password
        });
        
        if (response.status === 'success') {
            // Store token and manager info
            localStorage.setItem('token', response.data.token);
            localStorage.setItem('isManager', 'true');
            localStorage.setItem('managerName', response.data.name);
            localStorage.setItem('employeeId', response.data.employeeId);
            
            // Redirect to manager dashboard
            window.location.href = './manager-dashboard.html';
        } else {
            throw new Error(response.message || 'Login failed');
        }
    } catch (error) {
        console.error('Login error:', error);
        errorText.textContent = error.message || 'Invalid credentials. Please try again.';
        errorMessage.classList.remove('hidden');
        
        loginBtn.disabled = false;
        loginBtn.innerHTML = '<i class="fas fa-sign-in-alt mr-2"></i>Login';
    }
});
