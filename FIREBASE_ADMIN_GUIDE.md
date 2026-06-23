# PureHome Foods — Firebase Admin Guide

## Architecture

Both **user website** and **admin panel** connect to the **same Firebase project** (`ecom-6586a`).
They share the same Firestore database, Authentication, and Storage.
The admin panel lives in the `admin/` folder and is deployed to a **separate URL**.

## Quick Start — Admin Panel

```bash
# 1. Copy admin/ folder to a new repo
cp -r admin/ ~/purehome-admin/

# 2. Install dependencies
cd ~/purehome-admin
npm install

# 3. Enable Email/Password auth in Firebase Console
#    → Authentication → Sign-in method → Email/Password → Enable

# 4. Create admin user in Firebase Console
#    → Authentication → Add User → email + password

# 5. Add admin UID to Firestore
#    → Firestore → config/admins → uids: ["paste-uid-here"]

# 6. Run
npm run dev

# 7. Deploy to Vercel/Netlify/Firebase Hosting (separate from user site)
npm run build
```

```
Same Firebase Project (ecom-6586a)
├── User Website → reads products, places orders
└── Admin Panel  → manages products, processes orders
```

## Firebase Config (SAME for both)

```js
const firebaseConfig = {
  apiKey: "AIzaSyDhdmRwQeYRu8r3zoUUTdXF8vLjiEleWSw",
  authDomain: "ecom-6586a.firebaseapp.com",
  projectId: "ecom-6586a",
  storageBucket: "ecom-6586a.firebasestorage.app",
  messagingSenderId: "956450721241",
  appId: "1:956450721241:web:26574ec21ef4ea12da9dc8",
};
```

## Firestore Collections

| Collection     | Purpose                          | Admin     | User      |
|---------------|----------------------------------|-----------|-----------|
| `products`    | Product catalog                  | CRUD      | Read only |
| `orders`      | Customer orders                  | Read/Update| Create/Read|
| `coupons`     | Discount codes                   | CRUD      | Read only |
| `giftcards`   | Gift card balances               | CRUD      | Read only |
| `profiles`    | User profiles                    | Read      | Read/Write|
| `addresses`   | Saved delivery addresses         | Read      | CRUD      |
| `contacts`    | Contact form submissions         | Read      | Create    |
| `config`      | App settings (categories, etc.)  | CRUD      | Read only |

## Firestore Security Rules

Deploy these to your Firebase project:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Products — anyone can read, only admin can write
    match /products/{productId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Orders — user can create their own, read their own; admin can read/update all
    match /orders/{orderId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null && (
        resource.data.userId == request.auth.uid || isAdmin()
      );
      allow update: if isAdmin();
      allow delete: if isAdmin();
    }

    // Coupons — anyone can read (for validation), only admin writes
    match /coupons/{code} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Gift Cards — authenticated users can read, admin manages
    match /giftcards/{code} {
      allow read: if request.auth != null;
      allow write: if isAdmin();
    }

    // User Profiles — users manage their own
    match /profiles/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }

    // Addresses — users manage their own
    match /addresses/{addressId} {
      allow create: if request.auth != null;
      allow read, update, delete: if request.auth != null && (
        resource.data.userId == request.auth.uid
      );
    }

    // Contacts — anyone can create, admin reads
    match /contacts/{contactId} {
      allow create: if true;
      allow read: if isAdmin();
    }

    // Config — admin manages, everyone reads
    match /config/{configId} {
      allow read: if true;
      allow write: if isAdmin();
    }

    // Admin check — store admin UIDs in config/admins
    function isAdmin() {
      return request.auth != null &&
        exists(/databases/$(database)/documents/config/admins) &&
        request.auth.uid in get(/databases/$(database)/documents/config/admins).data.uids;
    }
  }
}
```

## Setup Admin Access

1. Sign in to the user website with your Google account
2. Note your UID (visible in Firebase Console → Authentication → Users)
3. Create a Firestore document:
   - Collection: `config`
   - Document ID: `admins`
   - Field: `uids` (array) → add your UID

## Product Document Schema

```
products/{productId}
{
  name: "Mango Pickle",
  description: "Short description for cards",
  longDescription: "Full detail page description",
  price: 249,
  originalPrice: 349,        // optional, MRP
  image: "https://...",       // main image URL
  images: ["url1", "url2"],   // gallery images
  category: "Pickles",
  tags: ["bestseller", "organic"],
  rating: 4.8,
  reviews: 234,
  inStock: true,
  weight: "400g",
  ingredients: ["Mango", "Oil", "Spices"],
  shelfLife: "12 months",
  isNew: false,
  isBestseller: true
}
```

## Order Document Schema

```
orders/{autoId}
{
  orderId: "PH250615K7M2P",   // readable unique ID
  items: [{ id, name, price, mrp, image, weight, qty }],
  customer: { name, email, phone, address, city, state, pincode },
  paymentMethod: "upi",
  transactionId: "UTR123456",
  totalAmount: 448,
  mrpTotal: 698,
  productDiscount: 200,
  couponCode: "PURE30",
  couponDiscount: 50,
  giftCardCode: "GC001",
  giftCardUsed: 0,
  status: "pending",          // pending → confirmed → processing → shipped → delivered
  userId: "firebase-uid",
  userEmail: "user@email.com",
  userName: "User Name",
  createdAt: "2025-06-15T...",
  canCancel: true
}
```

## Coupon Document Schema

```
coupons/{CODE}  (document ID = coupon code in UPPERCASE)
{
  discount: 30,
  type: "percent",     // "percent" or "flat"
  minOrder: 299,
  active: true,
  maxDiscount: 100     // optional cap for percent type
}
```

## Gift Card Document Schema

```
giftcards/{CODE}  (document ID = card code in UPPERCASE)
{
  balance: 500,
  active: true
}
```

## Category Config

```
config/categories
{
  list: ["Pickles", "Jams & Preserves", "Spices", "Honey", "Snacks", "Beverages", "Ready Mixes"]
}
```

## Site Config (Branding & Content)

All fields below are optional. The website uses defaults if not set.

```
config/site
{
  logoUrl: "https://cdn.example.com/logo-icon.png",    // square icon logo
  logoTextUrl: "https://cdn.example.com/logo-full.png", // horizontal logo with text
  siteName: "PureHome",
  heroTitle: "Pure. Homemade. Delicious.",
  heroSubtitle: "Authentic recipes passed down through generations...",
  heroBadge: "Natural Ingredients",
  heroImage: "https://images.pexels.com/photos/...",
  aboutTitle: "Why Choose PureHome?",
  aboutSubtitle: "We believe food should be pure..."
}
```

Changes reflect **instantly** on the live website via Firestore real-time listeners.

## Admin Panel Features to Build

1. **Dashboard** — Order stats, revenue, recent orders
2. **Products** — Add/Edit/Delete, image upload to Firebase Storage
3. **Orders** — View all, update status (pending→confirmed→processing→shipped→delivered)
4. **Coupons** — Create/deactivate codes
5. **Gift Cards** — Generate codes with balance
6. **Categories** — Add/remove product categories
7. **Contacts** — View customer messages

## Real-time Sync

Both admin and user sides use `onSnapshot` listeners.
When admin updates a product price → user sees it **instantly** without refresh.
When user places order → admin dashboard shows it **instantly**.
