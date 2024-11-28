document.getElementById('forgotPasswordForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const email = document.getElementById('email').value;
    const messageDiv = document.getElementById('message');
    
    try {
        const response = await fetch('http://localhost:8080/api/v1/auth/forgot-password', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email })
        });

        const data = await response.json();

        if (response.ok) {
            showMessage('Password reset link has been sent to your email', 'success');
            setTimeout(() => {
                window.location.href = 'sign-in.html';
            }, 3000);
        } else {
            showMessage(data.message || 'Failed to send reset link', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showMessage('An error occurred. Please try again.', 'error');
    }
});

function showMessage(message, type = 'info') {
    const messageDiv = document.getElementById('message');
    if (messageDiv) {
        messageDiv.textContent = message;
        messageDiv.className = `message ${type}`;
        messageDiv.style.display = 'block';
        
        if (type === 'success') {
            messageDiv.style.backgroundColor = '#e6ffe6';
            messageDiv.style.color = '#00cc00';
            messageDiv.style.border = '1px solid #99ff99';
        } else if (type === 'error') {
            messageDiv.style.backgroundColor = '#ffe6e6';
            messageDiv.style.color = '#ff3333';
            messageDiv.style.border = '1px solid #ff9999';
        }
    }
} 