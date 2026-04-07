const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
dotenv.config({ path: path.join(__dirname, '../.env') });

const User = require('../src/models/User');
const Category = require('../src/models/Category');
const Product = require('../src/models/Product');
const Order = require('../src/models/Order');
const OrderDetail = require('../src/models/OrderDetail');
const Review = require('../src/models/Review');

const seedDB = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log('MongoDB Connected for seeding...');

        // Clear existing data
        await User.deleteMany({});
        await Category.deleteMany({});
        await Product.deleteMany({});
        await Order.deleteMany({});
        await OrderDetail.deleteMany({});
        await Review.deleteMany({});

        // Seed Users
        const users = await User.insertMany([
            { full_name: 'Quản trị viên', email: 'admin@shoppet.vn', password: '$2b$10$OaklZKgmmtNAiYnjgj/Z6.3deQ59Vcyqi4VPn.Wm0NuxFutZvxYea', role: 'admin', phone: '0999888777', address: 'Hệ thống ShopPet' },
            { full_name: 'Admin Admin', email: 'admin@petshop.com', password: '$2b$10$OaklZKgmmtNAiYnjgj/Z6.3deQ59Vcyqi4VPn.Wm0NuxFutZvxYea', role: 'admin', phone: '0123456789', address: 'Main Street Pet Shop HQ' },
            { full_name: 'Customer One', email: 'customer1@example.com', password: '$2b$10$OaklZKgmmtNAiYnjgj/Z6.3deQ59Vcyqi4VPn.Wm0NuxFutZvxYea', role: 'customer', phone: '0987654321', address: '123 Customer Ave, New York, NY' },
            { full_name: 'Customer Two', email: 'customer2@example.com', password: '$2b$10$OaklZKgmmtNAiYnjgj/Z6.3deQ59Vcyqi4VPn.Wm0NuxFutZvxYea', role: 'customer', phone: '0555123456', address: '456 Buyer Blvd, Los Angeles, CA' }
        ]);
        console.log('Users seeded');

        // Seed Categories
        const categories = await Category.insertMany([
            { name: 'Dogs', description: 'Various dog breeds, puppies, and canine friends.' },
            { name: 'Cats', description: 'Cute cats and kittens of different breeds.' },
            { name: 'Accessories', description: 'Leashes, collars, beds, toys, and grooming tools.' },
            { name: 'Food', description: 'Premium pet food for dogs, cats, and small animals.' }
        ]);
        console.log('Categories seeded');

        const dogs = categories[0]._id;
        const cats = categories[1]._id;
        const accessories = categories[2]._id;
        const food = categories[3]._id;

        // Seed Products
        const products = await Product.insertMany([
            { category_id: dogs, name: 'Golden Retriever Puppy', description: 'Adorable 3-month-old Golden Retriever, very friendly.', price: 1200.00, stock: 3, breed: 'Golden Retriever', specs: 'Age: 3 months, Vaccinated: Yes', image_url: 'https://placehold.co/400x300?text=Golden+Retriever' },
            { category_id: dogs, name: 'French Bulldog', description: 'Energetic 5-month-old Frenchie, great for apartments.', price: 1500.00, stock: 2, breed: 'French Bulldog', specs: 'Age: 5 months, Color: Fawn', image_url: 'https://placehold.co/400x300?text=French+Bulldog' },
            { category_id: cats, name: 'Persian Cat', description: 'Elegant long-haired Persian cat, calm temperament.', price: 800.00, stock: 4, breed: 'Persian', specs: 'Age: 4 months, Color: White', image_url: 'https://placehold.co/400x300?text=Persian+Cat' },
            { category_id: cats, name: 'Maine Coon', description: 'Friendly giant, one of the largest domestic cat breeds.', price: 1000.00, stock: 2, breed: 'Maine Coon', specs: 'Age: 6 months, Gentle giant', image_url: 'https://placehold.co/400x300?text=Maine+Coon' },
            { category_id: accessories, name: 'Orthopedic Pet Bed', description: 'Memory foam bed for ultimate comfort.', price: 59.99, stock: 50, breed: null, specs: 'Size: Large, Material: Memory Foam', image_url: 'https://placehold.co/400x300?text=Pet+Bed' },
            { category_id: accessories, name: 'Reflective Dog Leash', description: 'Durable 6ft leash with reflective stitching.', price: 15.50, stock: 100, breed: null, specs: 'Length: 6ft, Feature: Reflective', image_url: 'https://placehold.co/400x300?text=Leash' },
            { category_id: food, name: 'Grain-Free Puppy Food', description: 'High-quality kibble for growing puppies.', price: 45.00, stock: 30, breed: null, specs: 'Weight: 5kg, Flavor: Chicken', image_url: 'https://placehold.co/400x300?text=Puppy+Food' },
            { category_id: food, name: 'Gourmet Cat Wet Food Pack', description: 'Assorted seafood flavors in gravy.', price: 22.00, stock: 200, breed: null, specs: 'Weight: 12x85g, Pack: Variety', image_url: 'https://placehold.co/400x300?text=Cat+Food' },
            { category_id: dogs, name: 'Beagle Puppy', description: 'Active and curious 2-month-old Beagle.', price: 900.00, stock: 5, breed: 'Beagle', specs: 'Age: 2 months, Playful', image_url: 'https://placehold.co/400x300?text=Beagle' },
            { category_id: accessories, name: 'Interactive Cat Toy', description: 'Spinning toy with feathers to keep cats engaged.', price: 12.99, stock: 75, breed: null, specs: 'Type: Battery-operated, Fun', image_url: 'https://placehold.co/400x300?text=Cat+Toy' }
        ]);
        console.log('Products seeded');

        // Seed Orders
        const orders = await Order.insertMany([
            { user_id: users[1]._id, total_price: 75.49, status: 'Completed', shipping_address: '123 Customer Ave, New York, NY', phone: '0987654321' },
            { user_id: users[2]._id, total_price: 1200.00, status: 'Pending', shipping_address: '456 Buyer Blvd, Los Angeles, CA', phone: '0555123456' }
        ]);
        console.log('Orders seeded');

        // Seed Order Details
        await OrderDetail.insertMany([
            { order_id: orders[0]._id, product_id: products[4]._id, quantity: 1, price: 59.99 },
            { order_id: orders[0]._id, product_id: products[5]._id, quantity: 1, price: 15.50 },
            { order_id: orders[1]._id, product_id: products[0]._id, quantity: 1, price: 1200.00 }
        ]);
        console.log('Order Details seeded');

        // Seed Reviews
        await Review.insertMany([
            { user_id: users[1]._id, product_id: products[4]._id, rating: 5, comment: 'My dog loves this bed! Worth every penny.' },
            { user_id: users[1]._id, product_id: products[5]._id, rating: 4, comment: 'Good quality leash, very visible at night.' },
            { user_id: users[2]._id, product_id: products[0]._id, rating: 5, comment: 'Beautiful puppy! Arrived healthy and happy.' }
        ]);
        console.log('Reviews seeded');

        console.log('\n✅ Database seeded successfully!');
        process.exit(0);
    } catch (err) {
        console.error('❌ Seed error:', err);
        process.exit(1);
    }
};

seedDB();
