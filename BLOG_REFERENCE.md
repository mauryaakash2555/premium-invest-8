# 📝 BLOG REFERENCE GUIDE
**Quick access for editing any blog post**

---

## ⚙️ TECH STACK - WHAT THIS BLOG USES

**Framework:** React 19.0.0 (Create React App)  
**NOT Next.js** - Even though there's a Next.js folder in the project, your live blog runs on React

**Key Technologies:**
- **React** - Frontend framework
- **React Router** - Page navigation (`/blog`, `/blog/[slug]`)
- **HTML Strings** - Blog content is stored as HTML (not JSX)
- **Inline CSS** - All styling uses `style="..."` attributes
- **DOMPurify** - Sanitizes HTML before rendering
- **Axios** - API calls (for future backend blogs)
- **React Helmet** - SEO meta tags

**What This Means for Editing:**
- ✅ Edit HTML directly in strings
- ✅ Use inline `style="..."` for all styling
- ❌ NO CSS classes (they won't work)
- ❌ NO JSX syntax like `className` or `{variable}`
- ❌ NO separate CSS/SCSS files for blog content

---

## 🎯 WHERE TO EDIT BLOGS

### **THE ONLY FILE YOU NEED TO EDIT:**
```
C:\Users\admin\premium-invest-8\frontend\src\data\staticBlogData.js
```

### **Supporting Files (Don't Edit These Unless Necessary):**
```
C:\Users\admin\premium-invest-8\frontend\src\pages\BlogDetail.js  ← Renders blog
C:\Users\admin\premium-invest-8\frontend\src\pages\Blog.js        ← Blog list page
```

---

## 📚 BLOG INVENTORY

### **BLOG 1: 47 Lakh Loss Case Study**
- **Title:** "He Lost ₹47 Lakh Following 'Expert' Advice"
- **Slug:** `47-lakh-investment-mistake-mumbai`
- **URL:** https://bmwealth.in/blog/47-lakh-investment-mistake-mumbai
- **Line in Code:** Starts at **line 8** in `staticBlogData.js`
- **Variable Name:** `staticBlogPost`
- **Status:** ✅ Live & Polished

**What's in this blog:**
- Mumbai CA case study
- ₹47 lakh opportunity cost analysis
- 5 core investment mistakes
- Premium editorial styling applied
- Muted-gold highlights on 3 key sentences
- Ultra-premium WhatsApp CTA with soft glow
- Zero emojis (except social share buttons)

---

### **BLOG 2: [Not Yet Created]**
- **Placeholder for next blog**
- Will be added to the same file: `staticBlogData.js`
- Export array location: Line 393

---

### **BLOG 3: [Not Yet Created]**
- **Placeholder for future blog**

---

## 🛠️ HOW TO ADD A NEW BLOG

### **Step 1: Open the file**
```
C:\Users\admin\premium-invest-8\frontend\src\data\staticBlogData.js
```

### **Step 2: Copy the structure of Blog 1**
Look for `export const staticBlogPost = { ... }`

### **Step 3: Create a new blog object**
```javascript
export const staticBlogPost2 = {
  id: "blog-2",
  slug: "your-slug-here",
  title: "Your Title Here",
  author: "BM Wealth Editorial Team",
  date: "December 15, 2025",
  published_date: "2025-12-15",
  readTime: "6 min read",
  read_time: "6 minutes",
  category: "Investment Education",
  excerpt: "Your excerpt here...",
  image: "/blog-images/your-image.jpg",
  image_url: "/blog-images/your-image.jpg",
  tags: ["tag1", "tag2", "tag3"],
  keywords: "keywords here",
  
  content: `
    <div style="margin-bottom: 40px;">
      <p style="font-size: 18px; line-height: 2; margin-bottom: 20px;">
        Your content here...
      </p>
    </div>
  `
  // ⚠️ IMPORTANT: 
  // - Content MUST be HTML (not JSX)
  // - Use style="..." for ALL styling (not className)
  // - Use double quotes for HTML attributes
  // - Escape single quotes in text with \'
};
```

### **Step 4: Add to export array** (Line 393)
```javascript
export const staticBlogData = [
  staticBlogPost,    // Blog 1
  staticBlogPost2,   // Blog 2 (new)
];
```

---

## 🎨 STYLING REFERENCE FOR BLOGS

### **Premium Elements Already in Blog 1:**

#### **1. Numeric Emphasis Block (e.g., ₹47,00,000)**
```html
<div style="background: rgba(218, 165, 32, 0.05); padding: 20px 22px; border-radius: 10px; border-left: 2px solid rgba(192, 160, 98, 0.5); margin: 60px 0; text-align: center;">
  <p style="font-size: 52px; font-weight: 500; color: rgba(192, 160, 98, 0.85); margin-bottom: 14px; font-family: 'Playfair Display', serif;">
    <span style="position: relative; top: -2px;">₹</span>47,00,000
  </p>
  <p style="font-size: 20px; color: rgba(229, 229, 229, 0.75); font-weight: 400;">
    Your subtitle here
  </p>
</div>
```

#### **2. Editorial Highlight (Muted-Gold Left Border)**
```html
<p style="font-size: 19px; line-height: 2; margin-bottom: 20px; padding-left: 16px; border-left: 3px solid rgba(192, 160, 98, 0.7); color: #C0A062; font-weight: 500;">
  Your highlighted sentence here.
</p>
```

#### **3. Section Heading**
```html
<h2 style="font-family: 'Playfair Display', serif; font-size: 36px; color: #DAA520; margin-bottom: 30px;">
  Your Heading Here
</h2>
```

#### **4. Regular Paragraph**
```html
<p style="font-size: 18px; line-height: 2; margin-bottom: 20px;">
  Your paragraph text here.
</p>
```

#### **5. Section Divider**
```html
<hr style="border: none; border-top: 1px solid rgba(192, 160, 98, 0.3); margin: 70px 0;" />
```

#### **6. CTA Section (Copy exactly from Blog 1)**
Located at **line 311-352** in `staticBlogData.js`

---

## 🚀 AFTER EDITING: HOW TO PUBLISH

### **Method 1: Automatic (Recommended)**
```powershell
cd "C:\Users\admin\premium-invest-8"
git add frontend/src/data/staticBlogData.js
git commit -m "feat: add Blog 2 - [your title]"
git push origin main
```
Vercel auto-deploys in 2-3 minutes.

### **Method 2: Test Locally First**
```powershell
cd "C:\Users\admin\premium-invest-8\frontend"
npm start
```
Check at http://localhost:3000/blog

---

## ⚠️ CRITICAL RULES FOR BLOG EDITING

### **DO:**
- ✅ Use HTML syntax (not JSX): `style="..."` not `className="..."`
- ✅ Keep all inline styles with `style="..."` attribute
- ✅ Use double quotes for HTML attributes: `style="color: red;"`
- ✅ Use the exact color palette from Blog 1
- ✅ Copy-paste working structures (safer than typing)
- ✅ Test locally before pushing

### **DON'T:**
- ❌ Use CSS classes like `className="..."` (won't work - this is HTML not JSX)
- ❌ Use curly braces `{}` for variables (this is a string, not React component)
- ❌ Remove inline styles (blog won't look right)
- ❌ Add emojis inside blog content (only in social share is OK)
- ❌ Change font families or sizes drastically
- ❌ Use bright colors (stick to gold/brown/dark palette)

### **COMMON MISTAKES TO AVOID:**

```javascript
// ❌ WRONG (JSX syntax - won't work):
content: `<p className="text-gold">Hello</p>`

// ✅ CORRECT (HTML with inline styles):
content: `<p style="color: #C0A062;">Hello</p>`

// ❌ WRONG (trying to use variables):
content: `<p>{blogTitle}</p>`

// ✅ CORRECT (plain text or template literals outside content):
content: `<p>Static text here</p>`

// ❌ WRONG (React self-closing):
content: `<img src="..." />`

// ✅ CORRECT (HTML syntax):
content: `<img src="..." />`  // Actually both work, but stick to HTML
```

---

## 📞 EMERGENCY CONTACTS

### **If Blog Breaks After Push:**
1. **Vercel Rollback:** https://vercel.com/dashboard → Deployments → Promote previous working version
2. **Git Revert:** `git revert HEAD --no-edit && git push origin main`

### **File Locations (Quick Copy-Paste):**
```
Blog Data File:
C:\Users\admin\premium-invest-8\frontend\src\data\staticBlogData.js

Blog Page Component:
C:\Users\admin\premium-invest-8\frontend\src\pages\BlogDetail.js

Blog List Component:
C:\Users\admin\premium-invest-8\frontend\src\pages\Blog.js
```

---

## 📊 BLOG CHECKLIST BEFORE PUBLISHING

- [ ] Title is compelling and SEO-friendly
- [ ] Slug is lowercase with hyphens (no spaces)
- [ ] Date is correct format (YYYY-MM-DD)
- [ ] Reading time is accurate (count words ÷ 200)
- [ ] Excerpt is 1-2 sentences max
- [ ] All paragraph tags have inline styles
- [ ] No emojis inside blog content
- [ ] CTA section is copied exactly from Blog 1
- [ ] Tested locally with `npm start`
- [ ] Committed with clear message
- [ ] Checked live site after Vercel deploy

---

**Last Updated:** December 13, 2025  
**Maintained By:** BM Wealth Editorial Team
