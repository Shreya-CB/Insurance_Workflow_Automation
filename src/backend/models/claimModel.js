import db from '../config/db.js';

export async function createClaim(data) {
  if (!db) throw new Error("Database connection not available");
  const sql = `INSERT INTO claims
    (policy_id,user_id,incident_type,description,claim_amount,evidence_url,status)
    VALUES (?,?,?,?,?,?,?)`;
  const [res] = await db.execute(sql, [
    data.policy_id, 
    data.user_id, 
    data.incident_type, 
    data.description, 
    data.claim_amount, 
    data.evidence_url,
    data.status || 'Pending Review'
  ]);
  return res.insertId;
}

export async function getClaimById(id) {
  if (!db) throw new Error("Database connection not available");
  const [rows] = await db.execute('SELECT * FROM claims WHERE claim_id = ?', [id]);
  return rows[0];
}

export async function updateClaim(id, patch) {
  if (!db) throw new Error("Database connection not available");
  const sets = Object.keys(patch).map(k => `${k} = ?`).join(',');
  const values = Object.values(patch);
  values.push(id);
  await db.execute(`UPDATE claims SET ${sets} WHERE claim_id = ?`, values);
}
