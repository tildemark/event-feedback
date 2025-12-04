import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST() {
  try {
    // Delete all feedback records
    const result = await prisma.feedback.deleteMany({});
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} feedback records`,
      count: result.count,
    });
  } catch (error) {
    console.error('Error resetting data:', error);
    return NextResponse.json(
      { 
        error: 'Failed to reset data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
