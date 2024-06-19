const jwt = require('jsonwebtoken');
const pool = require('./db');

const verifyToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
	if (err) {
	  console.error('Token verification error:', err);
	  return res.status(401).json({ error: 'Invalid token' });
	}
	req.userId = decoded.userId;
	next();
  });
};

const checkRole = (requiredRole) => {	
  return async (req, res, next) => {
    try {
      const userId = req.userId;
      const query = 'SELECT role FROM users WHERE id = $1';
      const { rows } = await pool.query(query, [userId]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'User not found' });
      }

      const userRole = rows[0].role;

      if ((userRole & requiredRole) === requiredRole) {
        next();
      } else {
        return res.status(403).json({ error: 'Forbidden' });
      }
    } catch (error) {
      console.error('Error checking user role:', error);
      return res.status(500).json({ error: 'Internal server error' });
    }
  };
};

module.exports = {
	verifyToken,
	checkRole,
  };