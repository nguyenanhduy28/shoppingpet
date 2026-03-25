// ==================== API CONFIG ====================
const API_URL = 'http://127.0.0.1:5000/api';

// ==================== HELPER FUNCTIONS ====================
function formatPrice(price) {
    return new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(price);
}

function generateStars(rating = 5) {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    let stars = '★'.repeat(fullStars);
    if (hasHalfStar) stars += '☆';
    return stars;
}

// ==================== PRODUCT LISTING PAGE ====================
async function fetchCategories() {
    try {
        const response = await fetch(`${API_URL}/products/categories`);
        const result = await response.json();
        if (result.success) {
            renderCategories(result.data);
        }
    } catch (err) {
        console.error('Error fetching categories:', err);
    }
}

function renderCategories(categories) {
    const categoryList = document.querySelector('.category-list');
    if (!categoryList) return;

    categoryList.innerHTML = `
        <button class="category-item active" data-category="all">
            <span class="category-icon">🌟</span>
            <span>Tất cả</span>
        </button>
        ${categories.map(cat => `
            <button class="category-item" data-category="${cat.name}">
                <span class="category-icon">🐾</span>
                <span>${cat.name}</span>
            </button>
        `).join('')}
    `;
    setupCategoryFilter();
}

async function fetchProducts(filters = {}) {
    try {
        const queryParams = new URLSearchParams(filters).toString();
        const response = await fetch(`${API_URL}/products?${queryParams}`);
        const result = await response.json();
        if (result.success) {
            renderProducts(result.data);
            const productCount = document.getElementById('product-count');
            if (productCount) productCount.textContent = `${result.total} sản phẩm`;
        }
    } catch (err) {
        console.error('Error fetching products:', err);
    }
}

function renderProducts(products) {
    const productGrid = document.getElementById('productGrid');
    if (!productGrid) return;

    if (products.length === 0) {
        productGrid.innerHTML = '<p class="no-products">Không tìm thấy sản phẩm nào.</p>';
        return;
    }

    productGrid.innerHTML = products.map(product => `
        <div class="product-card" onclick="goToProductDetail('${product._id}')">
            <img src="${product.image_url || 'https://via.placeholder.com/400x300?text=No+Image'}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <p class="product-category">${product.category_name}</p>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-rating">
                    <span class="stars">${generateStars(5)}</span>
                    <span class="rating-count">(0)</span>
                </div>
                <div class="product-price">
                    ${formatPrice(product.price)}
                </div>
                <button class="btn btn-primary">Xem chi tiết</button>
            </div>
        </div>
    `).join('');
}

function setupCategoryFilter() {
    const categoryButtons = document.querySelectorAll('.category-item');
    categoryButtons.forEach(button => {
        button.addEventListener('click', () => {
            categoryButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            const category = button.getAttribute('data-category');
            const filters = category === 'all' ? {} : { category };
            fetchProducts(filters);
        });
    });
}

function setupSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchBtn && searchInput) {
        const handleSearch = () => {
            const search = searchInput.value.trim();
            if (search) {
                fetchProducts({ search });
            } else {
                fetchProducts();
            }
        };

        searchBtn.addEventListener('click', handleSearch);
        searchInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSearch();
        });
    }
}

function goToProductDetail(productId) {
    const isRoot = !window.location.pathname.includes('src/pages/');
    const path = isRoot ? 'src/pages/product-detail.html' : 'product-detail.html';
    window.location.href = `${path}?id=${productId}`;
}

// ==================== PRODUCT DETAIL PAGE ====================
async function fetchProductDetail() {
    const params = new URLSearchParams(window.location.search);
    const id = params.get('id');
    if (!id) return;

    try {
        const response = await fetch(`${API_URL}/products/${id}`);
        const result = await response.json();
        if (result.success) {
            renderProductDetail(result.data);
            fetchRelatedProducts(result.data.category_name, id);
        }
    } catch (err) {
        console.error('Error fetching product detail:', err);
    }
}

