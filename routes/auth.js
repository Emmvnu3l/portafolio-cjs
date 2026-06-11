const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const router = express.Router();
const { Usuario } = require('../models');
const { JWT_SECRET } = require('../middleware/auth');

// POST /auth/register - Registro de usuario
router.post('/register', async (req, res) => {
  try {
    const { nombre, email, password } = req.body;

    if (!nombre || !email || !password) {
      return res.status(400).json({ success: false, error: 'Todos los campos son obligatorios: nombre, email, password' });
    }

    const existente = await Usuario.findOne({ where: { email } });
    if (existente) {
      return res.status(409).json({ success: false, error: 'El email ya esta registrado.' });
    }

    const hash = await bcrypt.hash(password, 10);
    const usuario = await Usuario.create({ nombre, email, password: hash });

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '2h' });

    res.status(201).json({
      success: true,
      message: 'Usuario registrado exitosamente',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
    });
  } catch (err) {
    console.error('Error en POST /auth/register:', err.message);
    res.status(500).json({ success: false, error: 'Error al registrar usuario', detail: err.message });
  }
});

// POST /auth/login - Inicio de sesion
router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email y password son obligatorios.' });
    }

    const usuario = await Usuario.findOne({ where: { email } });
    if (!usuario) {
      return res.status(401).json({ success: false, error: 'Credenciales invalidas.' });
    }

    const valido = await bcrypt.compare(password, usuario.password);
    if (!valido) {
      return res.status(401).json({ success: false, error: 'Credenciales invalidas.' });
    }

    const token = jwt.sign({ id: usuario.id, email: usuario.email }, JWT_SECRET, { expiresIn: '2h' });

    res.status(200).json({
      success: true,
      message: 'Inicio de sesion exitoso',
      token,
      usuario: { id: usuario.id, nombre: usuario.nombre, email: usuario.email }
    });
  } catch (err) {
    console.error('Error en POST /auth/login:', err.message);
    res.status(500).json({ success: false, error: 'Error al iniciar sesion', detail: err.message });
  }
});

module.exports = router;
