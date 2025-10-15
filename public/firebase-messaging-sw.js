// Firebase Messaging Service Worker
// This service worker is separate from the next-pwa workbox service worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

// Firebase config
const firebaseConfig = {
  apiKey: "AIzaSyBejBaQ34LDosFHPD13naN0lWYVYtRqhOM",
  authDomain: "chat-api-craco.firebaseapp.com",
  projectId: "chat-api-craco",
  storageBucket: "chat-api-craco.firebasestorage.app",
  messagingSenderId: "674773585352",
  appId: "1:674773585352:web:dbf603c2809f70568784fd",
  measurementId: "G-DJQTM9ZXYZ"
};

// Initialize Firebase
firebase.initializeApp(firebaseConfig);

// Initialize Firebase Messaging
const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  // Tránh duplicate notification bằng cách sử dụng unique tag
  const notificationTitle = payload.notification?.title || 'Thông báo mới';
  const notificationOptions = {
    body: payload.notification?.body || 'Bạn có thông báo mới',
    icon: '/favicon.ico',
    badge: '/favicon.ico',
    tag: `firebase-notification-${Date.now()}`, // Unique tag để tránh duplicate
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Mở ứng dụng'
      },
      {
        action: 'close',
        title: 'Đóng'
      }
    ],
    data: payload.data || {}
  };

  // Kiểm tra xem có notification nào đang hiển thị không
  self.registration.getNotifications().then(notifications => {
    // Chỉ hiển thị notification mới nếu chưa có notification tương tự
    const hasSimilarNotification = notifications.some(notification => 
      notification.title === notificationTitle && 
      notification.body === notificationOptions.body
    );
    
    if (!hasSimilarNotification) {
      self.registration.showNotification(notificationTitle, notificationOptions);
    }
  });
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  console.log('[firebase-messaging-sw.js] Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'open') {
    // Mở ứng dụng
    event.waitUntil(
      clients.openWindow('/')
    );
  } else if (event.action === 'close') {
    // Đóng notification
    event.notification.close();
  } else {
    // Click vào notification (không phải action button)
    event.waitUntil(
      clients.openWindow('/')
    );
  }
});

// Handle notification close
self.addEventListener('notificationclose', (event) => {
  console.log('[firebase-messaging-sw.js] Notification closed:', event);
});
