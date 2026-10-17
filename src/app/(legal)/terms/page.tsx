import Link from "next/link";
import styles from "../../page.module.css";

export default function TermsOfService() {
  return (
    <div
      className={styles.container}
      style={{ padding: "8rem 2rem 4rem", maxWidth: "860px", margin: "0 auto" }}
    >
      <Link href="/" style={{ color: "#E8A0A8", marginBottom: "2rem", display: "inline-block" }}>
        ← Back to Home
      </Link>
      <h1 className={styles.sectionTitle} style={{ textAlign: "left", marginBottom: "0.5rem" }}>
        Terms of Service
      </h1>
      <p className={styles.subtitle} style={{ marginBottom: "3rem", textAlign: "left" }}>
        Effective Date: October 1, 2026 | Last Updated: October 1, 2026
      </p>

      <div style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.8", fontSize: "0.95rem" }}>
        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          1. Acceptance of Terms
        </h2>
        <p>
          These Terms of Service ("Terms") constitute a legally binding agreement between you ("you"
          or "User") and CodeCompass ("we," "us," or "our") governing your access to and use of the
          CodeCompass platform, including our website, web application, APIs, and all related
          services (collectively, the "Service"). By creating an account or using the Service, you
          agree to be bound by these Terms. If you do not agree, you must not use the Service.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          2. Eligibility
        </h2>
        <p>
          You must be at least 16 years old to use the Service. By using the Service, you represent
          and warrant that you meet this age requirement and have the legal capacity to enter into
          these Terms.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          3. Account Registration
        </h2>
        <p>
          You agree to provide accurate, current, and complete information during registration and
          to keep your account credentials secure. You are responsible for all activities that occur
          under your account. Notify us immediately at support@codecompass.app if you suspect
          unauthorized access.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          4. Description of Service
        </h2>
        <p>
          CodeCompass is an AI-powered workspace designed for students in intensive software
          engineering programs. The Service allows you to:
        </p>
        <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
          <li style={{ marginBottom: "0.4rem" }}>
            Store and organize notes, code snippets, API keys, and project files.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            Use AI-powered tools to refine, tag, and summarize your notes.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>Track academic progress and deadlines.</li>
          <li style={{ marginBottom: "0.4rem" }}>
            Access study tools such as flashcards and mood tracking.
          </li>
        </ul>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          5. AI Features and Disclaimers
        </h2>
        <p>
          <strong>AI Transparency:</strong> The Service uses artificial intelligence, including
          third-party AI providers such as xAI's Grok, to assist with note organization and
          summarization. You acknowledge that AI-generated outputs may be inaccurate, incomplete, or
          misleading. You are solely responsible for reviewing and verifying any AI-generated
          content before relying on it.
        </p>
        <p>
          <strong>No Training on Your Data:</strong> We do not use your personal notes, code, or
          other content to train AI models without your explicit consent. You may opt out of AI
          processing at any time in your account settings.
        </p>
        <p>
          <strong>Ownership of AI Outputs:</strong> You retain ownership of any content you submit
          to the Service. AI-generated refinements and summaries are provided for your use, and you
          may use them freely.
        </p>
        <p>
          <strong>Accuracy Disclaimer:</strong> The Service is provided "as is" and "as available."
          We make no warranties regarding the accuracy, reliability, or completeness of AI-generated
          content or any other aspect of the Service.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          6. Acceptable Use
        </h2>
        <p>You agree not to:</p>
        <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
          <li style={{ marginBottom: "0.4rem" }}>Use the Service for any unlawful purpose.</li>
          <li style={{ marginBottom: "0.4rem" }}>
            Upload or transmit viruses, malware, or any harmful code.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            Attempt to gain unauthorized access to the Service or other users' accounts.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            Interfere with or disrupt the integrity or performance of the Service.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            Store or share content that infringes on third-party intellectual property rights.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            Use the Service to store or process illegal content.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>Share your account credentials with others.</li>
        </ul>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          7. User Content and Intellectual Property
        </h2>
        <p>
          You retain all rights to the content you create, upload, or store on the Service ("User
          Content"). By using the Service, you grant CodeCompass a limited, non-exclusive,
          royalty-free license to process, store, and display your User Content solely for the
          purpose of providing the Service.
        </p>
        <p>
          We retain all rights to the Service itself, including its design, code, features, and
          branding. You may not copy, modify, distribute, or reverse engineer any part of the
          Service without our prior written consent.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          8. Subscriptions and Payments
        </h2>
        <p>
          The Service may offer free and paid subscription tiers. Paid subscriptions are billed on a
          recurring basis. You may cancel at any time, and you will retain access until the end of
          your current billing period. Refunds are provided at our sole discretion and in accordance
          with applicable law.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          9. Privacy and Data Protection
        </h2>
        <p>
          Your privacy is important to us. Our collection, use, and protection of your personal data
          is governed by our Privacy Policy, which is incorporated into these Terms by reference. By
          using the Service, you consent to the processing of your data as described in the Privacy
          Policy.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          10. Data Retention and Deletion
        </h2>
        <p>
          You may delete your account at any time through your account settings or by contacting us
          at support@codecompass.app. Upon deletion, we will remove or anonymize your personal data
          within 30 days, except where we are required to retain it for legal or regulatory
          purposes. You are responsible for backing up any content you wish to keep before deleting
          your account.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          11. Limitation of Liability
        </h2>
        <p>
          To the fullest extent permitted by law, CodeCompass and its officers, directors,
          employees, and agents shall not be liable for any indirect, incidental, special,
          consequential, or punitive damages, including loss of profits, data, or goodwill, arising
          out of or in connection with your use of the Service. Our total liability to you for any
          claim arising from these Terms or the Service shall not exceed the amount you paid us, if
          any, in the twelve months preceding the claim.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          12. Indemnification
        </h2>
        <p>
          You agree to indemnify and hold harmless CodeCompass and its affiliates from any claims,
          damages, losses, or expenses arising from your use of the Service, your violation of these
          Terms, or your infringement of any third-party rights.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          13. Termination
        </h2>
        <p>
          We reserve the right to suspend or terminate your access to the Service at any time, with
          or without notice, for conduct that we believe violates these Terms or is harmful to other
          users, us, or third parties, or for any other reason at our sole discretion.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          14. Governing Law and Dispute Resolution
        </h2>
        <p>
          These Terms shall be governed by and construed in accordance with the laws of Kenya,
          without regard to its conflict of law principles. Any disputes arising under these Terms
          shall be resolved through binding arbitration in Nairobi, Kenya, or, where applicable, in
          the jurisdiction of your residence as required by local consumer protection laws.
        </p>
        <p>
          For users in the EEA, nothing in these Terms affects your rights under mandatory consumer
          protection laws in your country of residence.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          15. Changes to These Terms
        </h2>
        <p>
          We may update these Terms from time to time. Material changes will be communicated via
          email or through a prominent notice on the Service. Your continued use of the Service
          after changes take effect constitutes acceptance of the revised Terms.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          16. Severability
        </h2>
        <p>
          If any provision of these Terms is found to be unenforceable or invalid, that provision
          will be limited or eliminated to the minimum extent necessary, and the remaining
          provisions will remain in full force and effect.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          17. Contact Information
        </h2>
        <p>For questions about these Terms, please contact us at:</p>
        <p style={{ paddingLeft: "1.5rem" }}>
          Email: legal@codecompass.app
          <br />
          Address: Nairobi, Kenya
        </p>
      </div>
    </div>
  );
}
