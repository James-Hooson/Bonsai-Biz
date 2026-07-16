// Minimal in-memory stand-in for the pieces of the Admin Firestore SDK that
// createCheckoutSession.ts / stripeWebhook.ts actually use: doc get/create/update
// and single-document transactions. Not a general-purpose Firestore emulator.

export interface FakeDocRef {
  id: string
  collectionName: string
  get(): Promise<{ exists: boolean; data: () => Record<string, unknown> | undefined }>
  create(data: Record<string, unknown>): Promise<void>
  update(data: Record<string, unknown>): Promise<void>
  set(data: Record<string, unknown>): Promise<void>
}

export interface FakeTransaction {
  get(ref: FakeDocRef): Promise<{ exists: boolean; data: () => Record<string, unknown> | undefined }>
  update(ref: FakeDocRef, data: Record<string, unknown>): void
  set(ref: FakeDocRef, data: Record<string, unknown>): void
}

export function createFakeFirestore(seed: Record<string, Record<string, Record<string, unknown>>> = {}) {
  const store: Record<string, Record<string, Record<string, unknown>>> = {}
  for (const [collectionName, docs] of Object.entries(seed)) {
    store[collectionName] = { ...docs }
  }

  const getCollection = (name: string) => (store[name] ??= {})

  function makeDocRef(collectionName: string, id: string): FakeDocRef {
    return {
      id,
      collectionName,
      async get() {
        const data = getCollection(collectionName)[id]
        return { exists: data !== undefined, data: () => data }
      },
      async create(data) {
        const coll = getCollection(collectionName)
        if (coll[id] !== undefined) {
          throw new Error('ALREADY_EXISTS: document already exists')
        }
        coll[id] = { ...data }
      },
      async update(data) {
        const coll = getCollection(collectionName)
        coll[id] = { ...(coll[id] ?? {}), ...data }
      },
      async set(data) {
        getCollection(collectionName)[id] = { ...data }
      },
    }
  }

  return {
    store,
    collection(name: string) {
      return { doc: (id: string) => makeDocRef(name, id) }
    },
    async runTransaction<T>(fn: (tx: FakeTransaction) => Promise<T>): Promise<T> {
      const tx: FakeTransaction = {
        get: (ref) => ref.get(),
        update: (ref, data) => {
          const coll = getCollection(ref.collectionName)
          coll[ref.id] = { ...(coll[ref.id] ?? {}), ...data }
        },
        set: (ref, data) => {
          getCollection(ref.collectionName)[ref.id] = { ...data }
        },
      }
      return fn(tx)
    },
  }
}

export type FakeFirestore = ReturnType<typeof createFakeFirestore>
