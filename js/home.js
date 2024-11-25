// Kiểm tra đăng nhập
document.addEventListener('DOMContentLoaded', function() {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    if (!userInfo.accessToken) {
        window.location.href = 'sign-in.html';
        return;
    }
    loadUserInfo();

    // Xử lý smooth scroll cho các internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const href = this.getAttribute('href');
            
            // Bỏ qua các href như "#!" hoặc chỉ "#"
            if (href === '#!' || href === '#') {
                return;
            }

            const targetElement = document.querySelector(href);
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
    // Lấy thông tin user từ sessionStorage
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    const userName = userInfo.userName || 'User';
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
    sessionStorage.clear(); // Xóa toàn bộ session storage
    window.location.href = 'sign-in.html';
}
