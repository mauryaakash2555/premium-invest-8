import { NextResponse } from 'next/server';
import { cookies, headers } from 'next/headers';
import { isAdminFromRequest } from '@/lib/adminSession';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logEventSafe } from '@/lib/db/events';
import { EmailService } from '@/lib/email/emailService';
import { emailTemplate } from '@/lib/email/templates';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  try {
    const cookieStore = await cookies();
    const headerStore = await headers();
    if (!isAdminFromRequest(cookieStore, headerStore)) {
      return NextResponse.json({ ok: false, error: 'unauthorized' }, { status: 401 });
    }

    const id = params?.id;
    const rejectionData = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    if (!rejectionData.reason) {
      return NextResponse.json(
        { error: 'Rejection reason is required' },
        { status: 400 }
      );
    }

    let sb;
    try {
      sb = supabaseAdmin();
    } catch {
      return NextResponse.json({ ok: false, error: 'setup_required' }, { status: 503 });
    }

    const { data: post, error: fetchError } = await sb.from('posts').select('*').eq('id', id).single();

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    const updatedPost = {
      status: 'REJECTED',
      rejected_at: new Date().toISOString(),
      rejection_reason: rejectionData.reason,
    };

    const { error: updateError } = await sb.from('posts').update(updatedPost).eq('id', id);

    if (updateError) {
      throw updateError;
    }

    // Log rejection event
    await logEventSafe({
      leadId: null,
      event_type: 'submission_rejected',
      data: {
        original_id: id,
        title: post?.title,
        reason: rejectionData.reason,
        rejected_at: new Date().toISOString()
      }
    });

    // Send rejection email to author
    const authorEmail = post?.author_email;
    if (authorEmail) {
      const emailContent = `
        <h2>Update on Your Submission</h2>
        <p>Thank you for submitting "<strong>${post?.title || 'Your Story'}</strong>".</p>
        <p>After careful review, our editorial team has decided not to publish this submission at this time.</p>
        <hr />
        <p><strong>Feedback from our team:</strong></p>
        <p style="padding: 12px; background: #f5f5f5; border-left: 4px solid #ccc;">${rejectionData.reason}</p>
        <hr />
        <p>We encourage you to review the feedback and consider resubmitting with revisions if applicable.</p>
        <p>Best regards,<br />The Premium Invest Editorial Team</p>
      `;

      await EmailService.sendRaw({
        to: authorEmail,
        subject: `Update on Your Submission: ${post?.title || 'Your Story'}`,
        html: emailTemplate(emailContent)
      }).catch(err => console.error('Failed to send rejection email:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Post rejected',
      id
    });

  } catch (error) {
    console.error('Rejection error:', error);
    return NextResponse.json(
      { error: 'Failed to reject post' },
      { status: 500 }
    );
  }
}
