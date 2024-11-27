const API_URL = 'http://localhost:8080/api/v1';
const TASKS_ENDPOINT = `${API_URL}/tasks`;
console.log('API endpoint:', TASKS_ENDPOINT); // Debug endpoint
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOMContentLoaded event fired');
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    if (!userInfo.accessToken) {
        window.location.href = 'sign-in.html';
        return;
    }
    loadUserInfo();
    loadTasks();

    async function filterTasks() {
        const statusFilter = document.getElementById('statusFilter').value;
        const priorityFilter = document.getElementById('priorityFilter').value;
        const keyword = document.getElementById('searchInput').value.trim();

        try {
            const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
            const response = await fetch(`${TASKS_ENDPOINT}?keyword=${encodeURIComponent(keyword)}&status=${statusFilter}&priority=${priorityFilter}`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${userInfo.accessToken}`,
                    'language': 'en'
                }
            });

            const result = await response.json();
            if (result.status === 0) {
                displayTasks(result.data);
                
                if (result.data.length === 0) {
                    showNotification('No tasks found matching your filters', 'info');
                }
            } else {
                showNotification(result.message || 'Error filtering tasks', 'error');
            }
        } catch (error) {
            console.error('Error:', error);
            showNotification('Error filtering tasks', 'error');
        }
    }

    document.getElementById('statusFilter').addEventListener('change', filterTasks);
    document.getElementById('priorityFilter').addEventListener('change', filterTasks);

    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');

    searchBtn.addEventListener('click', function() {
        const keyword = searchInput.value.trim();
        loadTasks(keyword);
    });

    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const keyword = searchInput.value.trim();
            loadTasks(keyword);
        }
    });

    window.addEventListener('click', function(event) {
        const modal = document.getElementById('addTaskModal');
        if (event.target === modal) {
            closeAddTaskForm();
        }
    });

    // Thêm event listener cho nút Add Task
    const addTaskBtn = document.querySelector('.add-task-btn');
    if (addTaskBtn) {
        addTaskBtn.addEventListener('click', function(e) {
            e.preventDefault();
            console.log('Add Task button clicked');
            showAddTaskForm();
        });
    } else {
        console.error('Add Task button not found');
    }

    // Thêm event listener cho form submit
    const addTaskForm = document.getElementById('addTaskForm');
    if (addTaskForm) {
        addTaskForm.addEventListener('submit', handleAddTask);
        console.log('Form submit listener added');
    } else {
        console.error('Add Task form not found');
    }

    // Thêm event listener cho nút close modal
    const closeBtn = document.querySelector('.close');
    if (closeBtn) {
        closeBtn.addEventListener('click', closeAddTaskForm);
    }
});

async function handleAddTask(e) {
    e.preventDefault();
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo'));
    
    // Log để kiểm tra
    console.log('Current user info:', userInfo);

    const task = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        date: document.getElementById('taskDueDate').value,
        priority: parseInt(document.getElementById('taskPriority').value),
        status: 0,
        user_id: userInfo.userId,
        created_by: userInfo.userId,    // Thêm created_by
        last_updated_by: userInfo.userId // Thêm last_updated_by
    };

    console.log('Task to be created:', task);

    try {
        const response = await fetch(TASKS_ENDPOINT, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userInfo.accessToken}`,
                'language': 'en'
            },
            body: JSON.stringify(task)
        });

        console.log('Response status:', response.status);
        const text = await response.text();
        console.log('Raw response:', text);

        try {
            const result = JSON.parse(text);
            console.log('Parsed response:', result);

            if (result.status === 0) {
                showNotification('Task created successfully', 'success');
                closeAddTaskForm();
                await loadTasks();
            } else {
                showNotification(result.message || 'Failed to create task', 'error');
            }
        } catch (parseError) {
            console.error('Error parsing response:', parseError);
            showNotification('Error processing server response', 'error');
        }
    } catch (error) {
        console.error('Network Error details:', error);
        showNotification('Error creating task. Please try again.', 'error');
    }
}

