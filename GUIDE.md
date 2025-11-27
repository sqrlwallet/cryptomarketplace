# Ripework - Quick Reference Guide

## 🎯 Common Tasks

### For Sellers

#### Creating a Product
1. Navigate to "Seller Dashboard"
2. Click "Create New Listing"
3. Fill in product details:
   - Title
   - Description
   - Type (Product/Service)
   - Price in USDC
   - Payment wallet address (auto-filled if connected)
   - Generate or enter unique link
   - Add tags (comma-separated)
4. Upload product image (optional)
5. Upload digital files (optional, for products)
6. Click "CREATE"

#### Managing Products
- View all listings in Seller Dashboard
- Edit products by clicking on them
- Toggle active/inactive status
- Track sales and views

#### Setting Up Wallet
1. Go to "Profile Settings"
2. Connect MetaMask wallet
3. Ensure you're on Base network
4. Your wallet address will auto-save

### For Buyers

#### Purchasing a Product
1. Browse marketplace or use search
2. Click on product to view details
3. Click "BUY NOW"
4. Review payment breakdown:
   - Product price
   - 10% platform fee
   - Total amount
5. Ensure wallet is connected to Base network
6. Approve transaction in MetaMask (2 transactions):
   - First: Platform fee payment
   - Second: Seller payment
7. Wait for confirmation
8. Access purchased files in "My Purchases"

#### Accessing Purchases
1. Go to "My Purchases"
2. View all acquired products
3. Download digital files
4. View transaction details

#### Viewing Transactions
1. Go to "Transactions"
2. Filter by:
   - All transactions
   - Purchases only
   - Sales only
3. Click transaction hash to view on Basescan

### For All Users

#### Creating an Account
1. Click "Sign Up"
2. Enter email, password, and username
3. Verify email (check spam folder)
4. Complete profile setup

#### Connecting Wallet
1. Install MetaMask browser extension
2. Click "Connect Wallet" in navbar
3. Approve connection
4. Switch to Base network if prompted

#### Updating Profile
1. Go to "Profile Settings"
2. Update:
   - Username
   - Bio
   - Wallet address
   - Seller status
3. Click "Save Changes"

## 🔧 Technical Reference

### Supported Networks
- **Base Mainnet** (Chain ID: 8453)
- RPC: https://mainnet.base.org
- Explorer: https://basescan.org

### Accepted Currency
- **USDC** on Base chain only
- Contract: `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913`

### Platform Wallet
- Address: `0x8D9CA82052e90eEd4eC2D8a8f5d489A518a8F9e4`
- Receives 10% of all transactions

### File Limits
- **Product Images**: 5MB max, image formats only
- **Digital Files**: 100MB max per file, 10 files max per product

### URL Patterns
```
Marketplace:     https://yoursite.com/
Product:         https://yoursite.com/?product=unique-link-abc123
User Profile:    https://yoursite.com/username
```

## 💡 Tips & Best Practices

### For Sellers
- ✅ Use clear, descriptive titles
- ✅ Write detailed descriptions
- ✅ Add relevant tags for discoverability
- ✅ Upload high-quality product images
- ✅ Set competitive prices
- ✅ Respond to buyer questions promptly
- ✅ Keep products updated
- ❌ Don't use misleading descriptions
- ❌ Don't set unrealistic prices

### For Buyers
- ✅ Read product descriptions carefully
- ✅ Check seller profiles and ratings
- ✅ Verify transaction details before confirming
- ✅ Keep transaction hashes for records
- ✅ Download purchased files immediately
- ❌ Don't share wallet private keys
- ❌ Don't approve suspicious transactions

### Security
- ✅ Use strong, unique passwords
- ✅ Enable 2FA on email account
- ✅ Keep MetaMask secure
- ✅ Verify contract addresses
- ✅ Check network before transactions
- ❌ Never share private keys
- ❌ Don't click suspicious links
- ❌ Don't approve unknown contracts

## 🐛 Troubleshooting

### Wallet Issues

**Problem**: Wallet won't connect
- Ensure MetaMask is installed
- Refresh the page
- Try disconnecting and reconnecting
- Clear browser cache

**Problem**: Wrong network
- Click "Switch Network" when prompted
- Or manually switch to Base in MetaMask

**Problem**: Transaction failed
- Check USDC balance
- Check ETH balance for gas
- Increase gas limit if needed
- Try again after a few minutes

### Payment Issues

**Problem**: Payment stuck
- Check transaction on Basescan
- Wait for network confirmation
- Contact support if stuck >10 minutes

**Problem**: Paid but no access
- Check "My Purchases" page
- Verify transaction on Basescan
- Contact support with transaction hash

### File Issues

**Problem**: Can't upload files
- Check file size (<100MB)
- Check file count (<10 files)
- Try different file format
- Clear browser cache

**Problem**: Can't download files
- Verify purchase in "My Purchases"
- Check internet connection
- Try different browser
- Contact seller

### Account Issues

**Problem**: Can't sign in
- Verify email address
- Check spam for verification email
- Reset password if needed
- Clear browser cookies

**Problem**: Username taken
- Try different username
- Add numbers or underscores
- Make it unique but memorable

## 📞 Getting Help

### Self-Service
1. Check this guide
2. Review README.md
3. Check DEPLOYMENT.md for technical issues

### Contact Support
- Email: support@ripework.com (update with actual email)
- Include:
  - Your username
  - Transaction hash (if applicable)
  - Screenshot of issue
  - Browser and wallet info

### Report Bugs
- Describe the issue clearly
- Include steps to reproduce
- Attach screenshots
- Note browser/device info

## 🔄 Updates & Changelog

### Version 1.0.0 (Current)
- Initial release
- Base chain integration
- USDC payments
- Digital file delivery
- SEO optimization
- Neo-brutalism design

### Planned Features
- Multi-currency support
- NFT integration
- Escrow for services
- Review system
- Advanced analytics
- Mobile app

---

## 📚 Additional Resources

- **Base Network**: https://base.org
- **USDC Info**: https://www.circle.com/usdc
- **MetaMask Guide**: https://metamask.io/faqs
- **Supabase Docs**: https://supabase.com/docs

---

**Ripework** - Your Digital Marketplace on Base 🚀
