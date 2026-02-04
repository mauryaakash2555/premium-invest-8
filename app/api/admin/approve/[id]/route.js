import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabaseAdmin';
import { logEventSafe } from '@/lib/db/events';
import { EmailService } from '@/lib/email/emailService';
import { emailTemplate } from '@/lib/email/templates';

export const runtime = 'nodejs';

export async function POST(request, { params }) {
  try {
    const { id } = await params;
    const approvalData = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
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

    // Update the event data with approval info
    const updatedData = {
      ...event.data,
      status: 'APPROVED',
      approved_at: new Date().toISOString(),
      content_enhanced: approvalData.content_enhanced,
      image_url: approvalData.image_url,
      affiliate_link: approvalData.affiliate_link,
      sponsored_by: approvalData.sponsored_by,
      tags: approvalData.tags_to_add || []
    };

    const { error: updateError } = await sb
      .from('events')
      .update({ data: updatedData })
      .eq('id', id);

    if (updateError) {
      throw updateError;
    }

    // Log approval event
    await logEventSafe({
      leadId: null,
      event_type: 'submission_approved',
      data: {
        original_id: id,
        title: event.data?.title,
        approved_at: new Date().toISOString()
      }
    });

    // Send approval email to author
    const authorEmail = event.data?.author_email;
    if (authorEmail) {
      const emailContent = `
        <h2>Your Story Has Been Approved! 🎉</h2>
        <p>Great news! Your submission "<strong>${event.data?.title || 'Your Story'}</strong>" has been reviewed and approved by our editorial team.</p>
        <p>It will be published on our platform shortly.</p>
        <hr />
        <p>Thank you for contributing to our community.</p>
        <p>Best regards,<br />The Premium Invest Editorial Team</p>
      `;

      await EmailService.sendRaw({
        to: authorEmail,
        subject: `✅ Your Story Has Been Approved: ${event.data?.title || 'Your Submission'}`,
        html: emailTemplate(emailContent)
      }).catch(err => console.error('Failed to send approval email:', err));
    }

    return NextResponse.json({
      success: true,
      message: 'Post approved and published',
      id
    });

  } catch (error) {
    console.error('Approval error:', error);
    return NextResponse.json(
      { error: 'Failed to approve post' },
      { status: 500 }
    );
  }
}
