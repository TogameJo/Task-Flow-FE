document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'sign-in.html';
        return;
    }

    // Lấy các elements
    const updateProfileForm = document.getElementById('updateProfileForm');
    const avatarInput = document.getElementById('avatar');
    const avatarPreview = document.getElementById('avatarPreview');
    const messageDiv = document.getElementById('message');

    // Load avatar hiện tại
    const currentAvatar = localStorage.getItem('userAvatar');
    if (currentAvatar) {
        const avatars = document.querySelectorAll('.admin-main-avatar, .user-pics-info');
        avatars.forEach(avatar => {
            avatar.src = currentAvatar;
        });
        avatarPreview.src = currentAvatar;
        avatarPreview.style.display = 'block';
    }

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
