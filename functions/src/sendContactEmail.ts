import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import * as admin from 'firebase-admin'
import nodemailer from 'nodemailer'

const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD')

const SENDER_EMAIL = 'jmhooson48@gmail.com'
const RECIPIENT_EMAIL = 'zenoasisnz@gmail.com'

const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000
const RATE_LIMIT_MAX_REQUESTS = 5

interface ContactRequestBody {
  name: string
  email: string
  subject: string
  message: string
}

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

// Per-IP sliding-window limiter backed by Firestore so it holds across
// Cloud Functions instances (an in-memory counter wouldn't).
async function checkRateLimit(ip: string): Promise<boolean> {
  const db = admin.firestore()
  const rateLimitRef = db.collection('rateLimits').doc(`contact_${ip}`)
  const now = Date.now()

  return db.runTransaction(async (tx) => {
    const snap = await tx.get(rateLimitRef)
    const data = snap.data() as { windowStart: number; count: number } | undefined

    if (!data || now - data.windowStart > RATE_LIMIT_WINDOW_MS) {
      tx.set(rateLimitRef, { windowStart: now, count: 1 })
      return true
    }

    if (data.count >= RATE_LIMIT_MAX_REQUESTS) {
      return false
    }

    tx.update(rateLimitRef, { count: admin.firestore.FieldValue.increment(1) })
    return true
  })
}

export const sendContactEmail = onRequest(
  { cors: true, secrets: [GMAIL_APP_PASSWORD] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
      return
    }

    const forwardedFor = req.headers['x-forwarded-for']
    const ip =
      (typeof forwardedFor === 'string' ? forwardedFor.split(',')[0].trim() : undefined) ||
      req.ip ||
      'unknown'

    const allowed = await checkRateLimit(ip)
    if (!allowed) {
      res.status(429).json({ error: 'Too many requests. Please try again later.' })
      return
    }

    const { name, email, subject, message } = req.body as ContactRequestBody

    if (
      !isNonEmptyString(name, 200) ||
      !isNonEmptyString(email, 200) ||
      !isNonEmptyString(message, 5000) ||
      (subject !== undefined && typeof subject !== 'string')
    ) {
      res.status(400).json({ error: 'Invalid contact form submission' })
      return
    }

    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: SENDER_EMAIL,
        pass: GMAIL_APP_PASSWORD.value(),
      },
    })

    try {
      await transporter.sendMail({
        from: `Zen Oasis Contact Form <${SENDER_EMAIL}>`,
        to: RECIPIENT_EMAIL,
        replyTo: email,
        subject: `Contact form: ${subject?.trim() || 'New message'}`,
        text: `From: ${name} <${email}>\n\n${message}`,
      })

      res.json({ success: true })
    } catch (error) {
      console.error('Failed to send contact email:', error)
      res.status(500).json({ error: 'Failed to send message' })
    }
  }
)
