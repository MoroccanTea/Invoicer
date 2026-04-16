import mongoose, { Schema, Document, Model } from 'mongoose'

export interface ICounter extends Omit<Document, '_id'> {
  _id: string // Format: "MM-YYYY-CATEGORY"
  seq: number
}

const counterSchema = new Schema<ICounter>({
  _id: { type: String, required: true },
  seq: { type: Number, default: 0 },
})

const Counter: Model<ICounter> =
  mongoose.models.Counter || mongoose.model<ICounter>('Counter', counterSchema)

export async function getNextInvoiceNumber(
  category: string,
  date: Date = new Date()
): Promise<string> {
  const month = String(date.getMonth() + 1).padStart(2, '0')
  const year = date.getFullYear()

  // Map category to short code
  const categoryMap: Record<string, string> = {
    teaching: 'TCH',
    software_development: 'DEV',
    consulting: 'CON',
    pentesting: 'PEN',
  }

  const categoryCode = categoryMap[category] || 'GEN'
  const counterId = `${month}-${year}-${categoryCode}`

  const counter = await Counter.findByIdAndUpdate(
    counterId,
    { $inc: { seq: 1 } },
    { new: true, upsert: true }
  )

  const sequenceNumber = String(counter.seq).padStart(3, '0')
  return `${month}-${year}-${categoryCode}-${sequenceNumber}`
}

export default Counter
