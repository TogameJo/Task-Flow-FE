document.addEventListener('DOMContentLoaded', function() {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'sign-in.html';
        return;
    }

    // Load user avatar
    const userAvatar = localStorage.getItem('userAvatar');
    if (userAvatar) {
        const avatars = document.querySelectorAll('.admin-main-avatar, .user-pics-info');
        avatars.forEach(avatar => {
            avatar.src = userAvatar;
        });
    }

    // Load username
    const username = localStorage.getItem('username') || 'User';
    const usernameElements = document.querySelectorAll('.user-name-info');
    usernameElements.forEach(element => {
        element.textContent = username;
    });

    // Handle all internal links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            document.querySelector(this.getAttribute('href')).scrollIntoView({
                behavior: 'smooth'
            });
        });
    });
});

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('username');
    window.location.href = 'sign-in.html';
}

function toggleMenu() {
    const submenu = document.getElementById('Submenu');
    if (submenu) {
        submenu.classList.toggle('open-wrap');
    }
}
