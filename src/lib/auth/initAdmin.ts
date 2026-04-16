import connectDB from '@/lib/db/mongoose'
import User from '@/lib/models/User'
import crypto from 'crypto'

export async function initializeAdmin(): Promise<{ email: string; password: string } | null> {
  await connectDB()

  // Check if any admin exists
  const adminExists = await User.findOne({ role: 'admin' })

  if (adminExists) {
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
