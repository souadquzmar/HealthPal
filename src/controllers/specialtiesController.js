import db from '../config/database.js'

export const getSpecialties = async(req,res) => {
    try{
        const [rows] = await db.query('select distinct specialty from doctors where specialty is not null');

        const specialties = rows.map((row,index) => (
            {
                id:index+1,
                name:row.specialty
            }
        ));
        return res.status(200).json({message:{specialties}});
    } catch(error){
        console.log(error);
        return res.status(500).json({message:'Internal server error.'});
    }
}