import { NextResponse } from 'next/server';

const BACKEND_URL = process.env.BACKEND_URL || 'https://bmwealth-backend.onrender.com';

// GET comments for a post
export async function GET(request, { params }) {
  try {
    const postId = params.postId;
    
    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    const response = await fetch(`${BACKEND_URL}/api/comments/${postId}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      // If backend doesn't have this endpoint yet, return empty comments
      if (response.status === 404) {
        return NextResponse.json({ comments: [], count: 0 });
      }
      throw new Error(`Backend error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json(data);

  } catch (error) {
    console.error('[Comments API] GET error:', error);
    // Return empty comments on error to prevent UI breakage
    return NextResponse.json({ comments: [], count: 0 });
  }
}

// POST a new comment
export async function POST(request, { params }) {
  try {
    const postId = params.postId;
    const body = await request.json();

    if (!postId) {
      return NextResponse.json(
        { error: 'Post ID is required' },
        { status: 400 }
      );
    }

    // Validate required fields
    const { name, email, comment } = body;
    if (!name || !email || !comment) {
      return NextResponse.json(
        { error: 'Name, email, and comment are required' },
        { status: 400 }
      );
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Sanitize comment (basic XSS prevention)
    const sanitizedComment = comment
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .trim();

    const response = await fetch(`${BACKEND_URL}/api/comments/${postId}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        comment: sanitizedComment,
        postId,
        timestamp: new Date().toISOString(),
        ip: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown'
      })
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.message || `Backend error: ${response.status}`);
    }

    const data = await response.json();
    return NextResponse.json({
      success: true,
      message: 'Comment submitted for moderation',
      comment: data
    });

  } catch (error) {
    console.error('[Comments API] POST error:', error);
    return NextResponse.json(
      { error: 'Failed to submit comment. Please try again.' },
      { status: 500 }
    );
  }
}
