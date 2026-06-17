import {
  getFamilyMembers,
  addFamilyMember,
  deleteFamilyMember,
  updateFamilyMember,
} from '../models/FamilyMember.js';

// 📄 GET /api/family
export const fetchFamily = async (req, res) => {
  try {
    const family = await getFamilyMembers(req.user.id);
    res.json(family);
  } catch (err) {
    console.error('[Family] Fetch error:', err);
    res.status(500).json({ message: 'Error fetching family members' });
  }
};

// ➕ POST /api/family
export const createFamilyMember = async (req, res) => {
  const {
    name, relationship, age, occupation, maritalStatus,
  } = req.body;
  const userId = req.user.id;

  if (!name || !relationship) {
    return res.status(400).json({ message: 'Name and relationship are required' });
  }

  try {
    await addFamilyMember(userId, name, relationship, age, occupation, maritalStatus);
    res.json({ message: '✅ Family member added successfully' });
  } catch (err) {
    console.error('[Family] Add error:', err);
    res.status(500).json({ message: 'Error adding family member' });
  }
};

// ✏️ PUT /api/family/:id
export const editFamilyMember = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;
  const updates = req.body;

  try {
    await updateFamilyMember(id, userId, updates);
    res.json({ message: '✅ Family member updated successfully' });
  } catch (err) {
    console.error('[Family] Update error:', err);
    res.status(500).json({ message: 'Error updating family member' });
  }
};

// ❌ DELETE /api/family/:id
export const removeFamilyMember = async (req, res) => {
  const { id } = req.params;
  const userId = req.user.id;

  try {
    await deleteFamilyMember(id, userId);
    res.json({ message: '🗑️ Family member deleted successfully' });
  } catch (err) {
    console.error('[Family] Delete error:', err);
    res.status(500).json({ message: 'Error deleting family member' });
  }
};
