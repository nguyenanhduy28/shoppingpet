const ADMIN_API_URL = 'http://127.0.0.1:5000/api/admin';
const PROD_API_URL = 'http://127.0.0.1:5000/api/products';
const CAT_API_URL = 'http://127.0.0.1:5000/api/categories';

// ==================== SECURITY CHECK ====================
function checkAdminAuth() {
    const user = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');

    if (!token || !user || user.role !== 'admin') {
        alert('Bạn không có quyền truy cập trang quản trị!');
        window.location.href = '../../index.html';
        return false;
    }
    document.getElementById('adminName').textContent = user.full_name;
    return token;
}

const token = checkAdminAuth();

// ==================== NAVIGATION ====================
document.querySelectorAll('.menu-item[data-target]').forEach(item => {
    item.addEventListener('click', () => {
        const target = item.getAttribute('data-target');
        
        // Update Active Menu
        document.querySelectorAll('.menu-item').forEach(mi => mi.classList.remove('active'));
        item.classList.add('active');

        // Show/Hide Sections
        document.querySelectorAll('.data-section').forEach(sec => sec.classList.remove('active'));
        document.getElementById(`${target}Section`).classList.add('active');

        // Update Title
        const titles = {
            dashboard: 'Tổng quan hệ thống',
            products: 'Quản lý sản phẩm',
            categories: 'Quản lý danh mục',
            orders: 'Quản lý đơn hàng',
            users: 'Quản lý người dùng'
        };
        document.getElementById('pageTitle').textContent = titles[target];

        // Fetch Data
        loadSectionData(target);
    });
});

function loadSectionData(target) {
    switch(target) {
        case 'dashboard': fetchStats(); break;
        case 'products': fetchAdminProducts(); break;
        case 'categories': fetchAdminCategories(); break;
        case 'orders': fetchAdminOrders(); break;
        case 'users': fetchAdminUsers(); break;
    }
}

// ==================== DASHBOARD ====================
async function fetchStats() {
    try {
        const res = await fetch(`${ADMIN_API_URL}/dashboard`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) {
            document.getElementById('statRevenue').textContent = formatPrice(result.data.totalRevenue);
            document.getElementById('statOrders').textContent = result.data.totalOrders;
            document.getElementById('statUsers').textContent = result.data.totalUsers;
            document.getElementById('statProducts').textContent = result.data.totalProducts;
        }
    } catch (err) { console.error(err); }
}

