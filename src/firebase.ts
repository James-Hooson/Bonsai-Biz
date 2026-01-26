import { initializeApp } from 'firebase/app'
import { getFirestore } from 'firebase/firestore'
import { getStorage } from 'firebase/storage'
import { getAnalytics } from 'firebase/analytics'

const firebaseConfig = {
  apiKey: 'AIzaSyD_-MkWdrUa5UvXXA9JspndwD8reqwBNvY',
  authDomain: 'bonsai-fdf2b.firebaseapp.com',
  projectId: 'bonsai-fdf2b',
  storageBucket: 'bonsai-fdf2b.firebasestorage.app',
  messagingSenderId: '729369432047',
  appId: '1:729369432047:web:7319e38a4a2ce3e2eeb01a',
  measurementId: 'G-Q9X7SBL3GS',
}

const app = initializeApp(firebaseConfig)
const analytics = getAnalytics(app)
export const db = getFirestore(app)
export const storage = getStorage(app)
export default app
export { analytics }
