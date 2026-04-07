import mongoose from 'mongoose';

// Hardcoded URI for reliability in this one-off task
const MONGODB_URI = 'mongodb+srv://khilil:S26rY45ZfsQZ8Vry@cluster0.2taawsy.mongodb.net/clothing_store_db?appName=Cluster0';

// Define the Product Schema (Simplified but matching the essential structure)
const VariantSchema = new mongoose.Schema({
    id: String,
    sku: { type: String, unique: true },
    size: mongoose.Schema.Types.ObjectId,
    color: mongoose.Schema.Types.ObjectId,
    stock: Number,
    price: Number,
    reservedStock: { type: Number, default: 0 },
    lowStockThreshold: { type: Number, default: 5 },
    allowBackorder: { type: Boolean, default: false },
    measurements: {
        garmentType: { type: String, enum: ['top', 'bottom'] },
        top: { chest: Number, frontLength: Number, sleeveLength: Number }
    },
    images: [{
        id: String,
        url: String,
        isMain: Boolean,
        isPrimary: Boolean
    }]
});

const ProductSchema = new mongoose.Schema({
    title: String,
    productType: String,
    slug: { type: String, unique: true },
    brand: String,
    categories: [String],
    gender: String,
    material: String,
    shortDescription: String,
    fullDescription: String,
    price: Number,
    compareAtPrice: Number,
    trackInventory: Boolean,
    globalThreshold: Number,
    isActive: Boolean,
    isFeatured: Boolean,
    isNewArrival: Boolean,
    isBestSeller: Boolean,
    isCustomizable: { type: Boolean, default: false }, // ADDED ISCUSTOMIZABLE
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    variants: [VariantSchema]
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

async function seedProducts() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const p1 = new Product({
            title: "Customizable Signature Essential Tee - Arctic White",
            productType: "tshirt",
            slug: "customizable-signature-essential-tee-arctic-white",
            brand: "Fenrir Era",
            categories: ["Topwear", "T-Shirts", "Customizable", "Classics"],
            gender: "unisex",
            material: "100% Cotton",
            shortDescription: "Our premium Arctic White blank canvas tee, ready for your custom graphics and designs.",
            fullDescription: "Design it your way. The Signature Essential Tee in Arctic White is built to be customized. Use our 3D design studio to add text, graphics, and elements perfectly.",
            price: 599,
            compareAtPrice: 999,
            trackInventory: true,
            globalThreshold: 5,
            isActive: true,
            isFeatured: true,
            isNewArrival: true,
            isBestSeller: false,
            isCustomizable: true, // FLAG SET
            metaTitle: "Customizable White Tee | Personalize | Fenrir Era",
            metaDescription: "Design your own custom T-Shirt. Premium 100% cotton customizable tees.",
            variants: [
                {
                    id: "v-cust-wht-m",
                    sku: "FE-CUST-WHT-M",
                    size: new mongoose.Types.ObjectId("699e723dded151d4c6d550c3"),
                    color: new mongoose.Types.ObjectId("699d678d21b5c4d7950075fd"), // Dummy light string or actual white ref
                    stock: 50,
                    price: 599,
                    images: [{ id: "cust-wht-front", url: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?q=80&w=600&auto=format&fit=crop", isMain: true, isPrimary: true }]
                }
            ]
        });

        const p2 = new Product({
            title: "Customizable Drop-Shoulder Street Tee - Midnight Black",
            productType: "tshirt",
            slug: "customizable-drop-shoulder-street-tee-midnight-black",
            brand: "Fenrir Era",
            categories: ["Topwear", "T-Shirts", "Customizable", "Streetwear"],
            gender: "unisex",
            material: "220 GSM Cotton",
            shortDescription: "Ultra-heavyweight 220 GSM pitch black tee with drop-shoulders. Designed for DIY custom printing.",
            fullDescription: "Ready for your exclusive design. The Midnight Black drop-shoulder tee provides the ultimate dark canvas for vibrant, custom streetwear.",
            price: 699,
            compareAtPrice: 1299,
            trackInventory: true,
            globalThreshold: 5,
            isActive: true,
            isFeatured: true,
            isNewArrival: true,
            isBestSeller: true,
            isCustomizable: true, // FLAG SET
            metaTitle: "Customizable Black Oversized Tee | Fenrir Era",
            metaDescription: "The ultimate 220 GSM black oversized t-shirt, fully customizable in our 3D studio.",
            variants: [
                {
                    id: "v-cust-blk-m",
                    sku: "FE-CUST-BLK-M",
                    size: new mongoose.Types.ObjectId("699e723dded151d4c6d550c3"),
                    color: new mongoose.Types.ObjectId("699d678d21b5c4d7950075fc"),
                    stock: 100,
                    price: 699,
                    images: [{ id: "cust-blk-front", url: "https://images.unsplash.com/photo-1583743814966-8936f5b7be1a?q=80&w=600&auto=format&fit=crop", isMain: true, isPrimary: true }]
                }
            ]
        });

        await p1.save();
        await p2.save();
        console.log('✅ 2 Customizable Products added successfully!');
        
        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding product:', error.message);
        process.exit(1);
    }
}

seedProducts();
