document.addEventListener('DOMContentLoaded', function() {
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    if (!userInfo.accessToken) {
        window.location.href = 'sign-in.html';
        return;
    }
    loadUserInfo();
    loadTasks();

    document.getElementById('addTaskForm').addEventListener('submit', handleAddTask);
    document.getElementById('statusFilter').addEventListener('change', filterTasks);
    document.getElementById('priorityFilter').addEventListener('change', filterTasks);

    // Thêm event listener cho thanh tìm kiếm
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.querySelector('.search-btn');

    // Xử lý sự kiện khi nhấn nút tìm kiếm
    searchBtn.addEventListener('click', function() {
        const keyword = searchInput.value.trim();
        loadTasks(keyword);
    });

    // Xử lý sự kiện khi nhấn Enter trong ô tìm kiếm
    searchInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            const keyword = searchInput.value.trim();
            loadTasks(keyword);
        }
    });

    // Event listener cho form tạo công việc
    document.getElementById('addTaskForm').addEventListener('submit', handleAddTask);
    
    // Đóng modal khi click bên ngoài
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('addTaskModal');
        if (event.target === modal) {
            closeAddTaskForm();
        }
    });
});

async function handleAddTask(e) {
    e.preventDefault();
    
    const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
    if (!userInfo.accessToken) {
        showNotification('Please login first', 'error');
        window.location.href = 'sign-in.html';
        return;
    }

    const task = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        date: document.getElementById('taskDueDate').value,
        priority: getPriorityValue(document.getElementById('taskPriority').value),
        status: 0, // PENDING
        user_id: userInfo.userId
    };

    try {
        const response = await fetch('http://localhost:8080/api/v1/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userInfo.accessToken}`,
                'language': 'en'
            },
            body: JSON.stringify(task)
        });

        const data = await response.json();
        if (data.status_code === 200) {
            showNotification('Task created successfully', 'success');
            closeAddTaskForm();
            loadTasks(); // Tải lại danh sách công việc
        } else {
            showNotification(data.message || 'Failed to create task', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error creating task', 'error');
    }
}

async function loadTasks(keyword = '') {
    try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
        const response = await fetch(`http://localhost:8080/api/v1/tasks?keyword=${encodeURIComponent(keyword)}`, {
            headers: {
                'Authorization': `Bearer ${userInfo.accessToken}`,
                'language': 'en'
            }
        });

        const data = await response.json();
        if (data.status_code === 200) {
            displayTasks(data.data);
            
            if (keyword && data.data.length === 0) {
                showNotification('No tasks found matching your search', 'info');
            }
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
        task.status = newStatus === 'completed' ? 1 : 0;

        const response = await fetch(`http://localhost:8080/api/v1/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${userInfo.accessToken}`,
                'language': 'en'
            },
            body: JSON.stringify(task)
        });

        const data = await response.json();
        if (data.status_code === 200) {
            showNotification('Task updated successfully', 'success');
            loadTasks();
        } else {
            showNotification(data.message || 'Failed to update task', 'error');
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
        const response = await fetch(`http://localhost:8080/api/v1/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${userInfo.accessToken}`,
                'language': 'en'
            }
        });

        const data = await response.json();
        if (data.status_code === 200) {
            showNotification('Task deleted successfully', 'success');
            loadTasks();
        } else {
            showNotification(data.message || 'Failed to delete task', 'error');
        }
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error deleting task', 'error');
    }
}

