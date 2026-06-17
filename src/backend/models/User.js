import db from '../config/db.js';

export const createUser = async (user) => {
  const [result] = await db.execute(
    'INSERT INTO users (name, email, phone, password, role) VALUES (?, ?, ?, ?, ?)',
    [user.name, user.email, user.phone, user.password, user.role || 'customer'],
  );
  return result;
};

export const findUserByEmail = async (email) => {
  const [rows] = await db.execute('SELECT * FROM users WHERE email = ?', [email]);
  return rows[0];
};
