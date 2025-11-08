import db from "../config/database.js";

export const listCases = async (req, res) => {
  try {
    const [cases] = await db.query(
      "select * from cases order by created_at desc"
    );
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
    const [cases] = await db.query(
      `SELECT 
          c.id,
          c.title,
          c.description,
          c.category,
          c.location,
          c.goal_amount,
          c.raised_amount,
          c.status,
          c.update_text,
          c.recovered,
          c.created_at,
          u.full_name AS patient_name,
          p.gender,
          p.date_of_birth,
          p.medical_history
        FROM cases c
        JOIN patients p ON c.patient_id = p.id
        JOIN users u ON p.user_id = u.id
        WHERE c.id = ?`,
      [caseId]
    );

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
