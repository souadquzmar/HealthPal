import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import db from '../config/database.js'
import dotnev from 'dotenv'
import { registerSchema,loginSchema } from '../validations/authSchema.js';
dotnev.config();

export const registerUser = async (req,res) => {
    try{
        const {error,value} = registerSchema.validate(req.body);

        if(error)
            return res.status(400).json({message: error.details[0].message});

        const {fullName, email, password, role} = value;
        const [existingUser] = await db.query('select * from users where email = ?',[email]);

        if(existingUser.length > 0)
            return res.status(409).json({message: 'Email already exists'})

        const hashedPassword = await bcrypt.hash(password,10);
        await db.query('insert into users (full_name, email, password_hash, role) values (?,?,?,?)',[fullName,email,hashedPassword,role]);
        return res.status(201).json({message: 'User registered successfully'})
    } catch(error){
        console.log(error);
        res.status(500).json({message: 'Internal server error'})
    }

}

export const loginUser = async(req,res) => {
    try{
        const {error,value} = loginSchema.validate(req.body);
        if(error)
            return res.status(400).json({message: error.details[0].message});
        const {email,password} = value;
        const [users] = await db.query('select * from users where email = ?',[email]);
        if(users.length === 0)
            return res.status(404).json({message: 'User not found'});
        const user = users[0];
        const valid = await bcrypt.compare(password,user.password_hash);
        if(!valid)
            return res.status(401).json({message: 'Password is wrong'});
        const token = jwt.sign({id: user.id, role: user.role},process.env.JWT_SECRET,{expiresIn:'1d'});
        return res.status(200).json({messsage:'Login successfully', token, user:{
            id:user.id,
            full_name: user.full_name,
            role: user.role
        }})
    } catch(error){
        console.log(error);
        res.status(500).json({message: 'Internal server error'})
    }
}