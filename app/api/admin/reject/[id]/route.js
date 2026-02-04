import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logEventSafe } from '@/lib/db/events';
import { EmailService } from '@/lib/email/emailService';
import { emailTemplate } from '@/lib/email/templates';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
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

    const sb = supabaseAdmin();

    // Fetch the original event
    const { data: event, error: fetchError } = await sb
      .from('events')
      .select('*')
      .eq('id', id)
      .single();

    if (fetchError || !event) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    // Update the event data with rejection info
    const updatedData = {
      ...event.data,
      status: 'REJECTED',
      rejected_at: new Date().toISOString(),
      rejection_reason: rejectionData.reason
    };

    const { error: updateError } = await sb
      .from('events')
      .update({ data: updatedData })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    // Log rejection event
    await logEventSafe({
      leadId: null,
      event_type: 'submission_rejected',
      data: {
        original_id: id,
        title: event.data?.title,
        reason: rejectionData.reason,
        rejected_at: new Date().toISOString()
      }
    });

    // Send rejection email to author
    const authorEmail = event.data?.author_email;
    if (authorEmail) {
      const emailContent = `
        <h2>Update on Your Submission</h2>
        <p>Thank you for submitting "<strong>${event.data?.title || 'Your Story'}</strong>".</p>
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
        subject: `Update on Your Submission: ${event.data?.title || 'Your Story'}`,
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
