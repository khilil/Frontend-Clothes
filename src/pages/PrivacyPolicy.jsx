import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import CollectiveFooter from '../components/common/CollectiveFooter/CollectiveFooter';

const PrivacyPolicy = () => {
  // Smooth scroll to top on mount
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <main className="min-h-screen bg-background text-text-primary font-secondary selection:bg-accent selection:text-primary pb-24">
      {/* Page Header */}
      <section className="pt-32 pb-16 px-6 md:pt-40 md:pb-20 border-b border-border-subtle">
        <div className="max-w-4xl mx-auto">
          <nav className="text-[10px] sm:text-xs tracking-[0.3em] uppercase mb-8 opacity-60 flex items-center space-x-3">
            <Link to="/" className="text-text-secondary hover:text-accent transition-colors duration-300">Home</Link>
            <span className="text-text-secondary/50">/</span>
            <strong className="text-accent font-medium">Privacy Policy</strong>
          </nav>
          <h1 className="font-display italic text-5xl md:text-6xl text-text-primary mb-4">
            Privacy Policy
          </h1>
          <p className="font-primary tracking-widest uppercase text-sm md:text-base text-text-secondary opacity-80 mb-6">
            Your privacy is important to us.
          </p>
          <p className="text-xs text-text-secondary/60 font-primary uppercase tracking-widest">
            Last Updated: {new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}
          </p>
        </div>
      </section>

      {/* Content Section */}
      <section className="py-16 px-6">
        <div className="max-w-4xl mx-auto space-y-12">
          
          <div className="space-y-6">
            <h2 className="text-2xl font-primary tracking-wide text-text-primary">1. Introduction</h2>
            <div className="space-y-4 text-text-secondary/80 leading-relaxed text-sm md:text-base font-light">
              <p>
                At Fenrir Era, we value your privacy and are committed to protecting your personal data. This Privacy Policy outlines how we collect, use, and safeguard your information when you visit our website, purchase our products, or interact with our services.
              </p>
              <p>
                By using the Fenrir Era website, you consent to the data practices described in this statement. We encourage you to read this policy carefully to understand our approach to your personal information.
              </p>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border-subtle"></div>

          <div className="space-y-6">
            <h2 className="text-2xl font-primary tracking-wide text-text-primary">2. Information We Collect</h2>
            <div className="space-y-4 text-text-secondary/80 leading-relaxed text-sm md:text-base font-light">
              <p>
                To provide you with our premium services, we collect various types of information, including:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Personal Identification Information:</strong> Name, email address, phone number, and shipping/billing address.</li>
                <li><strong>Payment Information:</strong> Credit card details and billing information (processed securely through our encrypted payment gateways).</li>
                <li><strong>Account Information:</strong> Order history, preferences, and wishlist items if you create an account with us.</li>
                <li><strong>Technical Data:</strong> IP address, browser type, device identifiers, and browsing behavior on our platform.</li>
              </ul>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border-subtle"></div>

          <div className="space-y-6">
            <h2 className="text-2xl font-primary tracking-wide text-text-primary">3. How We Use Your Information</h2>
            <div className="space-y-4 text-text-secondary/80 leading-relaxed text-sm md:text-base font-light">
              <p>
                The information we collect is used in the following ways to enhance your experience:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Order Processing:</strong> To fulfill and manage purchases, orders, payments, and other related transactions.</li>
                <li><strong>Customer Support:</strong> To respond to your inquiries, provide assistance, and resolve any issues.</li>
                <li><strong>Personalization:</strong> To tailor our website experience, product recommendations, and communications to your preferences.</li>
                <li><strong>Service Improvements:</strong> To analyze usage trends and improve the functionality and design of our website.</li>
                <li><strong>Marketing (Optional):</strong> To send promotional emails or newsletters, provided you have explicitly opted in.</li>
              </ul>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border-subtle"></div>

          <div className="space-y-6">
            <h2 className="text-2xl font-primary tracking-wide text-text-primary">4. Cookies & Tracking Technologies</h2>
            <div className="space-y-4 text-text-secondary/80 leading-relaxed text-sm md:text-base font-light">
              <p>
                We use cookies and similar tracking technologies to track activity on our service and hold certain information. Cookies are files with small amounts of data which may include an anonymous unique identifier.
              </p>
              <p>
                You can instruct your browser to refuse all cookies or to indicate when a cookie is being sent. However, if you do not accept cookies, you may not be able to use some portions of our website. We use cookies primarily for maintaining your cart session and identifying you across visits.
              </p>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border-subtle"></div>

          <div className="space-y-6">
            <h2 className="text-2xl font-primary tracking-wide text-text-primary">5. Data Protection</h2>
            <div className="space-y-4 text-text-secondary/80 leading-relaxed text-sm md:text-base font-light">
              <p>
                The security of your personal data is paramount to us. We implement a variety of security measures, including SSL encryption, secure server hosting, and strict access controls, to maintain the safety of your personal information.
              </p>
              <p>
                While we strive to use commercially acceptable means to protect your personal data, remember that no method of transmission over the internet or method of electronic storage is 100% secure.
              </p>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border-subtle"></div>

          <div className="space-y-6">
            <h2 className="text-2xl font-primary tracking-wide text-text-primary">6. Third-Party Services</h2>
            <div className="space-y-4 text-text-secondary/80 leading-relaxed text-sm md:text-base font-light">
              <p>
                We may employ third-party companies and individuals to facilitate our service, provide the service on our behalf, or assist us in analyzing how our service is used. Examples include:
              </p>
              <ul className="list-disc pl-5 space-y-2">
                <li><strong>Payment Processors:</strong> Gateways like Razorpay or Stripe that securely handle your transaction data.</li>
                <li><strong>Shipping Partners:</strong> Logistics companies that require your address to deliver your purchases.</li>
                <li><strong>Analytics Providers:</strong> Tools that help us monitor and analyze web traffic and behavior.</li>
              </ul>
              <p>
                These third parties have access to your Personal Data only to perform these tasks on our behalf and are obligated not to disclose or use it for any other purpose.
              </p>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border-subtle"></div>

          <div className="space-y-6">
            <h2 className="text-2xl font-primary tracking-wide text-text-primary">7. User Rights</h2>
            <div className="space-y-4 text-text-secondary/80 leading-relaxed text-sm md:text-base font-light">
              <p>
                Depending on your location, you may have the right to access, rectify, or erase your personal data. You can also object to the processing of your personal data or request data portability. 
              </p>
              <p>
                To exercise any of these rights, please contact our support team. We will review your request and respond in a timely manner according to applicable privacy laws.
              </p>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border-subtle"></div>

          <div className="space-y-6">
            <h2 className="text-2xl font-primary tracking-wide text-text-primary">8. Changes to This Policy</h2>
            <div className="space-y-4 text-text-secondary/80 leading-relaxed text-sm md:text-base font-light">
              <p>
                We may update our Privacy Policy from time to time to reflect changes in our practices or legal requirements. We will notify you of any changes by posting the new Privacy Policy on this page and updating the "Last Updated" date at the top.
              </p>
              <p>
                You are advised to review this Privacy Policy periodically for any changes.
              </p>
            </div>
          </div>

          <div className="w-full h-[1px] bg-border-subtle"></div>

          <div className="space-y-6">
            <h2 className="text-2xl font-primary tracking-wide text-text-primary">9. Contact Us</h2>
            <div className="space-y-4 text-text-secondary/80 leading-relaxed text-sm md:text-base font-light">
              <p>
                If you have any questions or concerns about this Privacy Policy or our data practices, please contact our Data Protection Officer:
              </p>
              <div className="pt-2">
                <a href="mailto:support@fenrirera.com" className="text-accent hover:underline hover:underline-offset-4 transition-all tracking-wide">
                  support@fenrirera.com
                </a>
              </div>
            </div>
          </div>

        </div>
      </section>
      <CollectiveFooter />
    </main>
  );
};

export default PrivacyPolicy;
