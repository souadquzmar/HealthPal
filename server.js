import express from 'express';
import dotnev from 'dotenv';
import router from './src/routes/authRoutes.js';
dotnev.config();

const server = express();
server.use(express.json());

server.use('/api/auth',router);
server.get('/',(req,res) =>{
    res.send('HealthPal is running');
});
server.listen(3000);