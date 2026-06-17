import db from '../config/db.js';

// Fetch all family members for a user
export const getFamilyMembers = async (userId) => {
  const [rows] = await db.query('SELECT * FROM FamilyMembers WHERE userId = ?', [userId]);
  return rows;
};

// Add new family member
export const addFamilyMember = async (userId, name, relationship, age, occupation, maritalStatus) => {
  await db.query(
    'INSERT INTO FamilyMembers (userId, name, relationship, age, occupation, maritalStatus) VALUES (?, ?, ?, ?, ?, ?)',
    [userId, name, relationship, age || null, occupation || null, maritalStatus || 'Single'],
  );
};

// Update family member details
export const updateFamilyMember = async (id, userId, updates) => {
  const fields = Object.keys(updates)
    .map((key) => `${key} = ?`)
    .join(', ');
  const values = Object.values(updates);
  values.push(id, userId);
  await db.query(`UPDATE FamilyMembers SET ${fields} WHERE id = ? AND userId = ?`, values);
};

// Delete member
export const deleteFamilyMember = async (id, userId) => {
  await db.query('DELETE FROM FamilyMembers WHERE id = ? AND userId = ?', [id, userId]);
};
