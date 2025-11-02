
document.getElementById("admin-login-submit").addEventListener("click", function(e) {
    e.preventDefault()
    
    const username = document.getElementById("admin-username").value.trim()
    const password = document.getElementById("admin-password").value
    
    
    const validAdminUsername = "admin"
    const validAdminPassword = "admin123"
    
   
    if(!username) {
        alert("Please enter your username!")
        return
    }
    
    if(!password) {
        alert("Please enter your password!")
        return
    }
    
   
    if(username === validAdminUsername && password === validAdminPassword) {
        alert("Admin login successful!")
    } else {
        alert("Invalid admin credentials!")
        document.getElementById("admin-password").value = ""
    }
})

document.getElementById("admin-password").addEventListener("keypress", function(e) {
    if(e.key === "Enter") {
        document.getElementById("admin-login-submit").click()
    }
})
