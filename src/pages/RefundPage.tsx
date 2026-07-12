const H = ({ children }: { children: string }) => <h3 style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text)', margin: '18px 0 8px' }}>{children}</h3>;
const P = ({ children }: { children: React.ReactNode }) => <p style={{ marginBottom: 14 }}>{children}</p>;

export default function RefundPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 16px' }}>
      <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '24px 22px' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Refund & Cancellation Policy</h1>
        <div style={{ fontSize: '.82rem', color: 'var(--text-sec)', lineHeight: 1.8 }}>
          <P>This Refund and Cancellation Policy is in accordance with the Consumer Protection Act, 2019 and the Consumer Protection (E-Commerce) Rules, 2020 of India. It applies to all food product orders placed through our website.</P>

          <H>Cancellation by customer</H>
          <P>You may cancel your order at any time before it reaches the "Processing" stage. Once food preparation has begun (Processing, Shipped, or Delivered status), cancellation is not possible due to the perishable nature of food products. To cancel, go to Orders in your account, select the order, and choose a cancellation reason.</P>

          <H>Cancellation by us</H>
          <P>We reserve the right to cancel orders in the following situations: payment verification failure, product unavailability, suspected fraudulent activity, incorrect pricing due to technical errors, or inability to deliver to the provided address. In such cases, a full refund will be initiated automatically.</P>

          <H>Refund eligibility</H>
          <P>Refunds are applicable in the following cases:</P>
          <ul style={{ paddingLeft: 18, marginBottom: 14 }}>
            <li style={{ marginBottom: 6 }}>Order cancelled before the Processing stage</li>
            <li style={{ marginBottom: 6 }}>Damaged or spoiled food items received (reported within 24 hours with photo evidence)</li>
            <li style={{ marginBottom: 6 }}>Wrong product delivered</li>
            <li style={{ marginBottom: 6 }}>Missing items from the order</li>
            <li style={{ marginBottom: 6 }}>Order cancelled by us due to unavailability or payment issues</li>
          </ul>

          <H>Non-refundable cases</H>
          <P>Refunds will not be issued in the following cases:</P>
          <ul style={{ paddingLeft: 18, marginBottom: 14 }}>
            <li style={{ marginBottom: 6 }}>Change of mind after delivery</li>
            <li style={{ marginBottom: 6 }}>Products consumed or opened (unless defective)</li>
            <li style={{ marginBottom: 6 }}>Damage caused by improper storage after delivery</li>
            <li style={{ marginBottom: 6 }}>Delay in reporting issues beyond the allowed window</li>
            <li style={{ marginBottom: 6 }}>Incorrect address provided by the customer leading to delivery failure</li>
          </ul>

          <H>Refund process</H>
          <P>Once a refund is approved, it will be processed within 5 to 7 working days. Refunds will be credited to the original payment method (UPI account). If a gift card was used, the refund amount corresponding to the gift card will be credited back to the same gift card. The refund transaction ID and date will be updated in your order details once processed.</P>

          <H>Partial refunds</H>
          <P>In cases where only part of the order is affected (e.g., one item damaged out of multiple), a partial refund proportional to the affected item(s) will be issued. Delivery charges are non-refundable unless the entire order is cancelled or all items are defective.</P>

          <H>Replacement policy</H>
          <P>You may request a replacement for damaged, defective, or incorrect food items within 3 days of delivery. For perishable food items, replacement must be requested within 24 hours of delivery with supporting photographs. Replacement is subject to product availability. If replacement is not possible, a full refund for the affected item(s) will be issued.</P>

          <H>How to request a refund or replacement</H>
          <P>Go to the Orders section in your account, select the relevant order, and use the Cancel Order or Request Replacement option. You may also contact us through the Contact page with your order ID and details of the issue. All refund and replacement requests are reviewed within 48 hours.</P>

          <H>Coupon and gift card refunds</H>
          <P>If a coupon was used on a cancelled order, the coupon will not be re-issued unless the cancellation was initiated by us. Gift card amounts used on cancelled orders will be credited back to the same gift card within the standard refund timeline.</P>

          <H>Dispute resolution</H>
          <P>If you are not satisfied with the resolution of your refund or cancellation request, you may escalate the matter to our Grievance Officer via the Contact page. Consumers also have the right to approach the Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019.</P>

          <H>Changes to this policy</H>
          <P>We may update this Refund and Cancellation Policy from time to time. Changes will be posted on this page. Continued use of the website constitutes acceptance of the updated policy.</P>
        </div>
      </div>
    </div>
  );
}
