document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'sign-in.html';
        return;
    }

    try {
        // Lấy thông tin user từ localStorage và parse JSON
        const userDataString = localStorage.getItem('userData');
        if (userDataString) {
            const userData = JSON.parse(userDataString);
            console.log("User Data:", userData); // Để debug
            
            // Hiển thị tên người dùng trong submenu bằng id
            const usernameElement = document.getElementById('user-name-info');
            if (usernameElement && userData.name) {
                usernameElement.textContent = userData.name;
            }

            // Hiển thị avatar
            const avatarUrl = userData.avatar || '../assets/images/userdefault.png';
            const avatarElements = document.querySelectorAll('.admin-main-avatar, .user-pics-info');
            avatarElements.forEach(avatar => {
                avatar.src = avatarUrl;
            });
        }
    } catch (error) {
        console.error('Error parsing user data:', error);
    }

    // Xử lý smooth scroll cho các internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

// Hàm logout
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
