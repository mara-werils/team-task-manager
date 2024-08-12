document.addEventListener('DOMContentLoaded', function () {
    const signupForm = document.getElementById('signup-form');
    const loginForm = document.getElementById('login-form');
    const taskForm = document.getElementById('task-form');

    function showMessage(elementId, message, type = 'success') {
        const element = document.getElementById(elementId);
        element.innerText = message;
        element.className = `alert alert-${type}`;
    }

    if (signupForm) {
        signupForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;

            const response = await fetch('/users/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ username, email, password })
            });

            if (response.ok) {
                showMessage('signup-message', 'User created successfully!', 'success');
                signupForm.reset();
            } else {
                showMessage('signup-message', 'Error creating user.', 'danger');
            }
        });
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            const response = await fetch('/token', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                },
                body: new URLSearchParams({ username, password })
            });

            if (response.ok) {
                const data = await response.json();
                localStorage.setItem('access_token', data.access_token);
                showMessage('login-message', 'Login successful!', 'success');
                loginForm.reset();
            } else {
                showMessage('login-message', 'Invalid credentials.', 'danger');
            }
        });
    }

    if (taskForm) {
        taskForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            const title = document.getElementById('title').value;
            const description = document.getElementById('description').value;
            const token = localStorage.getItem('access_token');

            const response = await fetch('/tasks/', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ title, description })
            });

            if (response.ok) {
                taskForm.reset();
                loadTasks();
            }
        });

        loadTasks();
    }

    async function loadTasks() {
        const token = localStorage.getItem('access_token');
        const response = await fetch('/tasks/', {
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });

        const tasksList = document.getElementById('tasks-list');
        tasksList.innerHTML = '';
        const tasks = await response.json();

        tasks.forEach(task => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerText = `${task.title}: ${task.description}`;
            
            const buttonsDiv = document.createElement('div');
            
            if (!task.is_done) {
                const doneButton = document.createElement('button');
                doneButton.className = 'btn btn-success btn-sm';
                doneButton.innerText = 'Mark as Done';
                doneButton.onclick = async function () {
                    await markTaskAsDone(task.id);
                    loadTasks();
                };
                buttonsDiv.appendChild(doneButton);
            } else {
                const doneBadge = document.createElement('span');
                doneBadge.className = 'badge badge-success';
                doneBadge.innerText = 'Done';
                buttonsDiv.appendChild(doneBadge);
            }

            const deleteButton = document.createElement('button');
            deleteButton.className = 'btn btn-danger btn-sm ml-2';
            deleteButton.innerText = 'Delete';
            deleteButton.onclick = async function () {
                await deleteTask(task.id);
                loadTasks();
            };
            buttonsDiv.appendChild(deleteButton);

            li.appendChild(buttonsDiv);
            tasksList.appendChild(li);
        });
    }

    async function markTaskAsDone(taskId) {
        const token = localStorage.getItem('access_token');
        await fetch(`/tasks/${taskId}/done`, {
            method: 'PUT',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }

    async function deleteTask(taskId) {
        const token = localStorage.getItem('access_token');
        await fetch(`/tasks/${taskId}`, {
            method: 'DELETE',
            headers: {
                'Authorization': `Bearer ${token}`
            }
        });
    }
});
