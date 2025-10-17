import { useState, useEffect, useCallback } from "react";
import { requestPermission, onMessageListener } from "../lib/firebase";

interface NotificationState {
  permission: NotificationPermission | null;
  token: string | null;
  isSupported: boolean;
  nextPwaSwRegistered: boolean;
  firebaseSwRegistered: boolean;
  lastMessage: any; // eslint-disable-line @typescript-eslint/no-explicit-any
}

export default function Home() {
  const [notificationState, setNotificationState] = useState<NotificationState>({
    permission: null,
    token: null,
    isSupported: false,
    nextPwaSwRegistered: false,
    firebaseSwRegistered: false,
    lastMessage: null,
  });

  const [logs, setLogs] = useState<string[]>([]);
  const [isDarkMode, setIsDarkMode] = useState(true);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
  };

  const clearOldServiceWorkers = useCallback(async () => {
    try {
      // Get all service worker registrations
      const registrations = await navigator.serviceWorker.getRegistrations();
      
      for (const registration of registrations) {
        // Chỉ unregister old Next-PWA service workers, KHÔNG unregister Firebase
        const scriptURL = registration.active?.scriptURL || '';
        const scope = registration.scope;
        
        // Chỉ unregister nếu là Next-PWA service worker
        if (scriptURL.includes('/sw.js') || 
            scriptURL.includes('workbox') ||
            scope.includes('/sw.js') ||
            (scope.includes('workbox') && !scope.includes('firebase'))) {
          await registration.unregister();
          addLog(`Unregistered old Next-PWA service worker: ${scope}`);
        } else {
          addLog(`Keeping service worker: ${scope}`);
        }
      }

      // Clear old caches (chỉ workbox, không clear Firebase caches)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          // Chỉ clear old workbox caches, không clear Firebase caches
          if ((cacheName.includes('workbox') || 
               cacheName.includes('next-pwa') ||
               cacheName.includes('sw-')) &&
              !cacheName.includes('firebase')) {
            await caches.delete(cacheName);
            addLog(`Cleared old cache: ${cacheName}`);
          }
        }
      }
    } catch (error) {
      addLog(`Error clearing old service workers: ${error}`);
    }
  }, [addLog]);

  useEffect(() => {
    // Check if notifications are supported
    const isSupported = 'Notification' in window && 'serviceWorker' in navigator;
    setNotificationState(prev => ({ ...prev, isSupported }));

    // Check current permission
    if (isSupported) {
      setNotificationState(prev => ({ ...prev, permission: Notification.permission }));
      addLog(`Notification permission: ${Notification.permission}`);
    }

    // Auto clear old service workers and cache
    if ('serviceWorker' in navigator) {
      clearOldServiceWorkers();
    }

    // Check service worker registrations
    if ('serviceWorker' in navigator) {
      // Check next-pwa service worker
      navigator.serviceWorker.getRegistration('/sw.js')
        .then(registration => {
          const isRegistered = !!registration;
          setNotificationState(prev => ({ ...prev, nextPwaSwRegistered: isRegistered }));
          addLog(`Next-PWA Service Worker registered: ${isRegistered}`);
        });

      // Check Firebase messaging service worker
      navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js')
        .then(registration => {
          const isRegistered = !!registration;
          setNotificationState(prev => ({ ...prev, firebaseSwRegistered: isRegistered }));
          addLog(`Firebase messaging SW registered: ${isRegistered}`);
        });
    }

    // Listen for foreground messages
    onMessageListener().then((payload) => {
      if (payload) {
        setNotificationState(prev => ({ ...prev, lastMessage: payload }));
        addLog(`Received foreground message: ${JSON.stringify(payload)}`);
      }
    });

    addLog('PWA Notification Debug Page initialized');
  }, [clearOldServiceWorkers]);

  const requestNotificationPermission = async () => {
    try {
      const token = await requestPermission();
      setNotificationState(prev => ({ 
        ...prev, 
        token,
        permission: Notification.permission 
      }));
      
      if (token) {
        addLog(`FCM Token: ${token}`);
      } else {
        addLog('Failed to get FCM token');
      }
    } catch (error) {
      addLog(`Error requesting permission: ${error}`);
    }
  };

  const testLocalNotification = () => {
    if (Notification.permission === 'granted') {
      new Notification('Test Notification', {
        body: 'Đây là thông báo test từ PWA',
        icon: '/favicon.ico',
        tag: 'test-notification'
      });
      addLog('Local notification sent');
    } else {
      addLog('Notification permission not granted');
    }
  };

  const copyToken = () => {
    if (notificationState.token) {
      navigator.clipboard.writeText(notificationState.token);
      addLog('FCM Token copied to clipboard');
    }
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const forceClearCache = async () => {
    try {
      addLog('Force clearing cache and old service workers...');
      
      // Clear old service workers (không clear Firebase)
      const registrations = await navigator.serviceWorker.getRegistrations();
      for (const registration of registrations) {
        const scriptURL = registration.active?.scriptURL || '';
        const scope = registration.scope;
        
        // Chỉ unregister old service workers, giữ Firebase
        if (scriptURL.includes('/sw.js') || 
            scriptURL.includes('workbox') ||
            scope.includes('/sw.js') ||
            (scope.includes('workbox') && !scope.includes('firebase'))) {
          await registration.unregister();
          addLog(`Unregistered old service worker: ${scope}`);
        } else {
          addLog(`Keeping Firebase service worker: ${scope}`);
        }
      }
      
      // Clear old caches (không clear Firebase caches)
      if ('caches' in window) {
        const cacheNames = await caches.keys();
        for (const cacheName of cacheNames) {
          if ((cacheName.includes('workbox') || 
               cacheName.includes('next-pwa') ||
               cacheName.includes('sw-')) &&
              !cacheName.includes('firebase')) {
            await caches.delete(cacheName);
            addLog(`Cleared old cache: ${cacheName}`);
          }
        }
      }
      
      // Clear localStorage and sessionStorage
      localStorage.clear();
      sessionStorage.clear();
      addLog('Cleared localStorage and sessionStorage');
      
      addLog('Cache cleared! Firebase service worker preserved.');
      
      // Auto refresh after 2 seconds
      setTimeout(() => {
        window.location.reload();
      }, 2000);
      
    } catch (error) {
      addLog(`Error clearing cache: ${error}`);
    }
  };


  return (
    <div className={`min-h-screen p-4 transition-colors duration-300 ${isDarkMode ? 'bg-gray-900' : 'bg-gray-50'}`}>
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className={`text-3xl font-bold transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>
            PWA + Firebase Push Notification Debug
          </h1>
          <button
            onClick={() => setIsDarkMode(!isDarkMode)}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 ${
              isDarkMode 
                ? 'bg-gray-700 hover:bg-gray-600 text-white' 
                : 'bg-gray-200 hover:bg-gray-300 text-gray-900'
            }`}
          >
            {isDarkMode ? '🌙 Dark' : '☀️ Light'}
          </button>
        </div>

        {/* Status Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
          <div className={`p-4 rounded-lg shadow transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Notification Support</h3>
            <p className={`text-lg font-bold ${notificationState.isSupported ? 'text-green-500' : 'text-red-500'}`}>
              {notificationState.isSupported ? '✅ Supported' : '❌ Not Supported'}
            </p>
          </div>

          <div className={`p-4 rounded-lg shadow transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Permission</h3>
            <p className={`text-lg font-bold ${
              notificationState.permission === 'granted' ? 'text-green-500' : 
              notificationState.permission === 'denied' ? 'text-red-500' : 'text-yellow-500'
            }`}>
              {notificationState.permission || 'Unknown'}
            </p>
          </div>

          <div className={`p-4 rounded-lg shadow transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Next-PWA SW</h3>
            <p className={`text-lg font-bold ${notificationState.nextPwaSwRegistered ? 'text-green-500' : 'text-red-500'}`}>
              {notificationState.nextPwaSwRegistered ? '✅ Registered' : '❌ Not Registered'}
            </p>
          </div>

          <div className={`p-4 rounded-lg shadow transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>Firebase SW</h3>
            <p className={`text-lg font-bold ${notificationState.firebaseSwRegistered ? 'text-green-500' : 'text-red-500'}`}>
              {notificationState.firebaseSwRegistered ? '✅ Registered' : '❌ Not Registered'}
            </p>
          </div>

          <div className={`p-4 rounded-lg shadow transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h3 className={`font-semibold transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>FCM Token</h3>
            <p className={`text-lg font-bold ${notificationState.token ? 'text-green-500' : 'text-red-500'}`}>
              {notificationState.token ? '✅ Available' : '❌ Not Available'}
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className={`p-6 rounded-lg shadow mb-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Actions</h2>
          <div className="flex flex-wrap gap-4">
            <button
              onClick={requestNotificationPermission}
              className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Request Permission & Get Token
            </button>
            
            <button
              onClick={testLocalNotification}
              disabled={notificationState.permission !== 'granted'}
              className="bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Test Local Notification
            </button>
            
            
            {notificationState.token && (
              <button
                onClick={copyToken}
                className="bg-purple-500 hover:bg-purple-600 text-white px-4 py-2 rounded-lg transition-colors"
              >
                Copy FCM Token
              </button>
            )}
            
            <button
              onClick={clearLogs}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              Clear Logs
            </button>
            
            <button
              onClick={forceClearCache}
              className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition-colors"
            >
              🧹 Force Clear Cache
            </button>
          </div>
        </div>

        {/* FCM Token Display */}
        {notificationState.token && (
          <div className={`p-6 rounded-lg shadow mb-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>FCM Token</h2>
            <div className={`p-4 rounded-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <code className={`text-sm break-all transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>{notificationState.token}</code>
            </div>
          </div>
        )}

        {/* Last Message */}
        {notificationState.lastMessage && (
          <div className={`p-6 rounded-lg shadow mb-8 transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
            <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Last Received Message</h2>
            <div className={`p-4 rounded-lg transition-colors duration-300 ${isDarkMode ? 'bg-gray-700' : 'bg-gray-100'}`}>
              <pre className={`text-sm overflow-auto transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-900'}`}>
                {JSON.stringify(notificationState.lastMessage, null, 2)}
              </pre>
            </div>
          </div>
        )}

        {/* Logs */}
        <div className={`p-6 rounded-lg shadow transition-colors duration-300 ${isDarkMode ? 'bg-gray-800' : 'bg-white'}`}>
          <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Debug Logs</h2>
          <div className={`p-4 rounded-lg h-64 overflow-y-auto font-mono text-sm transition-colors duration-300 ${
            isDarkMode 
              ? 'bg-gray-900 text-green-400' 
              : 'bg-gray-100 text-gray-800'
          }`}>
            {logs.length === 0 ? (
              <p className={`transition-colors duration-300 ${isDarkMode ? 'text-gray-500' : 'text-gray-400'}`}>No logs yet...</p>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="mb-1">
                  {log}
                </div>
              ))
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className={`p-6 rounded-lg mt-8 transition-colors duration-300 ${
          isDarkMode 
            ? 'bg-blue-900 bg-opacity-50' 
            : 'bg-blue-50'
        }`}>
          <h2 className={`text-xl font-semibold mb-4 transition-colors duration-300 ${isDarkMode ? 'text-white' : 'text-gray-900'}`}>Hướng dẫn sử dụng</h2>
          <ol className={`list-decimal list-inside space-y-2 transition-colors duration-300 ${isDarkMode ? 'text-gray-300' : 'text-gray-700'}`}>
            <li>Click &quot;Request Permission & Get Token&quot; để xin quyền và lấy FCM token</li>
            <li>Click &quot;Test Local Notification&quot; để test notification local</li>
            <li>Copy FCM token để gửi notification từ Firebase Console</li>
            <li>Kiểm tra logs để debug các vấn đề</li>
            <li>Để gửi notification từ Firebase Console: Project Settings → Cloud Messaging → Send test message</li>
          </ol>
        </div>
      </div>
    </div>
  );
}
