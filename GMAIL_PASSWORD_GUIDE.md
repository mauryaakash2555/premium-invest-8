# 📧 HOW TO GET GMAIL APP PASSWORD

## Option 1: Standard Method (Recommended)

### Step 1: Enable 2-Step Verification
1. Go to: https://myaccount.google.com/security
2. Under "Signing in to Google", click **2-Step Verification**
3. Follow the steps to enable it (if not already enabled)

### Step 2: Create App Password
1. Go to: https://myaccount.google.com/apppasswords
   - Or: Google Account → Security → 2-Step Verification → App passwords
2. Under "Select app", choose **Mail**
3. Under "Select device", choose **Other (Custom name)**
4. Type: **BM Wealth Contact Form**
5. Click **Generate**
6. Copy the **16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 3: Use in Vercel
- Remove spaces: `abcdefghijklmnop`
- Paste in Vercel Environment Variable: `EMAIL_PASS`

---

## Option 2: If App Passwords Not Available

**If you don't see "App passwords" option:**

1. **Check 2-Step Verification is ON:**
   - Go to: https://myaccount.google.com/security
   - 2-Step Verification must be **ON**

2. **If still not showing:**
   - Your Google account might be a Workspace account
   - Or 2-Step Verification not fully set up
   - Try: Sign out → Sign in → Check again

---

## Option 3: Alternative Email Service (If Gmail Doesn't Work)

### Use SendGrid (Free - 100 emails/day)

1. **Sign up:** https://sendgrid.com (free tier)
2. **Get API Key:**
   - Dashboard → Settings → API Keys
   - Create API Key
   - Copy the key

3. **Update `api/contact.js`:**
   ```javascript
   const transporter = nodemailer.createTransport({
     host: 'smtp.sendgrid.net',
     port: 587,
     auth: {
       user: 'apikey',
       pass: process.env.SENDGRID_API_KEY
     }
   });
   ```

4. **Add to Vercel:**
   - `SENDGRID_API_KEY` = your SendGrid API key
   - `EMAIL_FROM` = your verified sender email

---

## Option 4: Skip Email Entirely (Temporary)

**The form will still work!** It will:
- ✅ Save to MongoDB (you can check there)
- ✅ Show success message to user
- ❌ Just won't send email notification

**To skip email:**
- Don't add `EMAIL_USER` and `EMAIL_PASS` to Vercel
- Form will work, just log: "EMAIL_USER or EMAIL_PASS not set - email notifications disabled"

---

## 🔍 TROUBLESHOOTING MONGODB

### Check Your MongoDB Connection String:

**Format should be:**
```
mongodb+srv://username:password@cluster.mongodb.net/bmwealth?retryWrites=true&w=majority
```

### Get from MongoDB Atlas:
1. Go to: https://cloud.mongodb.com
2. Click **Connect** on your cluster
3. Choose **Connect your application**
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `bmwealth` (or your database name)

### Common Issues:
- ❌ **Wrong password** → Check MongoDB Atlas password
- ❌ **IP not whitelisted** → MongoDB Atlas → Network Access → Add IP `0.0.0.0/0` (all IPs)
- ❌ **Database name wrong** → Should be `bmwealth` (check your actual DB name)
- ❌ **Connection string format** → Must start with `mongodb+srv://`

---

## ✅ QUICK TEST (Without Email):

**You can test the form RIGHT NOW without email:**

1. **Add ONLY to Vercel:**
   ```
   MONGODB_URI = your_mongodb_connection_string
   ```
   (Don't add EMAIL_USER or EMAIL_PASS)

2. **Test the form:**
   - Form will submit successfully
   - Data saved to MongoDB
   - No email sent (but that's OK for testing!)

3. **Check MongoDB:**
   - Go to MongoDB Atlas
   - Browse Collections → `contacts`
   - You'll see the submission there!

---

## 🎯 RECOMMENDED APPROACH:

1. **First:** Test with MongoDB only (skip email)
2. **Then:** Get Gmail App Password when you have time
3. **Finally:** Add email credentials to Vercel

**The form works perfectly without email!** Email is just a notification convenience.
