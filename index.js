const { server } = require('./server.js');

require('dotenv').config();

const SERVER_PORT = process.env.PORT || 8080;
const SERVER_HOST = process.env.HOST || '127.0.0.1';

server.listen(SERVER_PORT, SERVER_HOST, () => {
  console.log('App running');
});