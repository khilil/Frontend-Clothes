import mongoose from 'mongoose';

const MONGODB_URI = 'mongodb+srv://khilil:S26rY45ZfsQZ8Vry@cluster0.2taawsy.mongodb.net/clothing_store_db?appName=Cluster0';

async function getIds() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to DB');

        const db = mongoose.connection.db;

        const colors = await db.collection('colors').find({}).toArray();
        const sizes = await db.collection('sizes').find({}).toArray();

        console.log('--- COLORS ---');
        colors.forEach(c => console.log(`${c.name}: ${c._id}`));

        console.log('--- SIZES ---');
        sizes.forEach(s => console.log(`${s.name} (${s.categoryType}): ${s._id}`));

        process.exit(0);
    } catch (error) {
        console.error('Error:', error);
        process.exit(1);
    }
}

getIds();
