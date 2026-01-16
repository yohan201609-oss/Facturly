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

// Middlewares de seguridad
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100 // límite de 100 peticiones por ventana
});
app.use('/api/', limiter);

// Rutas
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servidor saludable' });
});
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Ruta de prueba
app.get('/', (req, res) => {
  res.send('API de Facturly funcionando');
});

// Manejo de errores
app.use(errorHandler);

module.exports = app;
