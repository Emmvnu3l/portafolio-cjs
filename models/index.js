const Producto = require('./Producto');
const Venta = require('./Venta');
const VentaDetalle = require('./VentaDetalle');
const Usuario = require('./Usuario');

// Relaciones
Usuario.hasMany(Venta, { foreignKey: 'usuario_id', as: 'ventas' });
Venta.belongsTo(Usuario, { foreignKey: 'usuario_id', as: 'usuario' });

Venta.hasMany(VentaDetalle, { foreignKey: 'venta_id', as: 'detalles' });
VentaDetalle.belongsTo(Venta, { foreignKey: 'venta_id', as: 'venta' });

Producto.hasMany(VentaDetalle, { foreignKey: 'producto_id', as: 'detalles' });
VentaDetalle.belongsTo(Producto, { foreignKey: 'producto_id', as: 'producto' });

module.exports = {
  Producto,
  Venta,
  VentaDetalle,
  Usuario
};
