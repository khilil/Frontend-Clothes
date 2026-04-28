import axios from 'axios';

const RENDER_URL = 'https://backend-clothes-1p7b.onrender.com/api/v1/products';

async function testConnection() {
    console.log(`Checking connection to: ${RENDER_URL}`);
    try {
        const response = await axios.get(RENDER_URL, {
            timeout: 10000 // 10 seconds timeout
        });
        console.log('✅ Connection Successful!');
        console.log('Status:', response.status);
        console.log('Data:', JSON.stringify(response.data, null, 2).substring(0, 500));
    } catch (error) {
        console.error('❌ Connection Failed!');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', error.response.data);
        } else if (error.request) {
            console.error('No response received:', error.message);
        } else {
            console.error('Error setting up request:', error.message);
        }
    }
}

testConnection();
