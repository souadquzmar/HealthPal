import db from "../config/database.js";

export const listCases = async (req, res) => {
  try {
    const [cases] = await db.query(`
      SELECT 
        c.id, 
        c.title, 
        c.description, 
        c.category, 
        c.location, 
        c.goal_amount, 
        c.amount_raised, 
        c.status, 
        c.created_at,
        c.updated_at,
        u.full_name AS patient_name
      FROM cases c
      JOIN patients p ON c.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      ORDER BY c.created_at DESC
    `);
    return res.status(200).json({
      success: true,
      count: cases.length,
      cases,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getCaseById = async (req, res) => {
  try {
    const caseId = req.params.id;
    const [cases] = await db.query(`
      SELECT 
        c.*, 
        u.full_name AS patient_name
      FROM cases c
      JOIN patients p ON c.patient_id = p.id
      JOIN users u ON p.user_id = u.id
      WHERE c.id = ?
    `, [caseId]);

    if (cases.length === 0)
      return res.status(404).json({ message: "Case not found." });

    const caseData = cases[0];
    const [donations] = await db.query(
        `SELECT 
          u.full_name AS donor_name, 
          d.amount, 
          d.status, 
          d.created_at
        FROM donations d
        JOIN users u ON d.donor_id = u.id
        WHERE d.case_id = ?`,
        [caseId]
      ).catch(() => [[]]);

      return res.status(200).json({
        success:true,
        case: caseData,
        donations
      });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const createCase = async(req,res) => {
  try{
    const {title, description, category, location, goal_amount} = req.body;

    if(!title || !description || !goal_amount)
      return res.status(400).json({message: 'Title, description and goal amount are required.'});

    const patientId = req.user.patientId;
    if(!patientId)
      return res.status(400).json({message : 'No patient record found for this user.'});

    const [result] = await db.query(`insert into cases (patient_id,title,description,category,location,goal_amount,amount_raised,status,created_at) values (?,?,?,?,?,?,0.00,'active',NOW())`,[patientId,title,description,category || null,location || null,goal_amount]);

    return res.status(201).json({
      message:'Case created successfully.',
      case_id: result.insertId
    })
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

export const updateCase = async(req,res) => {
  try{
    const caseId = req.params.id;
    const {title, description, category, status} = req.body;
    const patientId = req.user.patientId;

    const [cases] = await db.query('select * from cases where id = ? and patient_id = ?',[caseId,patientId]);
    if(cases.length === 0)
      return res.status(403).json({message:'Access denied. This is not your case.'});

    await db.query('update cases set title = ?, description = ?, status = ?, updated_at = NOW() where id = ?',[title || cases[0].title, description || cases[0].description, status || cases[0].status, caseId]);

    return res.status(200).json({message:'Case updated successfully.'});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
}
