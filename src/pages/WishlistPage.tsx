import { WishlistActions } from '../lib/useWishlist';
import { CartActions } from '../lib/useCart';

interface Props {
  wishlist: WishlistActions;
  cart: CartActions;
}

export default function WishlistPage({ wishlist, cart }: Props) {
  return (
    <div style={{ maxWidth: 680, margin: '0 auto', padding: '28px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
        <h3 style={{ fontSize: '.95rem', fontWeight: 700, color: 'var(--text)', margin: 0 }}>My Wishlist</h3>
        <div style={{ flex: 1, height: 1, background: 'var(--border)' }} />
      </div>

      {wishlist.items.length === 0 ? (
        <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '40px 22px', textAlign: 'center' }}>
          <div style={{ fontSize: '.88rem', color: 'var(--text-sec)', marginBottom: 4 }}>Your wishlist is empty</div>
          <div style={{ fontSize: '.76rem', color: 'var(--text-sec)' }}>Tap the heart icon on products to save them here</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }}>
          {wishlist.items.map(p => {
            const qty = cart.items[p.id]?.qty || 0;
            const discount = p.mrp > p.rate ? Math.round(((p.mrp - p.rate) / p.mrp) * 100) : 0;
            const orderLimit = Math.min(p.maxQty || 1, p.stock || 0);
            const outOfStock = (p.stock || 0) <= 0;
            return (
              <div key={p.id} className="card-gpu" style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', overflow: 'hidden' }}>
                <div style={{ position: 'relative', width: '100%', aspectRatio: '1/1', background: '#eee', overflow: 'hidden' }}>
                  {p.imageUrl && <img src={p.imageUrl} alt={p.title} loading="lazy" decoding="async" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover' }} />}
                  <button
                    onClick={() => wishlist.toggle(p)}
                    aria-label="Remove from wishlist"
                    style={{ position: 'absolute', top: 8, right: 8, width: 32, height: 32, borderRadius: 16, border: 'none', background: 'var(--bg)', boxShadow: '0 1px 6px rgba(0,0,0,.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0, color: '#e74c3c' }}
                  >
                    <svg viewBox="0 0 24 24" style={{ width: 16, height: 16, fill: '#e74c3c', stroke: '#e74c3c', strokeWidth: 1.6, strokeLinecap: 'round', strokeLinejoin: 'round', display: 'block' }}>
                      <path d="M12.62 20.81c-.34.12-.9.12-1.24 0C8.48 19.82 2 15.69 2 8.69 2 5.6 4.49 3.1 7.56 3.1c1.82 0 3.43.88 4.44 2.24a5.53 5.53 0 014.44-2.24C19.51 3.1 22 5.6 22 8.69c0 7-6.48 11.13-9.38 12.12z" />
                    </svg>
                  </button>
                </div>
                <div style={{ padding: '10px 12px 12px' }}>
                  <div style={{ fontSize: '.84rem', fontWeight: 600, color: 'var(--text)', marginBottom: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{p.title}</div>
                  <div style={{ fontSize: '.72rem', color: 'var(--text-sec)', marginBottom: 5 }}>{p.catagory}</div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 5, marginBottom: 10 }}>
                    <span style={{ fontSize: '.9rem', fontWeight: 700, color: 'var(--text)' }}>₹{p.rate.toLocaleString('en-IN')}</span>
                    {p.mrp > p.rate && <span style={{ fontSize: '.64rem', color: 'var(--text-sec)', textDecoration: 'line-through' }}>₹{p.mrp.toLocaleString('en-IN')}</span>}
                    {discount > 0 && <span style={{ fontSize: '.64rem', fontWeight: 600, color: '#27ae60' }}>{discount}% off</span>}
                  </div>
                  {qty === 0 ? (
                    <button onClick={() => cart.add({ id: p.id, title: p.title, price: p.rate, mrp: p.mrp, image: p.imageUrl, stock: p.stock, maxQty: p.maxQty, catagory: p.catagory })} disabled={outOfStock} style={{ width: '100%', padding: '8px 0', borderRadius: 8, border: '1px solid var(--border)', background: outOfStock ? 'var(--hover)' : 'none', color: outOfStock ? 'var(--text-sec)' : 'var(--text)', fontSize: '.78rem', fontWeight: 600, cursor: outOfStock ? 'not-allowed' : 'pointer', fontFamily: 'inherit' }}>{outOfStock ? 'Out of stock' : 'Add to cart'}</button>
                  ) : (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderRadius: 8, border: '1px solid var(--border)' }}>
                      <button onClick={() => cart.dec(p.id)} style={{ width: 38, height: 34, border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text)', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'inherit' }}>−</button>
                      <span style={{ fontSize: '.84rem', fontWeight: 700, color: 'var(--text)' }}>{qty}</span>
                      <button disabled={qty >= orderLimit} onClick={() => cart.inc(p.id)} style={{ width: 38, height: 34, border: 'none', background: 'none', cursor: qty >= orderLimit ? 'not-allowed' : 'pointer', color: qty >= orderLimit ? 'var(--text-sec)' : 'var(--text)', fontSize: '1.1rem', fontWeight: 600, fontFamily: 'inherit' }}>+</button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
