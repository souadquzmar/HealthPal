import db from '../config/database.js';

export const listCases = async (req,res) => {
    try{
        const [cases] = await db.query('select * from cases order by created_at desc');
        return res.status(200).json({
            success:true,
            count: cases.length,
            cases
        });
    } catch(error) {
        console.log(error);
        return res.status(500).json({message:'Internal server error.'});
    }
}