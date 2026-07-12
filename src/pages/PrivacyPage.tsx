const H = ({ children }: { children: string }) => <h3 style={{ fontSize: '.88rem', fontWeight: 700, color: 'var(--text)', margin: '18px 0 8px' }}>{children}</h3>;
const P = ({ children }: { children: React.ReactNode }) => <p style={{ marginBottom: 14 }}>{children}</p>;

export default function PrivacyPage() {
  return (
    <div style={{ maxWidth: 760, margin: '0 auto', padding: '28px 16px' }}>
      <div style={{ background: 'var(--bg)', borderRadius: 14, border: '1px solid var(--border)', padding: '24px 22px' }}>
        <h1 style={{ fontSize: '1.15rem', fontWeight: 700, color: 'var(--text)', marginBottom: 14 }}>Privacy Policy</h1>
        <div style={{ fontSize: '.82rem', color: 'var(--text-sec)', lineHeight: 1.8 }}>
          <P>This Privacy Policy explains how we collect, use, store, and protect your personal information in compliance with the Information Technology Act, 2000, the Information Technology (Reasonable Security Practices and Procedures and Sensitive Personal Data or Information) Rules, 2011, and the Digital Personal Data Protection Act, 2023 of India.</P>

          <H>Information we collect</H>
          <P>We collect the following categories of information: name, email address, phone number, delivery address, order history, payment references (UPI UTR numbers), wishlist data, device information, and login credentials via Google Authentication. For food orders, we may also collect dietary preferences or allergy-related information if voluntarily provided.</P>

          <H>How we use your data</H>
          <P>Your data is used to: create and manage your account, process and deliver food orders, verify payments, manage wishlists and saved addresses, send order updates and delivery notifications, comply with FSSAI and food safety record-keeping requirements, improve our services and website experience, and respond to your queries and complaints.</P>

          <H>Legal basis for processing</H>
          <P>We process your personal data based on: your consent (provided during account creation and order placement), contractual necessity (to fulfill your orders), legal obligations (FSSAI compliance, tax records, consumer protection laws), and legitimate interests (fraud prevention, service improvement).</P>

          <H>Payment information</H>
          <P>We do not store your bank account details or UPI credentials. We only store payment reference numbers (UTR/transaction IDs) for order verification and dispute resolution. Gift card codes and coupon usage are recorded for accounting and audit purposes.</P>

          <H>Data storage & security</H>
          <P>Your data is stored on Firebase (Google Cloud) servers. We implement reasonable security practices as required under the IT Act, 2000 including encrypted data transmission, access controls, and secure authentication. However, no method of electronic transmission is completely secure, and we cannot guarantee absolute security.</P>

          <H>Data sharing</H>
          <P>We do not sell your personal data. We may share your information with: delivery partners (name, address, phone number for order fulfillment), payment processors (for transaction verification), legal authorities (if required by law, court order, or government regulation), and service providers (Firebase, analytics tools) under strict data processing agreements.</P>

          <H>Cookies & tracking</H>
          <P>This website uses local storage and cookies for: maintaining your login session, saving theme preferences (dark/light mode), cart persistence, and basic analytics. You can clear local storage through your browser settings at any time.</P>

          <H>Data retention</H>
          <P>We retain your personal data for as long as your account is active or as needed to provide services. Order records are retained for a minimum of 8 years as required under Indian tax and commercial law. You may request deletion of your account data by contacting us, subject to legal retention obligations.</P>

          <H>Your rights</H>
          <P>Under Indian law, you have the right to: access your personal data, correct inaccurate data through your profile settings, withdraw consent for data processing (which may limit service functionality), request deletion of your data (subject to legal retention requirements), and lodge a complaint with the relevant Data Protection Authority.</P>

          <H>Children's privacy</H>
          <P>This website is not intended for use by individuals under 18 years of age. We do not knowingly collect personal data from minors. If we become aware that we have collected data from a minor, we will take steps to delete it promptly.</P>

          <H>Grievance officer</H>
          <P>In accordance with the IT Act, 2000 and associated rules, our Grievance Officer can be reached via the Contact page. Complaints will be acknowledged within 48 hours and resolved within 30 days of receipt.</P>

          <H>Changes to this policy</H>
          <P>We may update this Privacy Policy from time to time. Changes will be posted on this page. Continued use of the website after changes are published constitutes acceptance of the updated policy.</P>
        </div>
      </div>
    </div>
  );
}
