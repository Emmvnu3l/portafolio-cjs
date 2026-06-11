const express = require('express');
const router = express.Router();
const { Producto } = require('../models');

// GET /productos - Obtener todos los productos con su inventario/stock
router.get('/', async (req, res) => {
  try {
    const productos = await Producto.findAll({ order: [['id', 'ASC']] });
    res.status(200).json({ success: true, data: productos });
  } catch (err) {
    console.error('Error en GET /productos:', err.message);
    res.status(500).json({ success: false, error: 'Error al obtener productos', detail: err.message });
  }
});

// POST /producto - Crear un nuevo producto
router.post('/', async (req, res) => {
  try {
    const { nombre, descripcion, precio, stock, imagen, categoria } = req.body;

    if (!nombre || precio === undefined || stock === undefined) {
      return res.status(400).json({ success: false, error: 'Faltan campos obligatorios: nombre, precio y stock' });
    }

    const producto = await Producto.create({ nombre, descripcion, precio, stock, imagen, categoria });
    res.status(201).json({ success: true, data: producto, message: 'Producto creado exitosamente' });
  } catch (err) {
    console.error('Error en POST /producto:', err.message);
    res.status(500).json({ success: false, error: 'Error al crear el producto', detail: err.message });
  }
});

// PUT /producto - Actualizar un producto registrado
router.put('/', async (req, res) => {
  try {
    const { id, nombre, descripcion, precio, stock, imagen, categoria } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'El campo id es obligatorio para actualizar' });
    }

    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ success: false, error: `Producto con id ${id} no encontrado` });
    }

    await producto.update({ nombre, descripcion, precio, stock, imagen, categoria });
    res.status(200).json({ success: true, data: producto, message: 'Producto actualizado exitosamente' });
  } catch (err) {
    console.error('Error en PUT /producto:', err.message);
    res.status(500).json({ success: false, error: 'Error al actualizar el producto', detail: err.message });
  }
});

// DELETE /producto - Eliminar un producto registrado
router.delete('/', async (req, res) => {
  try {
    const { id } = req.body;

    if (!id) {
      return res.status(400).json({ success: false, error: 'El campo id es obligatorio para eliminar' });
    }

    const producto = await Producto.findByPk(id);
    if (!producto) {
      return res.status(404).json({ success: false, error: `Producto con id ${id} no encontrado` });
    }

    await producto.destroy();
    res.status(200).json({ success: true, message: 'Producto eliminado exitosamente' });
  } catch (err) {
    console.error('Error en DELETE /producto:', err.message);
    res.status(500).json({ success: false, error: 'Error al eliminar el producto', detail: err.message });
  }
});

module.exports = router;
