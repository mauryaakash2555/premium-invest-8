# Deployment Guide - PageSpeed Optimizations

## Pre-Deployment Checklist

### 1. Verify Build
```bash
cd frontend
yarn build
```
Expected output:
- Build should complete successfully
- Main bundle: ~23.3 kB (gzipped)
- Service worker should be generated

### 2. Test Locally
```bash
# Install serve if not already installed
yarn global add serve

# Serve the build
serve -s build

# Open http://localhost:3000 in browser
```

### 3. Browser Testing Checklist
- [ ] Verify Google Analytics tracking fires (check browser DevTools Network tab)
- [ ] Check service worker registration (DevTools > Application > Service Workers)
- [ ] Test lazy loading (scroll down and watch images load)
- [ ] Verify WebP images load (or PNG fallbacks on unsupported browsers)
- [ ] Test on multiple browsers (Chrome, Firefox, Safari, Edge)
- [ ] Test on mobile devices

## Deployment Steps

### Option 1: Standard Deployment
1. Build the production bundle:
   ```bash
   cd frontend
   yarn build
   ```

2. Deploy the `frontend/build` directory to your hosting service

3. Ensure your hosting supports:
   - Gzip/Brotli compression (most modern hosts do)
   - Service Worker serving (must be served over HTTPS)
   - Proper MIME types for WebP images

### Option 2: Vercel/Netlify
These platforms automatically handle:
- HTTPS
- Compression
- Static file serving
- Service workers

Simply connect your GitHub repository and deploy.

## Post-Deployment Verification

### 1. PageSpeed Insights Test
Run PageSpeed Insights on your live URL:
- https://pagespeed.web.dev/

Expected improvements:
- Desktop score: 90+
- Mobile score: 90+
- LCP: < 2.5s (down from 26.8s)

### 2. Google Analytics Verification
1. Open your live site
2. Open Google Analytics Real-Time view
3. Verify page views are being tracked

### 3. Service Worker Verification
1. Open browser DevTools
2. Go to Application > Service Workers
3. Verify service worker is registered and active
4. Check Cache Storage for cached resources

### 4. WebP Image Verification
1. Open browser DevTools > Network tab
2. Filter by images
3. Verify WebP images are being served (check Content-Type: image/webp)

## Performance Monitoring

### Recommended Tools
1. **Google PageSpeed Insights** - Monthly checks
2. **Google Analytics** - Monitor bounce rates and user engagement
3. **Chrome DevTools Lighthouse** - Regular audits
4. **WebPageTest** - Detailed performance analysis

### Key Metrics to Monitor
- **LCP (Largest Contentful Paint)**: Target < 2.5s
- **FID (First Input Delay)**: Target < 100ms
- **CLS (Cumulative Layout Shift)**: Target < 0.1
- **Total Blocking Time**: Target < 300ms

## Troubleshooting

### Issue: Service Worker Not Registering
- Ensure site is served over HTTPS (service workers require HTTPS)
- Check browser console for errors
- Verify `service-worker.js` is accessible at root URL

### Issue: WebP Images Not Loading
- Check browser support: https://caniuse.com/webp
- Verify PNG fallbacks are working
- Check server MIME type configuration

### Issue: Google Analytics Not Tracking
- Verify GA4 measurement ID is correct (G-SSN64C0XCY)
- Check browser console for tracking errors
- Ensure ad blockers are not interfering
- Allow 24-48 hours for data to appear in reports

### Issue: Images Not Lazy Loading
- Check browser console for JavaScript errors
- Verify IntersectionObserver is supported
- Clear browser cache and test

### Issue: Poor Performance Despite Optimizations
- Check server response times
- Verify compression is enabled on hosting
- Check for blocking third-party scripts
- Review browser DevTools Performance tab

## Rollback Plan

If issues arise after deployment:

1. **Quick Rollback**:
   ```bash
   git revert HEAD~4..HEAD
   git push origin main
   ```

2. **Selective Revert**:
   - Service Worker only: Remove registration from `src/index.js`
   - Images only: Revert to original image URLs
   - GA4 only: Remove scripts from `public/index.html`

## Additional Optimizations (Future)

Consider implementing later:
1. **HTTP/2 Server Push** - Push critical resources
2. **CDN Integration** - Use CDN for static assets
3. **Image CDN** - Use service like Cloudinary or Imgix
4. **Resource Hints** - Add more preload/prefetch directives
5. **Critical CSS** - Inline critical CSS in HTML
6. **Font Optimization** - Use font-display: swap
7. **Bundle Analysis** - Regular webpack-bundle-analyzer runs

## Support & Documentation

- Main optimization doc: `PAGESPEED_OPTIMIZATION.md`
- React CRA docs: https://create-react-app.dev/docs/production-build/
- Workbox docs: https://developers.google.com/web/tools/workbox
- WebP docs: https://developers.google.com/speed/webp

## Success Criteria

Deployment is successful when:
- ✅ Build completes without errors
- ✅ Site loads correctly in all major browsers
- ✅ Google Analytics tracking confirmed
- ✅ Service worker registered in production
- ✅ PageSpeed scores 90+ on both desktop and mobile
- ✅ LCP < 2.5s
- ✅ No console errors in browser DevTools
- ✅ Images load correctly with lazy loading
- ✅ WebP images serve to supported browsers

## Contact

For issues or questions related to these optimizations, refer to:
- Project repository: https://github.com/mauryaakash2555/premium-invest-8
- Documentation: See PAGESPEED_OPTIMIZATION.md
