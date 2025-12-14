// Vercel Serverless Function - Contact Form Handler
// This runs on Vercel's edge network (instant, no cold start)

const { MongoClient } = require('mongodb');
const nodemailer = require('nodemailer');

// CORS headers for frontend
const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

module.exports = async (req, res) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return res.status(200).json({ message: 'OK' });
  }

  // Only allow POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { name, email, phone, message, recaptcha_token } = req.body;

    // Validate input
    if (!name || !email || !phone || !message) {
      return res.status(400).json({ 
        detail: 'All fields are required' 
      });
    }

    // Verify reCAPTCHA (optional - skip if token not provided)
    if (recaptcha_token && process.env.RECAPTCHA_SECRET_KEY) {
      const recaptchaResponse = await fetch('https://www.google.com/recaptcha/api/siteverify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: `secret=${process.env.RECAPTCHA_SECRET_KEY}&response=${recaptcha_token}`,
      });
      
      const recaptchaData = await recaptchaResponse.json();
      
      if (!recaptchaData.success || recaptchaData.score < 0.5) {
        return res.status(400).json({ 
          detail: 'reCAPTCHA verification failed' 
        });
      }
    }

    // Save to MongoDB (required - but with better error handling)
    let mongoSuccess = false;
    let mongoError = null;
    if (process.env.MONGODB_URI) {
      try {
        const client = await MongoClient.connect(process.env.MONGODB_URI, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
          serverSelectionTimeoutMS: 10000, // 10 second timeout
        });
        
        const db = client.db('bmwealth');
        const collection = db.collection('contacts');
        
        await collection.insertOne({
          name,
          email,
          phone,
          message,
          submitted_at: new Date(),
          source: 'website_contact_form',
        });
        
        await client.close();
        mongoSuccess = true;
      } catch (mongoErr) {
        mongoError = mongoErr;
        console.error('MongoDB error:', mongoErr.message);
        console.error('MongoDB error code:', mongoErr.code);
        console.error('MongoDB error name:', mongoErr.name);
        // Log but don't fail - form can still succeed
      }
    } else {
      console.warn('MONGODB_URI not set in environment variables');
      mongoError = new Error('MONGODB_URI environment variable not set');
    }
    
    // If MongoDB failed, log it but continue (form still succeeds)
    if (!mongoSuccess && mongoError) {
      console.error('MongoDB save failed, but form submission will still succeed');
    }

    // Send email notification (optional - won't fail if email fails)
    let emailSuccess = false;
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
      try {
        const transporter = nodemailer.createTransport({
          service: 'gmail',
          auth: {
            user: process.env.EMAIL_USER,
            pass: process.env.EMAIL_PASS,
          },
        });

        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: `New Contact Form Submission - ${name}`,
          html: `
            <h2>New Contact Form Submission</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Phone:</strong> ${phone}</p>
            <p><strong>Message:</strong></p>
            <p>${message}</p>
            <hr>
            <p><small>Submitted at: ${new Date().toLocaleString('en-IN', { timeZone: 'Asia/Kolkata' })}</small></p>
          `,
        });
        emailSuccess = true;
      } catch (emailError) {
        console.error('Email error:', emailError.message);
        // Don't fail the request if email fails - it's optional
        // Form submission still succeeds, just no email notification
      }
    } else {
      console.warn('EMAIL_USER or EMAIL_PASS not set - email notifications disabled');
    }

    // Success response (even if email failed, form submission succeeded)
    return res.status(200).json({ 
      message: 'Contact form submitted successfully',
      success: true,
      saved: mongoSuccess,
      emailSent: emailSuccess
    });

  } catch (error) {
    console.error('Contact form error:', error);
    console.error('Error details:', {
      message: error.message,
      stack: error.stack,
      mongodbUri: process.env.MONGODB_URI ? 'Set' : 'Not set',
      emailUser: process.env.EMAIL_USER ? 'Set' : 'Not set'
    });
    
    // More specific error messages
    let errorMessage = 'Internal server error. Please try again or contact us via WhatsApp.';
    
    if (error.message?.includes('MongoServerError') || error.message?.includes('MongoNetworkError')) {
      errorMessage = 'Database connection error. Please try again in a moment or contact us via WhatsApp.';
    } else if (error.message?.includes('timeout')) {
      errorMessage = 'Request timeout. Please try again or contact us via WhatsApp.';
    }
    
    return res.status(500).json({ 
      detail: errorMessage 
    });
  }
};
