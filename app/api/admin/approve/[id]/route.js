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
    const approvalData = await request.json();
    
    if (!id) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    let sb;
    try {
      sb = supabaseAdmin();
    } catch {
      return NextResponse.json({ ok: false, error: 'setup_required' }, { status: 503 });
    }

    // Fetch the original event
    const { data: post, error: fetchError } = await sb.from('posts').select('*').eq('id', id).single();

    if (fetchError || !post) {
      return NextResponse.json(
        { error: 'Submission not found' },
        { status: 404 }
      );
    }

    const updatedPost = {
      status: 'APPROVED',
      approved_at: new Date().toISOString(),
      content_enhanced: approvalData.content_enhanced,
      image_url: approvalData.image_url,
      affiliate_link: approvalData.affiliate_link,
      sponsored_by: approvalData.sponsored_by,
      tags: approvalData.tags_to_add || [],
    };

    let updateError;
    {
      const res = await sb.from('posts').update(updatedPost).eq('id', id);
      updateError = res.error;
    }

    if (updateError) {
      throw updateError;
    }

    // Log approval event
    await logEventSafe({
      leadId: null,
      event_type: 'submission_approved',
      data: {
        original_id: id,
        title: post?.title,
        approved_at: new Date().toISOString()
      }
    });

    // Send approval email to author
    const authorEmail = post?.author_email;
    if (authorEmail) {
      const emailContent = `
        <h2>Your Story Has Been Approved! 🎉</h2>
        <p>Great news! Your submission "<strong>${post?.title || 'Your Story'}</strong>" has been reviewed and approved by our editorial team.</p>
        <p>It will be published on our platform shortly.</p>
        <hr />
        <p>Thank you for contributing to our community.</p>
        <p>Best regards,<br />The Premium Invest Editorial Team</p>
      `;

      await EmailService.sendRaw({
        to: authorEmail,
        subject: `✅ Your Story Has Been Approved: ${post?.title || 'Your Submission'}`,
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
