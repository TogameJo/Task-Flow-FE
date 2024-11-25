document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const email = document.getElementById('exampleInputEmail').value;
    const password = document.getElementById('exampleInputPassword1').value;
    const errorMessage = document.getElementById('errorMessage');

    if (!email || !password) {
        errorMessage.style.color = 'red';
        errorMessage.textContent = 'Please enter both email and password';
        return;
    }

    try {
        // 1. Đăng nhập để lấy token
        console.log('Attempting login...');
        const loginResponse = await fetch('http://localhost:8080/api/v1/auth/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ email, password })
        });

        const loginData = await loginResponse.json();
        console.log('Login response:', loginData);

        if (loginResponse.ok && loginData?.data?.access_token) {
            // 2. Lấy thông tin user bằng ID từ login response
            try {
                const userId = loginData.data.id;
                console.log('Fetching user data for ID:', userId);
                
                const userResponse = await fetch(`http://localhost:8080/api/v1/users/${userId}`, {
                    method: 'GET', // Thêm method GET
                    headers: {
                        'Authorization': `Bearer ${loginData.data.access_token}`,
                        'Content-Type': 'application/json'
                    }
                });
                
                console.log('User response status:', userResponse.status);
                const userData = await userResponse.json();
                console.log('User data:', userData);

                if (userData.status === 0 && userData.data) {
                    // 3. Tạo object chứa thông tin user
                    const userInfo = {
                        accessToken: loginData.data.access_token,
                        refreshToken: loginData.data.refresh_token,
                        userId: userId,
                        email: userData.data.email,
                        userName: userData.data.name || email.split('@')[0], // Fallback to email username
                        isLoggedIn: true
                    };

                    console.log('Saving user info:', userInfo);

                    // 4. Lưu vào sessionStorage
                    sessionStorage.clear();
                    sessionStorage.setItem('userInfo', JSON.stringify(userInfo));

                    errorMessage.style.color = 'green';
                    errorMessage.textContent = 'Login successful!';

                    setTimeout(() => {
                        window.location.href = 'home.html';
                    }, 1000);
                } else {
                    console.error('Invalid user data format:', userData);
                    throw new Error('Invalid user data response');
                }
            } catch (error) {
                console.error('Error in user data fetch:', error);
                // Thử lưu thông tin cơ bản nếu không lấy được thông tin chi tiết
                const basicUserInfo = {
                    accessToken: loginData.data.access_token,
                    refreshToken: loginData.data.refresh_token,
                    userId: loginData.data.id,
                    email: email,
                    userName: email.split('@')[0], // Sử dụng phần trước @ của email làm username
                    isLoggedIn: true
                };

                sessionStorage.clear();
                sessionStorage.setItem('userInfo', JSON.stringify(basicUserInfo));

                errorMessage.style.color = 'green';
                errorMessage.textContent = 'Login successful';

                setTimeout(() => {
                    window.location.href = 'home.html';
                }, 1000);
            }
        } else {
            console.error('Login failed:', loginData);
            errorMessage.style.color = 'red';
            errorMessage.textContent = loginData.message || 'Invalid email or password';
        }
    } catch (error) {
        console.error('Login process error:', error);
        errorMessage.style.color = 'red';
        errorMessage.textContent = 'An error occurred. Please try again.';
    }
});