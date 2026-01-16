const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const { errorHandler } = require('./middleware/errorHandler');
const authRoutes = require('./routes/authRoutes');
const clientRoutes = require('./routes/clientRoutes');
const invoiceRoutes = require('./routes/invoiceRoutes');
const dashboardRoutes = require('./routes/dashboardRoutes');
const userRoutes = require('./routes/userRoutes');

const app = express();

// 1. RUTAS DE SALUD - DEBEN IR ANTES DE TODO
app.get('/health', (req, res) => {
  res.status(200).send('OK');
});

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

// 2. MIDDLEWARES
app.use(cors());
app.use(helmet({
  crossOriginResourcePolicy: false,
}));
app.use(express.json());

// Servir archivos estáticos
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// 3. RUTAS DE LA API
app.use('/api/auth', authRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/invoices', invoiceRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/users', userRoutes);

// Ruta base
app.get('/', (req, res) => {
  res.send('API de Facturly Viva y Funcionando');
});

// Manejo de errores
app.use(errorHandler);

module.exports = app;
