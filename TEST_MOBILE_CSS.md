# CRITICAL DIAGNOSTIC TEST

## What phone screen width are you testing on?

Check your phone's screen width:
- iPhone SE/Small: ~375px
- iPhone 12/13: ~390px  
- iPhone 14 Pro: ~393px
- Standard Android: ~360-414px
- Large phones: ~428px+

## Current CSS Breakpoints:
1. **≤480px**: 65vh height, 0.25 opacity
2. **481-768px**: 70vh height, 0.25 opacity  
3. **769-1024px**: 80vh height, 0.25 opacity
4. **≥1025px**: 100vh height, 0.15 opacity (DESKTOP)

## The red border test showed CSS IS loading
But height/opacity aren't changing - WHY?

## Possible causes:
1. **Inline styles with higher specificity** (checked - removed)
2. **Tailwind utilities overriding** (need to check)
3. **JavaScript setting styles dynamically** (need to check)
4. **Browser cache on Vercel** (need to force refresh)
5. **CSS not being included in production build** (need to verify)
6. **PostCSS/Craco stripping media queries** (need to verify)

## Next step: Check production build output
