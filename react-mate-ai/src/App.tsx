import React from 'react';
import './App.css';
import ModelContainer from './components/ModelContainer';
import ChatContainer from './components/ChatContainer';
import VisualizationContainer from './components/VisualizationContainer';

function App() {
  return (
    <div className="App">
      <div className="layout-container">
        <ModelContainer />
        <ChatContainer />
        <VisualizationContainer />
      </div>
    </div>
  );
}

export default App;