// Thêm hàm kiểm tra và làm mới token
async function ensureValidToken() {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    if (!userInfo.accessToken) {
        window.location.href = 'sign-in.html';
        return null;
    }

    // Decode token để kiểm tra exp
    const tokenParts = userInfo.accessToken.split('.');
    const payload = JSON.parse(atob(tokenParts[1]));
    const exp = payload.exp * 1000; // Convert to milliseconds

    // Nếu token hết hạn hoặc sắp hết hạn, refresh token
    if (Date.now() >= exp - 60000) { // Check if token expires in 1 minute
        try {
            const response = await fetch(`${API_URL}/auth/refresh-token`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    refresh_token: userInfo.refreshToken
                })
            });

            const result = await response.json();
            if (result.status === 0) {
                userInfo.accessToken = result.data.access_token;
                userInfo.refreshToken = result.data.refresh_token;
                sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
                return userInfo.accessToken;
            }
        } catch (error) {
            console.error('Error refreshing token:', error);
            window.location.href = 'sign-in.html';
            return null;
        }
    }

    return userInfo.accessToken;
}

// Sửa lại hàm loadTasks
async function loadTasks(keyword = '') {
    try {
        const token = await ensureValidToken();
        if (!token) return;

        const response = await fetch(`${TASKS_ENDPOINT}?keyword=${encodeURIComponent(keyword)}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json',
                'language': 'en'
            }
        });

        if (response.status === 401) {
            sessionStorage.clear();
            window.location.href = 'sign-in.html';
            return;
        }

        const result = await response.json();
        console.log('Load tasks response:', result);

        if (result.status === 0) {
            displayTasks(result.data);
        } else {
            showNotification(result.message || 'Error loading tasks', 'error');
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Error loading tasks', 'error');
    }
}

async function updateTaskStatus(taskId, newStatus) {
    try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
        const task = await getTaskDetails(taskId);
        
        const updatedTask = {
            title: task.title,
            description: task.description,
            date: task.date,
            priority: task.priority,
            status: newStatus === 'completed' ? 1 : 0,
            user_id: task.user.id
        };

        const response = await fetch(`${TASK_ENDPOINT}/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userInfo.accessToken}`,
                'language': 'en'
            },
            body: JSON.stringify(updatedTask)
        });

        const result = await response.json();
        if (result.status === 0) {
            showNotification('Task updated successfully', 'success');
            loadTasks();
        } else {
            showNotification(result.message || 'Failed to update task', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error updating task', 'error');
    }
}

async function deleteTask(taskId) {
    if (!confirm('Are you sure you want to delete this task?')) {
        return;
    }

    try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
        const response = await fetch(`${TASK_ENDPOINT}/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userInfo.accessToken}`,
                'language': 'en'
            }
        });

        const result = await response.json();
        if (result.status === 0) {
            showNotification('Task deleted successfully', 'success');
            loadTasks();

            // Xóa task khỏi sessionStorage
            let tasks = JSON.parse(sessionStorage.getItem('tasks') || '[]');
            tasks = tasks.filter(task => task.id !== taskId); // Giữ lại các task không bị xóa
            sessionStorage.setItem('tasks', JSON.stringify(tasks));
        } else {
            showNotification(result.message || 'Failed to delete task', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error deleting task', 'error');
    }
}

async function getTaskDetails(taskId) {
    try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
        const response = await fetch(`${TASK_ENDPOINT}/${taskId}`, {
            method: 'GET',
            headers: {
                'Authorization': `Bearer ${userInfo.accessToken}`,
                'language': 'en'
            }
        });

        const result = await response.json();
        if (result.status === 0) {
            return result.data;
        } else {
            throw new Error(result.message || 'Failed to get task details');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error getting task details', 'error');
        throw error;
    }
}

function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    if (!tasks || tasks.length === 0) {
        taskList.innerHTML = '<div class="no-tasks">No tasks found</div>';
        return;
    }

    tasks.forEach(task => {
        const taskElement = document.createElement('div');
        taskElement.className = 'task-item';
        taskElement.innerHTML = `
            <h3>${task.title}</h3>
            <p>${task.description}</p>
            <p>Due Date: ${task.date}</p>
            <p>Priority: ${task.priority}</p>
            <p>Status: ${task.status === 'PENDING' ? 'Pending' : 'In Progress'}</p>
            <button onclick="updateTaskStatus('${task.id}', '${task.status === 'PENDING' ? 'completed' : 'pending'}')">${task.status === 'PENDING' ? 'Mark as Completed' : 'Mark as Pending'}</button>
            <button onclick="deleteTask('${task.id}')" style="margin-left: 10px">Delete</button>
        `;
        taskList.appendChild(taskElement);
    });
}

function showNotification(message, type = 'info') {
    // Xóa thông báo cũ nếu có
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }

    // Tạo thông báo mới
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;

    // Thêm vào body
    document.body.appendChild(notification);

    // Tự động ẩn sau 3 giây
    setTimeout(() => {
        notification.remove();
    }, 3000);
}

async function loadUserInfo() {
    // Lấy thông tin user từ sessionStorage
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
    });
}

function toggleMenu() {
    const submenu = document.getElementById('Submenu');
    if (submenu) {
        submenu.classList.toggle('open-wrap');
    }
}

// Hàm đăng xuất
function logout() {
    sessionStorage.clear();
    window.location.href = 'sign-in.html';
}

window.addEventListener('storage', function(e) {
    if (e.key === 'userName' || e.key === 'userAvatar') {
        loadUserInfo();
    }
});

// Thêm các hàm mới để xử lý modal và form tạo công việc
function showAddTaskForm() {
    console.log('Showing add task form...');
    const modal = document.getElementById('addTaskModal');
    console.log('Modal element:', modal);
    if (modal) {
        modal.style.display = 'block';
        console.log('Modal display set to block');
    } else {
        console.error('Modal element not found');
    }
}

function closeAddTaskForm() {
    const modal = document.getElementById('addTaskModal');
    if (modal) {
        modal.style.display = 'none';
        // Reset form
        document.getElementById('addTaskForm').reset();
    }
}

// Thêm CSS cho modal
document.head.insertAdjacentHTML('beforeend', `
<style>
.modal {
    display: none;
    position: fixed;
    z-index: 1000;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0,0,0,0.5);
}

