require('dotenv').config();
const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const app = express();
app.use(express.json());

const authServer = require('./authServer');


const posts = [{
        username: 'Kyle',
        title: 'post 1'
    },
    {
        username: 'Buba',
        title: 'post 2'
    },
]

app.get('/posts', authenticateToken, (req, res) => {

    let postx = posts.filter((post) => {
        return post.username == req.user.name
    });

    res.json(postx);
});



app.listen(3000, () => {
    console.log('server running on 3000')
});

authServer.listen(3001, () => {
    console.log('auth server running on 3001');
})

function authenticateToken(req, res, next) {
    let header = req.headers['authentication'];
    let token = header && header.split(' ')[1];

    if (token == null) return res.status(401).send('no token');

    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) {
            res.status(401);
            res.send('Invalid Token');
        }

        if(user){
            req.user = user;
            next();
        }
        

    });

}