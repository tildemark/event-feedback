import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Get all feedback ordered by most recent
    const feedbacks = await prisma.feedback.findMany({
      orderBy: {
        created_at: 'desc',
      },
    });

    // Calculate statistics
    const totalResponses = feedbacks.length;
    
    const stats = {
      total_responses: totalResponses,
      average_ratings: {
        food: feedbacks.reduce((sum, f) => sum + f.food, 0) / totalResponses || 0,
        venue: feedbacks.reduce((sum, f) => sum + f.venue, 0) / totalResponses || 0,
        decor: feedbacks.reduce((sum, f) => sum + f.decor, 0) / totalResponses || 0,
        photobooth: feedbacks.reduce((sum, f) => sum + f.photobooth, 0) / totalResponses || 0,
        giveaways: feedbacks.reduce((sum, f) => sum + f.giveaways, 0) / totalResponses || 0,
        emcees: feedbacks.reduce((sum, f) => sum + f.emcees, 0) / totalResponses || 0,
        games: feedbacks.reduce((sum, f) => sum + f.games, 0) / totalResponses || 0,
        department_presentations: feedbacks.reduce((sum, f) => sum + f.department_presentations, 0) / totalResponses || 0,
        raffle: feedbacks.reduce((sum, f) => sum + f.raffle, 0) / totalResponses || 0,
        loyalty_awards: feedbacks.reduce((sum, f) => sum + f.loyalty_awards, 0) / totalResponses || 0,
      },
      with_comments: feedbacks.filter(f => f.comment).length,
      with_names: feedbacks.filter(f => f.name).length,
      departments: [...new Set(feedbacks.filter(f => f.department).map(f => f.department))],
    };

    // Format responses for export
    const responses = feedbacks.map(f => ({
      id: f.id,
      submitted_at: f.created_at.toISOString(),
      updated_at: f.updated_at.toISOString(),
      name: f.name || 'Anonymous',
      department: f.department || 'Not Specified',
      ratings: {
        food: f.food,
        venue: f.venue,
        decor: f.decor,
        photobooth: f.photobooth,
        giveaways: f.giveaways,
        emcees: f.emcees,
        games: f.games,
        department_presentations: f.department_presentations,
        raffle: f.raffle,
        loyalty_awards: f.loyalty_awards,
      },
      comment: f.comment || '',
    }));

    return NextResponse.json({
      stats,
      responses,
    });
  } catch (error) {
    console.error('Error fetching report:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
