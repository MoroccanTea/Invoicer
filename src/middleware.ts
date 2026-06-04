import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'

export async function middleware(request: NextRequest) {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })

  if (!token) {
    const isApiRoute = request.nextUrl.pathname.startsWith('/api/')

    if (isApiRoute) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const loginUrl = new URL('/login', request.url)
    loginUrl.searchParams.set('callbackUrl', request.nextUrl.pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/api/users/:path*',
    '/api/clients/:path*',
    '/api/projects/:path*',
    '/api/invoices/:path*',
    '/api/configuration/:path*',
    '/api/profile/:path*',
    '/api/notifications/:path*',
  ],
}
