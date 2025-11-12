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
