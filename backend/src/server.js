const dotenv = require('dotenv');
const app = require('./app');
const logger = require('./utils/logger');

dotenv.config();

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
  logger.info(`Servidor corriendo en el puerto ${PORT} en modo ${process.env.NODE_ENV}`);
});
