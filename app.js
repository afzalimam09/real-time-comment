const path = require('path');

require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');

const Comment = require('./models/comment');

const app = express();

app.use(express.static("public"));
app.use(express.json());
app.use(express.urlencoded({extended: false}));

//DB Connections
// const DB_URL = 'mongodb://localhost:27017/comments';
const DB_URL = "mongodb+srv://"+ process.env.MONGO_USERID + ":" + process.env.MONGO_PASSWORD + "@cluster0.lax8b.mongodb.net/comments";
mongoose.connect(DB_URL).then(() => {
    console.log('DB Connected!')
}).catch(err => {
    console.log(err);
});

//Routes
app.post('/api/comments', (req, res, next) => {
    const comment = new Comment({
        username: req.body.username,
        comment: req.body.comment
    });

    comment.save().then(result => {
        res.send(result)
    });
})

app.get('/api/comments', (req, res, next) => {
    Comment.find().then(comments => {
        res.send(comments);
    });
})

const server = app.listen( process.env.PORT || 3000, () => {
    console.log("Server is running on port 3000");
});

const io = require('socket.io')(server);

io.on('connection', (socket) => {
    //Receive event

    socket.on('comment', (data) => {
        data.time = Date.now();
        socket.broadcast.emit('comment', data);
    });

    socket.on('typing', (data) => {
        socket.broadcast.emit('typing', data);
    });
})

