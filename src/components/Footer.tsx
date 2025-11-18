import React from 'react';

const Footer: React.FC = () => {
  const footerLinks = {
    platform: [
      { name: 'How It Works', href: '#' },
      { name: 'For Inventors', href: '#' },
      { name: 'For Investors', href: '#' },
      { name: 'Success Stories', href: '#' }
    ],
    features: [
      { name: 'Live Auctions', href: '#' },
      { name: 'Project Gallery', href: '#' },
      { name: 'Secure Messaging', href: '#' },
      { name: 'Verification', href: '#' }
    ],
    company: [
      { name: 'About Us', href: '#' },
      { name: 'Team', href: '#' },
      { name: 'Careers', href: '#' },
      { name: 'Press', href: '#' }
    ],
    resources: [
      { name: 'Blog', href: '#' },
      { name: 'Help Center', href: '#' },
      { name: 'Guidelines', href: '#' },
      { name: 'API Docs', href: '#' }
    ],
    legal: [
      { name: 'Terms of Service', href: '#' },
      { name: 'Privacy Policy', href: '#' },
      { name: 'Cookie Policy', href: '#' },
      { name: 'GDPR', href: '#' }
    ]
  };

  return (
    <footer className="bg-white border-t border-gray-200 py-12">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-8 mb-8">
          <div>
            <h3 className="text-amber-600 font-semibold mb-4 text-sm uppercase tracking-wider">Platform</h3>
            <ul className="space-y-3">
              {footerLinks.platform.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-600 hover:text-amber-600 text-sm transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-amber-600 font-semibold mb-4 text-sm uppercase tracking-wider">Features</h3>
            <ul className="space-y-3">
              {footerLinks.features.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-600 hover:text-amber-600 text-sm transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-amber-600 font-semibold mb-4 text-sm uppercase tracking-wider">Company</h3>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-600 hover:text-amber-600 text-sm transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-amber-600 font-semibold mb-4 text-sm uppercase tracking-wider">Resources</h3>
            <ul className="space-y-3">
              {footerLinks.resources.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-600 hover:text-amber-600 text-sm transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
          
          <div>
            <h3 className="text-amber-600 font-semibold mb-4 text-sm uppercase tracking-wider">Legal</h3>
            <ul className="space-y-3">
              {footerLinks.legal.map((link) => (
                <li key={link.name}>
                  <a href={link.href} className="text-gray-600 hover:text-amber-600 text-sm transition-colors">
                    {link.name}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-200 pt-8">
          <p className="text-center text-gray-600 text-sm">
            © 2024 Pitch Invest. All rights reserved. | Excellence in Innovation Investment
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
