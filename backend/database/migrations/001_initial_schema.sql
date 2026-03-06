CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;

CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    full_name VARCHAR(255) NOT NULL,
    phone VARCHAR(20) UNIQUE NOT NULL,
    email VARCHAR(255),
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(50) NOT NULL CHECK (role IN ('admin', 'validator', 'partner', 'donor')),
    is_active BOOLEAN DEFAULT true,
    is_phone_verified BOOLEAN DEFAULT false,
    phone_verified_at TIMESTAMP,
    last_login TIMESTAMP,
    refresh_token TEXT,
    fcm_token TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_role ON users(role);
CREATE INDEX idx_users_phone ON users(phone);
CREATE INDEX idx_users_email ON users(email) WHERE email IS NOT NULL;


CREATE TABLE validators (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    id_card_url TEXT NOT NULL,
    selfie_url TEXT NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended')),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    rejection_reason TEXT,
    reputation_score INTEGER DEFAULT 0,
    total_deliveries INTEGER DEFAULT 0,
    success_rate DECIMAL(5,2) DEFAULT 0,
    working_quarters TEXT[],
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_validators_status ON validators(verification_status);


CREATE TABLE partners (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    business_name VARCHAR(255) NOT NULL,
    owner_name VARCHAR(255) NOT NULL,
    address TEXT NOT NULL,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    payment_phone VARCHAR(20) NOT NULL,
    payment_operator VARCHAR(50) CHECK (payment_operator IN ('bankily', 'masrivie', 'sedad', 'other')),
    payment_verified BOOLEAN DEFAULT false,
    payment_verified_at TIMESTAMP,
    commerce_registry_url TEXT NOT NULL,
    verification_status VARCHAR(50) DEFAULT 'pending'
        CHECK (verification_status IN ('pending', 'approved', 'rejected', 'suspended')),
    verified_by UUID REFERENCES users(id),
    verified_at TIMESTAMP,
    site_visit_required BOOLEAN DEFAULT true,
    site_visit_date TIMESTAMP,
    site_visit_notes TEXT,
    site_visit_photos TEXT[],
    visited_by UUID REFERENCES users(id),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_partners_status ON partners(verification_status);
CREATE INDEX idx_partners_location ON partners USING GIST (
    ST_SetSRID(ST_MakePoint(location_lng, location_lat), 4326)
) WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;


CREATE TABLE beneficiaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference_code VARCHAR(100) UNIQUE NOT NULL, -- Jamais affiché publiquement
    registered_by UUID NOT NULL REFERENCES users(id),
    description TEXT,
    family_size INTEGER,
    location_quarter VARCHAR(255),
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_beneficiaries_code ON beneficiaries(reference_code);
CREATE INDEX idx_beneficiaries_quarter ON beneficiaries(location_quarter);


CREATE TABLE needs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    validator_id UUID NOT NULL REFERENCES users(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    beneficiary_id UUID REFERENCES beneficiaries(id),
    title VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(50) CHECK (category IN ('iftar_meal', 'food_basket', 'clothing', 'medical', 'other')),
    estimated_amount DECIMAL(10,2) NOT NULL CHECK (estimated_amount > 0),
    location_quarter VARCHAR(255) NOT NULL,
    location_lat DECIMAL(10,8),
    location_lng DECIMAL(11,8),
    status VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending', 'open', 'funded', 'completed', 'cancelled')),
    priority INTEGER DEFAULT 1 CHECK (priority BETWEEN 1 AND 5),
    expiry_date TIMESTAMP,
    funded_at TIMESTAMP,
    completed_at TIMESTAMP,
    cancelled_at TIMESTAMP,
    cancellation_reason TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_needs_status ON needs(status);
CREATE INDEX idx_needs_quarter ON needs(location_quarter);
CREATE INDEX idx_needs_priority ON needs(priority DESC) WHERE status = 'open';
CREATE INDEX idx_needs_expiry ON needs(expiry_date) WHERE status IN ('pending', 'open');
CREATE INDEX idx_needs_location ON needs USING GIST (
    ST_SetSRID(ST_MakePoint(location_lng, location_lat), 4326)
) WHERE location_lat IS NOT NULL AND location_lng IS NOT NULL;


CREATE TABLE transactions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    need_id UUID UNIQUE NOT NULL REFERENCES needs(id),
    donor_id UUID NOT NULL REFERENCES users(id),
    partner_id UUID NOT NULL REFERENCES partners(id),
    amount DECIMAL(10,2) NOT NULL CHECK (amount > 0),
    payment_method VARCHAR(50) CHECK (payment_method IN ('mobile_money', 'card', 'cash')),
    donor_phone VARCHAR(20) NOT NULL,
    partner_phone VARCHAR(20) NOT NULL,
    payment_reference VARCHAR(255),
    payment_status VARCHAR(50) DEFAULT 'pending'
        CHECK (payment_status IN ('pending', 'completed', 'failed')),
    payment_completed_at TIMESTAMP,
    receipt_number VARCHAR(100) UNIQUE NOT NULL, 
    receipt_url TEXT,
    status VARCHAR(50) DEFAULT 'pending'
        CHECK (status IN ('pending', 'completed', 'confirmed', 'failed')),
    blockchain_hash VARCHAR(256), 
    blockchain_tx_hash VARCHAR(256),
    blockchain_explorer_url TEXT,
    blockchain_timestamp TIMESTAMP,
    blockchain_id INTEGER,
    confirmed_by UUID REFERENCES users(id),
    confirmed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_transactions_status ON transactions(status);
CREATE INDEX idx_transactions_donor ON transactions(donor_id);
CREATE INDEX idx_transactions_receipt ON transactions(receipt_number);
CREATE INDEX idx_transactions_blockchain ON transactions(blockchain_tx_hash);
CREATE INDEX idx_transactions_created ON transactions(created_at DESC);


CREATE TABLE impact_proofs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    transaction_id UUID UNIQUE NOT NULL REFERENCES transactions(id),
    proof_type VARCHAR(50) CHECK (proof_type IN ('photo', 'confirmation_code')),
    media_url TEXT NOT NULL,
    thumbnail_url TEXT,
    is_faces_blurred BOOLEAN DEFAULT false, 
    uploaded_by UUID NOT NULL REFERENCES users(id),
    uploaded_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_impact_proofs_transaction ON impact_proofs(transaction_id);


CREATE TABLE admin_actions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    admin_id UUID NOT NULL REFERENCES users(id),
    action_type VARCHAR(100) NOT NULL,
    target_user_id UUID REFERENCES users(id),
    target_validator_id UUID REFERENCES validators(id),
    target_partner_id UUID REFERENCES partners(id),
    target_transaction_id UUID REFERENCES transactions(id),
    reason TEXT,
    metadata JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_admin_actions_admin ON admin_actions(admin_id);
CREATE INDEX idx_admin_actions_created ON admin_actions(created_at DESC);


CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES users(id),
    type VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    body TEXT NOT NULL,
    data JSONB,
    is_read BOOLEAN DEFAULT false,
    read_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_notifications_user ON notifications(user_id, is_read, created_at DESC);


CREATE TABLE verification_codes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    phone VARCHAR(20) NOT NULL,
    code VARCHAR(6) NOT NULL,
    attempts INTEGER DEFAULT 0 CHECK (attempts <= 5), 
    expires_at TIMESTAMP NOT NULL,
    used_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_verification_codes_phone ON verification_codes(phone, expires_at DESC);


-- TRIGGERS

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_users_updated_at BEFORE UPDATE ON users
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_validators_updated_at BEFORE UPDATE ON validators
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_partners_updated_at BEFORE UPDATE ON partners
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_needs_updated_at BEFORE UPDATE ON needs
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
CREATE TRIGGER update_transactions_updated_at BEFORE UPDATE ON transactions
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE OR REPLACE FUNCTION generate_receipt_number()
RETURNS TRIGGER AS $$
BEGIN
    NEW.receipt_number := 'IHSAN-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' ||
                          UPPER(SUBSTRING(MD5(RANDOM()::TEXT) FROM 1 FOR 8));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER transactions_generate_receipt
    BEFORE INSERT ON transactions
    FOR EACH ROW EXECUTE FUNCTION generate_receipt_number();



INSERT INTO users (id, full_name, phone, password_hash, role, is_phone_verified)
VALUES (
    uuid_generate_v4(),
    'Administrateur IHSAN',
    '+22212345678',
    '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj2N/lVQ6Wn2',
    'admin',
    true
);


-- VUES

CREATE VIEW public_dashboard AS
SELECT
    t.id,
    t.amount,
    t.created_at AS donation_date,
    t.confirmed_at,
    t.blockchain_hash,
    t.blockchain_explorer_url,
    n.title AS need_title,
    n.location_quarter,
    ip.thumbnail_url AS proof_image,
    u.full_name AS validator_name
FROM transactions t
JOIN needs n ON t.need_id = n.id
LEFT JOIN impact_proofs ip ON t.id = ip.transaction_id
JOIN users u ON n.validator_id = u.id
WHERE t.status = 'confirmed'
ORDER BY t.confirmed_at DESC
LIMIT 100;

CREATE VIEW global_stats AS
SELECT
    (SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'confirmed') AS total_donations,
    (SELECT COUNT(*) FROM transactions WHERE status = 'confirmed') AS total_transactions,
    (SELECT COUNT(*) FROM needs WHERE status = 'completed') AS total_needs_completed,
    (SELECT COUNT(*) FROM validators WHERE verification_status = 'approved') AS active_validators,
    (SELECT COUNT(*) FROM partners WHERE verification_status = 'approved') AS active_partners,
    (SELECT COUNT(DISTINCT location_quarter) FROM needs) AS quarters_covered;