// sw.js
self.addEventListener('push', (event) => {
    const data = event.data.json();
    const title = data.title || 'New Notification';
    const options = {
      body: data.body || 'You have a new notification!',
      icon: 'icon.png', // Provide your icon image here
    };
  
    event.waitUntil(self.registration.showNotification(title, options));
  });
  