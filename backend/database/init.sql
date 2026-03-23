-- Database initialization for Pet Shop E-commerce (Microsoft SQL Server - T-SQL)
-- This script creates all necessary tables and seeds initial data to support 25 features.

-- 1. Create Tables

-- Categories (Manage Categories CRUD)
CREATE TABLE Categories (
    id INT IDENTITY(1,1) PRIMARY KEY,
    name NVARCHAR(100) NOT NULL UNIQUE,
    description NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE()
);

-- Users (Register, Login, Manage Profile, Manage Users)
CREATE TABLE Users (
    id INT IDENTITY(1,1) PRIMARY KEY,
    full_name NVARCHAR(255) NOT NULL,
    email NVARCHAR(255) NOT NULL UNIQUE,
    password NVARCHAR(255) NOT NULL, -- Note: Store hashed passwords in production
    role NVARCHAR(20) DEFAULT 'customer' CHECK (role IN ('admin', 'customer')),
    phone NVARCHAR(20),
    address NVARCHAR(MAX),
    is_banned BIT DEFAULT 0,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE()
);

-- Products (Product Listing, Product Detail, Search, Filter, Manage Products)
CREATE TABLE Products (
    id INT IDENTITY(1,1) PRIMARY KEY,
    category_id INT NOT NULL,
    name NVARCHAR(255) NOT NULL,
    description NVARCHAR(MAX),
    price DECIMAL(10, 2) NOT NULL,
    stock INT DEFAULT 0,
    breed NVARCHAR(100), -- Specific for pet products
    specs NVARCHAR(MAX), -- Store additional specs (age, size, etc.) as text or JSON
    image_url NVARCHAR(255),
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (category_id) REFERENCES Categories(id) ON DELETE CASCADE
);

-- Carts (Add to Cart, Update Cart, Remove from Cart)
CREATE TABLE Carts (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL DEFAULT 1,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
);

-- Orders (Checkout, View Order History, Order Detail, Manage Orders)
CREATE TABLE Orders (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    total_price DECIMAL(10, 2) NOT NULL,
    status NVARCHAR(20) DEFAULT 'Pending' CHECK (status IN ('Pending', 'Shipped', 'Completed', 'Cancelled')),
    shipping_address NVARCHAR(MAX) NOT NULL,
    phone NVARCHAR(20) NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    updated_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE
);

-- Order_Details (Part of Order Detail feature)
CREATE TABLE Order_Details (
    id INT IDENTITY(1,1) PRIMARY KEY,
    order_id INT NOT NULL,
    product_id INT NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10, 2) NOT NULL, -- Store price at the time of order to avoid history issues
    FOREIGN KEY (order_id) REFERENCES Orders(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
);

-- Reviews (Rate & Review products)
CREATE TABLE Reviews (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    rating INT CHECK (rating >= 1 AND rating <= 5),
    comment NVARCHAR(MAX),
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
);

-- Wishlists (Wishlist - Save for later)
CREATE TABLE Wishlists (
    id INT IDENTITY(1,1) PRIMARY KEY,
    user_id INT NOT NULL,
    product_id INT NOT NULL,
    created_at DATETIME2 DEFAULT GETDATE(),
    FOREIGN KEY (user_id) REFERENCES Users(id) ON DELETE CASCADE,
    FOREIGN KEY (product_id) REFERENCES Products(id) ON DELETE CASCADE
);

-- 2. Seed Data

-- Seed Users
INSERT INTO Users (full_name, email, password, role, phone, address) VALUES
(N'Quản trị viên', N'admin@shoppet.vn', N'$2b$10$OaklZKgmmtNAiYnjgj/Z6.3deQ59Vcyqi4VPn.Wm0NuxFutZvxYea', N'admin', N'0999888777', N'Hệ thống ShopPet'),
(N'Admin Admin', N'admin@petshop.com', N'admin_hashed_pw', N'admin', N'0123456789', N'Main Street Pet Shop HQ'),
(N'Customer One', N'customer1@example.com', N'customer1_hashed_pw', N'customer', N'0987654321', N'123 Customer Ave, New York, NY'),
(N'Customer Two', N'customer2@example.com', N'customer2_hashed_pw', N'customer', N'0555123456', N'456 Buyer Blvd, Los Angeles, CA');

