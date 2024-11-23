document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    // Lấy giá trị từ form
    const email = document.getElementById('exampleInputEmail').value;
    const password = document.getElementById('exampleInputPassword1').value;
    const errorMessage = document.getElementById('errorMessage');

    // Kiểm tra form trống
    if (!email || !password) {
        errorMessage.style.color = 'red';
        errorMessage.textContent = 'Please enter both email and password';
        return;
    }

    try {
        // Gửi request đăng nhập
        const response = await fetch('http://localhost:8080/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response.json();

        if (response.ok && data?.data?.access_token) {
            // Tạo một object chứa toàn bộ thông tin user
            const userInfo = {
                accessToken: data.data.access_token,
                refreshToken: data.data.refresh_token,
                userId: data.data.id,
                isLoggedIn: true
            };

            // Gọi API users để lấy thông tin người dùng
            try {
                const userResponse = await fetch('http://localhost:8080/api/v1/users', {
                    headers: {
                        'Authorization': `Bearer ${data.data.access_token}`
                    }
                });
                const userData = await userResponse.json();
                
                if (userData?.data?.[0]?.name) {
                    userInfo.userName = userData.data[0].name;
                }
            } catch (error) {
                console.error('Error fetching user info:', error);
            }

            // Lưu toàn bộ thông tin vào sessionStorage thay vì localStorage
            sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
            
            errorMessage.style.color = 'green';
            errorMessage.textContent = 'Login successful!';
            
            setTimeout(() => {
                window.location.href = 'home.html';
            }, 1000);
        } else {
            // Đăng nhập thất bại
            errorMessage.style.color = 'red';
            errorMessage.textContent = 'Invalid email or password';
        }
    } catch (error) {
        console.error('Login error:', error);
        errorMessage.style.color = 'red';
        errorMessage.textContent = 'An error occurred. Please try again.';
    }
});
// Trong phần xử lý đăng nhập thành công
