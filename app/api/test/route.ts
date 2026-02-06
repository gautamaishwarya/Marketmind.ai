import { NextResponse } from 'next/server'

/**
 * Simple test endpoint to verify API routes are working
 * Access at: /api/test
 */
export async function GET() {
  return NextResponse.json(
    {
      status: 'success',
      message: '✅ API routes are working!',
      timestamp: new Date().toISOString(),
    },
    {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
      },
    }
  )
}
