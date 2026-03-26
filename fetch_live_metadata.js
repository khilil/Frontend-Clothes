import axios from 'axios';

const API_BASE_URL = 'https://backend-clothes-1p7b.onrender.com/api/v1';

async function fetchMetadata() {
    try {
        console.log('Fetching Colors...');
        const colorsRes = await axios.get(`${API_BASE_URL}/colors`);
        console.log('--- COLORS ---');
        colorsRes.data.data.forEach(c => console.log(`${c.name}: ${c._id}`));

        console.log('\nFetching Sizes...');
        const sizesRes = await axios.get(`${API_BASE_URL}/sizes`);
        console.log('--- SIZES ---');
        sizesRes.data.data.forEach(s => console.log(`${s.name} (${s.categoryType}): ${s._id}`));

    } catch (error) {
        console.error('Error fetching data:', error.response?.data || error.message);
    }
}

fetchMetadata();
