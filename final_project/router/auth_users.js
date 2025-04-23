const express = require('express');
const jwt = require('jsonwebtoken');
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username)=>{ //returns boolean
  return users.some(users => users.username === username);
}

const authenticatedUser = (username, password)=> { //returns boolean
  return users.some(users => users.username === username && users.password === password);
}


//only registered users can login
regd_users.post("/login", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  const userIsValid = authenticatedUser(username, password);  // Check credentials

  if (!userIsValid) {
    return res.status(401).json({ message: "Invalid login credentials" });
  }

  // Get the user object to access the username
  const user = users.find(user => user.username === username && user.password === password); 

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // If credentials are valid, create a JWT token
  const accessToken = jwt.sign(
    { username: user.username },  
    'pokemon', 
    { expiresIn: '1h' }
  );

  // Store the token in the session
  req.session.authorization = {
    accessToken,
    username: user.username  // Store the username of the logged-in user
  };

  return res.status(200).json({ message: "Login successful", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;
  const { review } = req.body;


  if (!review) {
    return res.status(400).json({ message: "Review text is required." });
  }

  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  if (books[isbn]) {
    books[isbn].reviews[username] = review;
    return res.status(200).json({
      message: "Review added/updated successfully",
      book: books[isbn]
    });
  } 
  else {
    return res.status(404).json({ message: "Book not found" });
  }
});

// Delete a book review
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization.username;

  if (!username) {
    return res.status(403).json({ message: "User not authenticated" });
  }

  if (books[isbn]) {
    // Check if the review exists and if it belongs to the authenticated user
    if (books[isbn].reviews[username]) {
      // Delete the review
      delete books[isbn].reviews[username];
      return res.status(200).json({
        message: "Review deleted successfully",
        book: books[isbn]
      });
    } 
    else {
      return res.status(404).json({ message: "Review not found for this user" });
    }
  } 
  else {
    return res.status(404).json({ message: "Book not found" });
  }
});


module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
