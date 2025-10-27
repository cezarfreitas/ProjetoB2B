-- =====================================================
-- B2B Tropical - E-commerce de Chinelos
-- Schema do Banco de Dados MySQL
-- =====================================================

-- Criar banco de dados (se não existir)
CREATE DATABASE IF NOT EXISTS b2btropical CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE b2btropical;

-- =====================================================
-- TABELA: users (Clientes B2B)
-- =====================================================
CREATE TABLE IF NOT EXISTS users (
    id VARCHAR(25) PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    name VARCHAR(255) NOT NULL,
    company VARCHAR(255) NOT NULL,
    cnpj VARCHAR(18) UNIQUE,
    phone VARCHAR(20),
    address TEXT,
    city VARCHAR(100),
    state VARCHAR(2),
    zipCode VARCHAR(10),
    role ENUM('ADMIN', 'CUSTOMER', 'MANAGER') DEFAULT 'CUSTOMER',
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_email (email),
    INDEX idx_cnpj (cnpj),
    INDEX idx_company (company),
    INDEX idx_role (role)
);

-- =====================================================
-- TABELA: products (Produtos - Chinelos)
-- =====================================================
CREATE TABLE IF NOT EXISTS products (
    id VARCHAR(25) PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    sku VARCHAR(100) UNIQUE NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(100),
    gender ENUM('MASCULINO', 'FEMININO', 'UNISSEX', 'INFANTIL') NOT NULL,
    colors JSON, -- Array de cores disponíveis
    sizes JSON,  -- Array de tamanhos disponíveis
    price DECIMAL(10,2) NOT NULL,
    costPrice DECIMAL(10,2),
    stock INT DEFAULT 0,
    minStock INT DEFAULT 0,
    weight DECIMAL(8,2),
    dimensions VARCHAR(100),
    isActive BOOLEAN DEFAULT TRUE,
    images JSON, -- Array de URLs de imagens
    tags JSON,   -- Array de tags
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_sku (sku),
    INDEX idx_brand (brand),
    INDEX idx_category (category),
    INDEX idx_gender (gender),
    INDEX idx_price (price),
    INDEX idx_stock (stock),
    INDEX idx_isActive (isActive)
);

-- =====================================================
-- TABELA: product_grades (Grades de Venda B2B)
-- =====================================================
CREATE TABLE IF NOT EXISTS product_grades (
    id VARCHAR(25) PRIMARY KEY,
    productId VARCHAR(25) NOT NULL,
    gradeName VARCHAR(100) NOT NULL, -- Ex: "Varejo", "Atacado", "Distribuidor"
    minQuantity INT NOT NULL,        -- Quantidade mínima para esta grade
    maxQuantity INT,                 -- Quantidade máxima (opcional)
    price DECIMAL(10,2) NOT NULL,    -- Preço para esta grade
    isActive BOOLEAN DEFAULT TRUE,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    INDEX idx_productId (productId),
    INDEX idx_gradeName (gradeName),
    INDEX idx_minQuantity (minQuantity)
);

-- =====================================================
-- TABELA: orders (Pedidos)
-- =====================================================
CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(25) PRIMARY KEY,
    orderNumber VARCHAR(50) UNIQUE NOT NULL,
    userId VARCHAR(25) NOT NULL,
    status ENUM('PENDING', 'CONFIRMED', 'PROCESSING', 'SHIPPED', 'DELIVERED', 'CANCELLED') DEFAULT 'PENDING',
    subtotal DECIMAL(10,2) NOT NULL,
    discount DECIMAL(10,2) DEFAULT 0,
    shipping DECIMAL(10,2) DEFAULT 0,
    total DECIMAL(10,2) NOT NULL,
    notes TEXT,
    shippingAddress TEXT NOT NULL,
    billingAddress TEXT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id),
    INDEX idx_orderNumber (orderNumber),
    INDEX idx_userId (userId),
    INDEX idx_status (status),
    INDEX idx_createdAt (createdAt)
);

-- =====================================================
-- TABELA: order_items (Itens dos Pedidos)
-- =====================================================
CREATE TABLE IF NOT EXISTS order_items (
    id VARCHAR(25) PRIMARY KEY,
    orderId VARCHAR(25) NOT NULL,
    productId VARCHAR(25) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL, -- Preço no momento do pedido
    total DECIMAL(10,2) NOT NULL,
    
    FOREIGN KEY (orderId) REFERENCES orders(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id),
    INDEX idx_orderId (orderId),
    INDEX idx_productId (productId)
);

-- =====================================================
-- TABELA: cart_items (Carrinho de Compras)
-- =====================================================
CREATE TABLE IF NOT EXISTS cart_items (
    id VARCHAR(25) PRIMARY KEY,
    userId VARCHAR(25) NOT NULL,
    productId VARCHAR(25) NOT NULL,
    quantity INT NOT NULL,
    createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    FOREIGN KEY (userId) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (productId) REFERENCES products(id) ON DELETE CASCADE,
    UNIQUE KEY unique_user_product (userId, productId),
    INDEX idx_userId (userId),
    INDEX idx_productId (productId)
);

-- =====================================================
-- DADOS INICIAIS
-- =====================================================

-- Inserir usuário admin padrão
INSERT INTO users (id, email, name, company, role, isActive) VALUES 
('admin_001', 'admin@b2btropical.com', 'Administrador', 'B2B Tropical', 'ADMIN', TRUE);

