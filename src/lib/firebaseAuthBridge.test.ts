import { describe, it, expect, vi, beforeEach } from 'vitest'

const mocks = vi.hoisted(() => ({
  signInWithCustomToken: vi.fn(),
  signOut: vi.fn(),
}))

vi.mock('firebase/auth', () => ({
  signInWithCustomToken: mocks.signInWithCustomToken,
  signOut: mocks.signOut,
}))

vi.mock('../firebase', () => ({
  auth: { __fake: 'auth-instance' },
}))

import { syncFirebaseAuth, clearFirebaseAuth } from './firebaseAuthBridge'
import { auth } from '../firebase'

beforeEach(() => {
  vi.clearAllMocks()
  vi.stubGlobal('fetch', vi.fn())
})

describe('syncFirebaseAuth', () => {
  it('exchanges the Auth0 ID token for a Firebase custom token and signs in', async () => {
    vi.mocked(fetch).mockResolvedValue({
      ok: true,
      json: async () => ({ firebaseToken: 'minted-token' }),
    } as Response)

    await syncFirebaseAuth('auth0-id-token')

    const [url, init] = vi.mocked(fetch).mock.calls[0]
    expect(String(url)).toContain('/mintFirebaseToken')
    expect(init?.method).toBe('POST')
    expect((init?.headers as Record<string, string>).Authorization).toBe('Bearer auth0-id-token')

    expect(mocks.signInWithCustomToken).toHaveBeenCalledWith(auth, 'minted-token')
  })

  it('throws and does not sign in when the mint request fails', async () => {
    vi.mocked(fetch).mockResolvedValue({ ok: false } as Response)

    await expect(syncFirebaseAuth('auth0-id-token')).rejects.toThrow('Failed to mint Firebase token')
    expect(mocks.signInWithCustomToken).not.toHaveBeenCalled()
  })
})

describe('clearFirebaseAuth', () => {
  it('signs out of the Firebase session', async () => {
    await clearFirebaseAuth()
    expect(mocks.signOut).toHaveBeenCalledWith(auth)
  })
})
