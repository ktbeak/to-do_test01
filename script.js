// ==========================================================================
// TaskFlow Application State
// ==========================================================================

let todos = [];
let currentFilter = 'all';

// ==========================================================================
// DOM Elements
// ==========================================================================

const todoForm = document.getElementById('todo-form');
const todoInput = document.getElementById('todo-input');
const todoList = document.getElementById('todo-list');
const emptyState = document.getElementById('empty-state');
const themeToggle = document.getElementById('theme-toggle');
const completedCountEl = document.getElementById('completed-count');
const totalCountEl = document.getElementById('total-count');
const filterBtns = document.querySelectorAll('.filter-btn');
const clearCompletedBtn = document.getElementById('clear-completed');

// ==========================================================================
// Theme (Dark / Light Mode) Controller
// ==========================================================================

function initTheme() {
    const savedTheme = localStorage.getItem('theme');
    const systemPrefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    if (savedTheme === 'dark' || (!savedTheme && systemPrefersDark)) {
        document.documentElement.setAttribute('data-theme', 'dark');
    } else {
        document.documentElement.setAttribute('data-theme', 'light');
    }
}

function toggleTheme() {
    const currentTheme = document.documentElement.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
    
    document.documentElement.setAttribute('data-theme', newTheme);
    localStorage.setItem('theme', newTheme);
}

// ==========================================================================
// Data Persistence (LocalStorage)
// ==========================================================================

function saveTodos() {
    localStorage.setItem('todos', JSON.stringify(todos));
}

function loadTodos() {
    const saved = localStorage.getItem('todos');
    if (saved) {
        try {
            todos = JSON.parse(saved);
        } catch (e) {
            todos = [];
            console.error('Failed to parse saved todos:', e);
        }
    } else {
        // Sample default tasks to welcome the user
        todos = [
            { id: 1, text: '💡 TaskFlow 사용법 알아보기', completed: false },
            { id: 2, text: '✨ 새로운 할 일 입력하고 추가 버튼 누르기', completed: false },
            { id: 3, text: '🌙 우측 상단 해/달 아이콘 눌러 다크모드 적용하기', completed: true }
        ];
        saveTodos();
    }
}

// ==========================================================================
// Core Render Engine
// ==========================================================================

function render() {
    // Clear list
    todoList.innerHTML = '';
    
    // Filter tasks
    const filteredTodos = todos.filter(todo => {
        if (currentFilter === 'active') return !todo.completed;
        if (currentFilter === 'completed') return todo.completed;
        return true; // 'all'
    });
    
    // Toggle Empty State
    if (filteredTodos.length === 0) {
        emptyState.style.display = 'flex';
        todoList.style.display = 'none';
        
        // Custom empty state text based on filters
        const emptyText = emptyState.querySelector('.empty-text');
        const emptySubtext = emptyState.querySelector('.empty-subtext');
        if (currentFilter === 'completed') {
            emptyText.textContent = '완료된 할 일이 없습니다.';
            emptySubtext.textContent = '할 일을 완료해서 리스트를 채워보세요!';
        } else if (currentFilter === 'active') {
            emptyText.textContent = '진행 중인 할 일이 없습니다.';
            emptySubtext.textContent = '모든 할 일을 마쳤습니다! 멋지네요 🎉';
        } else {
            emptyText.textContent = '등록된 할 일이 없습니다.';
            emptySubtext.textContent = '새로운 할 일을 추가하고 일정을 관리해보세요!';
        }
    } else {
        emptyState.style.display = 'none';
        todoList.style.display = 'flex';
        
        // Populate items
        filteredTodos.forEach(todo => {
            const li = document.createElement('li');
            li.className = `todo-item ${todo.completed ? 'completed' : ''}`;
            li.dataset.id = todo.id;
            
            // Task content area (clickable for completing)
            const wrapper = document.createElement('div');
            wrapper.className = 'todo-content-wrapper';
            wrapper.addEventListener('click', () => toggleTodoComplete(todo.id));
            
            // Custom checkbox markup
            const checkSpan = document.createElement('span');
            checkSpan.className = 'todo-custom-check';
            checkSpan.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round">
                    <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
            `;
            
            // Task text
            const textSpan = document.createElement('span');
            textSpan.className = 'todo-text';
            textSpan.textContent = todo.text;
            
            wrapper.appendChild(checkSpan);
            wrapper.appendChild(textSpan);
            
            // Delete button markup
            const deleteBtn = document.createElement('button');
            deleteBtn.className = 'todo-delete-btn';
            deleteBtn.setAttribute('aria-label', '할 일 삭제');
            deleteBtn.innerHTML = `
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18"></line>
                    <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
            `;
            deleteBtn.addEventListener('click', (e) => {
                e.stopPropagation(); // Avoid triggering wrapper click
                deleteTodo(todo.id, li);
            });
            
            li.appendChild(wrapper);
            li.appendChild(deleteBtn);
            todoList.appendChild(li);
        });
    }
    
    // Update stats counts
    const totalCount = todos.length;
    const completedCount = todos.filter(t => t.completed).length;
    
    totalCountEl.textContent = totalCount;
    completedCountEl.textContent = completedCount;
    
    // Toggle "Clear Completed" visibility
    if (completedCount > 0) {
        clearCompletedBtn.style.visibility = 'visible';
        clearCompletedBtn.style.opacity = '1';
    } else {
        clearCompletedBtn.style.visibility = 'hidden';
        clearCompletedBtn.style.opacity = '0';
    }
}

// ==========================================================================
// Task Event Actions
// ==========================================================================

function addTodo(text) {
    const newTodo = {
        id: Date.now(), // Unique ID using timestamp
        text: text.trim(),
        completed: false
    };
    
    todos.unshift(newTodo); // Add to the top of list
    saveTodos();
    render();
}

function toggleTodoComplete(id) {
    todos = todos.map(todo => {
        if (todo.id === id) {
            return { ...todo, completed: !todo.completed };
        }
        return todo;
    });
    saveTodos();
    render();
}

function deleteTodo(id, itemElement) {
    // Add slide-out CSS class for premium exit animation
    itemElement.classList.add('leaving');
    
    // Wait for the CSS transition (300ms) to complete before state update
    itemElement.addEventListener('animationend', () => {
        todos = todos.filter(todo => todo.id !== id);
        saveTodos();
        render();
    }, { once: true });
}

function clearCompleted() {
    todos = todos.filter(todo => !todo.completed);
    saveTodos();
    render();
}

// ==========================================================================
// Event Listeners Registration
// ==========================================================================

// Add task form submit listener
todoForm.addEventListener('submit', (e) => {
    e.preventDefault();
    const text = todoInput.value;
    if (text.trim()) {
        addTodo(text);
        todoInput.value = '';
        todoInput.focus();
    }
});

// Clear completed task action
clearCompletedBtn.addEventListener('click', clearCompleted);

// Filter button switchers
filterBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        filterBtns.forEach(b => b.classList.remove('active'));
        e.target.classList.add('active');
        currentFilter = e.target.dataset.filter;
        render();
    });
});

// Theme switch button trigger
themeToggle.addEventListener('click', toggleTheme);

// ==========================================================================
// Initialization
// ==========================================================================

document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    loadTodos();
    render();
});
