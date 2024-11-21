document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'sign-in.html';
        return;
    }

    // Hiển thị thông tin user
    try {
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
            const userData = JSON.parse(userDataString);
            
            // Hiển thị tên người dùng trong submenu
            const usernameElement = document.querySelector('.user-name');
            if (usernameElement) {
                usernameElement.textContent = userData.name || 'User';
            }

            // Lấy và hiển thị avatar
            const savedAvatar = localStorage.getItem('userAvatar');
            const defaultAvatar = '../assets/images/userdefault.png';
            
            // Cập nhật tất cả các elements avatar
            updateAllAvatars(savedAvatar || defaultAvatar);
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
    }

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

// Hàm cập nhật tất cả avatars
function updateAllAvatars(avatarSrc) {
    const avatarElements = document.querySelectorAll('.admin-main-avatar, .user-pics-info');
    avatarElements.forEach(avatar => {
        avatar.src = avatarSrc;
        avatar.onerror = function() {
            avatar.src = '../assets/images/userdefault.png';
        };
    });
}

// Lắng nghe sự kiện thay đổi avatar
window.addEventListener('avatarChanged', function() {
    const newAvatar = localStorage.getItem('userAvatar');
    if (newAvatar) {
        updateAllAvatars(newAvatar);
    }
});

// Hàm logout cập nhật
function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('userData');
    localStorage.removeItem('accessToken');
    window.location.href = 'sign-in.html';
}

// Hàm toggle menu
function toggleMenu() {
    const submenu = document.getElementById('Submenu');
    if (submenu) {
        submenu.classList.toggle('open-wrap');
    }
}