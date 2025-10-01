# Hướng dẫn Setup Firebase cho PWA Push Notifications

## Bước 1: Tạo Firebase Project

1. Truy cập [Firebase Console](https://console.firebase.google.com/)
2. Click "Create a project" hoặc "Add project"
3. Nhập tên project (ví dụ: "pwa-notification-demo")
4. Chọn có/không enable Google Analytics (tùy chọn)
5. Click "Create project"

## Bước 2: Thêm Web App vào Firebase Project

1. Trong Firebase Console, click vào icon "Web" (`</>`)
2. Nhập tên app (ví dụ: "PWA Demo")
3. Chọn "Also set up Firebase Hosting" nếu muốn
4. Click "Register app"
5. Copy Firebase config object

## Bước 3: Cập nhật Firebase Config

Thay thế config trong các file sau:

### 1. `/src/lib/firebase.ts`
```typescript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

### 2. `/public/firebase-messaging-sw.js`
```javascript
const firebaseConfig = {
  apiKey: "your-actual-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "your-actual-app-id"
};
```

## Bước 4: Lấy VAPID Key

1. Trong Firebase Console, vào **Project Settings** (icon bánh răng)
2. Chọn tab **Cloud Messaging**
3. Scroll xuống phần **Web configuration**
4. Copy **Web push certificates** → **Key pair**
5. Cập nhật trong `/src/lib/firebase.ts`:
```typescript
const vapidKey = "your-actual-vapid-key";
```

## Bước 5: Test Push Notifications

### Cách 1: Sử dụng Firebase Console
1. Vào **Cloud Messaging** trong Firebase Console
2. Click **Send your first message**
3. Nhập title và text
4. Click **Send test message**
5. Paste FCM token từ debug page
6. Click **Test**

### Cách 2: Sử dụng cURL
```bash
curl -X POST https://fcm.googleapis.com/fcm/send \
  -H "Authorization: key=YOUR_SERVER_KEY" \
  -H "Content-Type: application/json" \
  -d '{
    "to": "FCM_TOKEN_FROM_DEBUG_PAGE",
    "notification": {
      "title": "Test Notification",
      "body": "Đây là test notification từ server"
    }
  }'
```

## Bước 6: Lấy Server Key (cho cURL)

1. Vào **Project Settings** → **Cloud Messaging**
2. Copy **Server key** (dùng cho Authorization header)

## Troubleshooting

### Lỗi thường gặp:

1. **"Firebase: Error (messaging/unsupported-browser)"**
   - Kiểm tra browser có hỗ trợ service worker không
   - Sử dụng HTTPS (localhost OK cho development)

2. **"Firebase: Error (messaging/failed-service-worker-registration)"**
   - Kiểm tra file `firebase-messaging-sw.js` có tồn tại không
   - Kiểm tra Firebase config có đúng không

3. **"Firebase: Error (messaging/invalid-vapid-key)"**
   - Kiểm tra VAPID key có đúng không
   - VAPID key phải bắt đầu với "B" và có độ dài 87 ký tự

4. **Notification không hiển thị**
   - Kiểm tra permission đã được grant chưa
   - Kiểm tra service worker đã register chưa
   - Kiểm tra FCM token có valid không

### Debug Steps:

1. Mở Developer Tools → Console
2. Kiểm tra logs từ debug page
3. Kiểm tra Application → Service Workers
4. Kiểm tra Application → Storage → IndexedDB (FCM tokens)

## Production Deployment

1. Deploy lên HTTPS domain (Firebase Hosting, Vercel, Netlify...)
2. Cập nhật Firebase config cho production domain
3. Test notifications trên production
4. Setup proper error handling và logging
