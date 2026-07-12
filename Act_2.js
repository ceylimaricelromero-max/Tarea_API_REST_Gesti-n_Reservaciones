// controllers/auth.controller.js
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const db = require('../config/db'); // Tu pool de conexiones (pg, mysql2, etc.)

const SALT_ROUNDS = 10;

exports.register = async (req, res) => {
    try {
        const { nombre, email, password } = req.body;
        
        // 1. Encriptar contraseña con salt >= 10
        const hashedPassword = await bcrypt.hash(password, SALT_ROUNDS);
        
        // 2. Insertar en la base de datos (por defecto rol 'Cliente')
        const query = 'INSERT INTO usuarios (nombre, email, password, rol) VALUES (?, ?, ?, "Cliente")';
        await db.query(query, [nombre, email, hashedPassword]);
        
        res.status(201).json({ status: "success", message: "Usuario registrado con éxito" });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;
        
        // Buscar usuario
        const [rows] = await db.query('SELECT * FROM usuarios WHERE email = ?', [email]);
        if (rows.length === 0) return res.status(401).json({ message: "Credenciales incorrectas" });
        
        const usuario = rows[0];
        
        // Comparar contraseñas de forma segura
        const match = await bcrypt.compare(password, usuario.password);
        if (!match) return res.status(401).json({ message: "Credenciales incorrectas" });
        
        // Generar JWT (Excluimos el password del payload por seguridad)
        const token = jwt.sign(
            { id: usuario.id, rol: usuario.rol }, 
            process.env.JWT_SECRET, 
            { expiresIn: '8h' }
        );
        
        res.json({ token, usuario: { id: usuario.id, nombre: usuario.nombre, rol: usuario.rol } });
    } catch (error) {
        res.status(500).json({ status: "error", message: error.message });
    }
};