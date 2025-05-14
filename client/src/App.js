import React, { useState } from 'react';
import axios from 'axios';
import './style.css';
import useTypewriter from './useTypewriter';

function App() {
  const [messages, setMessages] = useState([
    { type: 'bot', text: 'Welcome, hero! Ask me anything about the Marvel Universe.' },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [imageMode, setImageMode] = useState(false); // new state for image generation

  const lastBotMsg =
    messages.filter((m) => m.type === 'bot').map((m) => m.text).pop() || '';
  const typedBotText = useTypewriter(lastBotMsg, 20);
const startListening = () => {
  const recognition = new window.webkitSpeechRecognition() || new window.SpeechRecognition();
  recognition.lang = 'en-US';
  recognition.interimResults = false;
  recognition.maxAlternatives = 1;

  recognition.start();

  recognition.onresult = (event) => {
    const voiceText = event.results[0][0].transcript;
    setInput(voiceText); // Fill the input box
    sendMessageFromVoice(voiceText); // Auto-send
  };

  recognition.onerror = (event) => {
    console.error('Voice recognition error:', event.error);
  };
};

const sendMessageFromVoice = async (voiceText) => {
  if (!voiceText.trim() || loading) return;

  setMessages((prev) => [...prev, { type: 'user', text: voiceText }]);
  setInput('');
  setLoading(true);

  try {
    const { data } = await axios.post('http://localhost:5000/api/chat', {
      message: voiceText,
    });
    setMessages((prev) => [...prev, { type: 'bot', text: data.reply }]);

    // Optional: Bot reply as speech
    const utterance = new SpeechSynthesisUtterance(data.reply);
    speechSynthesis.speak(utterance);

  } catch (error) {
    console.error('Voice error:', error);
    setMessages((prev) => [...prev, { type: 'bot', text: 'Oops! Something went wrong.' }]);
  } finally {
    setLoading(false);
  }
};

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    setMessages((prev) => [...prev, { type: 'user', text: input }]);
    const userText = input;
    setInput('');
    setLoading(true);

    try {
      if (imageMode) {
        const { data } = await axios.post('http://localhost:5000/api/generate-image', {
          prompt: userText,
        });
        setMessages((prev) => [
          ...prev,
          { type: 'image', imageUrl: data.imageUrl, text: `Generated: ${userText}` },
        ]);
      } else {
        const { data } = await axios.post('http://localhost:5000/api/chat', {
          message: userText,
        });
        setMessages((prev) => [...prev, { type: 'bot', text: data.reply }]);
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        { type: 'bot', text: 'Oops! Something went wrong.' },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') sendMessage();
  };

  return (
    <div className="app-container">
      <video autoPlay muted loop id="bg-video">
        <source src={`${process.env.PUBLIC_URL}/assets/bg.mp4`} type="video/mp4" />
      </video>

      <div className="chat-wrapper">
        <header>
          <img
            src={`${process.env.PUBLIC_URL}/assets/logo.png`}
            alt="Marvel Logo"
            className="logo"
          />
          <h1>Marvel Chatbot</h1>
        </header>

        {/* Mode toggle */}
        <div className="mode-toggle">
          <label>
            <input
              type="checkbox"
              checked={imageMode}
              onChange={() => setImageMode(!imageMode)}
            />
            Generate Marvel Image
          </label>
        </div>

        {/* Chat messages */}
        <div className="chat-box">
          {messages.map((msg, idx) => {
            if (msg.type === 'image') {
              return (
                <div key={idx} className="message image">
                  <p>{msg.text}</p>
                  <img src={msg.imageUrl} alt="Generated Marvel" />
                </div>
              );
            }

            const isLastBot =
              idx === messages.length - 1 && msg.type === 'bot' && !loading;
            const displayText = isLastBot ? typedBotText : msg.text;

            return (
              <div key={idx} className={`message ${msg.type}`}>
                {displayText}
              </div>
            );
          })}

          {loading && (
            <div className="message bot loading">🕸️ Summoning Marvel wisdom...</div>
          )}
        </div>

        {/* Input field */}
        <div className="input-area">
          <input
            type="text"
            placeholder={
              imageMode ? 'Describe an image (e.g., Iron Man flying)' : 'Ask a Marvel question...'
            }
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyPress}
            disabled={loading}
          />
          <button onClick={sendMessage} disabled={loading}>
            <button onClick={startListening} disabled={loading}>
  🎤 Speak
</button>

            {loading ? 'Sending...' : imageMode ? 'Generate' : 'Send'}
          </button>
        </div>
      </div>
    </div>
  );
}

export default App;
