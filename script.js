// Function to add a new task to the list
function addTask(event) {
    event.preventDefault();
  
    // Get the input value
    const input = document.getElementById("todoInput");
    const taskText = input.value;
  
    if (taskText.trim() !== "") {
      // Create a new list item
      const listItem = document.createElement("li");
      listItem.textContent = taskText;
  
      // Add the list item to the to-do list
      const todoList = document.getElementById("todoList");
      todoList.appendChild(listItem);
  
      // Clear the input field
      input.value = "";
  
      // Save the updated list to local storage
      saveListToStorage();
    }
  }
  
  // Function to save the list to local storage
  function saveListToStorage() {
    const todoList = document.getElementById("todoList");
  
    // Create an array to store the tasks
    const tasks = [];
  
    // Iterate through each list item and add the task text to the array
    for (let i = 0; i < todoList.children.length; i++) {
      const listItem = todoList.children[i];
      tasks.push(listItem.textContent);
    }
  
    // Save the tasks array to local storage
    localStorage.setItem("tasks", JSON.stringify(tasks));
  }
  
  // Function to load the list from local storage
  function loadListFromStorage() {
    const tasks = localStorage.getItem("tasks");
  
    if (tasks) {
      const todoList = document.getElementById("todoList");
  
      // Parse the stored tasks array
      const parsedTasks = JSON.parse(tasks);
  
      // Create list items for each task and add them to the to-do list
      parsedTasks.forEach(task => {
        const listItem = document.createElement("li");
        listItem.textContent = task;
        todoList.appendChild(listItem);
      });
    }
  }
  
  // Attach event listener to the form submission
  const form = document.getElementById("todoForm");
  form.addEventListener("submit", addTask);
  
  // Load the list from local storage on page load
  window.addEventListener("load", loadListFromStorage);
  