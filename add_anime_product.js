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
    metaTitle: String,
    metaDescription: String,
    metaKeywords: String,
    variants: [VariantSchema]
}, { timestamps: true });

const Product = mongoose.model('Product', ProductSchema);

async function addProduct() {
    try {
        await mongoose.connect(MONGODB_URI);
        console.log('Connected to MongoDB');

        const newProduct = new Product({
            title: "Naruto x AOT 'Hato' Crossover Oversized Streetwear T-Shirt - Pitch Black",
            productType: "tshirt",
            slug: "naruto-x-aot-hato-crossover-oversized-t-shirt-black",
            brand: "Fenrir Era",
            categories: ["Topwear", "T-Shirts", "Streetwear", "Anime", "New Arrivals"],
            gender: "men",
            material: "100% Cotton",
            shortDescription: "Premium oversized anime streetwear tee featuring an exclusive Naruto x Attack on Titan high-definition graphic print.",
            fullDescription: "Elevate your streetwear game with the 'Hato' Crossover Oversized T-Shirt. This piece combines the legendary aesthetics of Naruto and Attack on Titan into a single, bold graphic statement. Crafted from 220 GSM heavyweight bio-washed cotton, it offers a perfect drop-shoulder fit for ultimate comfort and style.",
            price: 899,
            compareAtPrice: 1499,
            trackInventory: true,
            globalThreshold: 5,
            isActive: true,
            isFeatured: true,
            isNewArrival: true,
            isBestSeller: false,
            metaTitle: "Naruto x AOT Crossover Oversized Black T-Shirt | Anime Streetwear India",
            metaDescription: "Shop the limited edition Naruto x Attack on Titan 'Hato' Crossover Oversized T-Shirt. Premium 220 GSM black streetwear tee with bold anime prints.",
            metaKeywords: "anime streetwear, naruto t-shirt, aot oversized shirt, black graphic tee, streetwear india",
            variants: [
                {
                    id: "v-hato-blk-s",
                    sku: "FE-OVS-BLK-HATO-S",
                    size: new mongoose.Types.ObjectId("699e723dded151d4c6d550c2"),
                    color: new mongoose.Types.ObjectId("699d678d21b5c4d7950075fc"),
                    stock: 50,
                    price: 899,
                    measurements: { garmentType: "top", top: { chest: 44, frontLength: 29, sleeveLength: 10 } },
                    images: [{ id: "hato-blk-front", url: "https://cdn.fenrirera.com/products/hato-oversized-black-front.jpg", isMain: true, isPrimary: true }]
                },
                {
                    id: "v-hato-blk-m",
                    sku: "FE-OVS-BLK-HATO-M",
                    size: new mongoose.Types.ObjectId("699e723dded151d4c6d550c3"),
                    color: new mongoose.Types.ObjectId("699d678d21b5c4d7950075fc"),
                    stock: 75,
                    price: 899,
                    measurements: { garmentType: "top", top: { chest: 46, frontLength: 30, sleeveLength: 10.5 } },
                    images: [{ id: "hato-blk-front", url: "https://cdn.fenrirera.com/products/hato-oversized-black-front.jpg", isMain: true, isPrimary: true }]
                },
                {
                    id: "v-hato-blk-l",
                    sku: "FE-OVS-BLK-HATO-L",
                    size: new mongoose.Types.ObjectId("699e723dded151d4c6d550c4"),
                    color: new mongoose.Types.ObjectId("699d678d21b5c4d7950075fc"),
                    stock: 100,
                    price: 899,
                    measurements: { garmentType: "top", top: { chest: 48, frontLength: 31, sleeveLength: 11 } },
                    images: [{ id: "hato-blk-front", url: "https://cdn.fenrirera.com/products/hato-oversized-black-front.jpg", isMain: true, isPrimary: true }]
                },
                {
                    id: "v-hato-blk-xl",
                    sku: "FE-OVS-BLK-HATO-XL",
                    size: new mongoose.Types.ObjectId("699e723dded151d4c6d550c5"),
                    color: new mongoose.Types.ObjectId("699d678d21b5c4d7950075fc"),
                    stock: 60,
                    price: 899,
                    measurements: { garmentType: "top", top: { chest: 50, frontLength: 32, sleeveLength: 11.5 } },
                    images: [{ id: "hato-blk-front", url: "https://cdn.fenrirera.com/products/hato-oversized-black-front.jpg", isMain: true, isPrimary: true }]
                },
                {
                    id: "v-hato-blk-xxl",
                    sku: "FE-OVS-BLK-HATO-XXL",
                    size: new mongoose.Types.ObjectId("699e723dded151d4c6d550c6"),
                    color: new mongoose.Types.ObjectId("699d678d21b5c4d7950075fc"),
                    stock: 30,
                    price: 899,
                    measurements: { garmentType: "top", top: { chest: 52, frontLength: 33, sleeveLength: 12 } },
                    images: [{ id: "hato-blk-front", url: "https://cdn.fenrirera.com/products/hato-oversized-black-front.jpg", isMain: true, isPrimary: true }]
                }
            ]
        });

        const result = await newProduct.save();
        console.log('✅ Product added successfully!');
        console.log('Product ID:', result._id);
        console.log('Slug:', result.slug);

        process.exit(0);
    } catch (error) {
        console.error('❌ Error adding product:', error.message);
        if (error.code === 11000) {
            console.error('Error: Duplicate slug or SKU detected.');
        }
        process.exit(1);
    }
}

addProduct();
