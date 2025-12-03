-- Function untuk auto-update timestamp updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL,
    full_name VARCHAR(100) NOT NULL,
    reset_password_token VARCHAR(255),
    reset_password_expires TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- nambah column role di table users
ALTER TABLE users ADD COLUMN role VARCHAR(20) DEFAULT 'user';
ALTER TABLE users ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20);
ALTER TABLE users ADD COLUMN IF NOT EXISTS avatar_url TEXT;
ALTER TABLE users ADD COLUMN IF NOT EXISTS nationality VARCHAR(100) DEFAULT 'Indonesia';

-- update role jadi admin untuk email
UPDATE users SET role = 'admin' WHERE email = 'robin@gmail.com';

-- Indexes untuk users
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

-- Trigger untuk auto-update users
CREATE TRIGGER update_users_updated_at 
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: locations (lokasi/negara)
CREATE TABLE locations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    country VARCHAR(100) NOT NULL,
    region VARCHAR(100),
    city VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: destinations (destinasi wisata)
CREATE TABLE destinations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    image_url TEXT,
    is_halal_friendly BOOLEAN DEFAULT true,
    facilities TEXT[],
    rating DECIMAL(2,1) DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes untuk destinations
CREATE INDEX idx_destinations_category ON destinations(category);

-- Trigger untuk auto-update destinations
CREATE TRIGGER update_destinations_updated_at 
BEFORE UPDATE ON destinations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: packages (paket wisata)
CREATE TABLE packages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    destination_id UUID NOT NULL,
    name VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    description TEXT,
    image_url TEXT,
    price DECIMAL(12,2) NOT NULL,
    duration_days INTEGER NOT NULL,
    duration_nights INTEGER,
    max_participants INTEGER,
    quota INTEGER DEFAULT 0,
    quota_filled INTEGER DEFAULT 0,
    itinerary JSONB,
    facilities TEXT[],
    includes JSONB,
    excludes JSONB,
    airline VARCHAR(100),
    departure_airport VARCHAR(100),
    arrival_airport VARCHAR(100),
    start_date DATE,
    end_date DATE,
    departure_dates JSONB,
    is_active BOOLEAN DEFAULT true,
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_package_destination 
        FOREIGN KEY (destination_id) 
        REFERENCES destinations(id) 
        ON DELETE CASCADE
);

-- Indexes untuk packages
CREATE INDEX idx_packages_destination ON packages(destination_id);
CREATE INDEX idx_packages_slug ON packages(slug);
CREATE INDEX idx_packages_is_active ON packages(is_active);
CREATE INDEX idx_packages_is_featured ON packages(is_featured);

-- Trigger untuk auto-update packages
CREATE TRIGGER update_packages_updated_at 
BEFORE UPDATE ON packages
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: bookings (pemesanan paket)
CREATE TABLE bookings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    package_id UUID NOT NULL,
    booking_code VARCHAR(50) UNIQUE,
    booking_date DATE NOT NULL,
    departure_date DATE,
    total_participants INTEGER NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    status VARCHAR(50) DEFAULT 'pending',
    payment_status VARCHAR(50) DEFAULT 'unpaid',
    fullname VARCHAR(255),
    email VARCHAR(255),
    phone_number VARCHAR(20),
    whatsapp_contact VARCHAR(20),
    passport_number VARCHAR(50),
    passport_expiry DATE,
    passport_url TEXT,
    nationality VARCHAR(100) DEFAULT 'Indonesia',
    notes TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_booking_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_booking_package 
        FOREIGN KEY (package_id) 
        REFERENCES packages(id) 
        ON DELETE CASCADE
);

-- Indexes untuk bookings
CREATE INDEX idx_bookings_user ON bookings(user_id);
CREATE INDEX idx_bookings_package ON bookings(package_id);
CREATE INDEX idx_bookings_status ON bookings(status);
CREATE INDEX idx_bookings_booking_code ON bookings(booking_code);

-- Trigger untuk auto-update bookings
CREATE TRIGGER update_bookings_updated_at 
BEFORE UPDATE ON bookings
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: payments (pembayaran)
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL,
    payment_method VARCHAR(50),
    payment_type VARCHAR(50),
    amount DECIMAL(12,2) NOT NULL,
    payment_proof_url TEXT,
    status VARCHAR(50) DEFAULT 'pending',
    paid_at TIMESTAMP,
    verified_by UUID,
    verified_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_payment_booking 
        FOREIGN KEY (booking_id) 
        REFERENCES bookings(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_payment_verifier 
        FOREIGN KEY (verified_by) 
        REFERENCES users(id) 
        ON DELETE SET NULL
);

-- Indexes untuk payments
CREATE INDEX idx_payments_booking ON payments(booking_id);
CREATE INDEX idx_payments_status ON payments(status);

-- Table: reviews (ulasan pengguna)
CREATE TABLE reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    booking_id UUID NOT NULL,
    package_id UUID,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    review_text TEXT,
    images JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_review_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_review_booking 
        FOREIGN KEY (booking_id) 
        REFERENCES bookings(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_review_package 
        FOREIGN KEY (package_id) 
        REFERENCES packages(id) 
        ON DELETE CASCADE
);

-- Indexes untuk reviews
CREATE INDEX idx_reviews_user ON reviews(user_id);
CREATE INDEX idx_reviews_package ON reviews(package_id);
CREATE INDEX idx_reviews_booking ON reviews(booking_id);

