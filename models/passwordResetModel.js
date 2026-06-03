const pool = require('../config/db')

const createReset = async (id_user, code_hash, expires_at) =>{
    const result = await pool.query('INSERT INTO password_resets (id_user, code_hash, expires_at) VALUES ($1, $2, $3) RETURNING id_reset, created_at', [id_user, code_hash, expires_at])
    return result.rows[0]
}

const getLatestValidReset = async (id_user) => {
    const result = await pool.query(`SELECT id_reset, code_hash, expires_at, used_at, created_at
     FROM password_resets
     WHERE id_user = $1
       AND used_at IS NULL
       AND expires_at > NOW()
     ORDER BY created_at DESC
     LIMIT 1`, [id_user])
    return result.rows[0] || null
}

const markUsed = async (id_reset)=>{
    const result = await pool.query('UPDATE password_resets SET used_at = NOW() WHERE id_reset = $1 RETURNING *', [id_reset])
    return result.rows[0]
}

const invalidateAllForUser = async (id_user) => {
    await pool.query(
      `UPDATE password_resets SET used_at = NOW()
         WHERE id_user = $1 AND used_at IS NULL`,
        [id_user]
    )
}


module.exports = {
  createReset,
  getLatestValidReset,
  markUsed,
  invalidateAllForUser,
}