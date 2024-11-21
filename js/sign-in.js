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
            // Đăng nhập thành công
            localStorage.setItem('accessToken', data.data.access_token);
            localStorage.setItem('userData', JSON.stringify(data.data.user));
            localStorage.setItem('isLoggedIn', 'true');

            // Hiển thị thông báo thành công
            errorMessage.style.color = 'green';
            errorMessage.textContent = 'Login successful!';

            // Chuyển hướng sau 1.5 giây
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