-- Inserir categorias de chinelos
INSERT INTO products (id, name, description, sku, brand, category, gender, colors, sizes, price, stock, isActive) VALUES 
('prod_001', 'Havaianas Tradicionais', 'Chinelos clássicos brasileiros', 'HAV-TRAD-001', 'Havaianas', 'Tradicionais', 'UNISSEX', '["Branco", "Azul", "Vermelho"]', '["35", "36", "37", "38", "39", "40", "41", "42"]', 29.90, 100, TRUE),
('prod_002', 'Ipanema Feminino', 'Chinelos elegantes para mulheres', 'IPA-FEM-001', 'Ipanema', 'Feminino', 'FEMININO', '["Rosa", "Branco", "Preto"]', '["35", "36", "37", "38", "39", "40"]', 45.90, 80, TRUE),
('prod_003', 'Rider Esportivo', 'Chinelos esportivos resistentes', 'RID-ESP-001', 'Rider', 'Esportivo', 'MASCULINO', '["Preto", "Azul", "Cinza"]', '["38", "39", "40", "41", "42", "43", "44"]', 89.90, 60, TRUE);

-- Inserir grades de venda para os produtos
INSERT INTO product_grades (id, productId, gradeName, minQuantity, maxQuantity, price, isActive) VALUES 
-- Grades para Havaianas Tradicionais
('grade_001', 'prod_001', 'Varejo', 1, 11, 29.90, TRUE),
('grade_002', 'prod_001', 'Atacado', 12, 49, 24.90, TRUE),
('grade_003', 'prod_001', 'Distribuidor', 50, NULL, 19.90, TRUE),

-- Grades para Ipanema Feminino
('grade_004', 'prod_002', 'Varejo', 1, 11, 45.90, TRUE),
('grade_005', 'prod_002', 'Atacado', 12, 49, 38.90, TRUE),
('grade_006', 'prod_002', 'Distribuidor', 50, NULL, 32.90, TRUE),

-- Grades para Rider Esportivo
('grade_007', 'prod_003', 'Varejo', 1, 11, 89.90, TRUE),
('grade_008', 'prod_003', 'Atacado', 12, 49, 75.90, TRUE),
('grade_009', 'prod_003', 'Distribuidor', 50, NULL, 65.90, TRUE);

-- =====================================================
-- VIEWS ÚTEIS
-- =====================================================

-- View para produtos com informações de estoque
CREATE VIEW v_products_stock AS
SELECT 
    p.id,
    p.name,
    p.sku,
    p.brand,
    p.category,
    p.gender,
    p.price,
    p.stock,
    p.minStock,
    CASE 
        WHEN p.stock = 0 THEN 'Sem Estoque'
        WHEN p.stock <= p.minStock THEN 'Estoque Baixo'
        ELSE 'Em Estoque'
    END as stockStatus,
    p.isActive
FROM products p;

-- View para pedidos com informações do cliente
CREATE VIEW v_orders_customer AS
SELECT 
    o.id,
    o.orderNumber,
    o.status,
    o.total,
    o.createdAt,
    u.name as customerName,
    u.company as customerCompany,
    u.email as customerEmail
FROM orders o
JOIN users u ON o.userId = u.id;

-- =====================================================
-- PROCEDURES ÚTEIS
-- =====================================================

-- Procedure para atualizar estoque após venda
DELIMITER //
CREATE PROCEDURE UpdateStockAfterSale(
    IN p_productId VARCHAR(25),
    IN p_quantity INT
)
BEGIN
    UPDATE products 
    SET stock = stock - p_quantity,
        updatedAt = CURRENT_TIMESTAMP
    WHERE id = p_productId;
END //
DELIMITER ;

-- Procedure para gerar número de pedido único
DELIMITER //
CREATE PROCEDURE GenerateOrderNumber(OUT p_orderNumber VARCHAR(50))
BEGIN
    DECLARE v_count INT;
    DECLARE v_date VARCHAR(8);
    
    SET v_date = DATE_FORMAT(NOW(), '%Y%m%d');
    
    SELECT COUNT(*) + 1 INTO v_count 
    FROM orders 
    WHERE DATE(createdAt) = CURDATE();
    
    SET p_orderNumber = CONCAT('ORD-', v_date, '-', LPAD(v_count, 4, '0'));
END //
DELIMITER ;

-- =====================================================
-- TRIGGERS
-- =====================================================

-- Trigger para atualizar updatedAt automaticamente
DELIMITER //
CREATE TRIGGER tr_users_updated_at 
    BEFORE UPDATE ON users 
    FOR EACH ROW 
BEGIN 
    SET NEW.updatedAt = CURRENT_TIMESTAMP; 
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER tr_products_updated_at 
    BEFORE UPDATE ON products 
    FOR EACH ROW 
BEGIN 
    SET NEW.updatedAt = CURRENT_TIMESTAMP; 
END //
DELIMITER ;

DELIMITER //
CREATE TRIGGER tr_orders_updated_at 
    BEFORE UPDATE ON orders 
    FOR EACH ROW 
BEGIN 
    SET NEW.updatedAt = CURRENT_TIMESTAMP; 
END //
DELIMITER ;

-- =====================================================
-- ÍNDICES ADICIONAIS PARA PERFORMANCE
-- =====================================================

-- Índices compostos para consultas frequentes
CREATE INDEX idx_products_category_gender ON products(category, gender);
CREATE INDEX idx_products_brand_category ON products(brand, category);
CREATE INDEX idx_orders_user_status ON orders(userId, status);
CREATE INDEX idx_order_items_order_product ON order_items(orderId, productId);

-- =====================================================
-- FIM DO SCRIPT
-- =====================================================
