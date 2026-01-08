import React from 'react';
import { Shield, Lock, Eye, FileText, Users, Globe, CheckCircle } from 'lucide-react';

const PrivacyPolicy: React.FC = () => {
  const privacyFeatures = [
    { icon: Shield, title: 'Data Protection', description: 'Your personal information is encrypted and securely stored' },
    { icon: Lock, title: 'Secure Transactions', description: 'All financial transactions are processed through secure channels' },
    { icon: Eye, title: 'Transparency', description: 'We are transparent about how we collect and use your data' },
    { icon: Users, title: 'User Control', description: 'You have full control over your personal information' },
  ];

  const sections = [
    {
      title: 'Information We Collect',
      content: [
        'Personal Information: When you register on Pitch Invest, we collect information such as your name, email address, phone number, and professional details.',
        'Profile Information: This includes your user profile, project details, investment preferences, and any other information you choose to provide.',
        'Usage Data: We collect information about how you interact with our platform, including pages visited, features used, and time spent on the platform.',
        'Technical Data: We automatically collect certain technical information such as IP address, browser type, device information, and cookies.',
      ],
    },
    {
      title: 'How We Use Your Information',
      content: [
        'To provide and improve our services, including matching inventors with investors and facilitating auctions.',
        'To communicate with you about your account, transactions, and important updates about our platform.',
        'To personalize your experience and show you relevant content and opportunities.',
        'To ensure platform security, prevent fraud, and comply with legal obligations.',
        'To analyze platform usage and improve our services through aggregated and anonymized data.',
      ],
    },
    {
      title: 'Data Sharing and Disclosure',
      content: [
        'We do not sell your personal information to third parties.',
        'We may share your information with other users on the platform as necessary to facilitate connections and transactions (e.g., showing your profile to potential investors).',
        'We may share information with service providers who help us operate our platform, subject to strict confidentiality agreements.',
        'We may disclose information if required by law or to protect our rights and the safety of our users.',
      ],
    },
    {
      title: 'Data Security',
      content: [
        'We implement industry-standard security measures to protect your personal information.',
        'All data is encrypted in transit and at rest using advanced encryption technologies.',
        'We regularly review and update our security practices to address emerging threats.',
        'While we strive to protect your data, no method of transmission over the internet is 100% secure.',
      ],
    },
    {
      title: 'Your Rights',
      content: [
        'Access: You have the right to access and review your personal information.',
        'Correction: You can update or correct your personal information at any time through your account settings.',
        'Deletion: You may request deletion of your account and personal information, subject to legal and contractual obligations.',
        'Data Portability: You can request a copy of your data in a machine-readable format.',
        'Opt-out: You can opt-out of certain communications and data processing activities.',
      ],
    },
    {
      title: 'Cookies and Tracking',
      content: [
        'We use cookies and similar technologies to enhance your experience, analyze usage, and provide personalized content.',
        'You can control cookie preferences through your browser settings.',
        'Some features may not function properly if cookies are disabled.',
      ],
    },
    {
      title: 'Third-Party Links',
      content: [
        'Our platform may contain links to third-party websites or services.',
        'We are not responsible for the privacy practices of these external sites.',
        'We encourage you to review the privacy policies of any third-party sites you visit.',
      ],
    },
    {
      title: 'Children\'s Privacy',
      content: [
        'Pitch Invest is not intended for users under the age of 18.',
        'We do not knowingly collect personal information from children.',
        'If we become aware that we have collected information from a child, we will take steps to delete it promptly.',
      ],
    },
    {
      title: 'Changes to This Policy',
      content: [
        'We may update this Privacy Policy from time to time to reflect changes in our practices or legal requirements.',
        'We will notify you of significant changes by email or through a prominent notice on our platform.',
        'Your continued use of the platform after changes become effective constitutes acceptance of the updated policy.',
        'We encourage you to review this policy periodically.',
      ],
    },
    {
      title: 'Contact Us',
      content: [
        'If you have questions, concerns, or requests regarding this Privacy Policy or your personal information, please contact us:',
        'Email: privacy@pitchinvest.com',
        'Address: [Your Company Address]',
        'We will respond to your inquiry within 30 days.',
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      {/* Header Section */}
      <section className="max-w-4xl mx-auto px-4 mb-12">
        <div className="text-center mb-8">
          <span className="text-[#d5b775] font-semibold tracking-widest text-sm uppercase">
            Privacy Policy
          </span>
          <h1 className="text-4xl md:text-5xl font-bold mt-4 mb-4">
            <span className="text-[#0a3d5c]">Your Privacy </span>
            <span className="text-[#d5b775]">Matters</span>
          </h1>
          <p className="text-gray-600 max-w-2xl mx-auto">
            At Pitch Invest, we are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, and safeguard your data.
          </p>
          <div className="mt-6 text-sm text-gray-500">
            Last Updated: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
          </div>
        </div>

        {/* Privacy Features */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-12">
          {privacyFeatures.map((feature) => (
            <div key={feature.title} className="bg-white rounded-xl p-6 shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:shadow-lg transition-all text-center">
              <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-[#d5b775]/10 flex items-center justify-center">
                <feature.icon className="w-6 h-6 text-[#d5b775]" />
              </div>
              <h3 className="font-semibold text-[#0a3d5c] mb-2">{feature.title}</h3>
              <p className="text-xs text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Policy Content */}
      <section className="max-w-4xl mx-auto px-4">
        <div className="space-y-8">
          {sections.map((section, index) => (
            <div key={index} className="bg-white rounded-2xl p-8 shadow-[0_4px_20px_rgba(0,0,0,0.08)]">
              <div className="flex items-start gap-3 mb-4">
                <div className="flex-shrink-0">
                  <CheckCircle className="w-6 h-6 text-[#d5b775]" />
                </div>
                <h2 className="text-2xl font-bold text-[#0a3d5c]">{section.title}</h2>
              </div>
              <div className="ml-9 space-y-3">
                {section.content.map((item, itemIndex) => (
                  <p key={itemIndex} className="text-gray-700 leading-relaxed">
                    {item}
                  </p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Footer Note */}
      <section className="max-w-4xl mx-auto px-4 mt-12">
        <div className="bg-[#faf9f6] rounded-2xl p-8 text-center">
          <FileText className="w-12 h-12 text-[#d5b775] mx-auto mb-4" />
          <h3 className="text-xl font-bold text-[#0a3d5c] mb-2">Questions About Privacy?</h3>
          <p className="text-gray-600 mb-4">
            If you have any questions or concerns about this Privacy Policy or our data practices, please don't hesitate to contact us.
          </p>
          <div className="flex items-center justify-center gap-2 text-[#0a3d5c]">
            <Globe className="w-5 h-5" />
            <span className="font-medium">We're here to help</span>
          </div>
        </div>
      </section>
    </div>
  );
};

export default PrivacyPolicy;
