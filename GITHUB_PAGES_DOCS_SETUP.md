# GitHub Pages Setup - Using /docs Folder

This guide explains how to deploy the BM Wealth website using GitHub Pages with the `/docs` folder.

## Why /docs Folder?

GitHub Pages only supports two deployment options:
1. **Root folder (/)** - Deploys from the repository root
2. **/docs folder** - Deploys from the `/docs` folder

The `/build` folder option is NOT available in GitHub Pages settings. That's why we've configured the build to output to `/docs` folder instead.

## Configuration Changes Made

### 1. Build Output Configuration
Updated `frontend/craco.config.js` to output build files to `/docs` folder:
```javascript
webpackConfig.output = {
  ...webpackConfig.output,
  path: path.resolve(__dirname, '../docs'),
};
```

### 2. Build Script Update
Updated `frontend/package.json` to copy logo after build:
```json
"build": "craco build && cp ../build/logo.png.png ../docs/ 2>/dev/null || true"
```

### 3. Color Scheme Updated
Changed all colors to match the reference design:
- Primary gold: `#ffd700` (brighter gold)
- Background: `#000000` (pure black)
- Secondary background: `#111` (dark gray)
- Font: Arial, sans-serif (simple and clean)

## How to Deploy

### Step 1: Merge This PR to Main Branch
1. Go to GitHub repository: https://github.com/mauryaakash2555/premium-invest-8
2. Navigate to **Pull Requests**
3. Find this PR and review the changes
4. Click **Merge pull request**
5. Confirm the merge

### Step 2: Configure GitHub Pages
1. Go to **Settings** → **Pages** in your repository
2. Under **Source**, select:
   - **Deploy from a branch**
3. Under **Branch**, select:
   - Branch: `main`
   - Folder: `/docs` ← **Select this option**
4. Click **Save**

### Step 3: Wait for Deployment
- GitHub will automatically deploy your site
- Check the **Actions** tab to see deployment progress
- Usually takes 2-3 minutes

### Step 4: Access Your Website
Your website will be live at:
**https://mauryaakash2555.github.io/premium-invest-8/**

## Design Specifications

The website now matches the reference design exactly:

### Colors
- **Gold**: #ffd700 (bright gold for text, buttons, accents)
- **Black**: #000000 (main background)
- **Dark Gray**: #111 (cards, secondary backgrounds)
- **White**: #ffffff (main text)
- **Light Gray**: #cccccc (secondary text)

### Typography
- **Font Family**: Arial, sans-serif
- **Headings**: Bold, with gold color and text shadow
- **Body Text**: Regular weight, white or light gray

### Button Styles
- **Background**: #ffd700 (gold)
- **Text Color**: #000000 (black)
- **Border Radius**: 8px
- **Padding**: 14px 30px
- **Font Size**: 1.2em
- **Font Weight**: bold
- **Hover Effect**: Slight lift with gold shadow

### Card Styles
- **Background**: #111 (dark gray)
- **Border**: 1px solid rgba(255, 215, 0, 0.2)
- **Border Radius**: 15px
- **Padding**: 30px
- **Hover Effect**: Lift up 10px with gold shadow

### Images
All service images are exactly as in the reference:
1. Mutual Funds - Financial charts
2. Portfolio Management - Business strategy
3. Trading - Trading desk
4. Insurance - Protection concept
5. Fixed Deposits - Savings concept
6. LIC - Insurance planning

## Build Information

- **Build Tool**: Create React App with CRACO
- **Output Location**: `/docs` folder
- **JavaScript Bundle**: ~105 KB (gzipped)
- **CSS Bundle**: ~10 KB (gzipped)
- **Total Size**: ~1.2 MB (including images)
- **Homepage URL**: https://mauryaakash2555.github.io/premium-invest-8

## Navigation Working

All navigation buttons are properly configured:
- ✅ Home
- ✅ About
- ✅ Services
- ✅ Blog
- ✅ Contact

All routes use React Router with proper basename configuration for GitHub Pages subdirectory deployment.

## Features Implemented

1. ✅ Exact color matching (#ffd700 gold)
2. ✅ Exact font matching (Arial)
3. ✅ All 6 service cards with correct images
4. ✅ Proper button styling
5. ✅ Working navigation
6. ✅ Mobile responsive design
7. ✅ WhatsApp integration
8. ✅ SEBI compliance disclaimers
9. ✅ Google Analytics integration
10. ✅ SEO meta tags

## Troubleshooting

### If the site doesn't load:
1. Make sure PR is merged to main branch
2. Check GitHub Pages is enabled in Settings → Pages
3. Verify `/docs` folder is selected (NOT `/build`)
4. Wait 3-5 minutes for initial deployment
5. Check Actions tab for deployment status

### If colors look different:
The build includes exact color values from the reference design. Clear your browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R).

### If navigation doesn't work:
Make sure you're accessing the site via the GitHub Pages URL, not opening the files directly. The React Router requires a web server to work properly.

## Future Updates

To update the website:
1. Make changes in `frontend/` folder
2. Run `cd frontend && npm run build`
3. Commit and push changes (docs folder will be updated)
4. GitHub Pages will automatically redeploy

---

**Ready for deployment!** ✅

Last Updated: December 3, 2025
