const axios = require('axios');

// You need to replace this with your actual JWT token from localStorage
// Open browser console and type: localStorage.getItem('token')
const token = 'YOUR_TOKEN_HERE';

async function testHistoryAPI() {
    try {
        const response = await axios.get('http://localhost:5000/api/transactions/history', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
        
        console.log('API Response:');
        console.log(JSON.stringify(response.data, null, 2));
    } catch (error) {
        console.error('Error:', error.response?.data || error.message);
    }
}

testHistoryAPI();
