import { useState } from 'react'
import './App.css'

function App() {
  const [count, setCount] = useState(0)

  return (
    <>
      <div className='main-div border'>
          <div className=' div-nav border'>p1</div>
          <div className='div-chat border'>
            <div className='users-div border'>
              hello 
            </div>
            <div className='chats-div border'>
              volla
            </div>
          </div>
      </div>
    </>
  )
}

export default App
