const express = require('express');
const path = require('path');
const sequelize = require('./config/database');
const { Producto, Venta, VentaDetalle, Usuario } = require('./models');
const productosRoutes = require('./routes/productos');
const ventasRoutes = require('./routes/ventas');
const authRoutes = require('./routes/auth');

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Servir archivos estaticos del frontend
app.use(express.static(path.join(__dirname, 'public')));

// Rutas API
app.use('/productos', productosRoutes);
app.use('/producto', productosRoutes);
app.use('/ventas', ventasRoutes);
app.use('/venta', ventasRoutes);
app.use('/auth', authRoutes);

// GET / - Devuelve la aplicacion cliente (pagina principal)
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manejo de rutas no encontradas (404)
app.use((req, res) => {
  res.status(404).json({ success: false, error: 'Recurso no encontrado' });
});

// Manejo global de errores
app.use((err, req, res, next) => {
  console.error('Error no manejado:', err);
  res.status(500).json({ success: false, error: 'Error interno del servidor', detail: err.message });
});

// Inicializar base de datos y servidor
async function init() {
  try {
    await sequelize.authenticate();
    console.log('Conexion a PostgreSQL establecida correctamente.');

    // Sincronizar modelos (crear tablas si no existen)
    await sequelize.sync({ alter: true });
    console.log('Modelos sincronizados con la base de datos.');

    // Poblar datos de ejemplo si no hay productos
    const count = await Producto.count();
    if (count === 0) {
      console.log('Poblando base de datos con productos de ejemplo...');
      await Producto.bulkCreate([
        { nombre: 'Laptop Dell XPS', descripcion: 'Laptop ultraliviana 13 pulgadas', precio: 899990, stock: 10, categoria: 'Tecnologia', imagen: 'https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=400&h=300&fit=crop' },
        { nombre: 'Mouse Logitech', descripcion: 'Mouse inalambrico ergonómico', precio: 29990, stock: 25, categoria: 'Tecnologia', imagen: 'https://images.unsplash.com/photo-1527864550417-7fd91fc51a46?w=400&h=300&fit=crop' },
        { nombre: 'Teclado Mecanico', descripcion: 'Teclado RGB switches rojos', precio: 79990, stock: 15, categoria: 'Tecnologia', imagen: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&h=300&fit=crop' },
        { nombre: 'Monitor 27"', descripcion: 'Monitor IPS 144Hz', precio: 249990, stock: 8, categoria: 'Tecnologia', imagen: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&h=300&fit=crop' },
        { nombre: 'Audifonos Sony', descripcion: 'Cancelacion de ruido inalambricos', precio: 159990, stock: 12, categoria: 'Audio', imagen: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&h=300&fit=crop' }
      ]);
      console.log('Productos de ejemplo creados.');
    } else {
      console.log(`Ya existen ${count} productos en la base de datos.`);
    }

    app.listen(PORT, () => {
      console.log(`Servidor ecommerce escuchando en http://localhost:${PORT}`);
    });
  } catch (err) {
    console.error('No se pudo iniciar el servidor:', err.message);
    process.exit(1);
  }
}

init();
