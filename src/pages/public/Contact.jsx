import { useState } from 'react';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';

function Contact() {
  const [formData, setFormData] = useState({
    name: '',
    contactNumber: '',
    email: '',
    contactingAs: '',
    message: '',
    attachment: null,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [acceptedTerms, setAcceptedTerms] = useState(false);
  const [acceptNewsletter, setAcceptNewsletter] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    setFormData(prev => ({ ...prev, attachment: e.target.files[0] }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      setFormData(prev => ({ ...prev, attachment: e.dataTransfer.files[0] }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      if (!formData.name || !formData.contactNumber || !formData.email) {
        toast.error('Please fill in all required fields');
        setIsSubmitting(false);
        return;
      }

      if (!acceptedTerms) {
        toast.error('Please accept the Privacy Policy and Terms of Service');
        setIsSubmitting(false);
        return;
      }

      await new Promise(resolve => setTimeout(resolve, 500));
      
      toast.success('Thank you! We will contact you soon.');
      setFormData({
        name: '',
        contactNumber: '',
        email: '',
        contactingAs: '',
        message: '',
        attachment: null,
      });
      setAcceptedTerms(false);
      setAcceptNewsletter(false);
    } catch (error) {
      toast.error('Something went wrong. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-midnight-900 to-midnight-950 py-12 md:py-16">
      <div className="max-w-6xl mx-auto px-4 md:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-3xl md:text-4xl font-bold text-text-primary mb-3">
            Get In Touch
          </h1>
          <p className="text-text-secondary text-base md:text-lg">
            Have questions? We'd love to hear from you. Send us a message and we'll respond as soon as possible.
          </p>
        </div>

        {/* Main Content - Contact Cards and Form */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          {/* Contact Cards */}
          <div className="space-y-4">
            {/* Email Card */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-gold rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-midnight-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Email Us</h3>
              <p className="text-text-secondary text-sm mb-3">
                Send us your queries and we'll get back to you within 24 hours.
              </p>
              <a
                href="mailto:support@dreambid.co.in"
                className="text-gold hover:text-gold-hover font-semibold text-sm transition"
              >
                support@dreambid.co.in
              </a>
            </div>

            {/* Phone Card */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-gold rounded-lg flex items-center justify-center mb-4">
                <svg className="w-6 h-6 text-midnight-950" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 00.948.684l1.498 4.493a1 1 0 00.502.756l2.73 1.365a1 1 0 001.27-1.27l-1.365-2.73a1 1 0 00.756-.502l4.493-1.498a1 1 0 00.684-.948V5a2 2 0 00-2-2h-2.5a2.012 2.012 0 00-1.412.588l-.662.662A2 2 0 006.832 4h-1.7a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V9a1 1 0 10-2 0v8a2 2 0 11-4 0V5a2 2 0 00-2-2h-2.5a2 2 0 00-1.412.588l-.662.662A2 2 0 006.168 4H5a2 2 0 00-2 2v12a2 2 0 002 2h12a2 2 0 002-2V9" />
                </svg>
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">Call Us</h3>
              <p className="text-text-secondary text-sm mb-3">
                Speak directly with our support team.
              </p>
              <a
                href="tel:+911140845500"
                className="text-gold hover:text-gold-hover font-semibold text-sm transition"
              >
                +91 1140 8455 00
              </a>
            </div>

            {/* WhatsApp Card */}
            <div className="card p-6">
              <div className="w-12 h-12 bg-status-live rounded-lg flex items-center justify-center mb-4">
                <img src="/whatsapp.svg" alt="WhatsApp" className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-bold text-text-primary mb-2">WhatsApp Us</h3>
              <p className="text-text-secondary text-sm mb-3">
                Quick support via WhatsApp messaging.
              </p>
              <a
                href="https://wa.me/919899360360?text=Hi%20I%20would%20like%20to%20know%20more%20about%20DreamBid"
                target="_blank"
                rel="noopener noreferrer"
                className="text-status-live hover:text-green-600 font-semibold text-sm transition"
              >
                +91 9899 360 360
              </a>
            </div>
          </div>

          {/* Form Section */}
          <div className="md:col-span-2">
            <div className="card p-6 md:p-8">
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-semibold text-text-primary mb-2">
                    Full Name *
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    required
                    placeholder="Enter your full name"
                    className="w-full px-4 py-3 bg-midnight-800 border border-midnight-700 text-text-primary placeholder-text-muted rounded-input focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Contact Number */}
                <div>
                  <label htmlFor="contactNumber" className="block text-sm font-semibold text-text-primary mb-2">
                    Contact Number *
                  </label>
                  <input
                    type="tel"
                    id="contactNumber"
                    name="contactNumber"
                    value={formData.contactNumber}
                    onChange={handleChange}
                    required
                    placeholder="Enter 10-digit mobile number"
                    pattern="\d{10}"
                    className="w-full px-4 py-3 bg-midnight-800 border border-midnight-700 text-text-primary placeholder-text-muted rounded-input focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Email */}
                <div>
                  <label htmlFor="email" className="block text-sm font-semibold text-text-primary mb-2">
                    Email *
                  </label>
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    placeholder="Enter your email address"
                    className="w-full px-4 py-3 bg-midnight-800 border border-midnight-700 text-text-primary placeholder-text-muted rounded-input focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition"
                  />
                </div>

                {/* Contacting As */}
                <div>
                  <label htmlFor="contactingAs" className="block text-sm font-semibold text-text-primary mb-2">
                    Contacting As
                  </label>
                  <select
                    id="contactingAs"
                    name="contactingAs"
                    value={formData.contactingAs}
                    onChange={handleChange}
                    className="w-full px-4 py-3 bg-midnight-800 border border-midnight-700 text-text-primary rounded-input focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition"
                  >
                    <option value="" className="bg-midnight-800">Select an option</option>
                    <option value="buyer" className="bg-midnight-800">Buyer</option>
                    <option value="seller" className="bg-midnight-800">Seller</option>
                    <option value="investor" className="bg-midnight-800">Investor</option>
                    <option value="other" className="bg-midnight-800">Other</option>
                  </select>
                </div>

                {/* File Upload */}
                <div>
                  <label htmlFor="attachment" className="block text-sm font-semibold text-text-primary mb-2">
                    Attachment (Optional)
                  </label>
                  <div
                    onDragEnter={handleDrag}
                    onDragLeave={handleDrag}
                    onDragOver={handleDrag}
                    onDrop={handleDrop}
                    className={`relative border-2 border-dashed rounded-input p-4 transition cursor-pointer ${
                      dragActive
                        ? 'border-gold bg-midnight-800 bg-opacity-50'
                        : 'border-midnight-700 bg-midnight-800 hover:border-midnight-600'
                    }`}
                  >
                    <input
                      type="file"
                      id="attachment"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="text-center py-2">
                      <svg className="w-8 h-8 text-text-muted mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      </svg>
                      <p className="text-text-primary text-sm">
                        {formData.attachment
                          ? `Selected: ${formData.attachment.name}`
                          : 'Drag & drop your file here or click to select'}
                      </p>
                      <p className="text-text-muted text-xs mt-1">Max file size: 5MB</p>
                    </div>
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label htmlFor="message" className="block text-sm font-semibold text-text-primary mb-2">
                    Message
                  </label>
                  <textarea
                    id="message"
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    rows="4"
                    placeholder="Tell us about your inquiry..."
                    className="w-full px-4 py-3 bg-midnight-800 border border-midnight-700 text-text-primary placeholder-text-muted rounded-input focus:ring-2 focus:ring-gold focus:border-transparent outline-none transition resize-none"
                  />
                </div>

                {/* Checkboxes */}
                <div className="space-y-3 py-4 border-y border-midnight-700">
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptedTerms}
                      onChange={(e) => setAcceptedTerms(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded bg-midnight-800 border-midnight-700 text-gold focus:ring-gold cursor-pointer"
                    />
                    <span className="ml-3 text-sm text-text-secondary">
                      I agree to the{' '}
                      <Link to="/privacy" className="text-gold hover:text-gold-hover">
                        Privacy Policy
                      </Link>
                      {' '}and{' '}
                      <Link to="/terms" className="text-gold hover:text-gold-hover">
                        Terms of Service
                      </Link>
                    </span>
                  </label>
                  <label className="flex items-start cursor-pointer">
                    <input
                      type="checkbox"
                      checked={acceptNewsletter}
                      onChange={(e) => setAcceptNewsletter(e.target.checked)}
                      className="mt-1 w-4 h-4 rounded bg-midnight-800 border-midnight-700 text-gold focus:ring-gold cursor-pointer"
                    />
                    <span className="ml-3 text-sm text-text-secondary">
                      Subscribe to our newsletter for updates
                    </span>
                  </label>
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full px-6 py-3 bg-gold text-midnight-950 rounded-btn hover:bg-gold-hover disabled:opacity-50 disabled:cursor-not-allowed transition font-bold text-base"
                >
                  {isSubmitting ? 'Sending...' : 'Send Message'}
                </button>
              </form>
            </div>
          </div>
        </div>

        {/* Office Locations */}
        <div className="mb-12">
          <h2 className="text-2xl md:text-3xl font-bold text-text-primary mb-8 text-center">
            Our Offices
          </h2>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="card p-6">
              <h3 className="text-lg font-bold text-text-primary mb-3">Delhi</h3>
              <p className="text-text-secondary text-sm">
                Office No. 101, Tower C, Cyber Hub, DLF Cyber City, Gurgaon, Haryana 122001
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-text-primary mb-3">Noida</h3>
              <p className="text-text-secondary text-sm">
                Suite 502, Sector 63, Plot No. 301, Central Spine Road, Noida, Uttar Pradesh 201301
              </p>
            </div>

            <div className="card p-6 border-2 border-gold">
              <h3 className="text-lg font-bold text-gold mb-3">Bengaluru (HQ)</h3>
              <p className="text-text-secondary text-sm">
                Level 5, Pinnacle Tower, Sarjapur Road, Bengaluru, Karnataka 560034
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-text-primary mb-3">Mumbai</h3>
              <p className="text-text-secondary text-sm">
                Unit 302, Thane One, Ghodbunder Road, Mumbai, Maharashtra 400615
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-text-primary mb-3">Hyderabad</h3>
              <p className="text-text-secondary text-sm">
                Floor 3, Prosperity Tower, HITEC City, Hyderabad, Telangana 500081
              </p>
            </div>

            <div className="card p-6">
              <h3 className="text-lg font-bold text-text-primary mb-3">Surat</h3>
              <p className="text-text-secondary text-sm">
                Office No. 1201, 12th Floor, Shree Complex, Athwalines, Surat, Gujarat 395005
              </p>
            </div>
          </div>
        </div>

        {/* WhatsApp Channel */}
        <div className="bg-midnight-800 border border-midnight-700 rounded-card p-8">
          <div className="text-center mb-8">
            <div className="w-16 h-16 bg-status-live rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .96 4.534.96 10.08c0 1.752.413 3.4 1.141 4.865L.06 23.884l9.251-2.39a11.717 11.717 0 005.739 1.49h.005c6.554 0 11.09-5.533 11.09-11.088a11.106 11.106 0 00-3.291-7.918"/>
              </svg>
            </div>
            <h3 className="text-2xl font-bold text-text-primary mb-2">Join Our WhatsApp Channel</h3>
            <p className="text-text-secondary mb-6">
              Get exclusive property updates, auction alerts, and special offers directly to your phone.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6 mb-8">
            <div className="flex items-start gap-3">
              <svg className="h-6 w-6 text-gold mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-text-primary font-semibold">Real-time Updates</p>
                <p className="text-text-secondary text-sm mt-1">Instant notifications about new auctions</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="h-6 w-6 text-gold mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-text-primary font-semibold">Special Offers</p>
                <p className="text-text-secondary text-sm mt-1">Exclusive deals for channel members</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <svg className="h-6 w-6 text-gold mt-1 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <p className="text-text-primary font-semibold">Expert Tips</p>
                <p className="text-text-secondary text-sm mt-1">Buying and selling guidance</p>
              </div>
            </div>
          </div>

          <div className="text-center">
            <a
              href="https://whatsapp.com/channel/0029Va9NHJqHKqyAlLhPOW0T"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-8 py-3 bg-status-live text-white rounded-btn hover:bg-green-600 transition font-bold text-base"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .96 4.534.96 10.08c0 1.752.413 3.4 1.141 4.865L.06 23.884l9.251-2.39a11.717 11.717 0 005.739 1.49h.005c6.554 0 11.09-5.533 11.09-11.088a11.106 11.106 0 00-3.291-7.918"/>
              </svg>
              Join WhatsApp Channel
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Contact;
