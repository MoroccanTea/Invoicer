import connectDB from '@/lib/db/mongoose'
import User from '@/lib/models/User'
import crypto from 'crypto'

let adminInitialized = false

export async function initializeAdmin(): Promise<{ email: string; password: string } | null> {
  if (adminInitialized) return null

  await connectDB()

  const adminExists = await User.findOne({ role: 'admin' })

  if (adminExists) {
    adminInitialized = true
    return null
  }

  // Generate random password
  const generatedPassword = crypto.randomBytes(12).toString('base64').slice(0, 16)

  // Create admin user
  const admin = new User({
    email: 'admin@invoicer.com',
    password: generatedPassword,
    firstName: 'Admin',
    lastName: 'User',
    role: 'admin',
    mustChangePassword: true,
    isActive: true,
  })

  await admin.save()
  adminInitialized = true

  console.log('='.repeat(60))
  console.log('INITIAL ADMIN CREDENTIALS')
  console.log('='.repeat(60))
  console.log(`Email: admin@invoicer.com`)
  console.log(`Password: ${generatedPassword}`)
  console.log('='.repeat(60))
  console.log('IMPORTANT: Change this password immediately after first login!')
  console.log('='.repeat(60))

  return {
    email: 'admin@invoicer.com',
    password: generatedPassword,
  }
}
