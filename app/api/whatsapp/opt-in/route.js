/**
 * WhatsApp Opt-In API for Live Intelligence
 * 
 * Handles user subscriptions for daily WhatsApp updates.
 * Stores preferences in Supabase.
 * 
 * @file app/api/whatsapp/opt-in/route.js
 * @created January 13, 2026
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

function getSupabase() {
  if (!supabaseUrl || !supabaseKey) return null;
  return createClient(supabaseUrl, supabaseKey);
}

export const dynamic = 'force-dynamic';

/**
 * POST - Subscribe to WhatsApp updates
 */
export async function POST(request) {
  try {
    const { phone, type, preferences } = await request.json();

    // Validate phone number
    if (!phone || !/^[6-9]\d{9}$/.test(phone)) {
      return NextResponse.json(
        { error: 'Invalid phone number. Please enter a valid 10-digit Indian mobile number.' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    if (!supabase) {
      // Log subscription if Supabase not configured
      console.log('[WhatsApp Opt-In]', { phone: phone.slice(-4), type, preferences });
      return NextResponse.json({ success: true, stored: false });
    }

    // Check if already subscribed
    const { data: existing } = await supabase
      .from('whatsapp_subscribers')
      .select('id, is_active')
      .eq('phone', `+91${phone}`)
      .single();

    if (existing) {
      // Reactivate if previously unsubscribed
      if (!existing.is_active) {
        await supabase
          .from('whatsapp_subscribers')
          .update({
            is_active: true,
            preferences,
            updated_at: new Date().toISOString(),
          })
          .eq('id', existing.id);
      }
      
      return NextResponse.json({ 
        success: true, 
        message: 'Subscription updated',
        isReactivation: !existing.is_active,
      });
    }

    // Create new subscription
    const { error } = await supabase
      .from('whatsapp_subscribers')
      .insert({
        phone: `+91${phone}`,
        subscription_type: type || 'live_intelligence',
        preferences: preferences || { morning: true, night: true },
        is_active: true,
        source: 'live_intelligence_page',
        created_at: new Date().toISOString(),
      });

    if (error) {
      console.error('WhatsApp opt-in error:', error);
      return NextResponse.json(
        { error: 'Failed to subscribe. Please try again.' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Successfully subscribed to daily updates',
    });
  } catch (error) {
    console.error('WhatsApp opt-in API error:', error);
    return NextResponse.json(
      { error: 'Something went wrong. Please try again.' },
      { status: 500 }
    );
  }
}

/**
 * DELETE - Unsubscribe from WhatsApp updates
 */
export async function DELETE(request) {
  try {
    const phone = request.nextUrl.searchParams.get('phone');

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number required' },
        { status: 400 }
      );
    }

    const supabase = getSupabase();

    if (!supabase) {
      return NextResponse.json({ success: true });
    }

    // Soft delete (set is_active to false)
    await supabase
      .from('whatsapp_subscribers')
      .update({
        is_active: false,
        unsubscribed_at: new Date().toISOString(),
      })
      .eq('phone', phone.startsWith('+91') ? phone : `+91${phone}`);

    return NextResponse.json({
      success: true,
      message: 'Successfully unsubscribed',
    });
  } catch (error) {
    console.error('WhatsApp unsubscribe error:', error);
    return NextResponse.json(
      { error: 'Failed to unsubscribe' },
      { status: 500 }
    );
  }
}
