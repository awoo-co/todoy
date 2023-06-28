// Get references to HTML elements
const todoList = document.getElementById('todo-list');
const newTodoInput = document.getElementById('new-todo');

// Load todos from local storage if available
let todos = localStorage.getItem('todos');
todos = todos ? JSON.parse(todos) : [];

// Render todos
renderTodos();

// Function to render todos
function renderTodos() {
  todoList.innerHTML = '';

  todos.forEach((todo, index) => {
    const li = document.createElement('li');
    li.innerText = todo.text;

    if (todo.completed) {
      li.classList.add('completed');
    }

    const removeButton = document.createElement('button');
    removeButton.innerText = 'Remove';
    removeButton.classList.add('remove-button');
    removeButton.addEventListener('click', () => {
      removeTodo(index);
    });

    li.appendChild(removeButton);

    li.addEventListener('click', () => {
      toggleTodoCompletion(index);
    });

    todoList.appendChild(li);
  });
}

// Function to add a new todo
function addTodo() {
  const text = newTodoInput.value.trim();

  if (text !== '') {
    todos.push({
      text: text,
      completed: false
    });

    newTodoInput.value = '';
    saveTodos();
    renderTodos();
  }
}

// Function to toggle todo completion
function toggleTodoCompletion(index) {
  todos[index].completed = !todos[index].completed;
  saveTodos();
  renderTodos();
}

// Function to remove a todo
function removeTodo(index) {
  todos.splice(index, 1);
  saveTodos();
  renderTodos();
}

// Function to remove all todos
function removeAll() {
  todos = [];
  saveTodos();
  renderTodos();
}

// Function to save todos to local storage
function saveTodos() {
  localStorage.setItem('todos', JSON.stringify(todos));
}

// Add event listeners to buttons
document.getElementById('add-button').addEventListener('click', addTodo);
document.getElementById('remove-all-button').addEventListener('click', removeAll);
