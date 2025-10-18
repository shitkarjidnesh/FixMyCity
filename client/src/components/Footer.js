import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const informationalLinks = [
    { to: '/about', text: 'About Us' },
    { to: '/contact', text: 'Contact Us' },
    { to: '/privacy', text: 'Privacy Policy' },
    { to: '/help', text: 'Help' },
  ];

  // Placeholder social media links
  const socialLinks = [
    { href: '#', text: 'Facebook' },
    { href: '#', text: 'Twitter' },
    { href: '#', text: 'Instagram' },
  ];

  return (
    <footer className="bg-gray-800 text-white pt-12 pb-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Brand and Description */}
          <div className="md:col-span-1">
            <h2 className="text-2xl font-bold text-blue-400 mb-2">FixMyCity</h2>
            <p className="text-gray-400 text-sm">
              Your platform for reporting and resolving civic issues efficiently.
            </p>
          </div>

          {/* Informational Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
            <ul className="space-y-2">
              {informationalLinks.map(link => (
                <li key={link.to}>
                  <Link to={link.to} className="text-gray-400 hover:text-white">
                    {link.text}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Social Media Links */}
          <div>
            <h3 className="text-lg font-semibold mb-4">Follow Us</h3>
            <ul className="space-y-2">
              {socialLinks.map(link => (
                <li key={link.text}>
                  <a href={link.href} target="_blank" rel="noopener noreferrer" className="text-gray-400 hover:text-white">
                    {link.text}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-700 pt-6 text-center text-gray-500 text-sm">
          <p>&copy; {new Date().getFullYear()} FixMyCity. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
