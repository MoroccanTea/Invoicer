import { NextResponse } from 'next/server'
import { buildOpenAPISpec } from '@/lib/swagger'

export const dynamic = 'force-dynamic'

export function GET() {
  return NextResponse.json(buildOpenAPISpec())
}
