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

    // Save to MongoDB
    if (process.env.MONGODB_URI) {
      const client = await MongoClient.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
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
    }

    // Send email notification
    if (process.env.EMAIL_USER && process.env.EMAIL_PASS) {
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
    }

    // Success response
    return res.status(200).json({ 
      message: 'Contact form submitted successfully',
      success: true 
    });

  } catch (error) {
    console.error('Contact form error:', error);
    return res.status(500).json({ 
      detail: 'Internal server error. Please try again or contact us via WhatsApp.' 
    });
  }
};
