import { Link } from 'react-router-dom';

export default function CookiePolicy() {
  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Cookie Policy</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. What Are Cookies</h2>
            <p>
              Cookies are small text files that are placed on your computer or mobile device
              when you visit our website. They are widely used to make websites work more
              efficiently and provide information to the website owners.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. How We Use Cookies</h2>
            <div className="space-y-4">
              <p>We use cookies to:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Remember your preferences and settings</li>
                <li>Remember items in your shopping cart</li>
                <li>Help with logging in to your account</li>
                <li>Understand how you use our website</li>
                <li>Improve our website based on this information</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Types of Cookies We Use</h2>
            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold mb-2">Essential Cookies</h3>
                <p>Required for the website to function properly. Cannot be disabled.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Performance Cookies</h3>
                <p>Help us understand how visitors interact with our website.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Functionality Cookies</h3>
                <p>Remember choices you make to improve your experience.</p>
              </div>
              
              <div>
                <h3 className="text-xl font-semibold mb-2">Targeting Cookies</h3>
                <p>Help make advertising messages more relevant to you.</p>
              </div>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Managing Cookies</h2>
            <div className="space-y-4">
              <p>You can control cookies through your browser settings:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>
                  <strong>Chrome:</strong> Settings → Privacy and Security → Cookies
                </li>
                <li>
                  <strong>Firefox:</strong> Options → Privacy & Security → Cookies
                </li>
                <li>
                  <strong>Safari:</strong> Preferences → Privacy → Cookies
                </li>
                <li>
                  <strong>Edge:</strong> Settings → Privacy & Security → Cookies
                </li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Third-Party Cookies</h2>
            <p>
              Some cookies are placed by third-party services that appear on our pages.
              We use these services to enhance your experience on our website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Contact Us</h2>
            <p>
              If you have questions about our use of cookies, please contact us at:{' '}
              <a href="mailto:privacy@wearxpress.com" className="text-blue-600 hover:underline">
                privacy@wearxpress.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}