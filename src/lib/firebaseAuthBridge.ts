import { signInWithCustomToken, signOut } from 'firebase/auth'
import { auth } from '../firebase'

export async function syncFirebaseAuth(rawIdToken: string): Promise<void> {
  const response = await fetch(`${import.meta.env.VITE_FUNCTIONS_BASE_URL}/mintFirebaseToken`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${rawIdToken}` },
  })

  if (!response.ok) {
    throw new Error('Failed to mint Firebase token')
  }

  const { firebaseToken } = (await response.json()) as { firebaseToken: string }
  await signInWithCustomToken(auth, firebaseToken)
}

export async function clearFirebaseAuth(): Promise<void> {
  await signOut(auth)
}
