const express = require('express');
const path = require('path');
const app = express();
const port = 3000;

// Middleware to parse JSON bodies from client requests
app.use(express.json());

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Data structures to hold todos and tabs on the server
// In a real-world application, you would replace this with a database
let todos = {
  "Home": [] // Initialize with a default 'Home' tab
}; 
let customTabs = ["Home"];

// --- API Endpoints for Tabs ---

// Get all custom tabs
app.get('/api/tabs', (req, res) => {
  res.json(customTabs);
});

// Add a new tab
app.post('/api/tabs', (req, res) => {
  const newTabName = req.body.tabName;
  if (!newTabName || customTabs.includes(newTabName)) {
    return res.status(400).send('Invalid or duplicate tab name.');
  }

  customTabs.push(newTabName);
  todos[newTabName] = []; // Initialize an empty todo list for the new tab
  res.status(201).json(customTabs);
});

// Delete a tab
app.delete('/api/tabs/:tabName', (req, res) => {
  const tabName = req.params.tabName;
  if (tabName === "Home") {
    return res.status(403).send("Cannot delete the 'Home' tab.");
  }
  
  customTabs = customTabs.filter(tab => tab !== tabName);
  delete todos[tabName]; // Remove the associated todos
  res.status(200).json(customTabs);
});

// --- API Endpoints for Todos ---

// Get all todos for a specific tab
app.get('/api/todos/:tabName', (req, res) => {
  const tabName = req.params.tabName;
  res.json(todos[tabName] || []); // Return todos for the tab, or an empty array
});

// Add a new todo to a specific tab
app.post('/api/todos/:tabName', (req, res) => {
  const tabName = req.params.tabName;
  const newTodo = req.body;
  if (!newTodo || typeof newTodo.text !== 'string' || !todos[tabName]) {
    return res.status(400).send('Invalid todo data or tab not found.');
  }

  todos[tabName].push(newTodo);
  res.status(201).json(newTodo);
});

// Update a todo (toggle completion)
app.put('/api/todos/:tabName/:index', (req, res) => {
  const tabName = req.params.tabName;
  const index = parseInt(req.params.index, 10);
  
  if (todos[tabName] && todos[tabName][index]) {
    todos[tabName][index].completed = !todos[tabName][index].completed;
    res.status(200).json(todos[tabName][index]);
  } else {
    res.status(404).send('Todo not found.');
  }
});

// Remove a specific todo
app.delete('/api/todos/:tabName/:index', (req, res) => {
  const tabName = req.params.tabName;
  const index = parseInt(req.params.index, 10);
  
  if (todos[tabName] && todos[tabName][index]) {
    todos[tabName].splice(index, 1);
    res.status(200).send('Todo removed.');
  } else {
    res.status(404).send('Todo not found.');
  }
});

// Remove all todos for a tab
app.delete('/api/todos-all/:tabName', (req, res) => {
  const tabName = req.params.tabName;
  if (todos[tabName]) {
    todos[tabName] = [];
    res.status(200).send('All todos removed.');
  } else {
    res.status(404).send('Tab not found.');
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});