-- Trigger untuk auto-update reviews
CREATE TRIGGER update_reviews_updated_at 
BEFORE UPDATE ON reviews
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: wishlists (daftar keinginan)
CREATE TABLE wishlists (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    package_id UUID NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_wishlist_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_wishlist_package 
        FOREIGN KEY (package_id) 
        REFERENCES packages(id) 
        ON DELETE CASCADE,
    CONSTRAINT unique_user_package 
        UNIQUE(user_id, package_id)
);

-- Indexes untuk wishlists
CREATE INDEX idx_wishlists_user ON wishlists(user_id);
CREATE INDEX idx_wishlists_package ON wishlists(package_id);

-- Table: testimonials (testimoni unggulan)
CREATE TABLE testimonials (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    package_id UUID,
    booking_id UUID,
    name VARCHAR(255) NOT NULL,
    avatar_url TEXT,
    testimonial_text TEXT NOT NULL,
    rating DECIMAL(2,1),
    is_featured BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_testimonial_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE,
    CONSTRAINT fk_testimonial_package 
        FOREIGN KEY (package_id) 
        REFERENCES packages(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_testimonial_booking 
        FOREIGN KEY (booking_id) 
        REFERENCES bookings(id) 
        ON DELETE SET NULL
);

-- Indexes untuk testimonials
CREATE INDEX idx_testimonials_featured ON testimonials(is_featured);

-- Table: article_categories (kategori artikel)
CREATE TABLE article_categories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) UNIQUE,
    description TEXT,
    icon_url TEXT,
    article_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: articles (artikel/blog)
CREATE TABLE articles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) UNIQUE,
    category VARCHAR(100),
    category_id UUID,
    content TEXT NOT NULL,
    excerpt TEXT,
    cover_image_url TEXT,
    tags JSONB,
    author_id UUID,
    views INTEGER DEFAULT 0,
    read_time VARCHAR(20),
    is_published BOOLEAN DEFAULT false,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_article_author 
        FOREIGN KEY (author_id) 
        REFERENCES users(id) 
        ON DELETE SET NULL,
    CONSTRAINT fk_article_category 
        FOREIGN KEY (category_id) 
        REFERENCES article_categories(id) 
        ON DELETE SET NULL
);

-- Indexes untuk articles
CREATE INDEX idx_articles_category ON articles(category_id);
CREATE INDEX idx_articles_author ON articles(author_id);
CREATE INDEX idx_articles_slug ON articles(slug);
CREATE INDEX idx_articles_published ON articles(is_published);

-- Trigger untuk auto-update articles
CREATE TRIGGER update_articles_updated_at 
BEFORE UPDATE ON articles
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Table: community_posts (postingan komunitas)
CREATE TABLE community_posts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    category VARCHAR(100),
    rating DECIMAL(2,1),
    likes_count INTEGER DEFAULT 0,
    comments_count INTEGER DEFAULT 0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_community_post_user 
        FOREIGN KEY (user_id) 
        REFERENCES users(id) 
        ON DELETE CASCADE
);

-- Indexes untuk community_posts
CREATE INDEX idx_community_posts_user ON community_posts(user_id);

-- Trigger untuk auto-update community_posts
CREATE TRIGGER update_community_posts_updated_at 
BEFORE UPDATE ON community_posts
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- View: v_packages_with_destination (paket dengan detail destinasi)
CREATE OR REPLACE VIEW v_packages_with_destination AS
SELECT 
    p.*,
    d.name as destination_name,
    d.location as destination_location,
    d.category as destination_category,
    d.image_url as destination_image_url
FROM packages p
JOIN destinations d ON p.destination_id = d.id;

-- View: v_bookings_detail (booking dengan detail lengkap)
CREATE OR REPLACE VIEW v_bookings_detail AS
SELECT 
    b.*,
    u.full_name as user_full_name,
    u.email as user_email,
    p.name as package_name,
    p.price as package_price,
    d.name as destination_name
FROM bookings b
JOIN users u ON b.user_id = u.id
JOIN packages p ON b.package_id = p.id
JOIN destinations d ON p.destination_id = d.id;

-- View: v_reviews_detail (review dengan detail lengkap)
CREATE OR REPLACE VIEW v_reviews_detail AS
SELECT 
    r.*,
    u.full_name as user_name,
    u.avatar_url as user_avatar,
    p.name as package_name
FROM reviews r
JOIN users u ON r.user_id = u.id
LEFT JOIN packages p ON r.package_id = p.id;

-- Seed: locations (data negara/lokasi)
INSERT INTO locations (country, region) VALUES
('Indonesia', 'Asia Tenggara'),
('Korea Selatan', 'Asia Timur'),
('Jepang', 'Asia Timur'),
('Turki', 'Timur Tengah'),
('Arab Saudi', 'Timur Tengah'),
('Uzbekistan', 'Asia Tengah'),
('Singapura', 'Asia Tenggara'),
('Malaysia', 'Asia Tenggara')
ON CONFLICT DO NOTHING;

-- Seed: article_categories (kategori artikel)
INSERT INTO article_categories (name, slug, description) VALUES
('Tips Travel', 'tips-travel', 'Tips dan trik untuk perjalanan yang nyaman'),
('Destinasi', 'destinasi', 'Rekomendasi destinasi halal friendly'),
('Kuliner', 'kuliner', 'Kuliner halal di berbagai destinasi'),
('Budaya', 'budaya', 'Budaya dan tradisi islami')
ON CONFLICT (slug) DO NOTHING;


COMMIT;