# PureHome Foods — Admin Panel (Standalone)

## Quick Setup

```bash
# 1. Copy this folder to a new repo
cp -r admin/ ~/purehome-admin/
cd ~/purehome-admin

# 2. Copy the admin component code
# Open src/components/AdminPanel.tsx from the user site
# Copy lines 16 through 835 (everything between the Firebase init and the export)
# Paste into admin/src/App.tsx replacing the placeholder section

# 3. Install
npm install

# 4. Run
npm run dev

# 5. Deploy separately (Vercel/Netlify/Firebase Hosting)
npm run build
```

## How to Sync Admin Code

The admin panel code lives in TWO places:
1. **Embedded**: `src/components/AdminPanel.tsx` (inside user site, accessed via Admin nav link)
2. **Standalone**: `admin/src/App.tsx` (this folder, deployed separately)

Both are functionally identical. The only difference:
- Embedded version imports `db` from `../lib/firebase` and uses a separate `adminApp`
- Standalone version has its own `initializeApp()` and `getFirestore()` directly

**To update standalone after editing embedded:**
1. Open `src/components/AdminPanel.tsx`
2. Copy lines 16 through 835 (Design Tokens → Layout function end)
3. Paste into `admin/src/App.tsx` replacing the placeholder block
4. The imports and export in `admin/src/App.tsx` are already correct

## Firebase Setup

Same Firebase project as user website:
- Enable **Email/Password** auth in Firebase Console
- Create admin user via Console → Authentication → Add User
- Add UID to Firestore: `config/admins` → `uids` array

## Security

- `noindex, nofollow` meta tag — search engines won't find it
- Email/Password only — no Google OAuth
- Admin UID verified against Firestore on every auth state change
- Hosted on separate domain from user site
