document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    if (!localStorage.getItem('accessToken')) {
        window.location.href = 'sign-in.html';
        return;
    }

    loadUserInfo();

    // Xử lý smooth scroll cho các internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetElement = document.querySelector(this.getAttribute('href'));
            if (targetElement) {
                targetElement.scrollIntoView({
                    behavior: 'smooth'
                });
            }
        });
    });
});

// Hàm load thông tin user
async function loadUserInfo() {
    // Lấy thông tin user từ localStorage
    const userName = localStorage.getItem('userName') || 'User';
    const userAvatar = localStorage.getItem('userAvatar') || '../assets/images/userdefault.png';

    // Cập nhật tên user
    const userNameElements = document.querySelectorAll('.user-name-info');
    userNameElements.forEach(element => {
        element.textContent = userName;
    });

    // Cập nhật avatar
    const avatarElements = document.querySelectorAll('.admin-main-avatar, .user-pics-info');
    avatarElements.forEach(element => {
        element.src = userAvatar;
        // Xử lý lỗi khi load ảnh
        element.onerror = function() {
            element.src = '../assets/images/userdefault.png';
        };
    });
}

// Lắng nghe sự kiện thay đổi trong localStorage
window.addEventListener('storage', function(e) {
    if (e.key === 'userName' || e.key === 'userAvatar') {
        loadUserInfo();
    }
});

// Hàm toggle menu
function toggleMenu() {
    const submenu = document.getElementById('Submenu');
    if (submenu) {
        submenu.classList.toggle('open-wrap');
    }
}

// Hàm logout
function logout() {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('userId');
    localStorage.removeItem('userName');
    // Không xóa avatar để giữ lại ảnh đã cập nhật
    window.location.href = 'sign-in.html';
}
