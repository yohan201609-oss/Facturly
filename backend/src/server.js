const dotenv = require('dotenv');
const app = require('./app');
const logger = require('./utils/logger');

dotenv.config();

const PORT = process.env.PORT || 3001;

app.listen(PORT, '0.0.0.0', () => {
  logger.info(`🚀 Servidor corriendo en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
});
