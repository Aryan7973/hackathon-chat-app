const express = require('express');
const webSocket = require('ws');
const http = require('http');
const cors = require('cors')
const {getChatId} = require('./utils');
const { history } = require('./store');
const handleWebSocketConnection = require('./websocket');

const app  = express();
const server = http.createServer(app);
const wss = new webSocket.Server({ server });
app.use(cors());


// WEBsocket connection
wss.on('connection', handleWebSocketConnection);


app.get('/messages',(req,res)=>{
    const{user1,user2} = req.query;
    const key = getChatId(user1,user2);
    res.json(history.get(key) || []);
});

const PORT = 3000;

server.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}` );
})
