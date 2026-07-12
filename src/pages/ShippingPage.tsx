const H = ({ children }: { children: string }) => <h3 style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text)', margin: '18px 0 8px' }}>{children}</h3>;
const P = ({ children }: { children: React.ReactNode }) => <p style={{ marginBottom: 14 }}>{children}</p>;

export default function ShippingPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 16px' }}>
      <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '24px 22px' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Shipping Policy</h1>
        <div style={{ fontSize: '.82rem', color: 'var(--text-sec)', lineHeight: 1.8 }}>
          <P>This Shipping Policy applies to all food product orders placed through our website. We aim to deliver fresh, high-quality food items to your doorstep in a timely and safe manner.</P>

          <H>Shipping coverage</H>
          <P>We currently deliver across serviceable pincodes within India. Delivery availability is validated during checkout based on the pincode provided. If your area is not serviceable, you will be notified before order confirmation.</P>

          <H>Delivery charges</H>
          <P>Delivery charges are calculated based on your order value. Orders above the minimum free delivery threshold (as displayed during checkout) qualify for free delivery. For orders below this threshold, a flat delivery charge will be applied and shown in the cart before payment.</P>

          <H>Processing time</H>
          <P>Orders are processed within 1 to 2 business days after payment verification. For perishable food items, orders are prepared fresh and dispatched to ensure maximum freshness upon delivery. Processing times may be extended during festivals, holidays, or periods of high demand.</P>

          <H>Estimated delivery time</H>
          <P>Standard delivery within metro cities: 2 to 4 business days. Standard delivery to other cities and towns: 4 to 7 business days. Remote or rural areas: 7 to 10 business days. These are estimated timelines and actual delivery may vary due to logistics, weather conditions, or unforeseen circumstances.</P>

          <H>Packaging</H>
          <P>All food products are packed in food-grade, FSSAI-compliant packaging designed to maintain freshness, hygiene, and quality during transit. Perishable items are packed with appropriate insulation or cold chain packaging where required. We use tamper-evident seals to ensure product integrity.</P>

          <H>Order tracking</H>
          <P>Once your order is dispatched, you can track its status through the Orders section in your account. Order status updates include: Pending Verification, Placed, Confirmed, Processing, Shipped, and Delivered.</P>

          <H>Delivery attempt</H>
          <P>Our delivery partner will attempt delivery to the address provided during checkout. Please ensure someone is available to receive the order. If delivery fails due to incorrect address, unavailability of the recipient, or refusal to accept, we may charge for re-delivery or the order may be cancelled.</P>

          <H>Damaged or incorrect items</H>
          <P>If you receive a damaged, spoiled, or incorrect food item, please report it within 24 hours of delivery with photographs through the Orders section or Contact page. We will arrange a replacement or refund as per our Refund Policy.</P>

          <H>Temperature-sensitive items</H>
          <P>Certain food products require specific storage conditions. Please follow the storage instructions on the product packaging immediately upon delivery. We are not responsible for spoilage or quality degradation caused by improper storage after delivery.</P>

          <H>Force majeure</H>
          <P>We are not liable for delivery delays caused by events beyond our reasonable control, including but not limited to natural disasters, strikes, government restrictions, pandemics, or logistics disruptions.</P>

          <H>Contact us</H>
          <P>For any shipping-related queries or concerns, please reach out to us through the Contact page. We aim to respond to all shipping inquiries within 24 hours.</P>
        </div>
      </div>
    </div>
  );
}
