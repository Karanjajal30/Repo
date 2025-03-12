// server.js

// Import required modules
const express = require('express');
const fs = require('fs');
const path = require('path');

// Create an instance of the Express application
const app = express();

// Define the port to run the server on (default to 3000 if not provided by environment)
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON and URL-encoded bodies from POST requests
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve static files from the "public" folder
app.use(express.static(path.join(__dirname, 'public')));

// Define the path to the users JSON file
const USERS_FILE = path.join(__dirname, 'users.json');

/**
 * Helper function to load users from the JSON file.
 * If the file doesn't exist, it creates one with an empty array.
 */
function loadUsers() {
  if (!fs.existsSync(USERS_FILE)) {
    // Create the file with an empty array if it doesn't exist
    fs.writeFileSync(USERS_FILE, JSON.stringify([]));
  }
  const data = fs.readFileSync(USERS_FILE, 'utf8');
  try {
    return JSON.parse(data);
  } catch (error) {
    // In case of any error parsing JSON, return an empty array
    return [];
  }
}

/**
 * Helper function to save users to the JSON file.
 * @param {Array} users - Array of user objects to be saved.
 */
function saveUsers(users) {
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2));
}

/**
 * POST /signup
 * Endpoint to handle user signups.
 * Expects "email" and "password" in the request body.
 * Appends a new user (with a timestamp) to the users.json file.
 */
app.post('/signup', (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  // Load existing users
  const users = loadUsers();

  // Check if the email is already registered
  const existingUser = users.find(user => user.email === email);
  if (existingUser) {
    return res.status(400).send('User already exists.');
  }

  // Create a new user object (note: in production, remember to hash passwords)
  const newUser = {
    email,
    password, // In production, NEVER store plain text passwords!
    timestamp: new Date().toISOString()
  };

  // Add the new user to the list and save it back to the file
  users.push(newUser);
  saveUsers(users);

  // Respond with success
  res.send('Signup successful!');
});

/**
 * POST /login
 * Endpoint to handle user logins.
 * Expects "email" and "password" in the request body.
 * Checks credentials against users stored in users.json.
 */
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  // Validate required fields
  if (!email || !password) {
    return res.status(400).send('Email and password are required.');
  }

  // Load existing users
  const users = loadUsers();

  // Look for a user matching both email and password
  const user = users.find(user => user.email === email && user.password === password);
  
  // If found, send success message; otherwise, send an error
  if (user) {
    res.send('Login successful!');
  } else {
    res.status(401).send('Invalid email or password.');
  }
});

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
