import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/auth'
import connectDB from '@/lib/db/mongoose'
import Config from '@/lib/models/Config'
import { logActivity } from '@/lib/models/ActivityLog'

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    await connectDB()

    let config = await Config.findOne()

    if (!config) {
      config = await Config.create({
        systemType: 'generic',
        businessName: '',
        businessAddress: '',
        businessCountry: '',
        isConfigured: false,
      })
    }

    return NextResponse.json(config)
  } catch (error: any) {
    console.error('Get configuration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Check permission
    if (
      session.user.role !== 'admin' &&
      !session.user.permissions?.configuration?.edit
    ) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const body = await request.json()

    await connectDB()

    // Validate Morocco-specific fields
    if (body.systemType === 'morocco') {
      if (!body.ice || !/^\d{15}$/.test(body.ice)) {
        return NextResponse.json(
          { error: 'ICE must be exactly 15 digits for Morocco system' },
          { status: 400 }
        )
      }
    }

    // Validate required fields
    if (!body.businessName || !body.businessAddress || !body.businessCountry) {
      return NextResponse.json(
        { error: 'Business name, address, and country are required' },
        { status: 400 }
      )
    }

    const allowedFields = [
      'systemType', 'businessName', 'businessAddress', 'businessCity', 'businessCountry',
      'businessPostalCode', 'businessPhone', 'businessEmail', 'businessWebsite',
      'ice', 'taxeProfessionnelle', 'identifiantFiscal', 'rc', 'cnss',
      'bankName', 'bankAccountName', 'rib', 'iban', 'swift',
      'currency', 'currencySymbol', 'taxRate', 'taxName',
      'logo', 'digitalSignature', 'digitalStamp', 'primaryColor',
      'invoicePrefix', 'invoiceFooterText', 'termsAndConditions', 'defaultPaymentTerms',
      'taxReminderMonths', 'invoiceTemplate',
    ] as const

    const safeBody: Record<string, unknown> = {}
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        safeBody[field] = body[field]
      }
    }

    // Update or create config
    let config = await Config.findOne()

    if (config) {
      Object.assign(config, safeBody, { isConfigured: true })
      await config.save()
    } else {
      config = await Config.create({ ...safeBody, isConfigured: true })
    }

    // Log activity
    await logActivity(
      'config_updated',
      session.user.id,
      `${session.user.firstName} ${session.user.lastName} updated the configuration`,
      { entityType: 'config', entityId: config._id }
    )

    return NextResponse.json(config)
  } catch (error: any) {
    console.error('Update configuration error:', error)
    return NextResponse.json(
      { error: error.message || 'Internal server error' },
      { status: 500 }
    )
  }
}