async function getTaskDetails(taskId) {
    try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
        const response = await fetch(`http://localhost:8080/api/v1/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${userInfo.accessToken}`,
                'language': 'en'
            }
        });

        const data = await response.json();
        if (data.status_code === 200) {
            return data.data;
        }
        throw new Error(data.message || 'Failed to get task details');
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error getting task details', 'error');
        throw error;
    }
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-item priority-${task.priority}`;
    div.innerHTML = `
        <div class="task-header">
            <h3>${task.title}</h3>
            <div class="task-badges">
                <span class="priority priority-${getPriorityLabel(task.priority).toLowerCase()}">
                    ${getPriorityLabel(task.priority)}
                </span>
                <span class="status status-${getStatusLabel(task.status).toLowerCase()}">
                    ${getStatusLabel(task.status)}
                </span>
            </div>
        </div>
        <p class="task-description">${task.description || ''}</p>
        <div class="task-details">
            <span><i class="far fa-calendar"></i> ${task.date}</span>
            <span><i class="far fa-user"></i> ${task.user?.name || 'Unknown'}</span>
        </div>
        <div class="task-actions">
            <button class="btn-progress" onclick="updateTaskStatus('${task.id}', '${task.status === 0 ? 'completed' : 'pending'}')">
                ${task.status === 0 ? 'Complete' : 'Mark as Pending'}
            </button>
            <button class="btn-delete" onclick="deleteTask('${task.id}')">
                <i class="far fa-trash-alt"></i> Delete
            </button>
        </div>
    `;
    return div;
}

// Helper functions
function getPriorityValue(priority) {
    switch(priority.toLowerCase()) {
        case 'high': return 2;
        case 'medium': return 1;
        case 'low': return 0;
        default: return 0;
    }
}

function getPriorityLabel(value) {
    switch(parseInt(value)) {
        case 2: return 'High';
        case 1: return 'Medium';
        case 0: return 'Low';
        default: return 'Medium';
    }
}

function getStatusLabel(value) {
    return parseInt(value) === 1 ? 'In Progress' : 'Pending';
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
    });
}

function toggleMenu() {
    const submenu = document.getElementById('Submenu');
    if (submenu) {
        submenu.classList.toggle('open-wrap');
    }
}

// Trong hàm logout
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
    const modal = document.getElementById('addTaskModal');
    modal.style.display = 'block';
    
    // Reset form
    document.getElementById('addTaskForm').reset();
    
    // Set default date là ngày hôm nay
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('taskDueDate').value = today;
}

function closeAddTaskForm() {
    const modal = document.getElementById('addTaskModal');
    modal.style.display = 'none';
}

// Thêm CSS cho modal
document.head.insertAdjacentHTML('beforeend', `
<style>
.modal {
    display: none;
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-color: rgba(0, 0, 0, 0.5);
    z-index: 1000;
}

.modal-content {
    position: relative;
    background-color: #fff;
    margin: 10% auto;
    padding: 20px;
    width: 50%;
    max-width: 500px;
    border-radius: 8px;
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.close {
    position: absolute;
    right: 20px;
    top: 10px;
    font-size: 24px;
    cursor: pointer;
    color: #666;
}

.form-group {
    margin-bottom: 15px;
}

.form-group label {
    display: block;
    margin-bottom: 5px;
    font-weight: 500;
}

.form-group input,
.form-group textarea,
.form-group select {
    width: 100%;
    padding: 8px;
    border: 1px solid #ddd;
    border-radius: 4px;
    font-size: 14px;
}

.form-group textarea {
    height: 100px;
    resize: vertical;
}

.submit-btn {
    background-color: #4CAF50;
    color: white;
    padding: 10px 20px;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    font-size: 14px;
    width: 100%;
}

.submit-btn:hover {
    background-color: #45a049;
}
</style>
`);

// Thêm hàm filterTasks
function filterTasks() {
    const statusFilter = document.getElementById('statusFilter').value;
    const priorityFilter = document.getElementById('priorityFilter').value;
    const keyword = document.getElementById('searchInput').value.trim();

    try {
        const userInfo = JSON.parse(sessionStorage.getItem('userInfo') || '{}');
        fetch(`http://localhost:8080/api/v1/tasks?keyword=${encodeURIComponent(keyword)}&status=${statusFilter}&priority=${priorityFilter}`, {
            headers: {
                'Authorization': `Bearer ${userInfo.accessToken}`,
                'language': 'en'
            }
        })
        .then(response => response.json())
        .then(data => {
            if (data.status_code === 200) {
                displayTasks(data.data);
                
                // Hiển thị thông báo khi không có kết quả
                if (data.data.length === 0) {
                    showNotification('No tasks found matching your filters', 'info');
                }
            } else {
                showNotification('Error filtering tasks', 'error');
            }
        });
    } catch (error) {
        console.error('Error:', error);
        showNotification('Error filtering tasks', 'error');
    }
}

// Cập nhật hàm displayTasks để hiển thị tasks
function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = ''; // Xóa danh sách hiện tại

    if (tasks.length === 0) {
        taskList.innerHTML = '<div class="no-tasks">No tasks found</div>';
        return;
    }

    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

// Thêm CSS cho thông báo không có tasks
document.head.insertAdjacentHTML('beforeend', `
<style>
.no-tasks {
    text-align: center;
    padding: 20px;
    color: #666;
    font-style: italic;
}
</style>
`);

// Thêm CSS cho notification
document.head.insertAdjacentHTML('beforeend', `
<style>
.notification {
    position: fixed;
    top: 20px;
    right: 20px;
    padding: 15px 25px;
    border-radius: 4px;
    color: white;
    z-index: 1000;
    animation: slideIn 0.5s ease-out;
}

.notification.success { background-color: #4CAF50; }
.notification.error { background-color: #f44336; }
.notification.info { background-color: #2196F3; }

@keyframes slideIn {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}
</style>
`);