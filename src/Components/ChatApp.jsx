import React, { useState } from 'react';

const PUBLIC_VAPID_KEY = 'BCU1J6IJvDvGicgeYTC9Mzfym1EtSXHJfxmbdY_q06qgAIBaHmvaxcB5C3L2SvXucJgDGWn2aUnmze_GIdRLShM'; // Use the public key from backend

const App = () => {
  const [message, setMessage] = useState('');
  const [subscription, setSubscription] = useState(null);

  // Register service worker and subscribe
  const subscribeToNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.register('/sw.js');

      const subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey: urlBase64ToUint8Array(PUBLIC_VAPID_KEY),
      });

      // Send subscription to the backend
      await fetch('http://localhost:4000/subscribe', {
        method: 'POST',
        body: JSON.stringify(subscription),
        headers: { 'Content-Type': 'application/json' },
      });

      setSubscription(subscription);
      alert('Subscribed to notifications!');
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
    }
  };

  // Send a notification
  const sendNotification = async () => {
    if (!subscription) {
      alert('Please subscribe first!');
      return;
    }

    try {
      await fetch('https://systemnotificationbackend.onrender.com/notify', {
        method: 'POST',
        body: JSON.stringify({
          subscription,
          payload: {
            title: 'Hello!',
            body: message || 'This is a test notification.',
          },
        }),
        headers: { 'Content-Type': 'application/json' },
      });

      alert('Notification sent!');
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Convert VAPID key to Uint8Array
  const urlBase64ToUint8Array = (base64String) => {
    const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
    const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
    const rawData = atob(base64);
    return new Uint8Array([...rawData].map((char) => char.charCodeAt(0)));
  };

  return (
    <div className="App">
      <h1>Push Notifications</h1>
      <button onClick={subscribeToNotifications}>Subscribe</button>
      <br />
      <textarea
        placeholder="Enter your notification message"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <br />
      <button onClick={sendNotification}>Send Notification</button>
    </div>
  );
};

export default App;