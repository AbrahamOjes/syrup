# How to Get 1000+ Merchants in 1 Hour

This guide shows you how to scale from 23 merchants to **1000+ merchants with active coupons** using CouponAPI.org.

---

## Option 1: CouponAPI.org (FASTEST - Recommended)

### What You Get

- ✅ **1000+ merchants** from top affiliate networks
- ✅ **Working coupons** from ShareASale, CJ, Rakuten, Impact
- ✅ **Instant import** - Get everything in 1-2 hours
- ✅ **Auto-updates** - Fresh coupons daily

### Step-by-Step Setup

#### 1. Sign Up for CouponAPI.org

Visit: https://couponapi.org/

**Pricing:**
- **Free**: 100 requests/day (~100 merchants for testing)
- **Starter ($29/month)**: 1,000 requests/day (~1000 merchants)
- **Pro ($99/month)**: 10,000 requests/day (~5000+ merchants)

#### 2. Get Your API Key

1. Create account
2. Go to Dashboard
3. Copy your API key (looks like: `abc123def456...`)

#### 3. Add API Key to Environment

```bash
cd syrup-backend

# Edit .env file
echo "COUPONAPI_KEY=your_key_here" >> .env
echo "IMPORT_LIMIT=1000" >> .env
```

#### 4. Run the Import

```bash
# Import 1000 merchants with coupons
npm run import:couponapi
```

**Expected Output:**
```
🚀 Starting CouponAPI.org import...

[1/1000] Importing Amazon...
  ✅ Imported 12 coupons
[2/1000] Importing Nike...
  ✅ Imported 5 coupons
[3/1000] Importing Walmart...
  ✅ Imported 8 coupons
...

╔═══════════════════════════════════════════╗
║       🎉 Import Complete!                 ║
╠═══════════════════════════════════════════╣
║  Merchants Imported: 1000                 ║
║  Coupons Imported: 3500                   ║
║  Duration: 3600s                          ║
╚═══════════════════════════════════════════╝
```

#### 5. Verify Import

```bash
# Check total merchants
curl http://localhost:3000/syrup/merchants | jq '.total'
# Expected: 1023 (23 manual + 1000 imported)

# Test a merchant (e.g., Amazon)
curl "http://localhost:3000/syrup/coupons?domain=amazon.com"
```

---

## Option 2: Affiliate Networks (FREE but slower)

### ShareASale Integration

#### 1. Join ShareASale

Visit: https://www.shareasale.com/info/affiliates/

1. Sign up as an affiliate (free)
2. Get approved (usually 24-48 hours)
3. Get your API credentials from dashboard

#### 2. Add Credentials

```bash
echo "SHAREASALE_AFFILIATE_ID=your_id" >> .env
echo "SHAREASALE_API_TOKEN=your_token" >> .env
echo "SHAREASALE_API_SECRET=your_secret" >> .env
```

#### 3. Run Import

```bash
npm run import:shareasale
# Expected: 500-1000 merchants in 2-3 hours
```

### CJ Affiliate Integration

#### 1. Join CJ Affiliate

Visit: https://www.cj.com/

1. Apply as publisher (free)
2. Get approved
3. Get API key from Account > Developer API

#### 2. Add Credentials

```bash
echo "CJ_API_KEY=your_key" >> .env
```

#### 3. Run Import

```bash
npm run import:cj
# Expected: 300-500 merchants in 1-2 hours
```

---

## Option 3: Manual Scraping (Advanced)

### Using Wired-Coupon-Scraper

#### 1. Clone the Scraper

```bash
cd ..
git clone https://github.com/Prem-ium/Wired-Coupon-Scraper.git
cd Wired-Coupon-Scraper
npm install
```

#### 2. Configure

Edit `config.json` to target specific retailers:

```json
{
  "retailers": [
    "amazon",
    "walmart",
    "target",
    "bestbuy",
    ...
  ]
}
```

