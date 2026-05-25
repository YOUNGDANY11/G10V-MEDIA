const pool = require('../config/db')

const getAll = async() =>{
    const result = await pool.query(
        `SELECT
            t.id_training,
            t.name,
            t.description,
            t.date,
            t.time,
            t.location,
            u.name AS staff_name,
            u.lastname AS staff_lastname,
            c.name AS categorie_name
        FROM trainings t
        INNER JOIN staff s ON s.id_staff = t.id_staff
        INNER JOIN users u ON u.id_user = s.id_user
        INNER JOIN categories c ON c.id_categorie = t.id_categorie`
    )
    return result.rows
}

const getById = async(id_training)=>{
    const result = await pool.query(
        `SELECT
            t.id_training,
            t.name,
            t.description,
            t.date,
            t.time,
            t.location,
            u.name AS staff_name,
            u.lastname AS staff_lastname,
            c.name AS categorie_name
        FROM trainings t
        INNER JOIN staff s ON s.id_staff = t.id_staff
        INNER JOIN users u ON u.id_user = s.id_user
        INNER JOIN categories c ON c.id_categorie = t.id_categorie
        WHERE t.id_training = $1`,
        [id_training]
    )
    return result.rows[0]
}

const getByLocation = async(location)=>{
    const result = await pool.query(
        `SELECT
            t.id_training,
            t.name,
            t.description,
            t.date,
            t.time,
            t.location,
            u.name AS staff_name,
            u.lastname AS staff_lastname,
            c.name AS categorie_name
        FROM trainings t
        INNER JOIN staff s ON s.id_staff = t.id_staff
        INNER JOIN users u ON u.id_user = s.id_user
        INNER JOIN categories c ON c.id_categorie = t.id_categorie
        WHERE t.location ILIKE $1`,
        [`%${location}%`]
    )
    return result.rows
}

const  getTrainingInTimeAnDate = async(time,date)=>{
    const result = await pool.query(
        `SELECT
            t.id_training,
            t.name,
            t.description,
            t.date,
            t.time,
            t.location,
            u.name AS staff_name,
            u.lastname AS staff_lastname,
            c.name AS categorie_name
        FROM trainings t
        INNER JOIN staff s ON s.id_staff = t.id_staff
        INNER JOIN users u ON u.id_user = s.id_user
        INNER JOIN categories c ON c.id_categorie = t.id_categorie
        WHERE t.time = $1 AND t.date = $2`,
        [time, date]
    )
    return result.rows
}

const create = async(name,description,date,time,location)=>{
    const result = await pool.query('INSERT INTO trainings (name,description,date,time,location) VALUES ($1,$2,$3,$4,$5) RETURNING *',[name,description,date,time,location])
    return result.rows[0]
}

const update = async(name,description,date,time,location,id_training)=>{
    const result = await pool.query('UPDATE trainings SET name =$1 ,description = $2, date = $3, time = $4, location = $5 WHERE id_training = $6 RETURNING *',[name,description,date,time,location,id_training])
    return result.rows[0]
}

const deleteTraining = async(id_training)=>{
    const result = await pool.query('DELETE FROM trainings WHERE id_training = $1 RETURNING *',[id_training])
    return result.rows[0]
}

module.exports = {
    getAll,
    getById,
    getByLocation,
    getTrainingInTimeAnDate,
    create,
    update,
    deleteTraining
}