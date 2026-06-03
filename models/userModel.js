const pool = require('../config/db')

const getAll = async()=>{
    const result = await pool.query('SELECT * FROM users')
    return result.rows
}

const getById = async(id_user) =>{
    const result = await pool.query('SELECT * FROM users WHERE id_user = $1',[id_user])
    return result.rows[0]
}

const getByDocument = async(document)=>{
    const result = await pool.query('SELECT * FROM users WHERE document = $1',[document])
    return result.rows[0]
}
const getByEmail = async(email)=>{
    const result = await pool.query('SELECT * FROM users WHERE email = $1',[email])
    return result.rows[0]
}

const getByName = async(name) =>{
    const result = await pool.query('SELECT * FROM users WHERE name ILIKE $1',[`%${name}%`])
    return result.rows
}

const getByLastName = async(lastname) =>{
    const result = await pool.query('SELECT * FROM users WHERE lastname ILIKE $1',[`%${lastname}%`])
    return result.rows
}

const create = async(name,lastname,document,hashedPassword,email,id_role) => {
    const result = await pool.query('INSERT INTO users (name,lastname,document,password,email,id_role) VALUES ($1,$2,$3,$4,$5,$6) RETURNING *',[name,lastname,document,hashedPassword,email,id_role])
    return result.rows[0]
}

const update = async(name,lastname,document,email,id_role,id_user) => {
    const result = await pool.query('UPDATE users SET name = $1, lastname = $2, document = $3, email = $4, id_role = $5, updated_at = NOW() WHERE id_user = $6 RETURNING *',[name,lastname,document,email,id_role,id_user])
    return result.rows[0]
}

const deleteUser = async(id_user) => {
    const result = await pool.query('DELETE FROM users WHERE id_user = $1 RETURNING *',[id_user])
    return result.rows[0]
}

const getByRole = async (id_role) => {
    const result = await pool.query('SELECT * FROM users WHERE id_role = $1', [id_role])
    return result.rows
}

const updatePassword = async(passwordHash, id_user) => {
    const result = await pool.query('UPDATE users SET password = $1 WHERE id_user = $2 RETURNING *',[passwordHash, id_user])
    return result.rows[0]
}

module.exports = {
    getAll,
    getById,
    getByDocument,
    getByEmail,
    getByName,
    getByLastName,
    getByRole,
    create,
    update,
    deleteUser,
    updatePassword
}