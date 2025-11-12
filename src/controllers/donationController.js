import db from '../config/database.js';

export const makeDonation = async (req,res) => {
    try{
        const {case_id, ngo_id, type, amount} = req.body;
        const donorId = req.user.id;

        if(!case_id && !ngo_id)
            return res.status(400).json({message:'Either case_id or ngo_id are required.'});
        if(!type)
            return res.status(400).json({message:'Donation type is required.'});
        if (type === 'money' && (!amount || amount <= 0))
            return res.status(400).json({ message: 'Valid donation amount is required for money donations.' });

        await db.query(`insert into donations (donor_id, ngo_id, case_id, type, amount, status) values (?,?,?,?,?,'pending')`,[donorId,ngo_id || null,case_id || null,type, amount || 0]);
        if(case_id && type === 'money')
            await db.query(`update cases set amount_raised = amount_raised + ? where id = ?`,[amount, case_id]);

        return res.status(201).json({
            message:'Donation recorded successfully.',
            donor_id: donorId,
            case_id
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({message: 'Internal server error.'});
    }
}