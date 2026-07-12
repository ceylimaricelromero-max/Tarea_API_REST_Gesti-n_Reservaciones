// Dentro de reser.controller.js -> crearReservacion
const { mesa_id, fecha, hora, comensales } = req.body;
const usuario_id = req.user.id; // Obtenido del token

// Validar si la mesa ya está apartada en esa fecha y rango de hora (ej. bloques de 2 horas)
const queryDisponibilidad = `
    SELECT * FROM reservaciones 
    WHERE mesa_id = ? 
      AND fecha = ? 
      AND (
        (hora <= ? AND ADDTIME(hora, '01:59:00') > ?) 
        OR 
        (? <= hora AND ADDTIME(?, '01:59:00') > hora)
      )
      AND estado != 'Cancelada'
`;

const [ocupado] = await db.query(queryDisponibilidad, [mesa_id, fecha, hora, hora, hora, hora]);

if (ocupado.length > 0) {
    return res.status(400).json({ 
        message: "La mesa seleccionada ya se encuentra reservada para este horario." 
    });
}

// Si está libre, procedes a insertar la reservación...