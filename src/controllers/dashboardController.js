import db from '../config/database.js';

export const getPatientProfile = async (req, res) => {
  try {
    const patientId = req.params.id;
    const [[patient]] = await db.query(
      `
      SELECT 
        u.full_name, 
        u.email, 
        p.gender, 
        p.date_of_birth, 
        p.medical_history
      FROM patients p
      JOIN users u ON p.user_id = u.id
      WHERE p.id = ?
    `,
      [patientId]
    );

    if (!patient)
      return res.status(404).json({ message: "Patient not found." });

    const [cases] = await db.query(
      `
      SELECT id, title, description, category, location, goal_amount, amount_raised, status, created_at
      FROM cases
      WHERE patient_id = ?
      ORDER BY created_at DESC
    `,
      [patientId]
    );

    return res.status(200).json({
      success: true,
      patient,
      cases,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getDonationReceipt = async (req, res) => {
  try {
    const donationId = req.params.donationId;

    const [[receipt]] = await db.query(`
      SELECT 
        d.id AS donation_id,
        u.full_name AS donor_name,
        np.organization_name AS ngo_name,
        c.title AS case_title,
        d.type,
        d.amount,
        d.status,
        d.created_at
      FROM donations d
      LEFT JOIN users u ON d.donor_id = u.id
      LEFT JOIN ngo_partners np ON d.ngo_id = np.id
      LEFT JOIN cases c ON d.case_id = c.id
      WHERE d.id = ?
    `, [donationId]);

    if (!receipt) return res.status(404).json({ message: 'Receipt not found.' });

    return res.status(200).json({
      success: true,
      receipt: {
        ...receipt,
        issued_at: new Date().toISOString()
      }
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};

export const getDashboardTransactions = async (req, res) => {
  try {
    const user = req.user;
    let query = '';
    let params = [];

    if (user.role === 'admin') {
      query = `
        SELECT 
          d.id AS donation_id,
          u.full_name AS donor_name,
          n.organization_name AS ngo_name,
          d.type, d.amount, d.status, d.created_at
        FROM donations d
        LEFT JOIN users u ON d.donor_id = u.id
        LEFT JOIN ngos n ON d.ngo_id = n.id
        ORDER BY d.created_at DESC;
      `;
    } 
    else if (user.role === 'ngo') {
      query = `
        SELECT 
          d.id AS donation_id,
          u.full_name AS donor_name,
          d.type, d.amount, d.status, d.created_at
        FROM donations d
        JOIN users u ON d.donor_id = u.id
        WHERE d.ngo_id = ?
        ORDER BY d.created_at DESC;
      `;
      params = [user.ngoPartnerId];
    } 
    else if (user.role === 'donor') {
      query = `
        SELECT 
          d.id AS donation_id,
          n.organization_name AS ngo_name,
          d.type, d.amount, d.status, d.created_at
        FROM donations d
        LEFT JOIN ngos n ON d.ngo_id = n.id
        WHERE d.donor_id = ?
        ORDER BY d.created_at DESC;
      `;
      params = [user.id];
    } 
    else if (user.role === 'patient') {
      query = `
        SELECT 
          d.id AS donation_id,
          u.full_name AS donor_name,
          d.amount, d.status, d.created_at,
          c.title AS case_title
        FROM donations d
        JOIN users u ON d.donor_id = u.id
        JOIN cases c ON d.case_id = c.id
        WHERE c.patient_id = ?
        ORDER BY d.created_at DESC;
      `;
      params = [user.patientId];
    } 
    else {
      return res.status(403).json({ message: 'Access denied' });
    }

    const [transactions] = await db.query(query, params);

    return res.status(200).json({
      success: true,
      count: transactions.length,
      transactions
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Internal server error.' });
  }
};