importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.10.1/firebase-messaging.js');
// // Initialize the Firebase app in the service worker by passing the generated config

const firebaseConfig = {
  apiKey: "AIzaSyDLm3d17ULwycckM2fwChCQL1_k82eoHEY",
  authDomain: "brickmarkweb.firebaseapp.com",
  projectId: "brickmarkweb",
  storageBucket: "brickmarkweb.firebasestorage.app",
  messagingSenderId: "450811158487",
  appId: "1:450811158487:web:38e3b49d538d27c946b592",
  measurementId: "G-0DMS6BCH48"
};


firebase?.initializeApp(firebaseConfig)


// Retrieve firebase messaging
const messaging = firebase.messaging();

self.addEventListener('install', function (event) {
  console.log('Hello world from the Service Worker :call_me_hand:');
});

// Handle background messages
self.addEventListener('push', function (event) {
  const payload = event.data.json();
  const notification = payload.data;
  const notificationTitle = notification.title;
  const notificationOptions = {
    body: notification.body,
    icon: notification.image,
  };

  event.waitUntil(
    self.registration.showNotification(notificationTitle, notificationOptions)
  );
});