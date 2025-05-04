// pages/api/upload.js
export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ message: 'Method not allowed' });
  }

  try {
    const response = await fetch('https://script.google.com/macros/s/당신의_스크립트_ID/exec', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(req.body),
    });

    const result = await response.text();
    res.status(200).json({ message: result });
  } catch (error) {
    console.error('프록시 에러:', error);
    res.status(500).json({ message: '프록시 요청 실패' });
  }
}
