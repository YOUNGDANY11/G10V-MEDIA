const role = (...allowedRoles) => (req, res, next) => {
    const user = req.user
    if (!user || !allowedRoles.includes(user.role)) {
        return res.status(403).json({
            status:'Error',
            mensaje:'Acceso denegado'
        })
    }
    next()
}

module.exports = role