document.addEventListener('DOMContentLoaded', function() {
    // Kiểm tra đăng nhập
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        window.location.href = 'sign-in.html';
        return;
    }

    // Load user info
    loadUserInfo();
    
    // Load tasks
    loadTasks();

    // Add event listeners
    document.getElementById('addTaskForm').addEventListener('submit', handleAddTask);
    document.getElementById('statusFilter').addEventListener('change', filterTasks);
    document.getElementById('priorityFilter').addEventListener('change', filterTasks);
});

function loadUserInfo() {
    const savedAvatar = localStorage.getItem('userAvatar');
    const defaultAvatar = '../assets/images/userdefault.png';
    
    // Update avatars
    const avatarElements = document.querySelectorAll('.admin-main-avatar, .user-pics-info');
    avatarElements.forEach(avatar => {
        avatar.src = savedAvatar || defaultAvatar;
        avatar.onerror = function() {
            avatar.src = defaultAvatar;
        };
    });
}

function showAddTaskForm() {
    document.getElementById('addTaskModal').style.display = 'block';
}

function closeAddTaskForm() {
    document.getElementById('addTaskModal').style.display = 'none';
}

async function handleAddTask(e) {
    e.preventDefault();
    
    const task = {
        title: document.getElementById('taskTitle').value,
        description: document.getElementById('taskDescription').value,
        dueDate: document.getElementById('taskDueDate').value,
        priority: document.getElementById('taskPriority').value,
        status: 'pending'
    };

    try {
        // Gọi API để thêm task
        const response = await fetch('http://localhost:8080/api/tasks', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            },
            body: JSON.stringify(task)
        });

        if (response.ok) {
            closeAddTaskForm();
            loadTasks(); // Reload tasks
        } else {
            alert('Failed to add task');
        }
    } catch (error) {
        console.error('Error adding task:', error);
        alert('Error adding task');
    }
}

async function loadTasks() {
    try {
        const response = await fetch('http://localhost:8080/api/tasks', {
            headers: {
                'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
            }
        });

        if (response.ok) {
            const tasks = await response.json();
            displayTasks(tasks);
        }
    } catch (error) {
        console.error('Error loading tasks:', error);
    }
}

function displayTasks(tasks) {
    const taskList = document.getElementById('taskList');
    taskList.innerHTML = '';

    tasks.forEach(task => {
        const taskElement = createTaskElement(task);
        taskList.appendChild(taskElement);
    });
}

function createTaskElement(task) {
    const div = document.createElement('div');
    div.className = `task-item priority-${task.priority}`;
    div.innerHTML = `
        <h3>${task.title}</h3>
        <p>${task.description}</p>
        <div class="task-details">
            <span class="due-date">Due: ${new Date(task.dueDate).toLocaleDateString()}</span>
            <span class="priority">${task.priority}</span>
            <span class="status">${task.status}</span>
        </div>
        <div class="task-actions">
            <button onclick="updateTaskStatus('${task.id}', 'completed')">Complete</button>
            <button onclick="deleteTask('${task.id}')">Delete</button>
        </div>
    `;
    return div;
}

function filterTasks() {
    const status = document.getElementById('statusFilter').value;
    const priority = document.getElementById('priorityFilter').value;
    loadTasks(); // Implement filtering logic here
}

// Các hàm khác giữ nguyên từ home.js
function toggleMenu() {
    const submenu = document.getElementById('Submenu');
    if (submenu) {
        submenu.classList.toggle('open-wrap');
    }
}

function logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userAvatar');
    localStorage.removeItem('userData');
    localStorage.removeItem('accessToken');
    window.location.href = 'sign-in.html';
}