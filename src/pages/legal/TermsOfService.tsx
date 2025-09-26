import { Link } from 'react-router-dom';

export default function TermsOfService() {
  return (
    <div className="min-h-screen pt-36 pb-12">
      <div className="container mx-auto px-4 max-w-4xl">
        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-lg">
          <p className="text-gray-600 mb-8">Last updated: {new Date().toLocaleDateString()}</p>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms
              and provision of this agreement. If you do not agree to abide by these terms, please
              do not use this website.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">2. Use License</h2>
            <div className="space-y-4">
              <p>Permission is granted to temporarily download one copy of the materials (information or software) on WearXpress's website for personal, non-commercial transitory viewing only.</p>
              <p>This is the grant of a license, not a transfer of title, and under this license you may not:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Modify or copy the materials</li>
                <li>Use the materials for any commercial purpose</li>
                <li>Attempt to decompile or reverse engineer any software</li>
                <li>Remove any copyright or other proprietary notations</li>
                <li>Transfer the materials to another person</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">3. Ordering & Payment</h2>
            <div className="space-y-4">
              <p>By placing an order, you:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Confirm that you are at least 18 years old</li>
                <li>Agree to provide current, complete, and accurate purchase information</li>
                <li>Agree to promptly update your account information</li>
                <li>Authorize us to charge your chosen payment method</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">4. Shipping & Returns</h2>
            <div className="space-y-4">
              <p>We offer:</p>
              <ul className="list-disc pl-6 space-y-2">
                <li>Free shipping on orders over $50</li>
                <li>30-day return policy for unused items</li>
                <li>Free returns within the continental US</li>
              </ul>
            </div>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">5. Disclaimer</h2>
            <p>
              The materials on WearXpress's website are provided on an 'as is' basis.
              WearXpress makes no warranties, expressed or implied, and hereby disclaims
              and negates all other warranties including, without limitation, implied
              warranties or conditions of merchantability, fitness for a particular
              purpose, or non-infringement of intellectual property or other violation
              of rights.
            </p>
          </section>

          <section className="mb-8">
            <h2 className="text-2xl font-bold mb-4">6. Limitations</h2>
            <p>
              In no event shall WearXpress or its suppliers be liable for any damages
              (including, without limitation, damages for loss of data or profit, or due
              to business interruption) arising out of the use or inability to use the
              materials on WearXpress's website.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}