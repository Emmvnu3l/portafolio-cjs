const API = '';

let usuarioActual = null;
let carrito = [];

function obtenerToken() {
  return localStorage.getItem('token');
}

function obtenerUsuario() {
  const u = localStorage.getItem('usuario');
  return u ? JSON.parse(u) : null;
}

function guardarSesion(token, usuario) {
  localStorage.setItem('token', token);
  localStorage.setItem('usuario', JSON.stringify(usuario));
  usuarioActual = usuario;
}

function cerrarSesion() {
  localStorage.removeItem('token');
  localStorage.removeItem('usuario');
  usuarioActual = null;
  carrito = [];
  renderCarrito();
  mostrarAuth();
}

function claveCarrito() {
  return usuarioActual ? `carrito_${usuarioActual.id}` : 'carrito_invitado';
}

function cargarCarrito() {
  const raw = localStorage.getItem(claveCarrito());
  carrito = raw ? JSON.parse(raw) : [];
}

function guardarCarrito() {
  localStorage.setItem(claveCarrito(), JSON.stringify(carrito));
  renderCarrito();
}

function formatearPrecio(valor) {
  return Number(valor).toLocaleString('es-CL');
}

function mostrarAuth() {
  document.getElementById('pantallaAuth').classList.remove('oculto');
  document.getElementById('appPrincipal').classList.add('oculto');
}

function mostrarApp() {
  document.getElementById('pantallaAuth').classList.add('oculto');
  document.getElementById('appPrincipal').classList.remove('oculto');
  const u = obtenerUsuario();
  if (u) {
    document.getElementById('usuarioNombre').textContent = `Hola, ${u.nombre}`;
  }
  cargarCarrito();
  cargarProductos();
  renderCarrito();
}

