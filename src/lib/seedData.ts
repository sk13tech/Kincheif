import { db, firebaseConfigured } from './firebase';
import { doc, setDoc, Timestamp } from 'firebase/firestore';

export async function seedAllData() {
  const results: string[] = [];

  if (!firebaseConfigured) {
    return { success: false, results, error: 'Firebase is not configured. Please set VITE_FIREBASE_* variables.' };
  }

  try {
    // ─── Settings: Site ───
    await setDoc(doc(db, 'settings', 'site'), {
      name: 'Median Foods',
      tagline: 'Fresh food, snacks & sweets · Since 2021',
      foundedYear: 2021,
      updatedAt: Timestamp.now(),
    });
    results.push('✓ settings/site');

    // ─── Settings: Contact ───
    await setDoc(doc(db, 'settings', 'contact'), {
      email: 'hello@medianfoods.com',
      phone: '+91 98765 43210',
      address: '123 Food Street, Mumbai, Maharashtra 400001',
      businessHours: {
        mondayFriday: '9:00 AM – 8:00 PM',
        saturday: '10:00 AM – 8:00 PM',
        sunday: '11:00 AM – 6:00 PM',
      },
      updatedAt: Timestamp.now(),
    });
    results.push('✓ settings/contact');

    // ─── Settings: About ───
    await setDoc(doc(db, 'settings', 'about'), {
      author: {
        name: 'Median Foods',
        tagline: 'Fresh food, snacks & sweets · Since 2021',
        description: 'Welcome to Median Foods, your trusted destination for delicious snacks, sweets, bakery items, and ready-to-enjoy food products. We are committed to serving quality food made with care, freshness, and hygiene. From festive sweets to daily treats, our mission is to make good food accessible, reliable, and joyful for every customer.',
        profileImage: '',
      },
      offerings: [
        { title: 'Fresh Bakery Items', description: 'Cookies, brownies, muffins, croissants, and assorted baked treats delivered fresh.' },
        { title: 'Indian Sweets', description: 'Traditional mithai and festive sweet boxes prepared with authentic ingredients.' },
        { title: 'Ready-to-Eat Snacks', description: 'Quick snack products for tea-time, gifting, or everyday cravings.' },
        { title: 'Quality & Hygiene', description: 'Food handled and packed with hygiene-focused processes and care.' },
      ],
      team: [
        { name: 'Aarav Mehta', role: 'Founder & Operations', initials: 'AM', order: 1 },
        { name: 'Riya Sharma', role: 'Food Curation Lead', initials: 'RS', order: 2 },
        { name: 'Kabir Jain', role: 'Packaging & Dispatch', initials: 'KJ', order: 3 },
        { name: 'Meera Nair', role: 'Customer Support', initials: 'MN', order: 4 },
      ],
      updatedAt: Timestamp.now(),
    });
    results.push('✓ settings/about');

    // ─── Settings: Social ───
    await setDoc(doc(db, 'settings', 'social'), {
      facebook: { url: 'https://facebook.com', show: true },
      instagram: { url: 'https://instagram.com', show: true },
      twitter: { url: 'https://x.com', show: true },
      youtube: { url: 'https://youtube.com', show: true },
      telegram: { url: '', show: false },
      whatsapp: { url: '', show: false },
      linkedin: { url: '', show: false },
      github: { url: '', show: false },
      updatedAt: Timestamp.now(),
    });
    results.push('✓ settings/social');

    // ─── Settings: Coupons ───
    await setDoc(doc(db, 'settings', 'coupons'), {
      items: [
        { code: 'SAVE10', type: 'percent', value: 10, minOrder: 500, maxDiscount: 200, active: true },
        { code: 'FLAT50', type: 'flat', value: 50, minOrder: 300, maxDiscount: 50, active: true },
        { code: 'WELCOME20', type: 'percent', value: 20, minOrder: 1000, maxDiscount: 500, active: true },
        { code: 'EXPIRED1', type: 'percent', value: 15, minOrder: 0, maxDiscount: 100, active: false },
      ],
      updatedAt: Timestamp.now(),
    });
    results.push('✓ settings/coupons (4 demo)');

    // ─── Settings: Gift Cards ───
    await setDoc(doc(db, 'settings', 'giftCards'), {
      items: [
        { code: 'GIFT500', balance: 500, active: true },
        { code: 'GIFT1000', balance: 1000, active: true },
        { code: 'GIFTUSED', balance: 0, active: false },
      ],
      updatedAt: Timestamp.now(),
    });
    results.push('✓ settings/giftCards (3 demo)');

    // ─── Settings: Config ───
    await setDoc(doc(db, 'settings', 'config'), {
      freeDeliveryMin: 999,
      deliveryCharge: 49,
      upiId: '',
      updatedAt: Timestamp.now(),
    });
    results.push('✓ settings/config');

    // ─── Carousel Posters (3 only) ───
    await setDoc(doc(db, 'carousel', 'carousel1'), {
      imageUrl: 'https://images.pexels.com/photos/8887011/pexels-photo-8887011.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      title: 'Festive Mithai & Sweets Showcase',
      description: 'Authentic handcrafted sweets · Flat 20% OFF on Party Boxes',
      order: 1,
      createdAt: Timestamp.now(),
    });
    await setDoc(doc(db, 'carousel', 'carousel2'), {
      imageUrl: 'https://images.pexels.com/photos/13871293/pexels-photo-13871293.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      title: 'Fresh Bakery Morning Specials',
      description: 'Warm croissants, cookies & pastries delivered straight to your door',
      order: 2,
      createdAt: Timestamp.now(),
    });
    await setDoc(doc(db, 'carousel', 'carousel3'), {
      imageUrl: 'https://images.pexels.com/photos/14048839/pexels-photo-14048839.jpeg?auto=compress&cs=tinysrgb&fit=crop&h=627&w=1200',
      title: 'Gourmet Desserts & Combo Packs',
      description: 'Use code WELCOME20 for up to ₹500 discount on your first order',
      order: 3,
      createdAt: Timestamp.now(),
    });
    results.push('✓ carousel posters (3 items)');

    // ─── Products: 15 Food Items ───
    const products = [
      { imageUrl: 'https://images.pexels.com/photos/9951856/pexels-photo-9951856.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Assorted Indian Sweets Box', description: 'A festive box of classic Indian mithai perfect for celebrations.', rate: 499, mrp: 599, stock: 24, catagory: 'Sweets', order: 1, maxQty: 10 },
      { imageUrl: 'https://images.pexels.com/photos/38028986/pexels-photo-38028986.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Chocolate Brownie Slice', description: 'Rich, fudgy brownie made with premium cocoa and nuts.', rate: 149, mrp: 199, stock: 30, catagory: 'Desserts', order: 2, maxQty: 12 },
      { imageUrl: 'https://images.pexels.com/photos/5995769/pexels-photo-5995769.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Coffee & Dessert Combo', description: 'Fresh cappuccino paired with sweet bites for a cozy break.', rate: 249, mrp: 299, stock: 18, catagory: 'Combos', order: 3, maxQty: 6 },
      { imageUrl: 'https://images.pexels.com/photos/38377151/pexels-photo-38377151.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Premium Cookie Gift Box', description: 'A curated selection of cookies and pastries in a gift-ready box.', rate: 699, mrp: 849, stock: 14, catagory: 'Bakery', order: 4, maxQty: 8 },
      { imageUrl: 'https://images.pexels.com/photos/8017963/pexels-photo-8017963.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Muffin & Pastry Platter', description: 'Mixed muffins and flaky pastries for breakfast or tea-time.', rate: 399, mrp: 499, stock: 16, catagory: 'Bakery', order: 5, maxQty: 8 },
      { imageUrl: 'https://images.pexels.com/photos/38028993/pexels-photo-38028993.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Dark Chocolate Brownie', description: 'Dense brownie with a deep chocolate flavor and soft center.', rate: 159, mrp: 209, stock: 28, catagory: 'Desserts', order: 6, maxQty: 10 },
      { imageUrl: 'https://images.pexels.com/photos/18012040/pexels-photo-18012040.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Savory Bakery Platter', description: 'Tea-time savory baked snacks served with a rustic café feel.', rate: 329, mrp: 399, stock: 12, catagory: 'Snacks', order: 7, maxQty: 6 },
      { imageUrl: 'https://images.pexels.com/photos/8498186/pexels-photo-8498186.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Chocolate Pastry Trio', description: 'Delicious layered pastries with a smooth chocolate finish.', rate: 279, mrp: 349, stock: 20, catagory: 'Desserts', order: 8, maxQty: 8 },
      { imageUrl: 'https://images.pexels.com/photos/9884561/pexels-photo-9884561.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Caramel Flan Dessert', description: 'Soft caramel pudding dessert with café-style presentation.', rate: 189, mrp: 239, stock: 15, catagory: 'Desserts', order: 9, maxQty: 8 },
      { imageUrl: 'https://images.pexels.com/photos/17525094/pexels-photo-17525094.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Crunchy Cereal Bowl Pack', description: 'Tasty cereal squares with cinnamon notes for a crisp snack.', rate: 129, mrp: 169, stock: 35, catagory: 'Snacks', order: 10, maxQty: 15 },
      { imageUrl: 'https://images.pexels.com/photos/9951856/pexels-photo-9951856.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Festive Mithai Platter', description: 'Traditional sweet assortment inspired by festive occasions.', rate: 549, mrp: 649, stock: 22, catagory: 'Sweets', order: 11, maxQty: 10 },
      { imageUrl: 'https://images.pexels.com/photos/38377151/pexels-photo-38377151.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Gourmet Cookies & Pastries', description: 'Elegant pastry assortment ideal for gifting or parties.', rate: 749, mrp: 899, stock: 11, catagory: 'Bakery', order: 12, maxQty: 8 },
      { imageUrl: 'https://images.pexels.com/photos/8498186/pexels-photo-8498186.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Chocolate Dessert Box', description: 'A dessert box with indulgent chocolate-based treats.', rate: 429, mrp: 529, stock: 17, catagory: 'Desserts', order: 13, maxQty: 8 },
      { imageUrl: 'https://images.pexels.com/photos/21207660/pexels-photo-21207660.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Bakery Window Specials', description: 'Freshly baked croissants and cookies from our bakery selection.', rate: 359, mrp: 449, stock: 10, catagory: 'Bakery', order: 14, maxQty: 6 },
      { imageUrl: 'https://images.pexels.com/photos/5995769/pexels-photo-5995769.jpeg?auto=compress&cs=tinysrgb&w=600', title: 'Daily Snack Combo', description: 'A balanced mix of sweet and crunchy snack favorites.', rate: 219, mrp: 279, stock: 26, catagory: 'Combos', order: 15, maxQty: 12 },
    ];

    for (let i = 0; i < products.length; i++) {
      await setDoc(doc(db, 'products', `product${i + 1}`), {
        ...products[i],
        createdAt: Timestamp.now(),
      });
    }
    results.push(`✓ products (${products.length} food items)`);

    // ─── Users (empty placeholder) ───
    await setDoc(doc(db, 'users', '_placeholder'), {
      _note: 'Placeholder. Users will be added here.',
      createdAt: Timestamp.now(),
    });
    results.push('✓ users (empty)');

    return { success: true, results };
  } catch (error) {
    return { success: false, results, error: String(error) };
  }
}
