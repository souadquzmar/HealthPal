import dotenv from 'dotenv';
import app from './app.js'; 
import db from './config/database.js';

dotenv.config();

const PORT = process.env.PORT || 3000;

db.getConnection()
  .then((connection) => {
    console.log('Connected to MySQL');
    connection.release();

    app.listen(PORT, () => {
      console.log(`HealthPal API running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error('Database connection failed:', err.message);
    process.exit(1); 
  });