// websocket.js
const { users, bufferMessages, history } = require('./store');
const { getChatId } = require('./utils');

function handleWebSocketConnection(ws) {
  let userId = null;

  ws.on('message', (message) => {
    const data = JSON.parse(message);

    if (data.type === 'register') {
      userId = data.userId;
      users.set(userId, ws);
      console.log(`✅ User connected: ${userId}`);

      // Send buffered messages
      if (bufferMessages.has(userId)) {
        bufferMessages.get(userId).forEach((msg) => ws.send(JSON.stringify(msg)));
        bufferMessages.delete(userId);
      }

    } else if (data.type === 'message') {
      const { from, to, text, timestamp } = data;
      const messageObject = { from, to, text, timestamp };

      // Save to chat history
      const key = getChatId(from, to);
      if (!history.has(key)) history.set(key, []);
      history.get(key).push(messageObject);

      // Deliver or buffer
      const receiver = users.get(to);
      if (receiver && receiver.readyState === 1) {
        receiver.send(JSON.stringify(messageObject));
      } else {
        if (!bufferMessages.has(to)) bufferMessages.set(to, []);
        bufferMessages.get(to).push(messageObject);
      }

      // Acknowledge to sender
      ws.send(JSON.stringify({ type: 'ack', message: text }));
    }
  });

  ws.on('close', () => {
    if (userId) {
      users.delete(userId);
      console.log(`⚠️ User disconnected: ${userId}`);
    }
  });
}

module.exports = handleWebSocketConnection;
