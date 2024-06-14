// Function to open a tab
function openTab(evt, tabName) {
  var i, tabcontent, tablinks;
  tabcontent = document.getElementsByClassName("tabcontent");
  for (i = 0; i < tabcontent.length; i++) {
      tabcontent[i].style.display = "none";
  }
  tablinks = document.getElementsByClassName("tablinks");
  for (i = 0; i < tablinks.length; i++) {
      tablinks[i].className = tablinks[i].className.replace(" active", "");
  }
  document.getElementById(tabName).style.display = "block";
  evt.currentTarget.className += " active";

  // Load the todos for the selected tab
  loadTodos(tabName);
}

// Function to add a new tab
function addTab() {
  const newTabName = document.getElementById('new-tab-name').value.trim();
  if (newTabName === '') return;

  const tabContainer = document.querySelector('.tab');
  const newTabButton = document.createElement('button');
  newTabButton.className = 'tablinks';
  newTabButton.innerText = newTabName;
  newTabButton.onclick = (event) => openTab(event, newTabName);
  tabContainer.appendChild(newTabButton);

  const newTabContent = document.createElement('div');
  newTabContent.id = newTabName;
  newTabContent.className = 'tabcontent';
  newTabContent.innerHTML = `
    <input type="text" id="new-todo-${newTabName.toLowerCase()}" placeholder="Add a new todo">
    <button onclick="addTodo('${newTabName}')">Add</button>
    <button onclick="removeAll('${newTabName}')">Remove All</button>
    <ul id="todo-list-${newTabName.toLowerCase()}"></ul>
  `;
  document.body.appendChild(newTabContent);

  document.getElementById('new-tab-name').value = '';
}

// Function to add a new todo
function addTodo(tab) {
  const inputId = `new-todo-${tab.toLowerCase()}`;
  const listId = `todo-list-${tab.toLowerCase()}`;
  const input = document.getElementById(inputId);
  const list = document.getElementById(listId);
  let todos = getTodos(tab);

  if (input.value.trim() !== '') {
      todos.push({
          text: input.value,
          completed: false
      });

      input.value = '';
      saveTodos(tab, todos);
      renderTodos(tab);
  }
}

// Function to toggle todo completion
function toggleTodoCompletion(tab, index) {
  let todos = getTodos(tab);
  todos[index].completed = !todos[index].completed;
  saveTodos(tab, todos);
  renderTodos(tab);
}

// Function to remove a todo
function removeTodo(tab, index) {
  let todos = getTodos(tab);
  todos.splice(index, 1);
  saveTodos(tab, todos);
  renderTodos(tab);
}

// Function to remove all todos
function removeAll(tab) {
  saveTodos(tab, []);
  renderTodos(tab);
}

// Function to save todos to local storage
function saveTodos(tab, todos) {
  localStorage.setItem(`todos-${tab}`, JSON.stringify(todos));
}

// Function to get todos from local storage
function getTodos(tab) {
  let todos = localStorage.getItem(`todos-${tab}`);
  return todos ? JSON.parse(todos) : [];
}

// Function to render todos
function renderTodos(tab) {
  const listId = `todo-list-${tab.toLowerCase()}`;
  const list = document.getElementById(listId);
  let todos = getTodos(tab);
  list.innerHTML = '';

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
          removeTodo(tab, index);
      });

      li.appendChild(removeButton);

      li.addEventListener('click', () => {
          toggleTodoCompletion(tab, index);
      });

      list.appendChild(li);
  });
}

// Function to load todos for a tab
function loadTodos(tab) {
  renderTodos(tab);
}

// Open the default tab (Home) on load
document.addEventListener('DOMContentLoaded', (event) => {
  document.querySelector('.tab button').click();
});