-- Seed Categories
INSERT INTO Categories (name, description) VALUES
(N'Dogs', N'Various dog breeds, puppies, and canine friends.'),
(N'Cats', N'Cute cats and kittens of different breeds.'),
(N'Accessories', N'Leashes, collars, beds, toys, and grooming tools.'),
(N'Food', N'Premium pet food for dogs, cats, and small animals.');

-- Seed Products (10 items)
INSERT INTO Products (category_id, name, description, price, stock, breed, specs, image_url) VALUES
(1, N'Golden Retriever Puppy', N'Adorable 3-month-old Golden Retriever, very friendly.', 1200.00, 3, N'Golden Retriever', N'Age: 3 months, Vaccinated: Yes', N'https://placehold.co/400x300?text=Golden+Retriever'),
(1, N'French Bulldog', N'Energetic 5-month-old Frenchie, great for apartments.', 1500.00, 2, N'French Bulldog', N'Age: 5 months, Color: Fawn', N'https://placehold.co/400x300?text=French+Bulldog'),
(2, N'Persian Cat', N'Elegant long-haired Persian cat, calm temperament.', 800.00, 4, N'Persian', N'Age: 4 months, Color: White', N'https://placehold.co/400x300?text=Persian+Cat'),
(2, N'Maine Coon', N'Friendly giant, one of the largest domestic cat breeds.', 1000.00, 2, N'Maine Coon', N'Age: 6 months, Gentle giant', N'https://placehold.co/400x300?text=Maine+Coon'),
(3, N'Orthopedic Pet Bed', N'Memory foam bed for ultimate comfort.', 59.99, 50, NULL, N'Size: Large, Material: Memory Foam', N'https://placehold.co/400x300?text=Pet+Bed'),
(3, N'Reflective Dog Leash', N'Durable 6ft leash with reflective stitching.', 15.50, 100, NULL, N'Length: 6ft, Feature: Reflective', N'https://placehold.co/400x300?text=Leash'),
(4, N'Grain-Free Puppy Food', N'High-quality kibble for growing puppies.', 45.00, 30, NULL, N'Weight: 5kg, Flavor: Chicken', N'https://placehold.co/400x300?text=Puppy+Food'),
(4, N'Gourmet Cat Wet Food Pack', N'Assorted seafood flavors in gravy.', 22.00, 200, NULL, N'Weight: 12x85g, Pack: Variety', N'https://placehold.co/400x300?text=Cat+Food'),
(1, N'Beagle Puppy', N'Active and curious 2-month-old Beagle.', 900.00, 5, N'Beagle', N'Age: 2 months, Playful', N'https://placehold.co/400x300?text=Beagle'),
(3, N'Interactive Cat Toy', N'Spinning toy with feathers to keep cats engaged.', 12.99, 75, NULL, N'Type: Battery-operated, Fun', N'https://placehold.co/400x300?text=Cat+Toy');

-- Seed Orders
INSERT INTO Orders (user_id, total_price, status, shipping_address, phone) VALUES
(2, 75.49, N'Completed', N'123 Customer Ave, New York, NY', N'0987654321'),
(3, 1200.00, N'Pending', N'456 Buyer Blvd, Los Angeles, CA', N'0555123456');

-- Seed Order Details
INSERT INTO Order_Details (order_id, product_id, quantity, price) VALUES
(1, 5, 1, 59.99),
(1, 6, 1, 15.50),
(2, 1, 1, 1200.00);

-- Seed Reviews
INSERT INTO Reviews (user_id, product_id, rating, comment) VALUES
(2, 5, 5, N'My dog loves this bed! Worth every penny.'),
(2, 6, 4, N'Good quality leash, very visible at night.'),
(3, 1, 5, N'Beautiful puppy! Arrived healthy and happy.');
