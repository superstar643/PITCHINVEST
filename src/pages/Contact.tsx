import React, { useState } from 'react';
import { Mail, Phone, MapPin, Linkedin, Twitter, Github, Instagram, Youtube, Facebook } from 'lucide-react';

const Contact: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission
   
    // Reset form
    setFormData({ name: '', email: '', subject: '', message: '' });
  };

  const socialLinks = [
    { name: 'LinkedIn', icon: Linkedin, href: '#', color: '#0077b5' },
    { name: 'Twitter', icon: Twitter, href: '#', color: '#1da1f2' },
    { name: 'GitHub', icon: Github, href: '#', color: '#333' },
    { name: 'Instagram', icon: Instagram, href: '#', color: '#e4405f' },
    { name: 'YouTube', icon: Youtube, href: '#', color: '#ff0000' },
    { name: 'Facebook', icon: Facebook, href: '#', color: '#1877f2' },
  ];

  const contactInfo = [
    { 
      icon: Mail, 
      title: 'Email', 
      info: 'contact@pitchinvest.com',
      color: '#d5b775'
    },
    { 
      icon: Phone, 
      title: 'Phone', 
      info: '+1 (555) 123-4567',
      color: '#d5b775'
    },
    { 
      icon: MapPin, 
      title: 'Office', 
      info: '123 Innovation Street',
      color: '#d5b775'
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white pt-24 pb-16">
      {/* Hero Section */}
      <div className="max-w-4xl mx-auto text-center px-4 mb-12">
        <span className="text-[#d5b775] font-semibold tracking-widest text-sm uppercase">
          Get in Touch
        </span>
        <h1 className="text-4xl md:text-5xl font-bold mt-2 mb-4">
          <span className="text-[#0a3d5c]">Let's </span>
          <span className="text-[#d5b775]">Connect</span>
        </h1>
        <p className="text-gray-600 text-lg max-w-xl mx-auto">
          Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
        </p>
      </div>

      {/* Contact Form */}
      <div className="max-w-3xl mx-auto px-4 mb-16">
        <div className="bg-white rounded-2xl shadow-[0_4px_30px_rgba(0,0,0,0.08)] p-8 md:p-10">
          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              {/* Name Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Name
                </label>
                <input
                  type="text"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  placeholder="Your full name"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all text-sm bg-white"
                  required
                />
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="your.email@example.com"
                  className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all text-sm bg-[#fefdfb]"
                  required
                />
              </div>
            </div>

            {/* Subject Field */}
            <div className="mb-6">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Subject
              </label>
              <input
                type="text"
                name="subject"
                value={formData.subject}
                onChange={handleInputChange}
                placeholder="What's this about?"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all text-sm bg-white"
                required
              />
            </div>

            {/* Message Field */}
            <div className="mb-8">
              <label className="block text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                Message
              </label>
              <textarea
                name="message"
                value={formData.message}
                onChange={handleInputChange}
                placeholder="Tell us more about your inquiry..."
                rows={5}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#0a3d5c]/20 focus:border-[#0a3d5c] transition-all text-sm resize-none bg-white"
                required
              />
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-4 bg-[#0a3d5c] hover:bg-[#083248] text-white font-semibold rounded-full shadow-lg hover:shadow-xl transition-all duration-300 uppercase tracking-wider text-sm"
            >
              Send Message
            </button>
          </form>
        </div>
      </div>

      {/* Social Media Section */}
      <div className="max-w-4xl mx-auto px-4 mb-16 text-center">
        <h2 className="text-2xl md:text-3xl font-bold mb-2">
          <span className="text-[#0a3d5c]">Follow Us on </span>
          <span className="text-[#d5b775]">Social Media</span>
        </h2>
        <p className="text-gray-500 mb-8">Stay connected and get the latest updates</p>
        
        <div className="flex flex-wrap justify-center gap-4">
          {socialLinks.map((social) => (
            <a
              key={social.name}
              href={social.href}
              className="group flex flex-col items-center p-4 bg-white rounded-2xl shadow-[0_2px_15px_rgba(0,0,0,0.06)] hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1 w-24"
            >
              <div className="w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 group-hover:bg-[#0a3d5c]/10 transition-colors mb-2">
                <social.icon 
                  className="w-6 h-6 text-[#0a3d5c] group-hover:text-[#0a3d5c]" 
                />
              </div>
              <span className="text-xs font-medium text-gray-600">{social.name}</span>
            </a>
          ))}
        </div>
      </div>

      {/* Contact Info Cards */}
      <div className="max-w-4xl mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {contactInfo.map((item) => (
            <div
              key={item.title}
              className="bg-white rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.08)] p-6 text-center hover:shadow-[0_8px_30px_rgba(0,0,0,0.12)] transition-all duration-300 hover:-translate-y-1"
            >
              <div className="w-14 h-14 mx-auto mb-4 flex items-center justify-center rounded-full bg-[#d5b775]/10">
                <item.icon className="w-7 h-7 text-[#d5b775]" />
              </div>
              <h3 className="text-lg font-bold text-[#0a3d5c] mb-1">{item.title}</h3>
              <p className="text-gray-500 text-sm">{item.info}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Contact;

