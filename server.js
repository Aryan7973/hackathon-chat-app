const express = require('express');
const webSocket = require('ws');
const http = require('http');

const app  = express();
const server = http.createServer(app);
const wss = new webSocket.Server({ server });

const users = new Map();
const bufferMessages = new Map();
const history = new Map();

function getChatId(user1,user2) {
    return [user1, user2].sort().join('-');
}

// WEBsocket connection
wss.on('connection', (ws, req) => {
    let userId = null;
    
    ws.on('message',function(message){
        const data = JSON.parse(message);

        if(data.type === 'register'){
            userId = data.userId;
            users.set(userId, ws);
            console.log(`User ${userId} connected`);

            // buffer message being sent
            if(bufferMessages.has(userId)){
                bufferMessages.get(userId).forEach(msg => ws.send(JSON.stringify(msg)));
                bufferMessages.delete(userId);
            }
        }else if(data.type === 'message'){
            const {to,from,text,timestamp} = data;
            const messageObject = {from,to,text,timestamp};
            
            // storing the messages in the history
            const key = getChatId(from,to);
            if(!history.has(key)) history.set(key,[]);
            history.get(key).push(messageObject);

            const recieverSocket = users.get(to);
            if(recieverSocket && recieverSocket.readyState == webSocket.OPEN){
                recieverSocket.send(JSON.stringify(messageObject));
            }else{
                if(!bufferMessages.has(to)) bufferMessages.set(to,[]);
                bufferMessages.get(to).push(messageObject);
            }
            
            // acknowledge back to the sender
            ws.send(JSON.stringify({type:'ack',message:text}));
            
        }
    });

});


app.get('/messages',(req,res)=>{
    const{user1,user2} = req.query;
    const key = getChatId(user1,user2);
    res.json(history.get(key) || []);
});

const PORT = 3000;

server.listen(PORT,()=>{
    console.log(`server is running on port ${PORT}` );
})
