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

  // Tạo unique message ID để tránh duplicate
  const messageId = payload.messageId || payload.data?.messageId || Date.now().toString();
  const messageKey = `message_${messageId}`;
  
  // Kiểm tra xem message này đã được xử lý chưa
  if (self.messageProcessed && self.messageProcessed[messageKey]) {
    console.log('[firebase-messaging-sw.js] Message already processed, skipping:', messageId);
    return;
  }
  
  // Đánh dấu message đã được xử lý
  if (!self.messageProcessed) self.messageProcessed = {};
  self.messageProcessed[messageKey] = true;
  
  // Cleanup old processed messages (giữ tối đa 100 messages)
  const processedKeys = Object.keys(self.messageProcessed);
  if (processedKeys.length > 100) {
    const oldestKeys = processedKeys.slice(0, processedKeys.length - 100);
    oldestKeys.forEach(key => delete self.messageProcessed[key]);
  }

  // Ưu tiên xử lý data payload để tránh duplicate
  const data = payload.data || {};
  const notification = payload.notification || {};

  // Check if app is in foreground
  if (data.appState === 'foreground' || data.visible === 'true') {
    console.log('[firebase-messaging-sw.js] App is in foreground, skipping notification display');
    return;
  }

  // Check if this is PWA context
  const isPWA = self.registration.scope.includes('standalone') || 
                self.registration.scope.includes('pwa') ||
                data.context === 'pwa';

  // Check if this is web context  
  const isWeb = !isPWA || data.context === 'web';

  // Only show notification in PWA context (or web context, but not both)
  if (isWeb && data.preferPWA === 'true') {
    console.log('[firebase-messaging-sw.js] Prefer PWA, skipping web notification');
    return;
  }

  if (isPWA && data.preferWeb === 'true') {
    console.log('[firebase-messaging-sw.js] Prefer Web, skipping PWA notification');
    return;
  }

  // Ưu tiên data payload, fallback to notification payload
  const url = data.url || (payload.fcmOptions && payload.fcmOptions.link) || '/';
  const title = data.title || notification.title || 'Berally';
  const body = data.body || notification.body || 'New notification';
  const icon = data.icon || notification.icon || '/favicon.ico';

  // Use context-specific tag để tránh duplicate
  const notificationTag = data.tag || `berally-${isPWA ? 'pwa' : 'web'}-${Date.now()}`;

  const options = {
    body,
    icon,
    badge: '/favicon.ico',
    tag: notificationTag,
    requireInteraction: true,
    actions: [
      {
        action: 'open',
        title: 'Open notification',
      },
      {
        action: 'close',
        title: 'Close notification',
      },
    ],
    data: {
      url,
      payloadData: data,
      timestamp: Date.now(),
      context: isPWA ? 'pwa' : 'web',
    },
  };

  // Kiểm tra duplicate notification trước khi hiển thị
  self.registration.getNotifications().then(notifications => {
    const hasSimilarNotification = notifications.some(notif => 
      notif.title === title && 
      notif.body === body &&
      (Date.now() - (notif.data?.timestamp || 0)) < 5000 // Trong vòng 5 giây
    );
    
    if (!hasSimilarNotification) {
      console.log('[firebase-messaging-sw.js] Showing notification:', title);
      self.registration.showNotification(title, options);
    } else {
      console.log('[firebase-messaging-sw.js] Duplicate notification detected, skipping');
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
