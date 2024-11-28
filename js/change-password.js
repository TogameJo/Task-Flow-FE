document.addEventListener('DOMContentLoaded', function() {
    loadUserInfo();
    setupToggleMenu();
    setupChangePasswordForm();
});

async function loadUserInfo() {
    try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
        if (!userInfo.accessToken) {
            window.location.href = 'sign-in.html';
            return;
        }

        // Cập nhật tên user
        const userNameElements = document.querySelectorAll('.user-name-info');
        userNameElements.forEach(element => {
            element.textContent = userInfo.userName || 'User';
        });

        // Cập nhật avatar
        const avatarElements = document.querySelectorAll('.admin-main-avatar, .user-pics-info');
        const defaultAvatar = '../assets/images/userdefault.png';
        const userAvatar = localStorage.getItem('userAvatar') || defaultAvatar;
        
        avatarElements.forEach(element => {
            element.src = userAvatar;
            element.onerror = function() {
                this.src = defaultAvatar;
            };
        });

    } catch (error) {
        console.error('Error loading user info:', error);
    }
}

function setupToggleMenu() {
    const toggleBtn = document.querySelector('.toggle-btn');
    const sidebar = document.querySelector('.sidebar');
    const mainContent = document.querySelector('.main-content');
    
    if (toggleBtn && sidebar) {
        // Hiển thị sidebar mặc định
        sidebar.classList.add('active');
        if (mainContent) {
            mainContent.classList.add('content-shifted');
        }
        
        toggleBtn.addEventListener('click', function() {
            sidebar.classList.toggle('active');
            if (mainContent) {
                mainContent.classList.toggle('content-shifted');
            }
        });
    }
}

// Thêm hàm refresh token
async function refreshToken() {
    try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
        if (!userInfo.refreshToken) {
            throw new Error('No refresh token available');
        }

        const response = await fetch('http://localhost:8080/api/v1/auth/refresh', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refreshToken: userInfo.refreshToken
            })
        });

        if (response.ok) {
            const data = await response.json();
            // Cập nhật token mới vào sessionStorage
            userInfo.accessToken = data.data.access_token;
            sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
            return true;
        }
        return false;
    } catch (error) {
        console.error('Error refreshing token:', error);
        return false;
    }
}

// Sửa lại hàm setupChangePasswordForm
function setupChangePasswordForm() {
    const form = document.getElementById('changePasswordForm');
    if (!form) {
        console.error('Change password form not found');
        return;
    }

    form.addEventListener('submit', async function(e) {
        e.preventDefault();
        
        const currentPassword = document.getElementById('currentPassword').value;
        const newPassword = document.getElementById('newPassword').value;
        const confirmPassword = document.getElementById('confirmPassword').value;

        if (!currentPassword || !newPassword || !confirmPassword) {
            showMessage('Please fill in all fields', 'error');
            return;
        }

        if (newPassword !== confirmPassword) {
            showMessage('New passwords do not match', 'error');
            return;
        }

        try {
            let userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
            
            if (!userInfo.accessToken || !userInfo.userId) {
                throw new Error('Not logged in');
            }

            const requestBody = {
                oldPassword: currentPassword,
                newPassword: newPassword
            };

            // Thử gọi API đổi mật khẩu
            let response = await fetch(`http://localhost:8080/api/v1/users/${userInfo.userId}/change-password`, {
                method: 'POST',
                headers: {
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${userInfo.accessToken.trim()}`
                },
                body: JSON.stringify(requestBody)
            });

            // Nếu token hết hạn, thử refresh token
            if (response.status === 401) {
                console.log('Token expired, attempting to refresh...');
                const refreshSuccess = await refreshToken();
                
                if (refreshSuccess) {
                    // Lấy lại userInfo với token mới
                    userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
                    
                    // Thử lại request với token mới
                    response = await fetch(`http://localhost:8080/api/v1/users/${userInfo.userId}/change-password`, {
                        method: 'POST',
                        headers: {
                            'Accept': 'application/json',
                            'Content-Type': 'application/json',
                            'Authorization': `Bearer ${userInfo.accessToken.trim()}`
                        },
                        body: JSON.stringify(requestBody)
                    });
                } else {
                    throw new Error('Failed to refresh token');
                }
            }

            const data = await response.json();
            console.log('Response:', response.status, data);

            if (response.ok) {
                showMessage('Password changed successfully!', 'success');
                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 2000);
            } else {
                showMessage(data.message || 'Failed to change password', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            if (error.message === 'Failed to refresh token') {
                showMessage('Session expired. Please login again', 'error');
                setTimeout(() => {
                    sessionStorage.clear();
                    window.location.href = 'sign-in.html';
                }, 1500);
            } else {
                showMessage('An error occurred. Please try again.', 'error');
            }
        }
    });
}

// Cập nhật hàm showMessage để hiển thị rõ ràng hơn
function showMessage(message, type = 'info') {
    const messageElement = document.getElementById('message');
    if (messageElement) {
        messageElement.textContent = message;
        messageElement.className = `message ${type}`;
        messageElement.style.backgroundColor = type === 'error' ? '#ffe6e6' : '#e6ffe6';
        messageElement.style.color = type === 'error' ? '#ff3333' : '#00cc00';
        messageElement.style.border = type === 'error' ? '1px solid #ff9999' : '1px solid #99ff99';
        messageElement.style.padding = '10px 20px';
        messageElement.style.borderRadius = '5px';
        messageElement.style.marginTop = '10px';
        messageElement.style.display = 'block';
        messageElement.style.textAlign = 'center';
        messageElement.style.width = '100%';
        messageElement.style.maxWidth = '400px';
        messageElement.style.margin = '10px auto';
        
        // Tự động ẩn message sau 3 giây
        setTimeout(() => {
            messageElement.style.display = 'none';
        }, 3000);
    }
}

// Thêm các hàm tiện ích
function toggleMenu() {
    const submenu = document.getElementById('Submenu');
    if (submenu) {
        submenu.classList.toggle('open-wrap');
    }
}

function logout() {
    sessionStorage.clear();
    localStorage.removeItem('userAvatar');
    window.location.href = 'sign-in.html';
}

// Lắng nghe sự kiện storage
window.addEventListener('storage', function(e) {
    if (e.key === 'userAvatar') {
        loadUserInfo();
    }
}); 