.modal-content {
    background-color: #fefefe;
    margin: 15% auto;
    padding: 20px;
    border: 1px solid #888;
    width: 80%;
    max-width: 500px;
    border-radius: 5px;
    position: relative;
}

.close {
    color: #aaa;
    float: right;
    font-size: 28px;
    font-weight: bold;
    cursor: pointer;
    position: absolute;
    right: 10px;
    top: 5px;
}

.close:hover,
.close:focus {
    color: black;
    text-decoration: none;
    cursor: pointer;
}

/* Thêm style cho form */
.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
}

.submit-btn {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    width: 100%;
}

.submit-btn:hover {
    background-color: #45a049;
}
</style>
`);

function getPriorityValue(value) {
    switch(value) {
        case '0': return 0; // Low
        case '1': return 1; // Medium
        case '2': return 2; // High
        default: return 0;  // Default to Low
    }
}

// Thêm hàm để refresh token
async function refreshToken() {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    if (!userInfo.refreshToken) {
        throw new Error('No refresh token available');
    }

    try {
        const response = await fetch(`${API_URL}/auth/refresh-token`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                refresh_token: userInfo.refreshToken
            })
        });

        if (!response.ok) {
            throw new Error('Failed to refresh token');
        }

        const result = await response.json();
        if (result.status === 0) {
            // Cập nhật token mới vào sessionStorage
            userInfo.accessToken = result.data.access_token;
            userInfo.refreshToken = result.data.refresh_token;
            sessionStorage.setItem('userInfo', JSON.stringify(userInfo));
            return userInfo.accessToken;
        } else {
            throw new Error(result.message || 'Failed to refresh token');
        }
    } catch (error) {
        console.error('Error refreshing token:', error);
        // Nếu refresh token thất bại, chuyển về trang đăng nhập
        sessionStorage.clear();
        window.location.href = 'sign-in.html';
        throw error;
    }
}