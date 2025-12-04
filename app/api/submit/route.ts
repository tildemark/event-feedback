import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import type { Ratings } from '@/lib/types';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { user_id, ratings, comment, name, department } = body;

    // Validation
    if (!user_id || typeof user_id !== 'string') {
      return NextResponse.json(
        { error: 'Invalid user_id' },
        { status: 400 }
      );
    }

    if (!ratings || typeof ratings !== 'object') {
      return NextResponse.json(
        { error: 'Ratings are required' },
        { status: 400 }
      );
    }

    // Validate all rating categories exist and are between 1-5
    const requiredCategories = [
      'food',
      'venue',
      'decor',
      'photobooth',
      'giveaways',
      'emcees',
      'games',
      'department_presentations',
      'raffle',
      'loyalty_awards',
    ];

    for (const category of requiredCategories) {
      const value = (ratings as Ratings)[category as keyof Ratings];
      if (typeof value !== 'number' || value < 1 || value > 5) {
        return NextResponse.json(
          { error: `Invalid rating for ${category}. Must be between 1 and 5.` },
          { status: 400 }
        );
      }
    }

    // Get user agent
    const user_agent = request.headers.get('user-agent') || undefined;

    // UPSERT operation
    const feedback = await prisma.feedback.upsert({
      where: { user_id },
      update: {
        food: ratings.food,
        venue: ratings.venue,
        decor: ratings.decor,
        photobooth: ratings.photobooth,
        giveaways: ratings.giveaways,
        emcees: ratings.emcees,
        games: ratings.games,
        department_presentations: ratings.department_presentations,
        raffle: ratings.raffle,
        loyalty_awards: ratings.loyalty_awards,
        comment: comment || null,
        name: name || null,
        department: department || null,
        user_agent,
      },
      create: {
        user_id,
        food: ratings.food,
        venue: ratings.venue,
        decor: ratings.decor,
        photobooth: ratings.photobooth,
        giveaways: ratings.giveaways,
        emcees: ratings.emcees,
        games: ratings.games,
        department_presentations: ratings.department_presentations,
        raffle: ratings.raffle,
        loyalty_awards: ratings.loyalty_awards,
        comment: comment || null,
        name: name || null,
        department: department || null,
        user_agent,
      },
    });

    return NextResponse.json({
      success: true,
      isUpdate: !!feedback.id,
      message: feedback.id ? 'Feedback updated successfully' : 'Feedback submitted successfully',
    });
  } catch (error) {
    console.error('Error submitting feedback:', error);
    console.error('Error details:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined,
      DATABASE_URL: process.env.DATABASE_URL ? 'Set' : 'Not set',
    });
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
