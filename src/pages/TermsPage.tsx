const H = ({ children }: { children: string }) => <h3 style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text)', margin: '18px 0 8px' }}>{children}</h3>;
const P = ({ children }: { children: React.ReactNode }) => <p style={{ marginBottom: 14 }}>{children}</p>;

export default function TermsPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 16px' }}>
      <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '24px 22px' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Terms & Conditions</h1>
        <div style={{ fontSize: '.82rem', color: 'var(--text-sec)', lineHeight: 1.8 }}>
          <P>Welcome to our platform. These Terms and Conditions govern your use of our website and services. By placing an order or using this website, you agree to be bound by these terms in accordance with the laws of India, including but not limited to the Information Technology Act, 2000, the Consumer Protection Act, 2019, and the Food Safety and Standards Act, 2006 (FSSAI).</P>

          <H>Eligibility</H>
          <P>You must be at least 18 years of age to use this website or place an order. By using the platform, you represent that you meet this requirement. Minors may use the site only under the supervision of a parent or legal guardian.</P>

          <H>Products & food items</H>
          <P>We sell food products that comply with the Food Safety and Standards Act, 2006 and FSSAI regulations. All food items listed on the website are prepared and packaged in compliance with applicable FSSAI guidelines. Product images are for illustration purposes and the actual product may vary slightly in appearance. Nutritional information and allergen declarations, where provided, are approximate and should be verified on the actual packaging.</P>

          <H>Pricing & payments</H>
          <P>All prices are listed in Indian Rupees (₹) and are inclusive of applicable taxes including GST unless stated otherwise. We accept payments via UPI and gift cards. Payment details such as UTR numbers must be provided accurately. Orders remain subject to verification and confirmation. We reserve the right to cancel orders if payment verification fails or if pricing errors are identified.</P>

          <H>Orders & delivery</H>
          <P>Placing an order constitutes an offer to purchase. Order confirmation is subject to product availability, payment verification, and delivery serviceability to your pincode. Estimated delivery timelines are indicative and may vary due to factors beyond our control including weather, logistics delays, or public holidays. We are not liable for delays caused by incorrect address or contact information provided by the customer.</P>

          <H>Cancellations</H>
          <P>Orders can be cancelled only until the order reaches the "Processing" stage. Once an order is being prepared or has been dispatched, cancellation is not possible. Cancellation requests are subject to verification and approved cancellations will be processed as refunds within 5 to 7 working days.</P>

          <H>Refunds</H>
          <P>Refunds for eligible cancellations or defective/damaged products will be processed to the original payment method within 5 to 7 working days from the date of approval. Refund timelines may vary depending on your bank or payment provider. Refunds will not be issued for products that have been consumed, opened (unless defective), or for change of mind after delivery.</P>

          <H>Replacement</H>
          <P>Replacement requests for damaged, defective, or incorrect items must be raised within 3 days of delivery. Items must be returned in their original packaging and condition. Replacement is subject to product availability. Perishable food items are eligible for replacement only if reported within 24 hours of delivery with supporting evidence (photographs).</P>

          <H>Food safety & hygiene</H>
          <P>Our food products are prepared and handled in accordance with FSSAI food safety standards. We recommend consuming products before the "Best Before" date printed on the packaging. Storage instructions on the packaging must be followed. We are not responsible for any adverse effects resulting from improper storage, handling, or consumption of expired products by the customer.</P>

          <H>Intellectual property</H>
          <P>All content on this website including text, images, logos, product descriptions, and design elements are the intellectual property of the company. Unauthorized reproduction, distribution, or commercial use of any content is prohibited under the Copyright Act, 1957.</P>

          <H>User accounts</H>
          <P>You are responsible for maintaining the confidentiality of your account credentials. You agree to provide accurate and complete information during registration and ordering. We reserve the right to suspend or terminate accounts that violate these terms or are involved in fraudulent activity.</P>

          <H>Limitation of liability</H>
          <P>To the maximum extent permitted by applicable Indian law, our total liability for any claim arising from or related to the use of this website or products purchased shall not exceed the amount paid by you for the specific order in question. We are not liable for any indirect, incidental, or consequential damages.</P>

          <H>Governing law & jurisdiction</H>
          <P>These terms are governed by the laws of India. Any disputes arising from the use of this website or services shall be subject to the exclusive jurisdiction of the courts in India. Consumers may also approach the Consumer Disputes Redressal Commission under the Consumer Protection Act, 2019.</P>

          <H>Grievance redressal</H>
          <P>In accordance with the Information Technology Act, 2000 and the Consumer Protection (E-Commerce) Rules, 2020, if you have any complaints or grievances regarding the platform, products, or services, you may contact our Grievance Officer via the Contact page. We aim to acknowledge complaints within 48 hours and resolve them within 30 days.</P>

          <H>Changes to these terms</H>
          <P>We reserve the right to update these Terms and Conditions at any time. Changes will be posted on this page with an updated effective date. Continued use of the website after changes are posted constitutes acceptance of the revised terms.</P>
        </div>
      </div>
    </div>
  );
}
