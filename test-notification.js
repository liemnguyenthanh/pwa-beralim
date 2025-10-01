// Test script để gửi push notification
// Chạy: node test-notification.js

const https = require('https');

// Server key từ Firebase Console > Project Settings > Cloud Messaging
const SERVER_KEY = 'YOUR_SERVER_KEY_HERE'; // Thay thế bằng server key thực tế

// FCM token từ debug page
const FCM_TOKEN = 'YOUR_FCM_TOKEN_HERE'; // Thay thế bằng FCM token từ debug page

const message = {
  to: FCM_TOKEN,
  notification: {
    title: 'Test Notification từ Server',
    body: 'Đây là test notification được gửi từ server!',
    icon: '/favicon.ico',
    click_action: 'http://localhost:3000'
  },
  data: {
    customData: 'test-data',
    timestamp: new Date().toISOString()
  }
};

const postData = JSON.stringify(message);

const options = {
  hostname: 'fcm.googleapis.com',
  port: 443,
  path: '/fcm/send',
  method: 'POST',
  headers: {
    'Authorization': `key=${SERVER_KEY}`,
    'Content-Type': 'application/json',
    'Content-Length': Buffer.byteLength(postData)
  }
};

console.log('Đang gửi notification...');
console.log('Message:', JSON.stringify(message, null, 2));

const req = https.request(options, (res) => {
  console.log(`Status: ${res.statusCode}`);
  console.log(`Headers: ${JSON.stringify(res.headers)}`);
  
  res.setEncoding('utf8');
  res.on('data', (chunk) => {
    console.log('Response:', chunk);
  });
  
  res.on('end', () => {
    console.log('Request completed');
  });
});

req.on('error', (e) => {
  console.error(`Problem with request: ${e.message}`);
});

req.write(postData);
req.end();
