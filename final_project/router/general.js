const express = require('express');
const axios = require('axios');
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const generalRouter = express.Router();


public_users.post("/register", (req,res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.status(400).json({ message: "Username and password are required" });
  }

  // Verify if the username already exists
  const userExists = isValid(username);

  if (userExists) {
    return res.status(409).json({ message: "Username already exists" });
  }

  // Add the new user to the users array
  users.push({ username, password });
  return res.status(200).json({ message: "User registered successfully" });

});

// Get the book list available in the shop
public_users.get('/',function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});

// Get book details based on ISBN
public_users.get('/isbn/:isbn',function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  }
  else {
    return res.status(404).json({message: "Book not found"});
  }
 });
  
// Get book details based on author
public_users.get('/author/:author',function (req, res) {
  const author = req.params.author.toLowerCase();
  const booksByAuthor = [];

  for (key in books) {
    if (books[key].author.toLowerCase() === author) {
      booksByAuthor.push(books[key]);
    }
  }

  if (booksByAuthor.length > 0) {
    return res.status(200).json(booksByAuthor);
  }
  else {
    return res.status(404).json({message: "No books found by this author"});
  }
});

// Get all books based on title
public_users.get('/title/:title',function (req, res) {
  const title = req.params.title.toLowerCase();
  const booksByTitle = [];

  for (let key in books) {
    if (books[key].title.toLowerCase() === title) {
      booksByTitle.push({ isbn: key, ...books[key] });
    }
  }

  if (booksByTitle.length > 0) {
    return res.status(200).json(booksByTitle);
  } else {
    return res.status(404).json({ message: "No books found with this title" });
  }
});

//  Get book review
public_users.get('/review/:isbn',function (req, res) {
  const isbn = req.params.isbn;

  const book = books[isbn];

  if (book) {
    return res.status(200).json(book.reviews);
  } else {
    return res.status(404).json({ message: "Book not found" });
  }

});

// Function to get the list of books 
const getBooksList = async () => {
  try {
    // Axios to fetch the list of books from the server
    const response = await axios.get('http://localhost:5000/'); 
    const books = response.data; 

    return books;  
  } catch (error) {
    console.error('Error fetching books:', error);
    throw error; 
  }
};

// Function to get book details by ISBN
const getBookByISBN = async (isbn) => {
  try {
    const response = await axios.get(`http://localhost:5000/isbn/${isbn}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching book by ISBN:', error.message);
    throw error;
  }
};

// Function to get book details by author
const getBooksByAuthor = async (author) => {
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching books by author:', error.message);
    throw error;
  }
};

// Function to get all books by title
const getBooksByTitle = async (title) => {
  try {
    const response = await axios.get(`http://localhost:5000/title/${title}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching books by title:', error.message);
    throw error;
  }
}

// Route to get the list of books
generalRouter.get('/books', async (req, res) => {
  try {
    const books = await getBooksList(); 
    res.status(200).json(books);  
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books' });
  }
});

// Route to get book details by ISBN
generalRouter.get('/books/isbn/:isbn', async (req, res) => {
  const isbn = req.params.isbn;
  try {
    const book = await getBookByISBN(isbn);
    res.status(200).json(book);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching book by ISBN' });
  }
});

// Route to get books by author 
generalRouter.get('/books/author/:author', async (req, res) => {
  const author = req.params.author;
  try {
    const books = await getBooksByAuthor(author);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books by author' });
  }
});

// Route to get books by title
generalRouter.get('/books/title/:title', async (req, res) => {
  const title = req.params.title;
  try {
    const books = await getBooksByTitle(title);
    res.status(200).json(books);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching books by title' });
  }
});

module.exports.general = generalRouter;
module.exports.public = public_users;
