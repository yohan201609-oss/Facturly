const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const rateLimit = require('express-rate-limit');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// 1. CONFIGURACIÓN DE CORS - DEBE IR PRIMERO
app.use(cors({
  origin: '*', // Permitir todos los orígenes para asegurar conexión en Render
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true
}));

// 2. SEGURIDAD CON HELMET (ajustado para permitir recursos cruzados)
app.use(helmet({
  crossOriginResourcePolicy: false,
  crossOriginOpenerPolicy: false,
}));

app.use(express.json());

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting (opcional, ajustado para no bloquear el desarrollo)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 500 // Aumentado para evitar bloqueos durante pruebas
});
app.use('/api', limiter);

// 3. RUTAS DE SALUD Y DIAGNÓSTICO
app.get('/health', (req, res) => res.status(200).send('OK'));
app.get('/api/health', (req, res) => res.status(200).json({ status: 'ok' }));

// 4. RUTAS DE LA API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

app.get('/', (req, res) => {
  res.send('API de Facturly funcionando correctamente');
});

// Manejo de errores
app.use(errorHandler);

module.exports = app;
