import { NextApiRequest, NextApiResponse } from 'next';

// Server key từ Firebase Console > Project Settings > Cloud Messaging
const SERVER_KEY = 'YOUR_SERVER_KEY_HERE'; // Thay thế bằng server key thực tế

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { token, title, body } = req.body;

  if (!token) {
    return res.status(400).json({ error: 'FCM token is required' });
  }

  const message = {
    to: token,
    notification: {
      title: title || 'Test Notification từ API',
      body: body || 'Đây là test notification được gửi từ API!',
      icon: '/favicon.ico',
      click_action: 'http://localhost:3000'
    },
    data: {
      customData: 'api-test',
      timestamp: new Date().toISOString()
    }
  };

  try {
    const response = await fetch('https://fcm.googleapis.com/fcm/send', {
      method: 'POST',
      headers: {
        'Authorization': `key=${SERVER_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(message)
    });

    const result = await response.json();

    if (response.ok) {
      res.status(200).json({ 
        success: true, 
        messageId: result.message_id,
        result 
      });
    } else {
      res.status(400).json({ 
        success: false, 
        error: result.error || 'Failed to send notification' 
      });
    }
  } catch (error) {
    console.error('Error sending notification:', error);
    res.status(500).json({ 
      success: false, 
      error: 'Internal server error' 
    });
  }
}
