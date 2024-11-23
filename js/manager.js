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
});

async function handleAddTask(e) {
    e.preventDefault();
    
    const currentUserId = localStorage.getItem('userId');
    const task = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        date: document.getElementById('taskDueDate').value,
        priority: getPriorityValue(document.getElementById('taskPriority').value),
        status: 0, // PENDING
        user_id: currentUserId
    };

    try {
        const response = await fetch('http://localhost:8080/api/v1/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'language': 'en'
            },
            body: JSON.stringify(task)
        });

        const data = await response.json();
        if (data.status_code === 200) {
            showNotification('Task created successfully', 'success');
            closeAddTaskForm();
            loadTasks();
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
        const response = await fetch(`http://localhost:8080/api/v1/tasks?keyword=${encodeURIComponent(keyword)}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
                'language': 'en'
            }
        });

        const data = await response.json();
        if (data.status_code === 200) {
            displayTasks(data.data);
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
        showNotification('Error loading tasks', 'error');
    }
}

async function updateTaskStatus(taskId, newStatus) {
    try {
        const task = await getTaskDetails(taskId);
        task.status = newStatus === 'completed' ? 1 : 0;

        const response = await fetch(`http://localhost:8080/api/v1/tasks/${taskId}`, {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
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
        const response = await fetch(`http://localhost:8080/api/v1/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
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
        const response = await fetch(`http://localhost:8080/api/v1/tasks/${taskId}`, {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`,
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
        default: return 1;
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

function showNotification(message, type) {
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    document.body.appendChild(notification);
    
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