import express from 'express';
import authRoutes from './routes/authRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';

const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/inventory', inventoryRoutes);


app.get('/', (req, res) => {
    res.send('HealthPal is running');
});

app.get('/health', (req, res) => {
  res.status(200).json({
    status: 'OK',
    message: 'HealthPal API is running',
    timestamp: new Date().toISOString(),
    database: 'Connected'
  });
});

app.use(errorHandler);


export default app;