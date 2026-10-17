import Link from "next/link";
import styles from "../../page.module.css";

export default function PrivacyPolicy() {
  return (
    <div
      className={styles.container}
      style={{ padding: "8rem 2rem 4rem", maxWidth: "860px", margin: "0 auto" }}
    >
      <Link href="/" style={{ color: "#E8A0A8", marginBottom: "2rem", display: "inline-block" }}>
        ← Back to Home
      </Link>
      <h1 className={styles.sectionTitle} style={{ textAlign: "left", marginBottom: "0.5rem" }}>
        Privacy Policy
      </h1>
      <p className={styles.subtitle} style={{ marginBottom: "3rem", textAlign: "left" }}>
        Effective Date: October 1, 2026 | Last Updated: October 1, 2026
      </p>

      <div style={{ color: "rgba(255,255,255,0.7)", lineHeight: "1.8", fontSize: "0.95rem" }}>
        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          1. Introduction
        </h2>
        <p>
          CodeCompass ("we," "us," or "our") operates a software-as-a-service platform designed to
          help students in intensive software engineering programs organize their notes, code
          snippets, API keys, project files, and academic deadlines. This Privacy Policy explains
          how we collect, use, store, share, and protect your personal data when you use our
          website, web application, and related services (collectively, the "Service").
        </p>
        <p>
          We are committed to protecting your privacy and complying with applicable data protection
          laws, including the General Data Protection Regulation (GDPR) for users in the European
          Economic Area (EEA), the California Consumer Privacy Act (CCPA/CPRA) for California
          residents, the Kenya Data Protection Act, 2019 (KDPA), and the Protection of Personal
          Information Act, 2013 (POPIA) for South African users. By accessing or using the Service,
          you acknowledge that you have read and understood this Privacy Policy.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          2. Data Controller
        </h2>
        <p>
          CodeCompass is the data controller responsible for your personal data. For any
          privacy-related inquiries, you may contact our Data Protection Officer at:
        </p>
        <p style={{ paddingLeft: "1.5rem" }}>
          Email: privacy@codecompass.app
          <br />
          Address: Nairobi, Kenya
        </p>
        <p>
          If you are located in the EEA, you have the right to lodge a complaint with your local
          supervisory authority. If you are located in Kenya, you may contact the Office of the Data
          Protection Commissioner (ODPC). If you are located in South Africa, you may contact the
          Information Regulator.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          3. Information We Collect
        </h2>
        <p>We collect the following categories of personal data:</p>
        <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Account Information:</strong> Your full name, email address, and hashed password
            when you create an account.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>User Content:</strong> Notes, text snippets, code blocks, screenshots, voice
            memos, API keys, environment variables, and project metadata you upload or create within
            the Service.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Usage Data:</strong> Information about how you interact with the Service,
            including pages visited, features used, session duration, and device/browser
            information.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Mood and Wellbeing Data:</strong> Optional daily mood check-ins that you may
            choose to record. This data is considered sensitive and is treated with additional care.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Authentication Data:</strong> If you sign in through a third-party provider
            (e.g., GitHub, Google), we receive basic profile information such as your name and email
            address.
          </li>
        </ul>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          4. Legal Basis for Processing (GDPR and POPIA)
        </h2>
        <p>We process your personal data on the following legal bases:</p>
        <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Contractual Necessity:</strong> Processing is necessary to provide the Service
            you have signed up for, including account creation, note storage, and AI-powered
            organization features.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Consent:</strong> For processing that requires your explicit consent, such as
            mood tracking and optional AI training data usage. You may withdraw consent at any time.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Legitimate Interests:</strong> For improving the Service, ensuring security, and
            preventing fraud, provided your rights and interests do not override these interests.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Legal Obligation:</strong> To comply with applicable laws and regulations.
          </li>
        </ul>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          5. How We Use Your Information
        </h2>
        <p>We use your personal data for the following purposes:</p>
        <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>To provide, maintain, and improve the Service.</li>
          <li style={{ marginBottom: "0.5rem" }}>
            To process and organize your notes, code snippets, and other content using AI-powered
            tools, including integration with third-party AI providers (e.g., xAI's Grok API).
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            To authenticate your account and manage your access.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            To send you service-related communications, such as security alerts and account updates.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            To detect, prevent, and address technical issues, security threats, and fraudulent
            activity.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>To comply with legal obligations.</li>
        </ul>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          6. AI Processing and Third-Party Services
        </h2>
        <p>
          CodeCompass uses artificial intelligence to help organize and refine your notes. When you
          submit content to the AI features, it is processed by third-party AI providers, including
          xAI (Grok). We do not allow third-party AI providers to use your personal content to train
          their models without your explicit consent. You may opt out of AI processing at any time
          in your account settings, though this may limit certain features of the Service.
        </p>
        <p>We also use the following third-party service providers:</p>
        <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Supabase:</strong> For authentication, database storage, and file storage.
            Supabase stores data in the European Union (Ireland).
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Vercel:</strong> For hosting the web application.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>xAI (Grok):</strong> For AI-powered note refinement and organization.
          </li>
        </ul>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          7. Data Sharing and Disclosure
        </h2>
        <p>
          We do not sell your personal data. We may share your data in the following circumstances:
        </p>
        <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>With Service Providers:</strong> As described in Section 6, we share data with
            third-party processors who assist us in operating the Service.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>With Your Consent:</strong> If you choose to share notes, flashcards, or project
            hubs with peers or study groups.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Legal Requirements:</strong> If required by law, regulation, or legal process.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            <strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale
            of assets, your data may be transferred as part of the transaction.
          </li>
        </ul>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          8. Data Retention
        </h2>
        <p>
          We retain your personal data for as long as your account is active or as needed to provide
          the Service. You may delete your account at any time, after which we will delete or
          anonymize your personal data within 30 days, unless we are required to retain it for legal
          or regulatory purposes. Screenshots and uploaded files stored in Supabase Storage are
          deleted when you delete the corresponding content or your account.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          9. Data Security
        </h2>
        <p>
          We implement appropriate technical and organizational measures to protect your personal
          data against unauthorized access, alteration, disclosure, or destruction. These measures
          include:
        </p>
        <ul style={{ paddingLeft: "1.5rem", marginTop: "0.5rem" }}>
          <li style={{ marginBottom: "0.5rem" }}>Encryption of data in transit and at rest.</li>
          <li style={{ marginBottom: "0.5rem" }}>Secure authentication via Supabase Auth.</li>
          <li style={{ marginBottom: "0.5rem" }}>
            Row-level security policies in our database to ensure users can only access their own
            data.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            Encryption of sensitive data such as API keys using Supabase Vault.
          </li>
          <li style={{ marginBottom: "0.5rem" }}>
            Regular security audits and vulnerability assessments.
          </li>
        </ul>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          10. Your Rights
        </h2>
        <p>Depending on your jurisdiction, you may have the following rights:</p>

        <h3
          style={{
            color: "#E8A0A8",
            fontSize: "1.1rem",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          For EEA Users (GDPR)
        </h3>
        <ul style={{ paddingLeft: "1.5rem" }}>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right of Access:</strong> Request a copy of the personal data we hold about you.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Rectification:</strong> Request correction of inaccurate or incomplete
            data.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Erasure:</strong> Request deletion of your personal data.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Restrict Processing:</strong> Request that we limit how we process your
            data.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Data Portability:</strong> Receive your data in a structured,
            machine-readable format.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Object:</strong> Object to processing based on legitimate interests.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Withdraw Consent:</strong> Withdraw consent at any time where
            processing is based on consent.
          </li>
        </ul>

        <h3
          style={{
            color: "#E8A0A8",
            fontSize: "1.1rem",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          For California Residents (CCPA/CPRA)
        </h3>
        <ul style={{ paddingLeft: "1.5rem" }}>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Know:</strong> Request disclosure of the categories and specific pieces
            of personal information we have collected.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Delete:</strong> Request deletion of your personal information.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Opt Out:</strong> Opt out of the sale or sharing of personal
            information. We do not sell your data.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Non-Discrimination:</strong> We will not discriminate against you for
            exercising your rights.
          </li>
        </ul>

        <h3
          style={{
            color: "#E8A0A8",
            fontSize: "1.1rem",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          For Kenyan Users (KDPA)
        </h3>
        <ul style={{ paddingLeft: "1.5rem" }}>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to be Informed:</strong> Know how your data is being used.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right of Access:</strong> Access your personal data.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Object:</strong> Object to processing of your personal data.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Data Portability:</strong> Receive your data in a portable format.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Erasure:</strong> Request deletion of your personal data.
          </li>
        </ul>

        <h3
          style={{
            color: "#E8A0A8",
            fontSize: "1.1rem",
            marginTop: "1.5rem",
            marginBottom: "0.5rem",
          }}
        >
          For South African Users (POPIA)
        </h3>
        <ul style={{ paddingLeft: "1.5rem" }}>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right of Access:</strong> Request access to your personal information.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Correction:</strong> Request correction of inaccurate information.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Deletion:</strong> Request deletion of your personal information.
          </li>
          <li style={{ marginBottom: "0.4rem" }}>
            <strong>Right to Object:</strong> Object to processing of your personal information.
          </li>
        </ul>

        <p style={{ marginTop: "1.5rem" }}>
          To exercise any of these rights, please contact us at privacy@codecompass.app. We will
          respond within 30 days of receiving your request.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          11. International Data Transfers
        </h2>
        <p>
          Your personal data may be transferred to and processed in countries outside your
          jurisdiction, including the European Union (where Supabase stores data) and the United
          States (where our AI providers may process data). We ensure appropriate safeguards are in
          place for such transfers, including Standard Contractual Clauses approved by the European
          Commission.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          12. Children's Privacy
        </h2>
        <p>
          The Service is not intended for children under the age of 16. We do not knowingly collect
          personal data from children under 16. If we become aware that we have collected data from
          a child under 16, we will take steps to delete such data promptly.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          13. Cookies and Tracking
        </h2>
        <p>
          We use essential cookies for authentication and session management. We do not use
          advertising or tracking cookies. You can manage cookie preferences through your browser
          settings.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          14. Changes to This Privacy Policy
        </h2>
        <p>
          We may update this Privacy Policy from time to time. We will notify you of material
          changes by posting the new policy on this page and updating the "Last Updated" date. Your
          continued use of the Service after changes constitutes acceptance of the updated policy.
        </p>

        <h2
          style={{ color: "#fff", fontSize: "1.4rem", marginTop: "2.5rem", marginBottom: "1rem" }}
        >
          15. Contact Us
        </h2>
        <p>If you have questions or concerns about this Privacy Policy, please contact us at:</p>
        <p style={{ paddingLeft: "1.5rem" }}>
          Email: privacy@codecompass.app
          <br />
          Address: Nairobi, Kenya
        </p>
      </div>
    </div>
  );
}
