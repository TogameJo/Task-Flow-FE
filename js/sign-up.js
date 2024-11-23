document.querySelector('form').addEventListener('submit', async (e) => {
    e.preventDefault();

    const name = document.getElementById('exampleInputUsername1').value;
    const email = document.getElementById('exampleInputEmail1').value;
    const password = document.getElementById('exampleInputPassword1').value;
    const termsAccepted = document.getElementById('examplecheck').checked;
    const messageDiv = document.getElementById('message');

    // Kiểm tra điều khoản
    if (!termsAccepted) {
        showMessage('You must accept the Terms & Conditions and Privacy Policy.', true);
        return;
    }

    // Kiểm tra mật khẩu
    const passwordRegex = /^(?=.*[A-Z])(?=.*\d|.*[!@#$%^&*(),.?":{}|<>])[A-Za-z\d!@#$%^&*(),.?":{}|<>]{8,}$/;
    if (!passwordRegex.test(password)) {
        showMessage('Password must be at least 8 characters long, with at least one uppercase letter and one number or special character.', true);
        return;
    }

    // Chuẩn bị dữ liệu
    const registerData = {
        name: name,
        email: email,
        password: password
    };

    try {
        const response = await fetch('http://localhost:8080/api/v1/auth/register', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(registerData)
        });

        const data = await response.json();

        if (response.ok) {
            // Đăng ký thành công
            showMessage('Registration successful!', false);
            setTimeout(() => {
                window.location.href = 'sign-in.html';
            }, 1500);
        } else {
            // Kiểm tra email đã tồn tại
            if (data.message && data.message.includes('Email already exists')) {
                showMessage('Email has been used.', true);
            } else {
                showMessage('Email already exists.', true);
            }
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('An error occurred. Please try again later.', true);
    }
});

function showMessage(message, isError) {
    const messageDiv = document.getElementById('message');
    messageDiv.textContent = message;
    messageDiv.style.display = 'block';
    
    if (isError) {
        messageDiv.style.color = 'red'; // Màu đỏ cho lỗi
    } else {
        messageDiv.style.color = 'green'; // Màu xanh cho thành công
    }
}