import { FieldValue, type Firestore, type DocumentReference } from 'firebase-admin/firestore'

interface StockItem {
  productId: string
  quantity: number
}

// A cart can list the same product more than once; stock is checked and
// adjusted per product, so fold those lines together first.
export function quantitiesByProduct(items: StockItem[]): Map<string, number> {
  const totals = new Map<string, number>()
  for (const item of items) {
    totals.set(item.productId, (totals.get(item.productId) ?? 0) + item.quantity)
  }
  return totals
}

// Flips a pending order to 'expired' and returns any stock it reserved at
// checkout. Only the transaction that makes the pending -> expired transition
// returns stock, so a Stripe expiry webhook arriving after an explicit cancel
// (or a redelivered webhook) can't return it twice. Returns whether it did so.
export async function releasePendingOrder(
  db: Firestore,
  orderRef: DocumentReference,
): Promise<boolean> {
  return db.runTransaction(async (tx) => {
    const orderSnap = await tx.get(orderRef)
    const order = orderSnap.data()
    if (order?.status !== 'pending') return false

    const quantities = order.stockReserved
      ? quantitiesByProduct((order.items ?? []) as StockItem[])
      : new Map<string, number>()
    const productRefs = [...quantities.keys()].map((id) => db.collection('products').doc(id))
    const productSnaps = await Promise.all(productRefs.map((ref) => tx.get(ref)))

    tx.update(orderRef, {
      status: 'expired',
      updatedAt: FieldValue.serverTimestamp(),
    })
    productSnaps.forEach((snap, i) => {
      if (!snap.exists) return
      const stock: number = (snap.data()?.stock ?? 0) + quantities.get(productRefs[i].id)!
      tx.update(productRefs[i], { stock, inStock: stock > 0 })
    })
    return true
  })
}
