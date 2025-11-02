import express from 'express';
import authRoutes from './routes/authRoutes.js';
import medicineRoutes from './routes/medicineRoutes.js';
import equipmentRoutes from './routes/equipmentRoutes.js';
import inventoryRoutes from './routes/inventoryRoutes.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { verifyToken } from './middlewares/authMiddleware.js';
import adminRoutes from './routes/adminRoutes.js';
import specialtiesRouter from './routes/specialtiesRoutes.js';
import consultationRoutes from './routes/consultationRoutes.js';
const app = express();

app.use(express.json());
app.use('/api/auth', authRoutes);
app.use('/api/medicines', medicineRoutes);
app.use('/api/equipment', equipmentRoutes);
app.use('/api/inventory', inventoryRoutes);
app.use('/api/admin',verifyToken,adminRoutes);
app.use('/api',specialtiesRouter);
app.use('/api',consultationRoutes);

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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

export default app;