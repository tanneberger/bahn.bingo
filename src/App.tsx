import './App.css'

import * as React from 'react';   
import * as ReactDOM from 'react-dom'; 
import { useState } from 'react';


function App() {
  let raw_messages: string[] = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11"];
  const shuffle = (array) => {
    array.sort(() => Math.random() - 0.5);
  }
  shuffle(raw_messages);
  const [messages, setMessages] = useState({
    messages: raw_messages,
  });
  return (
    <>
      <div className="parent">
          <div className="box">
              <h1> Bahn Bingo </h1>
              <div className = "grid-container">
                <div className="grid-item"><input id="1" type="checkbox" className="bingo-field-input"/><label htmlFor="1" className="bingo-field-label">{messages.messages[0]}</label></div>
                <div className="grid-item"><input id="2" type="checkbox" className="bingo-field-input"/><label htmlFor="2" className="bingo-field-label">{messages.messages[1]}</label></div>
                <div className="grid-item"><input id="3" type="checkbox" className="bingo-field-input"/><label htmlFor="3" className="bingo-field-label">{messages.messages[2]}</label></div>
                <div className="grid-item"><input id="4" type="checkbox" className="bingo-field-input"/><label htmlFor="4" className="bingo-field-label">{messages.messages[3]}</label></div>
                <div className="grid-item"><input id="5" type="checkbox" className="bingo-field-input"/><label htmlFor="5" className="bingo-field-label">{messages.messages[4]}</label></div>
                <div className="grid-item"><input id="6" type="checkbox" className="bingo-field-input"/><label htmlFor="6" className="bingo-field-label">{messages.messages[5]}</label></div>
                <div className="grid-item"><input id="7" type="checkbox" className="bingo-field-input"/><label htmlFor="7" className="bingo-field-label">{messages.messages[6]}</label></div>
                <div className="grid-item"><input id="8" type="checkbox" className="bingo-field-input"/><label htmlFor="8" className="bingo-field-label">{messages.messages[7]}</label></div>
                <div className="grid-item"><input id="9" type="checkbox" className="bingo-field-input"/><label htmlFor="9" className="bingo-field-label">{messages.messages[8]}</label></div>
              </div>
            </div>
        </div>
    </>
  )
}

export default App
