const express = require('express');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const nodemailer = require('nodemailer');
const { verifyToken, checkRole } = require('./authMiddleware');
const pool = require('./db');
require('dotenv').config();

const ROLE_ADMIN = parseInt(process.env.ROLE_ADMIN);

const app = express();
app.use(bodyParser.json());

app.post('/books', verifyToken, checkRole(ROLE_ADMIN), async (req, res) => {
  try {
    const { title, author, publicationDate, genres } = req.body;
    const query = 'INSERT INTO books (title, author, publication_date, genres) VALUES ($1, $2, $3, $4) RETURNING *';
    const { rows } = await pool.query(query, [title, author, publicationDate, genres]);
    res.status(201).json(rows[0]);
  } catch (error) {
    console.error('Error adding book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/books', async (req, res) => {
  try {
    const query = 'SELECT * FROM books';
    const { rows } = await pool.query(query);
    res.json(rows);
  } catch (error) {
    console.error('Error retrieving books:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/books/:id', async (req, res) => {
  try {
    const bookId = req.params.id;
    const query = 'SELECT * FROM books WHERE id = $1';
    const { rows } = await pool.query(query, [bookId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error retrieving book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/books/:id', verifyToken, checkRole(ROLE_ADMIN), async (req, res) => {
  try {
    const bookId = req.params.id;
    const { title, author, publicationDate, genres } = req.body;
    const query = 'UPDATE books SET title = $1, author = $2, publication_date = $3, genres = $4 WHERE id = $5 RETURNING *';
    const { rows } = await pool.query(query, [title, author, publicationDate, genres, bookId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.json(rows[0]);
  } catch (error) {
    console.error('Error updating book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/books/:id', verifyToken, checkRole(ROLE_ADMIN), async (req, res) => {
  try {
    const bookId = req.params.id;
    const query = 'DELETE FROM books WHERE id = $1 RETURNING *';
    const { rows } = await pool.query(query, [bookId]);
    if (rows.length === 0) {
      return res.status(404).json({ error: 'Book not found' });
    }
    res.sendStatus(204);
  } catch (error) {
    console.error('Error deleting book:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Routes for user registration and authentication
app.post('/users/register', async (req, res) => {
	try {
	  const { username, password, email } = req.body;
	  const hashedPassword = await bcrypt.hash(password, 10);
	  const query = 'INSERT INTO users (username, password, email) VALUES ($1, $2, $3) RETURNING *';
	  const { rows } = await pool.query(query, [username, hashedPassword, email]);
	  const user = rows[0];
  
	  try {

		const transporter = nodemailer.createTransport({
			service: 'gmail',
			auth: {
			  user: 'exmp@gmail.com',
			  pass: '111111'
			}
		  });

    const mailOptions = {
      from: 'your-email@example.com',
      to: user.email,
      subject: 'Email Confirmation',
      text: 'Please confirm your email address.',
    };

    await transporter.sendMail(mailOptions);
} catch (error) {
	console.error('Error sending confirmation email:', error);
  }
	res.status(201).json(user);
} catch (error) {
  console.error('Error registering user:', error);
  res.status(500).json({ error: 'Internal server error' });
}
});

app.post('/users/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    const query = 'SELECT * FROM users WHERE username = $1';
    const { rows } = await pool.query(query, [username]);

    if (rows.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = rows[0];
    const isPasswordValid = await bcrypt.compare(password, user.password);

    if (!isPasswordValid) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user.id }, process.env.JWT_SECRET);
    res.json({ token });
  } catch (error) {
    console.error('Error authenticating user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/users/me', verifyToken, async (req, res) => {
  try {
    const userId = req.userId;
    const query = 'SELECT * FROM users WHERE id = $1';
    const { rows } = await pool.query(query, [userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const user = rows[0];
    res.json(user);
  } catch (error) {
    console.error('Error retrieving user:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/users/:id/role', verifyToken, checkRole(ROLE_ADMIN), async (req, res) => {
  try {
    const userId = req.params.id;
    const { role } = req.body;
    const query = 'UPDATE users SET role = $1 WHERE id = $2 RETURNING *';
    const { rows } = await pool.query(query, [role, userId]);

    if (rows.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }

    const updatedUser = rows[0];
    res.json(updatedUser);
  } catch (error) {
    console.error('Error updating user role:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(3000, () => {
  console.log('Server is running on port 3000');
});