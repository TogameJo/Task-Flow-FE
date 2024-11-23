document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập bằng sessionStorage thay vì localStorage
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    if (!userInfo.accessToken) {
        window.location.href = 'sign-in.html';
        return;
    }

    // Load user info ngay khi trang load
    loadUserInfo();

    // Lấy các elements
    const updateProfileForm = document.getElementById('updateProfileForm');
    const avatarInput = document.getElementById('avatar');
    const avatarPreview = document.getElementById('avatarPreview');
    const messageDiv = document.getElementById('message');

    // Xem trước ảnh khi chọn file
    avatarInput.addEventListener('change', function(event) {
        const file = event.target.files[0];
        if (file) {
            // Kiểm tra định dạng file
            if (!file.type.match('image.*')) {
                showMessage('Vui lòng chọn file hình ảnh', true);
                return;
            }

            // Hiển thị preview
            const reader = new FileReader();
            reader.onload = function(e) {
                avatarPreview.src = e.target.result;
                avatarPreview.style.display = 'block';
            };
            reader.readAsDataURL(file);
        }
    });

    // Xử lý khi submit form
    updateProfileForm.addEventListener('submit', function(e) {
        e.preventDefault();
        
        const file = avatarInput.files[0];
        
        // Kiểm tra xem đã chọn file chưa
        if (!file) {
            showMessage('Vui lòng chọn ảnh đại diện', true);
            return;
        }

        // Đọc và lưu file
        const reader = new FileReader();
        reader.onload = function(e) {
            try {
                const avatarData = e.target.result;
                
                // Lưu vào localStorage
                localStorage.setItem('userAvatar', avatarData);
                
                // Cập nhật tất cả ảnh đại diện trên trang
                const avatars = document.querySelectorAll('.admin-main-avatar, .user-pics-info');
                avatars.forEach(avatar => {
                    avatar.src = avatarData;
                });

                showMessage('Change avatar successfully!', false);
                
                // Chuyển về trang home sau 1.5 giây
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1500);
            } catch (error) {
                showMessage('Some rror: ' + error.message, true);
            }
        };
        reader.readAsDataURL(file);
    });
});

// Hiển thị thông báo
function showMessage(message, isError) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    
    // Thêm style cho message
    messageDiv.style.padding = '10px 20px';
    messageDiv.style.borderRadius = '5px';
    messageDiv.style.marginTop = '10px';
    messageDiv.style.textAlign = 'center';
    messageDiv.style.fontWeight = '500';
    
    if (isError) {
        // Style cho thông báo lỗi
        messageDiv.style.backgroundColor = '#ffe6e6';
        messageDiv.style.color = '#ff3333';
        messageDiv.style.border = '1px solid #ff9999';
    } else {
        // Style cho thông báo thành công
        messageDiv.style.backgroundColor = '#e6ffe6';
        messageDiv.style.color = '#00cc00';
        messageDiv.style.border = '1px solid #99ff99';
    }
    
    messageDiv.style.display = 'block';
    
    // Thêm animation fade in
    messageDiv.style.animation = 'fadeIn 0.3s ease';
}

// Thêm keyframes animation vào head của document
const style = document.createElement('style');
style.textContent = `
    @keyframes fadeIn {
        from {
            opacity: 0;
            transform: translateY(-10px);
        }
        to {
            opacity: 1;
            transform: translateY(0);
        }
    }
`;
document.head.appendChild(style);

// Xử lý menu
function toggleMenu() {
    const submenu = document.getElementById('Submenu');
    if (submenu) {
        submenu.classList.toggle('open-wrap');
    }
}
// Trong phần xử lý submit form của profile.js
updateProfileForm.addEventListener('submit', function(e) {
    e.preventDefault();
    
    const file = avatarInput.files[0];
    
    if (!file) {
        showMessage('Vui lòng chọn ảnh đại diện', true);
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            const avatarData = e.target.result;
            
            // Lưu vào localStorage và emit event
            localStorage.setItem('userAvatar', avatarData);
            
            // Emit storage event để các tab khác biết có sự thay đổi
            window.dispatchEvent(new StorageEvent('storage', {
                key: 'userAvatar',
                newValue: avatarData,
                url: window.location.href
            }));

            showMessage('Change avatar successfully!', false);
            
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1500);
        } catch (error) {
            showMessage('Some error: ' + error.message, true);
        }
    };
    reader.readAsDataURL(file);
});


// Hàm load thông tin user
async function loadUserInfo() {
    // Lấy thông tin user từ localStorage
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

    // Cập nhật preview nếu có
    const avatarPreview = document.getElementById('avatarPreview');
    if (avatarPreview) {
        avatarPreview.src = userAvatar;
        avatarPreview.style.display = 'block';
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
    sessionStorage.clear();
    localStorage.removeItem('userAvatar'); // Xóa avatar khi logout
    window.location.href = 'sign-in.html';
}