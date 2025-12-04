import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id } = body;

    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid user_id' },
        { status: 400 }
      );
    }

    // Check if feedback exists for this user_id
    const existingFeedback = await prisma.feedback.findUnique({
      where: { user_id },
    });

    if (existingFeedback) {
      return NextResponse.json({
        exists: true,
        feedback: {
          id: existingFeedback.id,
          user_id: existingFeedback.user_id,
          created_at: existingFeedback.created_at.toISOString(),
          updated_at: existingFeedback.updated_at.toISOString(),
          ratings: {
            food: existingFeedback.food,
            venue: existingFeedback.venue,
            decor: existingFeedback.decor,
            photobooth: existingFeedback.photobooth,
            giveaways: existingFeedback.giveaways,
            emcees: existingFeedback.emcees,
            games: existingFeedback.games,
            department_presentations: existingFeedback.department_presentations,
            raffle: existingFeedback.raffle,
            loyalty_awards: existingFeedback.loyalty_awards,
          },
          comment: existingFeedback.comment,
          name: existingFeedback.name,
          department: existingFeedback.department,
        },
      });
    }

    return NextResponse.json({ exists: false });
  } catch (error) {
    console.error('Error checking feedback:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
