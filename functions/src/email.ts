import { defineSecret } from 'firebase-functions/params'
import nodemailer from 'nodemailer'

export const GMAIL_APP_PASSWORD = defineSecret('GMAIL_APP_PASSWORD')

export const SENDER_EMAIL = 'jmhooson48@gmail.com'
export const SHOP_EMAIL = 'zenoasisnz@gmail.com'

// Callers must list GMAIL_APP_PASSWORD in their function's `secrets`.
export function createMailTransport() {
  return nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: SENDER_EMAIL,
      pass: GMAIL_APP_PASSWORD.value(),
    },
  })
}
