import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { isAdminFromRequest } from '@/lib/adminSession';
import { EventsDB } from '@/lib/db/events';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function GET() {
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();
    if (!isAdminFromRequest(cookieStore, headerStore)) {
      return NextResponse.json({ ok: false, error: 'unauthorized', submissions: [] }, { status: 401 });
    }

    try {
      supabaseAdmin();
    } catch {
      return NextResponse.json({ ok: false, error: 'setup_required', submissions: [] }, { status: 503 });
    }

    // Fetch submission events from Supabase
    const { events, error } = await EventsDB.getAll({
      eventTypes: ['submission_impact', 'submission_guest'],
      limit: 100,
      newestFirst: true
    });

    if (error) {
      console.error('Queue fetch error:', error);
      return NextResponse.json(
        { error: 'Failed to fetch queue', submissions: [] },
        { status: 500 }
      );
    }

    // Transform events to submission format for admin queue
    // Filter to only show pending (not yet approved/rejected)
    const submissions = events
      .filter(event => {
        // Check if submission hasn't been processed yet
        const data = event.data || {};
        return !data.status || data.status === 'PENDING';
      })
      .map(event => {
        const data = event.data || {};
        return {
          _id: event.id,
          type: event.event_type === 'submission_impact' ? 'impact' : 'guest',
          title: data.title || 'Untitled',
          author_name: data.author_name || 'Unknown',
          author_email: data.author_email || '',
          submitted_at: data.received_at || event.created_at,
          // Impact-specific fields
          incident_description: data.what_happened || data.incident_description || '',
          location: data.where_happened || data.location || '',
          evidence: data.evidence_proof || data.evidence || '',
          impact_result: data.impact_result || '',
          people_affected: data.who_affected || data.people_affected || '',
          proposed_solution: data.proposed_solution || '',
          publish_anonymously: data.anonymous || data.publish_anonymously || false,
          visual_keywords: data.visual_keywords || data.location_tag || '',
          // Guest-specific fields
          article_content: data.article_content || '',
          expertise_area: data.expertise_area || '',
          author_credentials: data.author_credentials || '',
          author_bio: data.author_bio || '',
          author_linkedin: data.author_linkedin || '',
          sources_references: data.sources_references || ''
        };
      });

    return NextResponse.json({ submissions });

  } catch (error) {
    console.error('Queue fetch error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch queue', submissions: [] },
      { status: 500 }
    );
  }
}