#### 3. Run Scraper

```bash
npm start
# Creates coupons.json file
```

#### 4. Import to Your Database

```bash
cd ../syrup-backend
npm run import:json -- ../Wired-Coupon-Scraper/coupons.json
# Expected: 100-300 merchants depending on scraper results
```

---

## Comparison

| Method | Time | Cost | Merchants | Quality | Difficulty |
|--------|------|------|-----------|---------|------------|
| **CouponAPI.org** | 1 hour | $29/mo | 1000+ | ⭐⭐⭐⭐⭐ | ✅ Easy |
| **ShareASale** | 2-3 hours | Free | 500-1000 | ⭐⭐⭐⭐⭐ | 🟡 Medium |
| **CJ Affiliate** | 1-2 hours | Free | 300-500 | ⭐⭐⭐⭐ | 🟡 Medium |
| **Web Scraping** | 1-2 hours | Free | 100-300 | ⭐⭐⭐ | 🔴 Hard |

---

## Recommended Approach

### For Quick Launch (This Week)

```bash
# Use CouponAPI.org for instant 1000 merchants
npm run import:couponapi
```

**Cost:** $29/month
**Result:** 1000+ merchants with 3000+ coupons in 1-2 hours

### For Long-Term (Free)

```bash
# Apply to affiliate networks (takes 1-2 days approval)
# Then run imports
npm run import:shareasale
npm run import:cj
```

**Cost:** $0
**Result:** 800-1500 merchants with 2500+ coupons in 3-5 hours

### Hybrid (Best of Both)

```bash
# Month 1: Use CouponAPI for quick start
npm run import:couponapi

# Month 2: Switch to free affiliate networks
npm run import:shareasale
npm run import:cj

# Cancel CouponAPI subscription
```

**Cost:** $29 (one-time)
**Result:** 1500+ merchants, then free forever

---

## Maintenance

### Daily Coupon Refresh

Add to crontab:

```bash
# Refresh coupons daily at 2 AM
0 2 * * * cd /path/to/syrup-backend && npm run import:couponapi
```

### Remove Expired Coupons

```bash
npm run cleanup:expired
# Removes coupons past their expiration date
```

### Update Merchant Info

```bash
npm run update:merchants
# Refreshes merchant logos and domains
```

---

## Troubleshooting

### API Key Error

```
❌ Error: COUPONAPI_KEY not found in environment variables
```

**Solution:** Add your API key to `.env` file:
```bash
echo "COUPONAPI_KEY=your_actual_key" >> .env
```

### Rate Limit Exceeded

```
❌ Error: Rate limit exceeded. Retry after 3600 seconds.
```

**Solution:** You've hit your daily request limit. Either:
1. Wait for reset (shown in error)
2. Upgrade your CouponAPI.org plan
3. Use free affiliate networks instead

### Database Constraint Errors

```
❌ Error: Unique constraint failed on the constraint: `coupons_code_merchantId_key`
```

**This is normal!** It means coupon already exists. The import will skip duplicates and continue.

---

## Next Steps

After importing 1000+ merchants:

1. **Test the API**
   ```bash
   curl http://localhost:3000/syrup/merchants
   ```

2. **Connect Syrup Extension**
   - Open extension settings
   - Set Base URL to: `http://localhost:3000/syrup`
   - Test on any supported merchant site

3. **Deploy to Production**
   - Use Railway, Render, or AWS
   - Set production environment variables
   - Enable API key authentication

4. **Add More Merchants**
   - Community submissions
   - Custom scrapers for local stores
   - Merchant partnerships

---

## Support

- **CouponAPI.org**: https://couponapi.org/support
- **ShareASale**: https://www.shareasale.com/info/contact/
- **Syrup Discord**: https://discord.com/invite/SxTjmsS2g9

---

Ready to scale? Run this now:

```bash
npm run import:couponapi
```

🚀 You'll have 1000+ merchants in the next hour!
