import db from '../config/db.js';

async function findAvailableAdjuster(specialization) {
  if (!db) throw new Error("Database connection not available");
  const [rows] = await db.execute('SELECT * FROM adjusters WHERE specialization = ? ORDER BY active_cases ASC LIMIT 1', [specialization]);
  return rows[0];
}

export async function routeClaim(claimId) {
  if (!db) {
    console.warn("Database not available, skipping claim routing");
    return;
  }
  try {
    const [claimRows] = await db.execute('SELECT * FROM claims WHERE claim_id = ?', [claimId]);
    const claim = claimRows[0];
    if (!claim) return;
    const specialization = (claim.incident_type || 'General');
    const adjuster = await findAvailableAdjuster(specialization);
    if (!adjuster) return;
    await db.execute('UPDATE claims SET assigned_adjuster_id = ?, status = ? WHERE claim_id = ?', [adjuster.adjuster_id, 'Under Review', claimId]);
    await db.execute('UPDATE adjusters SET active_cases = active_cases + 1 WHERE adjuster_id = ?', [adjuster.adjuster_id]);
  } catch (err) {
    console.error("Error routing claim:", err);
  }
}
