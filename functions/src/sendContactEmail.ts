import { onRequest } from 'firebase-functions/v2/https'
import { defineSecret } from 'firebase-functions/params'
import nodemailer from 'nodemailer'

const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD')

const SENDER_EMAIL = 'jmhooson48@gmail.com'
const RECIPIENT_EMAIL = 'zenoasisnz@gmail.com'

interface ContactRequestBody {
  name: string
  email: string
  subject: string
  message: string
}

function isNonEmptyString(value: unknown, maxLength: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= maxLength
}

export const sendContactEmail = onRequest(
  { cors: true, secrets: [GMAIL_APP_PASSWORD] },
  async (req, res) => {
    if (req.method !== 'POST') {
      res.status(405).json({ error: 'Method not allowed' })
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
