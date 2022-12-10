const { createToken, verifyToken } = require('../helpers/token-signer');
const { sendMessage } = require('../controllers/message-sender');

const useRouter = (httpServer) => {

    httpServer.get("/", (req, res) => {
        const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        res.render('../views/index', {userIp: userIP});
    });

    httpServer.get('/create-token', (req, res) => {
        const userIP = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
        res.json([createToken({userIp: userIP})]);
    });

    httpServer.post('/api/send-message', (req, res) => {
        const access_token = req.headers['x-access-token'];
        if (!access_token) {
            return res.status(401).json({message: "Access token required"});
        }

        const verified = verifyToken(access_token);
        if (!verified.code == "OK") {
            return res.status(401).json({message: verified.message});
        }
        
        sendMessage(req, res);
    });
}

module.exports = { useRouter };