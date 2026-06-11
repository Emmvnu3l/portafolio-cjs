const express = require('express');
const router = express.Router();
const sequelize = require('../config/database');
const { Venta, VentaDetalle, Producto, Usuario } = require('../models');
const { verificarToken } = require('../middleware/auth');

// GET /ventas - Obtener todas las ventas con sus detalles, productos y usuario
router.get('/', async (req, res) => {
  try {
    const ventas = await Venta.findAll({
      order: [['id', 'DESC']],
      include: [
        {
          model: VentaDetalle,
          as: 'detalles',
          include: {
            model: Producto,
            as: 'producto',
            attributes: ['id', 'nombre']
          }
        },
        {
          model: Usuario,
          as: 'usuario',
          attributes: ['id', 'nombre', 'email']
        }
      ]
    });
    res.status(200).json({ success: true, data: ventas });
  } catch (err) {
    console.error('Error en GET /ventas:', err.message);
    res.status(500).json({ success: false, error: 'Error al obtener ventas', detail: err.message });
  }
});

// POST /venta - Registrar una nueva venta con transaccion SQL (requiere autenticacion)
router.post('/', verificarToken, async (req, res) => {
  const transaction = await require('../config/database').transaction();

  try {
    const { items } = req.body; // items = [{ producto_id, cantidad }]

    if (!Array.isArray(items) || items.length === 0) {
      await transaction.rollback();
      return res.status(400).json({ success: false, error: 'Debe enviar al menos un item en la venta' });
    }

    let total = 0;
    const detalles = [];

    // Validar stock y calcular totales
    for (const item of items) {
      const { producto_id, cantidad } = item;

      if (!producto_id || !cantidad || cantidad <= 0) {
        await transaction.rollback();
        return res.status(400).json({ success: false, error: 'Cada item debe tener producto_id y cantidad valida' });
      }

      const producto = await Producto.findByPk(producto_id, { transaction });
      if (!producto) {
        await transaction.rollback();
        return res.status(404).json({ success: false, error: `Producto con id ${producto_id} no encontrado` });
      }

      if (producto.stock < cantidad) {
        await transaction.rollback();
        return res.status(409).json({
          success: false,
          error: `Stock insuficiente para "${producto.nombre}". Disponible: ${producto.stock}, Solicitado: ${cantidad}`
        });
      }

      const subtotal = parseFloat(producto.precio) * cantidad;
      total += subtotal;

      detalles.push({
        producto_id,
        cantidad,
        precio_unitario: producto.precio
      });
    }

    // Crear venta asociada al usuario autenticado
    const venta = await Venta.create({ total, usuario_id: req.usuario.id }, { transaction });

    // Crear detalles y descontar stock
    for (const d of detalles) {
      await VentaDetalle.create({
        venta_id: venta.id,
        producto_id: d.producto_id,
        cantidad: d.cantidad,
        precio_unitario: d.precio_unitario
      }, { transaction });

      await Producto.decrement('stock', {
        by: d.cantidad,
        where: { id: d.producto_id },
        transaction
      });
    }

    await transaction.commit();
    res.status(201).json({ success: true, data: venta, message: 'Venta registrada exitosamente' });
  } catch (err) {
    await transaction.rollback();
    console.error('Error en POST /venta:', err.message);
    res.status(500).json({ success: false, error: 'Error al registrar la venta', detail: err.message });
  }
});

module.exports = router;
