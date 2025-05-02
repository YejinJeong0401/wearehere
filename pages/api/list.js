// pages/api/list.js
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, get, child } from 'firebase/database';

// Firebase 설정 (네 실제 정보로 바꿔줘야 해)
const firebaseConfig = {
    apiKey: "AIzaSyBE8R-KaQWBSuTfclXkCftcuYz01ugcNt8",
    authDomain: "wearehere-ed6c4.firebaseapp.com",
    databaseURL: "https://wearehere-ed6c4-default-rtdb.asia-southeast1.firebasedatabase.app",
    projectId: "wearehere-ed6c4",
};

const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

export default async function handler(req, res) {
  try {
    const dbRef = ref(db);
    const snapshot = await get(child(dbRef, 'characters')); // characters 배열 가져오기

    if (snapshot.exists()) {
      const characters = snapshot.val();
      res.status(200).json(characters);
    } else {
      res.status(404).json({ error: 'No character data found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Firebase fetch error', detail: error.message });
  }
}

