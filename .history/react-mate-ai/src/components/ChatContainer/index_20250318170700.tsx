import React from 'react';
import './styles.css';

const ChatContainer: React.FC = () => {
  return (
    <div className="chat-container">
      <div className="welcome-section">
        <h1>Welcome to AI Assistant</h1>
      </div>
      
      <div className="chat-section">
        {/* Chat Messages */}
        <div className="placeholder">Chat Window</div>
      </div>
      
      <div className="input-section">
        <input
          type="text"
          placeholder="Type your message here..."
          className="chat-input"
        />
        <button className="send-button">Send</button>
      </div>
    </div>
  );
};

export default ChatContainer;