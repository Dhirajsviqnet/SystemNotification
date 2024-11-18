import React, { useState, useEffect } from 'react';
import { io } from 'socket.io-client';

// Connect to the backend server
const socket = io('http://localhost:5000');

const ChatApp = () => {
  const [groupId, setGroupId] = useState('');
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [isJoined, setIsJoined] = useState(false); // State to track if the user has joined a group
  const [isOnline, setIsOnline] = useState(true); // Track user's online/offline status

  // Request Notification Permission
  useEffect(() => {
    if ('Notification' in window && Notification.permission !== 'granted') {
      Notification.requestPermission();
    }
  }, []);

  // Listen for incoming messages
  useEffect(() => {
    socket.on('receiveMessage', (data) => {
      setMessages((prevMessages) => [
        ...prevMessages,
        { sender: data.sender, message: data.message }
      ]);
      if (Notification.permission === 'granted') {
        // Show a system notification when a message is received
        new Notification('New Message', {
          body: `${data.sender}: ${data.message}`,
          icon: '/favicon.ico'
        });
      }
    });

    // Detect online/offline status
    socket.on('disconnect', () => {
      setIsOnline(false);
      if (Notification.permission === 'granted') {
        new Notification('You are offline', {
          body: 'You have lost connection to the server.',
          icon: '/favicon.ico'
        });
      }
    });

    socket.on('connect', () => {
      setIsOnline(true);
    });

    // Cleanup the listener when the component unmounts
    return () => {
      socket.off('receiveMessage');
      socket.off('disconnect');
      socket.off('connect');
    };
  }, []);

  // Join a group
  const joinGroup = () => {
    if (groupId) {
      socket.emit('joinGroup', groupId);
      setIsJoined(true);
      console.log(`Joined group: ${groupId}`);
    }
  };

  // Send a message to the group
  const sendMessage = () => {
    if (groupId && message) {
      socket.emit('sendMessage', groupId, message);
      setMessage(''); // Clear the input field after sending the message
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-gray-100 rounded-lg shadow-lg">
      <h1 className="text-3xl font-semibold text-center text-gray-700">Socket.IO Group Chat</h1>

      {!isJoined ? (
        <div className="text-center mt-6">
          <input
            type="text"
            placeholder="Enter Group ID"
            value={groupId}
            onChange={(e) => setGroupId(e.target.value)}
            className="w-4/5 md:w-2/3 lg:w-1/2 p-3 border border-gray-300 rounded-md mt-4 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          />
          <button
            onClick={joinGroup}
            className="mt-4 px-6 py-3 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            Join Group
          </button>
        </div>
      ) : (
        <div className="mt-6">
          <div className="max-h-96 overflow-y-auto p-4 bg-white rounded-lg shadow-md">
            <h3 className="text-xl font-semibold text-gray-800">Messages:</h3>
            {messages.map((msg, index) => (
              <div key={index} className="py-2 border-b border-gray-200">
                <strong className="text-indigo-600">{msg.sender}:</strong> {msg.message}
              </div>
            ))}
          </div>

          <div className="mt-6 flex space-x-4">
            <input
              type="text"
              placeholder="Enter Message"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
            <button
              onClick={sendMessage}
              className="px-6 py-3 bg-green-500 text-white font-semibold rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
            >
              Send
            </button>
          </div>

          {/* Show offline status */}
          {!isOnline && (
            <div className="mt-4 text-center text-red-600 font-semibold">
              You are offline. Messages will be sent when you are back online.
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default ChatApp;
