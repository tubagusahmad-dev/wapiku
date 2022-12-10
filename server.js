const express = require('express');
const app = express();
const http = require('http');
const server = http.createServer(app);
const { Server } = require("socket.io");
const io = new Server(server);
const bodyParser = require('body-parser');
const { rateLimit } = require('express-rate-limit');
const { connectedDevice, connectToWhatsApp, reconnectToWhatsApp } = require('./controllers/whatsapp-connect-controller');
const path = require("path");
const JSONdb = require('simple-json-db');
const deviceDb = new JSONdb(path.join(__dirname, '/db/device.json').replace('controllers', ''));
const requestDb = new JSONdb(path.join(__dirname, '/db/request.json').replace('controllers', ''));
const { useRouter } = require('./routers');

const REQUEST_LIMIT_PER_DAYS = process.env.REQUEST_LIMIT_PER_DAYS;

const requestLimit = rateLimit({
  windowMs: 24 * 60 * 60 * 1000,
  max: REQUEST_LIMIT_PER_DAYS,
  standardHeaders: true,
  legacyHeaders: false
});

app.set('view engine', 'ejs');
app.use(express.static('views/assets'));
app.use(express.json());
app.use(bodyParser.urlencoded({extended: true}));

useRouter(app);

io.on('connection', (socket) => {
  console.log("User Connected");
  socket.on('connect-to-whatsapp', async (data) => {
    await connectToWhatsApp(data.deviceId, io);
  });
});

reconnectToWhatsApp(io);

module.exports = {server};