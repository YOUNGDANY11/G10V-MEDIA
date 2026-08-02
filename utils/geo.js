const normalizeCoordinate = (value, kind) => {
    if (value === undefined || value === null || value === '') {
        return null
    }

    const numberValue = Number(value)
    if (!Number.isFinite(numberValue)) {
        return null
    }

    if (kind === 'lat' && (numberValue < -90 || numberValue > 90)) {
        return null
    }

    if (kind === 'lng' && (numberValue < -180 || numberValue > 180)) {
        return null
    }

    return numberValue
}

const toRadians = (degrees) => degrees * (Math.PI / 180)

const calculateDistanceMeters = (lat1, lng1, lat2, lng2) => {
    const earthRadiusMeters = 6371000
    const deltaLat = toRadians(lat2 - lat1)
    const deltaLng = toRadians(lng2 - lng1)

    const a = Math.sin(deltaLat / 2) ** 2
        + Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(deltaLng / 2) ** 2

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return earthRadiusMeters * c
}

module.exports = {
    normalizeCoordinate,
    calculateDistanceMeters,
}