function renderProductDetail(product) {
    const detailContainer = document.getElementById('productDetail');
    if (!detailContainer) return;

    // Update breadcrumb
    const breadcrumbCategory = document.getElementById('breadcrumbCategory');
    const breadcrumbProduct = document.getElementById('breadcrumbProduct');
    if (breadcrumbCategory) breadcrumbCategory.textContent = product.category_name;
    if (breadcrumbProduct) breadcrumbProduct.textContent = product.name;

    // Simple specs parsing if it's a string
    let specsHtml = '';
    if (product.specs) {
        const specs = product.specs.split(',').map(s => s.trim());
        specsHtml = specs.map(spec => {
            const [key, value] = spec.split(':').map(i => i.trim());
            return `
                <div class="spec-item">
                    <span class="spec-label">${key || 'Thông tin'}:</span>
                    <span class="spec-value">${value || spec}</span>
                </div>
            `;
        }).join('');
    }

    detailContainer.innerHTML = `
        <div class="detail-layout">
            <div class="detail-images">
                <div class="main-image-container">
                    <img id="mainImage" src="${product.image_url}" alt="${product.name}" class="main-image">
                </div>
            </div>
            <div class="detail-info">
                <h1>${product.name}</h1>
                <div class="product-rating">
                    <span class="stars">${generateStars(5)}</span>
                    <span class="rating-count">(0 đánh giá)</span>
                </div>
                <div class="detail-price">
                    ${formatPrice(product.price)}
                </div>
                <p class="detail-description">${product.description || 'Chưa có mô tả cho sản phẩm này.'}</p>
                
                <div class="detail-specs">
                    <h3>Thông Số Kỹ Thuật</h3>
                    <div class="spec-item">
                        <span class="spec-label">Giống loài:</span>
                        <span class="spec-value">${product.breed || 'N/A'}</span>
                    </div>
                    <div class="spec-item">
                        <span class="spec-label">Tình trạng kho:</span>
                        <span class="spec-value">${product.stock > 0 ? `Còn hàng (${product.stock})` : 'Hết hàng'}</span>
                    </div>
                    ${specsHtml}
                </div>
                
                <div class="quantity-selector">
                    <button class="quantity-btn" onclick="changeQuantity(-1)">-</button>
                    <span class="quantity-value" id="quantityValue">1</span>
                    <button class="quantity-btn" onclick="changeQuantity(1)">+</button>
                </div>
                
                <button class="btn-add-cart" onclick="addToCart('${product._id}', '${product.name}')">🛒 Thêm vào giỏ hàng</button>
                <button class="btn-back" onclick="location.href='../../index.html'">← Quay lại danh sách</button>
            </div>
        </div>
    `;
}

async function fetchRelatedProducts(category, currentId) {
    try {
        const response = await fetch(`${API_URL}/products?category=${category}&limit=4`);
        const result = await response.json();
        if (result.success) {
            const relatedProducts = result.data.filter(p => p._id != currentId);
            renderRelatedProducts(relatedProducts);
        }
    } catch (err) {
        console.error('Error fetching related products:', err);
    }
}

function renderRelatedProducts(products) {
    const relatedGrid = document.getElementById('relatedProducts');
    if (!relatedGrid) return;

    relatedGrid.innerHTML = products.map(product => `
        <div class="product-card" onclick="goToProductDetail('${product._id}')">
            <img src="${product.image_url}" alt="${product.name}" class="product-image">
            <div class="product-info">
                <p class="product-category">${product.category_name}</p>
                <h3 class="product-name">${product.name}</h3>
                <div class="product-price">
                    ${formatPrice(product.price)}
                </div>
                <button class="btn btn-primary">Xem chi tiết</button>
            </div>
        </div>
    `).join('');
}

// Global functions for UI interaction
window.changeQuantity = (delta) => {
    const qVal = document.getElementById('quantityValue');
    let current = parseInt(qVal.textContent);
    current = Math.max(1, current + delta);
    qVal.textContent = current;
};

window.addToCart = async (productId, productName) => {
    const token = localStorage.getItem('token');
    if (!token) {
        alert('Vui lòng đăng nhập để thêm sản phẩm vào giỏ hàng!');
        return;
    }

    const quantity = parseInt(document.getElementById('quantityValue').textContent);
    
    try {
        const response = await fetch(`${API_URL}/cart`, {
            method: 'POST',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ product_id: productId, quantity: quantity })
        });
        const result = await response.json();

        if (result.success) {
            alert(`Đã thêm ${quantity} x "${productName}" vào giỏ hàng!`);
            updateCartBadge();
        } else {
            alert('Lỗi: ' + result.message);
        }
    } catch (err) {
        console.error('Error adding to cart:', err);
        alert('Không thể kết nối đến máy chủ.');
    }
};

async function updateCartBadge() {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
        const response = await fetch(`${API_URL}/cart`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await response.json();
        if (result.success) {
            const badge = document.querySelector('.cart-badge');
            if (badge) {
                const totalQty = result.data.reduce((sum, item) => sum + item.quantity, 0);
                badge.textContent = totalQty;
            }
        }
    } catch (err) {
        console.error('Error updating cart badge:', err);
    }
}

// ==================== AUTH STATE UI ====================
function updateAuthUI() {
    const authLinks = document.getElementById('authLinks');
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (authLinks && user && token) {
        const isRoot = !window.location.pathname.includes('src/pages/');
        const adminPath = isRoot ? 'src/pages/admin.html' : 'admin.html';
        
        authLinks.innerHTML = `
            <span class="nav-link" style="color: #333; font-weight: 600;">Chào, ${user.full_name.split(' ')[0]}!</span>
            ${user.role === 'admin' ? `<a href="${adminPath}" class="nav-link" style="color: #ff6b6b;">Quản trị</a>` : ''}
            <a href="#" class="nav-link" onclick="logout()">Đăng xuất</a>
        `;
    }
}

window.logout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '../../index.html';
};

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', () => {
    updateAuthUI(); // Cập nhật Navbar khi load trang
    const isProductListPage = document.getElementById('productGrid') !== null;
    const isProductDetailPage = document.getElementById('productDetail') !== null;

    updateCartBadge(); // Update badge on every page load

    if (isProductListPage) {
        fetchCategories();
        fetchProducts();
        setupSearch();
    }

    if (isProductDetailPage) {
        fetchProductDetail();
    }
});
