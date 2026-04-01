import { db, admin } from './lib/firestore.js'

const ADMIN_EMAIL = 'tripletech126@gmail.com'

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' })

  const authHeader = req.headers.authorization
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'No token provided' })
  }

  try {
    const decoded = await admin.auth().verifyIdToken(authHeader.slice(7))
    if (decoded.email !== ADMIN_EMAIL) {
      return res.status(403).json({ error: 'Access denied' })
    }
  } catch {
    return res.status(401).json({ error: 'Invalid token' })
  }

  try {
    const snapshot = await db.collection('submissions')
      .orderBy('createdAt', 'desc')
      .limit(500)
      .get()

    const submissions = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data(),
      createdAt: doc.data().createdAt?.toDate?.()?.toISOString() || null,
    }))

    res.json({ submissions })
  } catch (err) {
    console.error('Failed to fetch submissions:', err.message)
    res.status(500).json({ error: 'Failed to fetch submissions' })
  }
}
