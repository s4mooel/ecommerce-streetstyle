// Productos (dataset según estudio de caso)
const productos = [
  { 
    id: 1, 
    nombre: 'Hoodie “Black Street”', 
    categoria: 'Hoodies', 
    precio: 120000, 
    imagen: './img/buzo_black_street.png' 
  },
  { 
    id: 2, 
    nombre: 'Hoodie “Retro Gray”', 
    categoria: 'Hoodies', 
    precio: 115000, 
    imagen: './img/buzo_gris.png' 
  },
  { 
    id: 3, 
    nombre: 'Gorra “NYC Flat”', 
    categoria: 'Gorras', 
    precio: 75000, 
    imagen: './img/gorra.png' 
  },
  { 
    id: 4, 
    nombre: 'Gorra “Classic White”', 
    categoria: 'Gorras', 
    precio: 70000, 
    imagen: './img/gorra_blanca.png' 
  },
  { 
    id: 5, 
    nombre: 'Buso Oversize “Storm”', 
    categoria: 'Busos oversize', 
    precio: 95000, 
    imagen: './img/buzo_storm.png' 
  },
  { 
    id: 6, 
    nombre: 'Buso Oversize “Skyline”', 
    categoria: 'Busos oversize', 
    precio: 99000, 
    imagen: './img/buzo2.png' 
  }
];


// Formateador de moneda COP
const formatCOP = value => new Intl.NumberFormat('es-CO', { style:'currency', currency:'COP' }).format(value);

// Carrito persistente con localStorage
let carrito = JSON.parse(localStorage.getItem('streetstyle_cart')) || [];

// Elementos DOM
const contenedorProductos = document.getElementById('catalogo');
const listaCarrito = document.getElementById('lista-carrito');
const totalCarritoEl = document.getElementById('total');
const cantidadItemsEl = document.getElementById('cantidad-items');
const paypalContainerId = 'paypal-button-container';

// Render dinámico
function renderProductos(list = productos) {
  contenedorProductos.innerHTML = '';
  list.forEach(prod => {
    const card = document.createElement('div');
    card.className = 'producto';
    card.innerHTML = `
      <img src="${prod.imagen}" alt="${prod.nombre}" />
      <h3>${prod.nombre}</h3>
      <p class="categoria">${prod.categoria}</p>
      <p class="precio">${formatCOP(Number(prod.precio))}</p>
      <button onclick="agregarAlCarrito(${prod.id})">Agregar al carrito</button>
    `;
    contenedorProductos.appendChild(card);
  });
}

// Filtrar por categoría
function filtrarPorCategoria(){
  const cat = document.getElementById('filtroCategoria').value;
  if(cat === 'todos') renderProductos();
  else renderProductos(productos.filter(p => p.categoria === cat));
}

// Agregar al carrito
function agregarAlCarrito(id){
  const prod = productos.find(p => p.id === id);
  const existente = carrito.find(i => i.id === id);
  if(existente) existente.cantidad++;
  else carrito.push({...prod, cantidad:1});
  guardarYActualizar();
}

// Guardar en localStorage y actualizar vista
function guardarYActualizar(){
  localStorage.setItem('streetstyle_cart', JSON.stringify(carrito));
  actualizarCarrito();
}

// Actualizar carrito en DOM
function actualizarCarrito(){
  listaCarrito.innerHTML = '';
  let total = 0;
  let items = 0;
  carrito.forEach(item => {
    const li = document.createElement('li');
    li.innerHTML = `
      <div>
        ${item.nombre} <div style="font-size:12px; color:#666;">${formatCOP(item.precio)} x ${item.cantidad}</div>
      </div>
      <div class="acciones">
        <strong>${formatCOP(item.precio * item.cantidad)}</strong>
        <button onclick="cambiarCantidad(${item.id}, -1)">-</button>
        <button onclick="cambiarCantidad(${item.id}, 1)">+</button>
        <button onclick="eliminarItem(${item.id})">✖</button>
      </div>
    `;
    listaCarrito.appendChild(li);
    total += Number(item.precio) * item.cantidad;
    items += item.cantidad;
  });
  totalCarritoEl.textContent = formatCOP(total);
  cantidadItemsEl.textContent = items;
  renderPayPal(total);
}

// Cambiar cantidad
function cambiarCantidad(id, delta){
  const item = carrito.find(i => i.id === id);
  if(!item) return;
  item.cantidad += delta;
  if(item.cantidad < 1) eliminarItem(id);
  guardarYActualizar();
}

// Eliminar item
function eliminarItem(id){
  carrito = carrito.filter(i => i.id !== id);
  guardarYActualizar();
}

// Vaciar carrito
function vaciarCarrito(){
  if(!confirm('¿Vaciar el carrito?')) return;
  carrito = [];
  guardarYActualizar();
}

// PayPal: solo mostrar si total > 0
let paypalRendered = false;
function renderPayPal(totalCOP){
  const container = document.getElementById('paypal-button-container');
  container.innerHTML = '';
  if(totalCOP <= 0){
    paypalRendered = false;
    return;
  }
  // Convertir COP a USD aprox para sandbox: (demo) asumir tasa 1 USD = 4000 COP
  const usd = (totalCOP / 4000).toFixed(2);

  paypal.Buttons({
    createOrder: function(data, actions){
      return actions.order.create({
        purchase_units: [{ amount: { value: String(usd) } }]
      });
    },
    onApprove: function(data, actions){
      return actions.order.capture().then(function(){
        alert('🎉 Pago simulado recibido (sandbox). ¡Gracias por tu compra!');
        carrito = [];
        guardarYActualizar();
      });
    }
  }).render('#paypal-button-container');
}

// Inicializar
document.addEventListener('DOMContentLoaded', () => {
  renderProductos();
  actualizarCarrito();
});
