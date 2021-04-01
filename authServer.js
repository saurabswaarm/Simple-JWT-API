require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const {
    db
} = require('./dbInit');

app.post('/login', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    let userModel = await db.User.findOne({
        where: {
            name: username
        }
    });
    userModel = userModel.toJSON();

    let validCred = await bcrypt.compare(password, userModel.password);

    if (validCred) {

        const accessToken = await generateAccessToken(userModel.name);
        const refreshToken = await generateRefreshToken(userModel.name);

        res.json({
            access_token: accessToken,
            refresh_token: refreshToken
        });
    } else {
        res.send('Invalid Credentials');
    }
})

app.post('/signup', async (req, res) => {
    let username = req.body.username;
    let password = req.body.password;

    console.log(req.headers);

    // console.log(req.body);
    try {
        let hashedPassword = await bcrypt.hash(password, 10);

        let userDbEntry = await db.User.create({
            name: username,
            password: hashedPassword
        });

        userDbEntry = await userDbEntry.toJSON();

        const accessToken = await generateAccessToken(userDbEntry.name);
        const refreshToken = await generateRefreshToken(userDbEntry.name);

        res.json({
            access_token: accessToken,
            refresh_token: refreshToken
        });

    } catch (err) {

        if(err.name == "SequelizeUniqueConstraintError"){
            res.send('User already exists');
        }
        res.send(err);
    }
})

app.delete('/logout', async (req, res) => {

    let header = req.headers['authentication'];
    let token = header && header.split(' ')[1];

    if (token == null) return res.status(401).send('no token');

    try {
        let tokenEntry = await db.Token.findOne({
            where: {
                token: token
            }
        });

        await tokenEntry.destroy();
        res.send('Succesfully logged out ' + (tokenEntry.toJSON()).username);
    } catch (err) {
        res.status(403).send('Invalid Token or some other error');
    }
});

app.post('/refresh', async (req, res) => {
    let header = req.headers['authentication'];
    let token = header && header.split(' ')[1];

    if (token == null) return res.status(401).send('no token');

    try {
        let tokenEntry = await db.Token.findOne({
            where: {
                token: token
            }
        });

        if (tokenEntry) {
            let tokenEntryJson = tokenEntry.toJSON();
            let access_token = await generateAccessToken(tokenEntryJson.username);
            let refresh_token = tokenEntryJson.token;

            res.json({
                access_token: access_token,
                refresh_token: refresh_token
            });
        } else {
            res.status(403).send('No such token found');
        }
    } catch (err) {
        res.status(500).send(err.message);
    }
})


async function generateAccessToken(name) {
    const accessToken = await jwt.sign({
        name: name
    }, process.env.ACCESS_TOKEN_SECRET, {
        expiresIn: 60
    });

    return accessToken;
}

async function generateRefreshToken(name) {
    const refreshToken = jwt.sign({
        name: name
    }, process.env.REFRESH_TOKEN_SECRET);

    let [tokenEntry, created] = await db.Token.findOrCreate({
        where: {
            username: name
        }
    });

    tokenEntry.token = refreshToken;
    await tokenEntry.save();

    return refreshToken;
}

module.exports = app;