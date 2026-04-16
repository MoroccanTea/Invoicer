import mongoose from 'mongoose'
import { NextResponse } from 'next/server'

export function isValidObjectId(id: string): boolean {
  return mongoose.Types.ObjectId.isValid(id)
}

export function invalidIdResponse() {
  return NextResponse.json({ error: 'Invalid ID' }, { status: 400 })
}
