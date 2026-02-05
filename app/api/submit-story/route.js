import { NextResponse } from 'next/server';
import { logEventSafe } from '@/lib/db/events';
import { EmailService } from '@/lib/email/emailService';
import { emailTemplate } from '@/lib/email/templates';
import { EmailPreferencesDB } from '@/lib/db/emailPreferences';
import { supabaseAdmin } from '@/lib/supabaseAdmin';

export const runtime = 'nodejs';

export async function POST(request) {
  try {
    const data = await request.json();
    
    // Validate required fields
    if (!data.title || !data.author_email || !data.type) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.author_email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Validate phone (10 digits) if provided
    if (data.author_phone && !/^[0-9]{10}$/.test(data.author_phone)) {
      return NextResponse.json(
        { error: 'Phone number must be 10 digits' },
        { status: 400 }
      );
    }

    // Determine event type based on submission type
    const eventType = data.type === 'impact' ? 'submission_impact' : 'submission_guest';

    // Log submission to Supabase events
    await logEventSafe({
      leadId: null,
      event_type: eventType,
      data: {
        ...data,
        status: 'PENDING',
        received_at: new Date().toISOString()
      }
    });

    // Insert into posts (single source of truth) - best-effort.
    try {
      const sb = supabaseAdmin();
      const pillar = String(data.type || '').toLowerCase() === 'impact' ? 'IMPACT' : 'GUEST';
      const contentOriginal = String(data.type || '').toLowerCase() === 'impact'
        ? String(data.what_happened || data.incident_description || '')
        : String(data.article_content || '');

      await sb
        .from('posts')
        .insert({
          pillar,
          status: 'PENDING',
          title: data.title,
          author_name: data.author_name || null,
          author_email: data.author_email,
          author_phone: data.author_phone || null,
          content_original: contentOriginal,
          content_enhanced: null,
          location: data.location || data.where_happened || null,
          expertise_area: data.expertise_area || null,
          author_credentials: data.author_credentials || null,
          author_bio: data.author_bio || null,
          author_linkedin: data.author_linkedin || null,
          tags: [],
          views: 0,
        })
        .throwOnError();
    } catch {
      // ignore if posts schema/env isn't configured yet
    }

    // Send notification email to admin
    const prefs = await EmailPreferencesDB.getSafe();
    const adminEmail = String(
      process.env.SUBMISSIONS_NOTIFY_EMAIL || 
      process.env.EDITORIAL_INBOX_EMAIL || 
      prefs?.email_address || ''
    ).trim();

    if (adminEmail) {
      const emailContent = `
        <h2>New ${data.type === 'impact' ? 'Community Impact' : 'Guest Column'} Submission</h2>
        <p><strong>Title:</strong> ${data.title}</p>
        <p><strong>Author:</strong> ${data.author_name} (${data.author_email})</p>
        ${data.location ? `<p><strong>Location:</strong> ${data.location}</p>` : ''}
        ${data.expertise_area ? `<p><strong>Expertise:</strong> ${data.expertise_area}</p>` : ''}
        <hr />
        <p>Review this submission in the <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'https://premiuminvest.in'}/admin/queue">Admin Queue</a></p>
      `;

      await EmailService.sendRaw({
        to: adminEmail,
        subject: `New Submission: ${data.title}`,
        html: emailTemplate(emailContent)
      }).catch(err => console.error('Failed to send admin notification:', err));
    }

    // Send confirmation email to author
    const authorConfirmation = `
      <h2>Thank You for Your Submission!</h2>
      <p>We've received your ${data.type === 'impact' ? 'community impact story' : 'guest column'}: "<strong>${data.title}</strong>"</p>
      <p>Our editorial team will review it within 48-72 hours. We'll contact you at ${data.author_email} with any updates.</p>
      <hr />
      <p>Best regards,<br />The Premium Invest Editorial Team</p>
    `;

    await EmailService.sendRaw({
      to: data.author_email,
      subject: `Submission Received: ${data.title}`,
      html: emailTemplate(authorConfirmation)
    }).catch(err => console.error('Failed to send author confirmation:', err));

    return NextResponse.json({
      success: true,
      message: 'Story submitted successfully',
      id: `submission_${Date.now()}`
    });

  } catch (error) {
    console.error('Submission error:', error);
    return NextResponse.json(
      { error: 'Failed to submit story. Please try again.' },
      { status: 500 }
    );
  }
}

// Health check endpoint
export async function GET() {
  return NextResponse.json({
    status: 'ok',
    message: 'Story submission API is running'
  });
}
