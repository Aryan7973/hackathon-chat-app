  import { useRef, useState } from 'react'
  import './App.css'
import { useEffect } from 'react';

  function App() {
    
    const [showPopup, setshowPopup] = useState(true);
    const [user,setUser] = useState('');
    const [recipient, setRecipient] = useState('');
    const [message,setMessage] = useState('');
    const [history,setHistory] = useState([]);
    const [currentChat, setCurrentChat] = useState(null);
    const [newChatUser, setNewChatUser] = useState('');
    const [activeChats, setActiveChats] = useState([]);
    const [isOnline,setIsOnline] = useState(true);


    const socketRef = useRef(null);

    const bottomRef = useRef(null);

    useEffect(() => {
    if (bottomRef.current) {
      bottomRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history])

    // handles the first login/register of user that you enter and creates websocket connection.
    const handleSubmit = () =>{
      if(user == ''){
        alert("Please enter a valid user name");
        return;
      }

      setUser(user);
      
      
      socketRef.current = new WebSocket('ws://localhost:3000');
      socketRef.current.onopen =  () => {
        console.log("Websocket connected");
        socketRef.current.send(JSON.stringify({type:'register',userId:user}));
      };
      
      socketRef.current.onmessage = (event) =>{
        const data = JSON.parse(event.data);
        if(data.type === 'ack'){
          console.log('Message from server',data.message);
        }else{
          setHistory(prev=>[...prev,data]);
        }
      }
      
      socketRef.current.onclose = () =>{
        console.log('Websoket disconnected');
      }
      
      
      setshowPopup(false);
    } 

    // logoff to register another user.
    const handleLogOff = () =>{
      if (socketRef.current) {
        socketRef.current.close();
      }
      setUser('');
      setshowPopup(true);
    }

    // opens chat history and starts chat with the entered recipient.
    const startChat = async () => {
      if(!recipient) return alert("Enter a recipient to chat with");
      try{
          const res = await fetch(`http://localhost:3000/messages?user1=${user}&user2=${recipient}`);
          const history = await res.json();
          setHistory(history);
          setCurrentChat(recipient);
          console.log('chat with ',recipient);
          
      }
      catch(err){
        console.log("failed to load chat history ",err);
      }
    }

    // message sending handled
    const sending = () =>{
      if(!message || !currentChat) return;
      const msg = {
        type:'message',
        from:user,
        to:currentChat,
        text:message,
        timestamp:Date.now()
      };
      socketRef.current.send(JSON.stringify(msg));
      setHistory(prev=>[...prev,msg]);
      setMessage('');

    }

    //offline simulation and buffer message checking
    const handleOffline = () => {
      setIsOnline(prev => {
        const goingOnline = !prev;

        if (!goingOnline && socketRef.current) {
          socketRef.current.close();
          socketRef.current = null;
          console.log('🔴 WebSocket closed for user:', user);
        }

        // back online
        if (goingOnline && !socketRef.current && user) {
          
          socketRef.current = new WebSocket('ws://localhost:3000');

          socketRef.current.onopen = () => {
            console.log("🟢 WebSocket reconnected");
            socketRef.current.send(JSON.stringify({ type: 'register', userId: user }));
          };

          socketRef.current.onmessage = (event) => {
            const data = JSON.parse(event.data);
            if (data.type === 'ack') {
              console.log('✅ Server ack:', data.message);
            } else {
              setHistory(prev => [...prev, data]);
            }
          };

          socketRef.current.onclose = () => {
            console.log("⚠️ WebSocket disconnected");
          };
        }

        return goingOnline;
      });
    };
    

    return (
      <>
      {showPopup == true?(
          <div className='popup border' >
            
            <div className='h1-login'>Login</div>
            <div className='input'>
                <label>Enter you Username to start the chat</label><br/>
                <input value={user} onChange={(e) => setUser(e.target.value)}></input>
            </div>
            <div className='btn-box'>
              <button className='btn-submit' onClick={handleSubmit}>Submit</button>
            </div>
        </div>
      ):(
        <div className='main-div border'>
                  <div className=' div-nav border'>
                    <div>{user}</div>
                    <div onClick={handleLogOff}>Logoff</div>
                    <div style={{backgroundColor: isOnline ? 'green' : 'red'}} className='simulate-offline' onClick={handleOffline}>{isOnline?'Online':'Offline'}</div>
                  </div>
                  <div className='div-chat border'>
                    <div className='users-div border'>
                      <div className='search-to'>
                        <input value={recipient} onChange={(e)=>setRecipient(e.target.value)}></input>
                        <button onClick={startChat}>Chat</button>
                        
                         {activeChats.map((user, index) => (
                          <div key={index} onClick={() => {
                            setCurrentChat(user);
                            setRecipient(user);
                          }}>
                            {user}
                          </div>
                        ))}
                      </div> 
                    </div>
                    <div className='chats-div border'>
                        <div className='all-chat border'>
                            {history && history.map((msg, index) => (
                              <div key={index} className={msg.from === user ? 'my-msg' : 'their-msg'}>
                                <strong>{msg.from}</strong>: {msg.text}
                              </div>
                            ))}
                            <div ref={bottomRef} />
                        </div>
                        <div className='send-box border'>
                          <textarea type='text-area' value={message} onChange={(e) => setMessage(e.target.value)} placeholder='Type your message...'></textarea>
                          <button onClick={sending}>Send</button>
                        </div>
                    </div>
                  </div>
              </div>
      )}

      
      </>
    )
  }

  export default App
