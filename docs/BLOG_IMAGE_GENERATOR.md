# 🖼️ Blog Image Generator

## Quick Start

1. Go to `/admin-secret-akash/blog-image` (admin) or `/tools/blog-image` (public)
2. Paste your blog content
3. Click "Generate Image"
4. Copy the URL → Use in `blog.json`

## Features

✅ **AI Keyword Extraction** - Analyzes blog content for key themes  
✅ **No Image Reuse** - Tracks all used images in `data/usedBlogImages.json`  
✅ **High Quality First** - Always tries best quality (1200x800, WebP)  
✅ **4 Fallback Strategies** - Keyword → Visual → Curated → Random  
✅ **Free Forever** - Uses Unsplash (unlimited free images)

## How It Works

```
Blog Content → Keyword Extraction → Unsplash Search → Filter Used → Return Unique Image
                     ↓                    ↓
               Theme Detection      Multiple Strategies
                     ↓
              Visual Mapping
```

### Keyword Extraction (`lib/blog/keywordExtractor.js`)
- Tokenizes content
- Removes stop words
- Weights finance terms higher
- Maps concepts to visual search terms
- Detects mood (optimistic/cautionary/educational)

### Image Search (`lib/blog/unsplashService.js`)
- Searches Unsplash with extracted keywords
- Filters out already-used images
- Returns optimized URLs (WebP, proper sizing)
- Includes attribution (Unsplash requirement)

### Image Tracking (`lib/blog/imageTracker.js`)
- Stores used image IDs in JSON
- Checks before returning any image
- Initializes from existing `blog.json`

## Setup

### Get Free Unsplash API Key (Optional - demo mode works)

1. Go to https://unsplash.com/developers
2. Create free account
3. Click "New Application"
4. Accept terms
5. Copy "Access Key"
6. Add to `.env.local`:
   ```
   UNSPLASH_ACCESS_KEY=your_key_here
   ```

> **Note:** Without a key, demo mode works but has lower rate limits.

## API Endpoints

### POST `/api/blog-image`

Generate image for blog content.

**Request:**
```json
{
  "content": "Your blog content here...",
  "title": "Optional Blog Title",
  "markAsUsed": true,
  "preferHighQuality": true
}
```

**Response:**
```json
{
  "success": true,
  "image": {
    "id": "photo-abc123",
    "url": "https://images.unsplash.com/photo-abc123?w=1200...",
    "urls": { "default": "...", "highQuality": "...", "thumbnail": "..." },
    "photographer": { "name": "John Doe", "link": "..." },
    "attribution": "Photo by John Doe on Unsplash"
  },
  "analysis": {
    "keywords": ["investment", "wealth", "planning"],
    "theme": "investment",
    "mood": "educational"
  }
}
```

### GET `/api/blog-image?action=init`

Initialize tracker from existing blogs.

## File Structure

```
lib/blog/
├── imageTracker.js      # Track used images (no reuse)
├── unsplashService.js   # Unsplash API integration
└── keywordExtractor.js  # AI keyword extraction

app/api/blog-image/
└── route.js             # API endpoint

app/admin-secret-akash/blog-image/
└── page.jsx             # Admin UI (marks as used)

app/(public)/tools/blog-image/
└── page.jsx             # Public UI (preview only)

data/
└── usedBlogImages.json  # Persisted used image IDs
```

## Best Practices

1. **Add title** - Helps extract better keywords
2. **Paste full content** - More content = better keyword extraction  
3. **Use admin tool** - Marks images as used to prevent duplicates
4. **Check attribution** - Include photographer credit where possible

## Troubleshooting

**"Could not find a suitable unique image"**  
All relevant images have been used. Try:
- Different keywords in title
- Longer/different content
- Reset `usedBlogImages.json` (carefully!)

**Rate limiting**  
Unsplash has 50 requests/hour free. If hitting limits:
- Get API key (5000/hour)
- Wait an hour

**Wrong theme detection**  
The algorithm looks for keyword patterns. For better results:
- Include relevant finance keywords
- Make sure content reflects the actual topic
