const jwt = require("jsonwebtoken");
const { createRandomString } = require('./utils');

const tokenSecret = "my-secret-jsonwebtoken";

const createToken = (data) => {
    data["random_key"] = createRandomString(150);
    const token = jwt.sign(data, tokenSecret, { expiresIn: '360d'});
    return token;
}

const verifyToken = (token) => {
    let result = {};
    jwt.verify(token, tokenSecret, (err, decode) => {
        if (err) {
            result = {
                code: "TOKEN_INVALID",
                message: "Unauthorized!!"
            };
        }

        result = {
            code: "OK",
            userIp: decode.userIp
        };
    });

    return result;
}

module.exports = { createToken, verifyToken };