# Firebase Setup Guide for CrispyRoots

## Your Firebase Config looks like this (from Step 3):

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyB1234567890abcdef",
  authDomain: "crispyroots-12345.firebaseapp.com",
  projectId: "crispyroots-12345",
  storageBucket: "crispyroots-12345.appspot.com",
  messagingSenderId: "123456789012",
  appId: "1:123456789012:web:abcdef1234567890"
};
```

## Map it to your .env file like this:

```
VITE_FIREBASE_API_KEY=AIzaSyB1234567890abcdef
VITE_FIREBASE_AUTH_DOMAIN=crispyroots-12345.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=crispyroots-12345
VITE_FIREBASE_STORAGE_BUCKET=crispyroots-12345.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789012
VITE_FIREBASE_APP_ID=1:123456789012:web:abcdef1234567890
```

## Important Rules:
- NO quotes around the values
- NO spaces around the = sign
- Each value on its own line
- File must be named exactly `.env` (dot at the beginning)
- File must be in the ROOT folder (same folder as package.json)

## After saving .env:
1. Stop the dev server if running (Ctrl+C)
2. Run: npm run build
3. Test locally: npm run preview

## How it works:
- If .env has real Firebase keys → Real SMS OTP + Firestore database
- If .env has placeholder/missing keys → Demo mode (fake OTP shown on screen, localStorage used)
- The app switches automatically, no code changes needed

## Firestore Security Rules

### DEVELOPMENT (open access — use during testing):
```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /{document=**} {
      allow read, write: if true;
    }
  }
}
```

### PRODUCTION (secure — use when going live):
Go to Firebase Console → Firestore → Rules tab and paste:

```
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {

    // Products: anyone can read, only authenticated users can write
    match /products/{productId} {
      allow read: if true;
      allow write: if request.auth != null;
    }

    // Customers: users can only read/write their own document
    match /customers/{customerId} {
      allow read: if request.auth != null && request.auth.uid == customerId;
      allow write: if request.auth != null && request.auth.uid == customerId;
      // Admin can read all customers (via getDocs on collection)
      allow read: if request.auth != null;
    }

    // Orders: authenticated users can create, read their own orders
    match /orders/{orderId} {
      allow read: if request.auth != null;
      allow create: if request.auth != null;
      allow update: if request.auth != null;
      allow delete: if request.auth != null;
    }

    // Config: anyone can read settings, authenticated users can write
    match /config/{docId} {
      allow read: if true;
      allow write: if request.auth != null;
    }
  }
}
```

## Testing:
1. Open the website
2. Go to Login
3. If Firebase is configured: You'll get a real SMS OTP
4. If not configured: You'll see the Demo OTP on screen (green box)
5. Products, Orders, Settings will sync to Firestore automatically
6. Payment screenshots will upload to Firebase Storage

## Phone Auth Billing Note:
- Free tier (Spark plan): 10 SMS verifications/day
- For production: Upgrade to Blaze plan (pay-as-you-go)
- Cost: ~₹0.50-4 per SMS depending on provider
- Use "Phone numbers for testing" in Firebase Console for development
