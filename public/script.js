// Register the service worker
if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/service-worker.js')
      .then(registration => {
        console.log('Service Worker registered with scope:', registration.scope);
      })
      .catch(error => {
        console.log('Service Worker registration failed:', error);
      });
  });
}

// Function to open a tab and load its todos
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

  loadTodos(tabName);
}

// Function to add a new tab
function addTab() {
  const newTabName = document.getElementById('new-tab-name').value.trim();
  if (newTabName === '') return;

  fetch('/api/tabs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ tabName: newTabName })
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to add new tab.');
      }
      return response.json();
    })
    .then(tabs => {
      // Create the tab elements on the page after a successful API call
      createTabElements(newTabName);
      document.getElementById('new-tab-name').value = '';
    })
    .catch(error => console.error('Error adding new tab:', error));
}

// Function to create new tab elements dynamically
function createTabElements(tabName) {
  // Check if tab already exists to avoid duplicates
  if (document.getElementById(tabName)) {
    return;
  }
  
  // Create the tab button
  const tabContainer = document.querySelector('.tab');
  const newTabButton = document.createElement('button');
  newTabButton.className = 'tablinks';
  newTabButton.innerText = tabName;
  newTabButton.onclick = (event) => openTab(event, tabName);
  tabContainer.appendChild(newTabButton);

  // Create a delete button for the tab (if it's not the 'Home' tab)
  if (tabName !== "Home") {
    const deleteButton = document.createElement('button');
    deleteButton.innerText = 'Delete';
    deleteButton.onclick = (event) => {
      event.stopPropagation(); // Prevent the tab from opening when clicking delete
      deleteTab(tabName);
    };
    tabContainer.appendChild(deleteButton);
  }

  // Create the tab content
  const newTabContent = document.createElement('div');
  newTabContent.id = tabName;
  newTabContent.className = 'tabcontent';
  newTabContent.innerHTML = `
    <input type="text" id="new-todo-${tabName.toLowerCase()}" placeholder="Add a new todo">
    <button onclick="addTodo('${tabName}')">Add</button>
    <button onclick="removeAll('${tabName}')">Remove All</button>
    <ul id="todo-list-${tabName.toLowerCase()}"></ul>
  `;
  document.body.appendChild(newTabContent);
}

// Function to add a new todo
function addTodo(tab) {
  const inputId = `new-todo-${tab.toLowerCase()}`;
  const input = document.getElementById(inputId);

  if (input.value.trim() !== '') {
    const newTodo = {
      text: input.value,
      completed: false
    };

    fetch(`/api/todos/${tab}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(newTodo)
    })
    .then(response => {
      if (response.ok) {
        input.value = '';
        loadTodos(tab); // Reload todos to show the new item
      } else {
        throw new Error('Failed to add todo.');
      }
    })
    .catch(error => console.error('Error adding todo:', error));
  }
}

// Function to toggle todo completion
function toggleTodoCompletion(tab, index) {
  fetch(`/api/todos/${tab}/${index}`, {
      method: 'PUT'
    })
    .then(response => {
      if (response.ok) {
        loadTodos(tab); // Reload todos to show the updated state
      } else {
        throw new Error('Failed to toggle todo.');
      }
    })
    .catch(error => console.error('Error toggling todo:', error));
}

// Function to remove a todo
function removeTodo(tab, index) {
  fetch(`/api/todos/${tab}/${index}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        loadTodos(tab); // Reload todos
      } else {
        throw new Error('Failed to remove todo.');
      }
    })
    .catch(error => console.error('Error removing todo:', error));
}

// Function to remove all todos
function removeAll(tab) {
  fetch(`/api/todos-all/${tab}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (response.ok) {
        loadTodos(tab);
      } else {
        throw new Error('Failed to remove all todos.');
      }
    })
    .catch(error => console.error('Error removing all todos:', error));
}

// Function to render todos for a given tab and todo list
function renderTodos(tab, todos) {
  const listId = `todo-list-${tab.toLowerCase()}`;
  const list = document.getElementById(listId);
  if (!list) return;

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
    removeButton.addEventListener('click', (event) => {
      event.stopPropagation(); // Prevent toggling completion when removing
      removeTodo(tab, index);
    });

    li.appendChild(removeButton);

    li.addEventListener('click', () => {
      toggleTodoCompletion(tab, index);
    });

    list.appendChild(li);
  });
}

// Function to load todos for a tab from the server
function loadTodos(tab) {
  fetch(`/api/todos/${tab}`)
    .then(response => response.json())
    .then(todos => {
      renderTodos(tab, todos);
    })
    .catch(error => console.error('Error loading todos:', error));
}

// Function to delete a tab
function deleteTab(tabName) {
  fetch(`/api/tabs/${tabName}`, {
      method: 'DELETE'
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Failed to delete tab.');
      }
      // Remove the tab button and content from the DOM
      const tabButton = document.querySelector(`.tablinks:nth-child(${Array.from(document.querySelectorAll('.tablinks')).findIndex(btn => btn.innerText === tabName) + 1})`);
      if (tabButton) tabButton.nextElementSibling.remove(); // Also remove the delete button
      if (tabButton) tabButton.remove();

      const tabContent = document.getElementById(tabName);
      if (tabContent) tabContent.remove();

      // Open the default 'Home' tab if the deleted tab was active
      const firstTabButton = document.querySelector('.tablinks');
      if (firstTabButton) {
        firstTabButton.click();
      }
    })
    .catch(error => console.error('Error deleting tab:', error));
}

// On page load, fetch the custom tabs from the server and render them
document.addEventListener('DOMContentLoaded', (event) => {
  fetch('/api/tabs')
    .then(response => response.json())
    .then(tabs => {
      tabs.forEach(tab => {
        createTabElements(tab);
      });
      // After creating all tabs, open the first one (Home)
      document.querySelector('.tab button').click();
    })
    .catch(error => console.error('Error fetching tabs:', error));
});