async function cargarProductos() {
  const contenedor = document.getElementById('gridProductos');
  const mensaje = document.getElementById('mensajeProductos');
  mensaje.className = 'mensaje';
  mensaje.textContent = '';

  try {
    const res = await fetch(`${API}/productos`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Error del servidor');

    if (!Array.isArray(json.data) || json.data.length === 0) {
      contenedor.innerHTML = '<p>No hay productos disponibles.</p>';
      return;
    }

    contenedor.innerHTML = json.data.map(p => `
      <div class="card">
        <img src="${p.imagen || 'https://via.placeholder.com/150'}" alt="${p.nombre}" />
        <div class="card-body">
          <h3>${p.nombre}</h3>
          <p>${p.descripcion || ''}</p>
          <div class="precio">$${formatearPrecio(p.precio)}</div>
          <div class="stock">Stock: ${p.stock}</div>
          <button class="btn btn-primario" onclick="agregarAlCarrito(${p.id}, '${p.nombre}', ${p.precio}, ${p.stock})" ${p.stock <= 0 ? 'disabled' : ''}>
            ${p.stock > 0 ? 'Agregar al carrito' : 'Sin stock'}
          </button>
        </div>
      </div>
    `).join('');
  } catch (err) {
    console.error(err);
    mensaje.className = 'mensaje error';
    mensaje.textContent = 'Error al cargar productos: ' + err.message;
  }
}

function agregarAlCarrito(id, nombre, precio, stockDisponible) {
  if (!obtenerToken()) {
    alert('Debes iniciar sesion para agregar productos al carrito.');
    return;
  }
  const existente = carrito.find(i => i.producto_id === id);
  if (existente) {
    if (existente.cantidad < stockDisponible) {
      existente.cantidad++;
    } else {
      alert('No hay mas stock disponible para este producto.');
      return;
    }
  } else {
    carrito.push({ producto_id: id, nombre, precio, cantidad: 1 });
  }
  guardarCarrito();
  abrirCarrito();
}

function cambiarCantidad(id, delta) {
  const item = carrito.find(i => i.producto_id === id);
  if (!item) return;
  item.cantidad += delta;
  if (item.cantidad <= 0) {
    carrito = carrito.filter(i => i.producto_id !== id);
  }
  guardarCarrito();
}

function renderCarrito() {
  const contenedor = document.getElementById('itemsCarrito');
  const totalEl = document.getElementById('totalCarrito');
  const contador = document.getElementById('contadorCarrito');

  if (carrito.length === 0) {
    contenedor.innerHTML = '<p>El carrito esta vacio.</p>';
    totalEl.textContent = '0';
    contador.textContent = '0';
    return;
  }

  let total = 0;
  contenedor.innerHTML = carrito.map(item => {
    const subtotal = item.precio * item.cantidad;
    total += subtotal;
    return `
      <div class="item-carrito">
        <div class="item-carrito-info">
          <strong>${item.nombre}</strong>
          <div>$${formatearPrecio(item.precio)} c/u</div>
        </div>
        <div class="item-carrito-cantidad">
          <button onclick="cambiarCantidad(${item.producto_id}, -1)">-</button>
          <span>${item.cantidad}</span>
          <button onclick="cambiarCantidad(${item.producto_id}, 1)">+</button>
        </div>
      </div>
    `;
  }).join('');

  totalEl.textContent = formatearPrecio(total);
  contador.textContent = carrito.reduce((sum, i) => sum + i.cantidad, 0);
}

function abrirCarrito() {
  if (!obtenerToken()) {
    alert('Debes iniciar sesion para usar el carrito.');
    return;
  }
  document.getElementById('carrito').classList.add('abierto');
}

function cerrarCarrito() {
  document.getElementById('carrito').classList.remove('abierto');
}

async function realizarCompra() {
  if (!obtenerToken()) {
    alert('Debes iniciar sesion para comprar.');
    return;
  }
  if (carrito.length === 0) {
    alert('El carrito esta vacio.');
    return;
  }

  const items = carrito.map(i => ({ producto_id: i.producto_id, cantidad: i.cantidad }));

  try {
    const res = await fetch(`${API}/venta`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${obtenerToken()}`
      },
      body: JSON.stringify({ items })
    });

    const json = await res.json();

    if (!res.ok || !json.success) {
      throw new Error(json.error || `Error HTTP ${res.status}`);
    }

    alert('Compra realizada exitosamente.');
    carrito = [];
    guardarCarrito();
    cerrarCarrito();
    cargarProductos();
    mostrarSeccion('productos');
  } catch (err) {
    console.error(err);
    alert('Error al realizar la compra: ' + err.message);
  }
}

async function cargarVentas() {
  const contenedor = document.getElementById('listaVentas');
  const mensaje = document.getElementById('mensajeVentas');
  mensaje.className = 'mensaje';
  mensaje.textContent = '';

  try {
    const res = await fetch(`${API}/ventas`);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const json = await res.json();
    if (!json.success) throw new Error(json.error || 'Error del servidor');

    if (!Array.isArray(json.data) || json.data.length === 0) {
      contenedor.innerHTML = '<p>No hay ventas registradas.</p>';
      return;
    }

    let html = `
      <table class="tabla-ventas">
        <thead>
          <tr>
            <th>ID Venta</th>
            <th>Cliente</th>
            <th>Fecha</th>
            <th>Total</th>
            <th>Detalle</th>
          </tr>
        </thead>
        <tbody>
    `;

    json.data.forEach(v => {
      const detalles = (v.detalles || []).map(d =>
        `<div class="detalle-venta">- ${d.cantidad}x ${d.producto?.nombre || 'Producto'} ($${formatearPrecio(d.precio_unitario)})</div>`
      ).join('');

      html += `
        <tr>
          <td>#${v.id}</td>
          <td>${v.usuario?.nombre || 'Desconocido'}</td>
          <td>${new Date(v.fecha).toLocaleString('es-CL')}</td>
          <td>$${formatearPrecio(v.total)}</td>
          <td>${detalles || 'Sin detalle'}</td>
        </tr>
      `;
    });

    html += '</tbody></table>';
    contenedor.innerHTML = html;
  } catch (err) {
    console.error(err);
    mensaje.className = 'mensaje error';
    mensaje.textContent = 'Error al cargar ventas: ' + err.message;
  }
}

function mostrarSeccion(seccion) {
  document.getElementById('seccionProductos').classList.toggle('oculto', seccion !== 'productos');
  document.getElementById('seccionVentas').classList.toggle('oculto', seccion !== 'ventas');
  document.getElementById('btnProductos').classList.toggle('active', seccion === 'productos');
  document.getElementById('btnVentas').classList.toggle('active', seccion === 'ventas');

  if (seccion === 'ventas') cargarVentas();
  if (seccion === 'productos') cargarProductos();
}

// ===== Auth =====
let modoRegistro = false;

function setModoAuth(registro) {
  modoRegistro = registro;
  document.getElementById('authTitulo').textContent = registro ? 'Crear Cuenta' : 'Iniciar Sesion';
  document.getElementById('authBtnSubmit').textContent = registro ? 'Registrarse' : 'Ingresar';
  document.getElementById('campoNombre').classList.toggle('oculto', !registro);
  document.getElementById('authTexto').textContent = registro ? 'Ya tienes cuenta?' : 'No tienes cuenta?';
  document.getElementById('authToggleBtn').textContent = registro ? 'Inicia sesion' : 'Registrate';
  document.getElementById('mensajeAuth').classList.add('oculto');
}

async function submitAuth(e) {
  e.preventDefault();
  const nombre = document.getElementById('nombre').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const mensaje = document.getElementById('mensajeAuth');

  if (modoRegistro && !nombre) {
    mensaje.className = 'mensaje error';
    mensaje.textContent = 'El nombre es obligatorio.';
    mensaje.classList.remove('oculto');
    return;
  }
  if (!email || !password) {
    mensaje.className = 'mensaje error';
    mensaje.textContent = 'Email y password son obligatorios.';
    mensaje.classList.remove('oculto');
    return;
  }

  const url = modoRegistro ? `${API}/auth/register` : `${API}/auth/login`;
  const body = modoRegistro ? { nombre, email, password } : { email, password };

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    });

    const json = await res.json();
    if (!res.ok || !json.success) {
      throw new Error(json.error || `Error HTTP ${res.status}`);
    }

    guardarSesion(json.token, json.usuario);
    mensaje.className = 'mensaje success';
    mensaje.textContent = modoRegistro ? 'Registro exitoso. Redirigiendo...' : 'Bienvenido!';
    mensaje.classList.remove('oculto');

    setTimeout(() => {
      mostrarApp();
    }, 800);
  } catch (err) {
    mensaje.className = 'mensaje error';
    mensaje.textContent = err.message;
    mensaje.classList.remove('oculto');
  }
}

// Event listeners
document.getElementById('btnAbrirCarrito').addEventListener('click', abrirCarrito);
document.getElementById('cerrarCarrito').addEventListener('click', cerrarCarrito);
document.getElementById('btnComprar').addEventListener('click', realizarCompra);
document.getElementById('btnProductos').addEventListener('click', () => mostrarSeccion('productos'));
document.getElementById('btnVentas').addEventListener('click', () => mostrarSeccion('ventas'));
document.getElementById('btnLogout').addEventListener('click', cerrarSesion);

document.getElementById('authToggleBtn').addEventListener('click', () => setModoAuth(!modoRegistro));
document.getElementById('authForm').addEventListener('submit', submitAuth);

// Inicializar
usuarioActual = obtenerUsuario();
if (usuarioActual && obtenerToken()) {
  mostrarApp();
} else {
  mostrarAuth();
}
