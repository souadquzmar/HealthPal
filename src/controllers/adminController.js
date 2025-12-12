import db from '../config/database.js';

export const verifyDoctor = async (req, res) => {
  const doctorID = req.params.id;
  const { specialty, license_number } = req.body; 

  let connection;

  try {
    connection = await db.getConnection();
    await connection.beginTransaction();

    const [result] = await connection.query(
      'UPDATE users SET is_verified = 1 WHERE id = ? AND role = "doctor"',
      [doctorID]
    );

    if (result.affectedRows === 0) {
      res.status(404).json({ message: 'Doctor not found or already verified.' });
    }

    await connection.query(
      'INSERT INTO doctors (user_id, specialty, license_number) VALUES (?, ?, ?)',
      [doctorID, specialty, license_number]
    );

    await connection.commit();
    connection.release();

    res.status(200).json({ message: 'Doctor verified and added to doctors table successfully.' });
  } catch (error) {
    if (connection) {
      await connection.rollback();
      connection.release();
    }
    console.error(error);
    res.status(500).json({ message: error.message });
  }
};
