# PWA + Firebase Push Notifications Demo

## 🚀 Đã Setup Hoàn Chỉnh

### ✅ Đã cấu hình:
- Firebase config với project: `chat-api-craco`
- VAPID key đã được cập nhật
- PWA manifest
- Service worker cho push notifications
- Debug page với UI đầy đủ

## 🔧 Cách sử dụng

### 1. Chạy ứng dụng
```bash
yarn dev
```
Mở: http://localhost:3000

### 2. Test Notifications

#### A. Test Local Notification
1. Click "Request Permission & Get Token"
2. Click "Test Local Notification"

#### B. Test từ Firebase Console
1. Lấy FCM token từ debug page
2. Vào Firebase Console → Cloud Messaging
3. Click "Send your first message"
4. Paste FCM token vào "FCM registration token"
5. Click "Test"

#### C. Test từ API (cần setup server key)
1. Lấy Server Key từ Firebase Console → Project Settings → Cloud Messaging
2. Cập nhật `YOUR_SERVER_KEY_HERE` trong `/src/pages/api/send-notification.ts`
3. Click "Send Test via API"

#### D. Test từ cURL
```bash
# Cập nhật SERVER_KEY và FCM_TOKEN trong test-notification.js
node test-notification.js
```

## 📱 PWA Features

- ✅ Manifest file
- ✅ Service worker registration  
- ✅ Push notification support
- ✅ Responsive design
- ✅ Debug interface với real-time monitoring
- ✅ Multiple test methods

## 🔍 Debug Information

Trang debug hiển thị:
- Notification support status
- Permission status
- Service Worker registration status
- FCM token
- Last received message
- Real-time logs

## 📋 Files Structure

```
├── public/
│   ├── manifest.json              # PWA manifest
│   └── firebase-messaging-sw.js   # Service worker
├── src/
│   ├── lib/
│   │   └── firebase.ts           # Firebase config & helpers
│   ├── pages/
│   │   ├── index.tsx             # Debug page
│   │   ├── _document.tsx         # PWA meta tags
│   │   └── api/
│   │       └── send-notification.ts # API endpoint
└── test-notification.js          # cURL test script
```

## 🛠️ Cần làm để hoàn thiện

1. **Lấy Server Key** từ Firebase Console để test API
2. **Test trên mobile device** để kiểm tra PWA
3. **Deploy lên HTTPS** để test production

## 🎯 Next Steps

- Setup proper error handling
- Add notification history
- Implement notification categories
- Add user preferences
- Setup analytics tracking