const { default: makeWASocket, DisconnectReason, useMultiFileAuthState, Browsers } = require("@adiwajshing/baileys")
const fs = require('fs');
const qrCode = require('qrcode');
const path = require("path");
const JSONdb = require('simple-json-db');
const deviceDb = new JSONdb(path.join(__dirname, '/db/device.json').replace('controllers', ''));

const connectedDevice = {};

const connectToWhatsApp = async (deviceId, socketIo) => {
    const { state, saveCreds } = await useMultiFileAuthState(`./db/wa_auth/${deviceId}`)

    const whatsappConnection = await makeWASocket({
        printQRInTerminal: false,
        auth: state,
        browser: Browsers.ubuntu("Firefox")
    });

    whatsappConnection.ev.on('connection.update', async (update) => {

        const { connection, lastDisconnect } = update;
        let codeResult = null;

        if (update.qr) {
            qrCode.toDataURL(update.qr, (err, QR) => {
                codeResult = QR;
                socketIo.emit(`qr-code-received`, codeResult);
            });
        }

        if (connection == "close") {
            const shouldReconnect = lastDisconnect.error.output.statusCode !== DisconnectReason.loggedOut;
            if (shouldReconnect) {
                connectToWhatsApp(deviceId, socketIo);
            }else{
                socketIo.emit('connection-closed', deviceId);
                deviceDb.delete(deviceId);
                deviceDb.sync();
            }
        }else if (connection == "open") {
            const userInfo = whatsappConnection.user;
            socketIo.emit('connection-opened', userInfo);
            deviceDb.set(deviceId, {qrCode: codeResult, info: userInfo});
            deviceDb.sync();
            connectedDevice[deviceId] = whatsappConnection;
            console.log(`${deviceId} connected`);
        }
    });

    whatsappConnection.ev.on('creds.update', saveCreds);
    whatsappConnection.ev.on('messages.upsert', message => {});

}

const reconnectToWhatsApp = async (io) => {
    const devices = await deviceDb.JSON();
    console.log(devices);
    Object.keys(devices).forEach( async (key, i) => {
        console.log(`Connecting.. to: ${key}`)
        await connectToWhatsApp(key, io);
    });
}

module.exports = { connectedDevice, connectToWhatsApp, reconnectToWhatsApp };