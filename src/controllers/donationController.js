import db from "../config/database.js";

export const makeDonation = async (req, res) => {
  try {
    const { case_id, ngo_id, type, amount } = req.body;
    const donorId = req.user.id;

    if (!case_id && !ngo_id)
      return res
        .status(400)
        .json({ message: "Either case_id or ngo_id are required." });
    if (!type)
      return res.status(400).json({ message: "Donation type is required." });
    if (type === "money" && (!amount || amount <= 0))
      return res.status(400).json({
        message: "Valid donation amount is required for money donations.",
      });

    if (case_id) {
      const [cases] = await db.query("SELECT id FROM cases WHERE id = ?", [
        case_id,
      ]);
      if (cases.length === 0)
        return res.status(404).json({ message: "Case not found." });
    }

    if (ngo_id) {
      const [ngos] = await db.query("SELECT id FROM ngo_partners WHERE id = ?", [
        ngo_id,
      ]);
      if (ngos.length === 0)
        return res.status(404).json({ message: "NGO not found." });
    }
    await db.query(
      `insert into donations (donor_id, ngo_id, case_id, type, amount, status) values (?,?,?,?,?,'pending')`,
      [donorId, ngo_id || null, case_id || null, type, amount || 0]
    );
    if (case_id && type === "money")
      await db.query(
        `update cases set amount_raised = amount_raised + ? where id = ?`,
        [amount, case_id]
      );

    return res.status(201).json({
      message: "Donation recorded successfully.",
      donor_id: donorId,
      case_id,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getDonationById = async (req, res) => {
  try {
    const donationId = req.params.id;
    const [[donation]] = await db.query(
      `
      SELECT 
        d.id,
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
    `,
      [donationId]
    );

    if (!donation)
      return res.status(404).json({ message: "Donation not found." });

    return res.status(200).json({ success: true, donation });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getDonorDonations = async (req, res) => {
  try {
    const donorId = req.params.id;
    const [donations] = await db.query(
      `
      SELECT 
        d.id,
        np.organization_name AS ngo_name,
        c.title AS case_title,
        d.type,
        d.amount,
        d.status,
        d.created_at
      FROM donations d
      LEFT JOIN ngos np ON d.ngo_id = np.id
      LEFT JOIN cases c ON d.case_id = c.id
      WHERE d.donor_id = ?
      ORDER BY d.created_at DESC
    `,
      [donorId]
    );

    return res.status(200).json({
      success: true,
      count: donations.length,
      donations,
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
};

export const getCaseDonors = async(req,res) => {
  try{

    const caseId = req.params.id;

    const [donors] = await db.query(`
      SELECT u.full_name AS donor_name, d.amount, d.status, d.created_at
      FROM donations d
      JOIN users u ON d.donor_id = u.id
      WHERE d.case_id = ? AND d.status != 'cancelled'
      ORDER BY d.created_at DESC`, [caseId]);

      return res.status(200).json({success:true, donor_count: donors.length, donors});
  } catch (error) {
    console.log(error);
    return res.status(500).json({ message: "Internal server error." });
  }
}

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