// ==================== PRODUCTS ====================
async function fetchAdminProducts() {
    try {
        const res = await fetch(PROD_API_URL);
        const result = await res.json();
        if (result.success) {
            const tbody = document.getElementById('productTableBody');
            tbody.innerHTML = result.data.map(p => `
                <tr>
                    <td>${p._id.slice(-6)}</td>
                    <td><img src="${p.image_url}" style="width:50px; height:50px; object-fit:cover; border-radius:4px;"></td>
                    <td>${p.name}</td>
                    <td>${formatPrice(p.price)}</td>
                    <td>${p.stock}</td>
                    <td>
                        <button class="btn-sm btn-edit" onclick="editProduct('${p._id}')">Sửa</button>
                        <button class="btn-sm btn-delete" onclick="deleteProduct('${p._id}')">Xóa</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

window.showAddProductModal = async () => {
    document.getElementById('modalTitle').textContent = 'Thêm sản phẩm mới';
    document.getElementById('productForm').reset();
    document.getElementById('prodId').value = '';
    
    // Load categories for select
    await loadCategorySelect();
    
    document.getElementById('productModal').style.display = 'flex';
};

async function loadCategorySelect() {
    const res = await fetch(CAT_API_URL);
    const result = await res.json();
    const select = document.getElementById('prodCategory');
    select.innerHTML = result.data.map(c => `<option value="${c._id}">${c.name}</option>`).join('');
}

document.getElementById('productForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('prodId').value;
    const data = {
        name: document.getElementById('prodName').value,
        category_id: document.getElementById('prodCategory').value,
        price: document.getElementById('prodPrice').value,
        stock: document.getElementById('prodStock').value,
        image_url: document.getElementById('prodImageUrl').value,
        breed: document.getElementById('prodBreed').value,
        description: document.getElementById('prodDesc').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${PROD_API_URL}/${id}` : PROD_API_URL;

    try {
        const res = await fetch(url, {
            method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            alert(id ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
            closeModal('productModal');
            fetchAdminProducts();
        }
    } catch (err) { console.error(err); }
});

window.deleteProduct = async (id) => {
    if(!confirm('Bạn có chắc muốn xóa sản phẩm này?')) return;
    try {
        const res = await fetch(`${PROD_API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) fetchAdminProducts();
    } catch (err) { console.error(err); }
};

window.editProduct = async (id) => {
    const res = await fetch(`${PROD_API_URL}/${id}`);
    const result = await res.json();
    if(result.success) {
        const p = result.data;
        await showAddProductModal();
        document.getElementById('modalTitle').textContent = 'Chỉnh sửa sản phẩm';
        document.getElementById('prodId').value = p._id;
        document.getElementById('prodName').value = p.name;
        document.getElementById('prodCategory').value = p.category_id._id || p.category_id;
        document.getElementById('prodPrice').value = p.price;
        document.getElementById('prodStock').value = p.stock;
        document.getElementById('prodImageUrl').value = p.image_url;
        document.getElementById('prodBreed').value = p.breed;
        document.getElementById('prodDesc').value = p.description;
    }
};

// ==================== CATEGORIES ====================
async function fetchAdminCategories() {
    try {
        const res = await fetch(CAT_API_URL);
        const result = await res.json();
        if (result.success) {
            const tbody = document.getElementById('categoryTableBody');
            tbody.innerHTML = result.data.map(c => `
                <tr>
                    <td>${c._id.slice(-6)}</td>
                    <td>${c.name}</td>
                    <td>${c.description || ''}</td>
                    <td>
                        <button class="btn-sm btn-edit" onclick="editCategory('${c._id}')">Sửa</button>
                        <button class="btn-sm btn-delete" onclick="deleteCategory('${c._id}')">Xóa</button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

window.showAddCategoryModal = () => {
    document.getElementById('catModalTitle').textContent = 'Thêm danh mục mới';
    document.getElementById('categoryForm').reset();
    document.getElementById('catId').value = '';
    document.getElementById('categoryModal').style.display = 'flex';
};

document.getElementById('categoryForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const id = document.getElementById('catId').value;
    const data = {
        name: document.getElementById('catName').value,
        description: document.getElementById('catDesc').value
    };

    const method = id ? 'PUT' : 'POST';
    const url = id ? `${CAT_API_URL}/${id}` : CAT_API_URL;

    try {
        const res = await fetch(url, {
            method,
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        if (result.success) {
            alert(id ? 'Cập nhật thành công!' : 'Thêm mới thành công!');
            closeModal('categoryModal');
            fetchAdminCategories();
        }
    } catch (err) { console.error(err); }
});

window.editCategory = async (id) => {
    const res = await fetch(`${CAT_API_URL}`);
    const result = await res.json();
    if(result.success) {
        const c = result.data.find(cat => cat._id === id);
        if(c) {
            showAddCategoryModal();
            document.getElementById('catModalTitle').textContent = 'Chỉnh sửa danh mục';
            document.getElementById('catId').value = c._id;
            document.getElementById('catName').value = c.name;
            document.getElementById('catDesc').value = c.description || '';
        }
    }
};

window.deleteCategory = async (id) => {
    if(!confirm('Xóa danh mục này có thể ảnh hưởng đến các sản phẩm liên quan. Bạn chắc chứ?')) return;
    try {
        const res = await fetch(`${CAT_API_URL}/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) fetchAdminCategories();
    } catch (err) { console.error(err); }
};

// ==================== ORDERS ====================
async function fetchAdminOrders() {
    try {
        const res = await fetch(`${ADMIN_API_URL}/orders`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) {
            const tbody = document.getElementById('orderTableBody');
            tbody.innerHTML = result.data.map(o => `
                <tr>
                    <td>#${o._id.slice(-6)}</td>
                    <td>${o.user_name}<br><small>${o.user_email}</small></td>
                    <td>${formatPrice(o.total_price)}</td>
                    <td>${new Date(o.created_at).toLocaleDateString('vi-VN')}</td>
                    <td><span class="badge badge-${o.status.toLowerCase()}">${o.status}</span></td>
                    <td>
                        <select onchange="updateStatus('${o._id}', this.value)" style="width: auto; padding: 5px;">
                            <option value="Pending" ${o.status === 'Pending' ? 'selected' : ''}>Chờ duyệt</option>
                            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Đang giao</option>
                            <option value="Completed" ${o.status === 'Completed' ? 'selected' : ''}>Hoàn thành</option>
                            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Hủy</option>
                        </select>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

window.updateStatus = async (id, status) => {
    try {
        await fetch(`${ADMIN_API_URL}/orders/${id}/status`, {
            method: 'PUT',
            headers: { 
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}` 
            },
            body: JSON.stringify({ status })
        });
        fetchAdminOrders();
    } catch (err) { console.error(err); }
};

// ==================== USERS ====================
async function fetchAdminUsers() {
    try {
        const res = await fetch(`${ADMIN_API_URL}/users`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const result = await res.json();
        if (result.success) {
            const tbody = document.getElementById('userTableBody');
            tbody.innerHTML = result.data.map(u => `
                <tr>
                    <td>${u._id.slice(-6)}</td>
                    <td>${u.full_name}</td>
                    <td>${u.email}</td>
                    <td>${new Date(u.created_at).toLocaleDateString('vi-VN')}</td>
                    <td>${u.is_banned ? '<span style="color:red">Bị khóa</span>' : '<span style="color:green">Hoạt động</span>'}</td>
                    <td>
                        <button class="btn-sm ${u.is_banned ? 'btn-unban' : 'btn-ban'}" onclick="toggleBan('${u._id}')">
                            ${u.is_banned ? 'Mở khóa' : 'Khóa'}
                        </button>
                    </td>
                </tr>
            `).join('');
        }
    } catch (err) { console.error(err); }
}

window.toggleBan = async (id) => {
    try {
        await fetch(`${ADMIN_API_URL}/users/${id}/ban`, {
            method: 'PUT',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        fetchAdminUsers();
    } catch (err) { console.error(err); }
};

// ==================== UTILS ====================
window.closeModal = (id) => {
    document.getElementById(id).style.display = 'none';
};

// Khởi tạo Dashboard mặc định
document.addEventListener('DOMContentLoaded', () => {
    fetchStats();
});
