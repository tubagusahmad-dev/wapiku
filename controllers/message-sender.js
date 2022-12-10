const { connectedDevice } = require('../controllers/whatsapp-connect-controller')
let currentDevice = null;

const sendMessage = async (req, res) => {
    currentDevice = connectedDevice[getRandomDeviceKey()];
    let receiver = req.body.receiver.replace("+", '');
    const message = req.body.message;
    const pendingTime = req.body.time_to_send;
    let receivers = [];
    let messages = [];

    if (!currentDevice) {
        return res.status(500).json({message: "Tidak ada perangkat untuk mengirim silahkan scan perangkat dulu"});
    }

    if (!receiver) {
        return res.status(500).json({message: "Masukkan penerima"});
    }

    if (!message) {
        return res.status(500).json({message: "Tidak ada pesan yg dikirim"});
    }

    if (!receiver.includes("@s.whatsapp.net") && !receiver.includes("@g.us")){
        if (!receiver.includes("@broadcast")) {
            receiver = `${receiver}@s.whatsapp.net`;
        }
    }

    if (!receiver instanceof Array){
        receivers = [receiver];
    }

    if (!message instanceof Array) {
        messages = [message];
    }

    if (pendingTime) {
        if(!pendingTime instanceof Number) {
            return res.status(500).json({message: "Waktu untuk pengiriman harus berupa milliseconds dalam bentuk integer"});
        }
        const pendingMessage = {
            timeToSend: pendingTime,
            receivers: receivers,
            messages: messages
        }
        const dateFormated = new Date().setTime(pendingTime);
        await savePendingMessage(pendingMessage);
        res.status(200).json({message: `Pesan akan dikirim pada: ${dateFormated}`})
    }

    await sendBulkMessage(receivers, messages, res)
}

const savePendingMessage = async (pendingMessage) => {

}

const sendBulkMessage = async (receivers, messages, httpResult) => {
    
    for (var i = 0; i < receivers.length; i++){
        for(var j = 0; j < messages.length; i++){
            await currentDevice.sendMessage(receivers[i], messages[i]);
        }
    }

    httpResult.status(200).json(messages);
    
}

const getRandomDeviceKey = () => {
    const devices = [];
    Object.keys(connectedDevice).forEach((key, i) => {
        devices.push(key);
    });
    const random = Math.floor(Math.random() * devices.length);
    return devices[random];
}

module.exports = { sendMessage };