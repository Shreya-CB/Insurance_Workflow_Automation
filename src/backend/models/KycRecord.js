import db from '../config/db.js'; // MySQL connection (mysql2/promise)

// Create new KYC record (for user or family member)
export const createKycRecord = async (userId, documentType, filePath, memberId = null) => {
  try {
    // Convert empty string or undefined to null for memberId
    const memberIdValue = (memberId === '' || memberId === undefined) ? null : memberId;

    const [result] = await db.query(
      "INSERT INTO KYCRecords (userId, memberId, documentType, filePath, status) VALUES (?, ?, ?, ?, 'Pending')",
      [userId, memberIdValue, documentType, filePath], // Use memberIdValue instead of memberId
    );
    return result;
  } catch (err) {
    // Prevent duplicate uploads
    if (err.code === 'ER_DUP_ENTRY') {
      throw new Error('❌ Document of this type already uploaded for this user or family member.');
    }
    console.error('Error inserting KYC record:', err);
    throw err;
  }
};

// Fetch all KYC records for a particular user
export const getKycRecordsByUser = async (userId) => {
  const [rows] = await db.query(
    'SELECT * FROM KYCRecords WHERE userId = ? ORDER BY uploadedAt DESC',
    [userId],
  );
  return rows;
};

// Update verification status + remarks
export const updateKycStatus = async (id, status, remarks) => {
  // avoid reassigning function parameter (ESLint no-param-reassign)
  let safeRemarks = remarks;
  if (safeRemarks && safeRemarks.length > 500) {
    safeRemarks = safeRemarks.slice(0, 500); // prevent overflow
  }

  await db.query('UPDATE KYCRecords SET status = ?, remarks = ? WHERE id = ?', [
    status,
    safeRemarks,
    id,
  ]);
};

// Delete a specific KYC record (if user owns it)
export const deleteKycRecord = async (userId, id) => {
  await db.query('DELETE FROM KYCRecords WHERE id = ? AND userId = ?', [id, userId]);
};
