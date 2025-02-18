import express from 'express';
import cors from 'cors';
import { authController } from './controllers/authController';

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());

// Auth routes
app.post('/auth/login', authController.login);
app.post('/auth/signup', authController.signup);
app.post('/auth/logout', authController.logout);

// Start server
app.listen(port, () => {
  console.log(`Server running on port ${port}`);
}); 