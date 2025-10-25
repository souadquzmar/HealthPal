import express from 'express';
import dotenv from 'dotenv';
import router from './src/routes/authRoutes.js';
import medicineRoutes from "./src/routes/medicineRoutes.js";
import equipmentRoutes from "./src/routes/equipmentRoutes.js";
import inventoryRoutes from "./src/routes/inventoryRoutes.js";


dotenv.config();

const server = express();
server.use(express.json());
server.use("/api/medicines", medicineRoutes);
server.use("/api/equipment", equipmentRoutes);
server.use("/api/inventory", inventoryRoutes);

server.use('/api/auth', router);

server.get('/', (req, res) => {
    res.send('HealthPal is running');
});

server.listen(3000, () => {
    console.log('Server running on port 3000');
});
