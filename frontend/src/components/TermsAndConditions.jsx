const TermsAndConditions = () => {
  return (
    <div className="w-full p-8 bg-[#fff5e6] text-[#333333]">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-[#ff9980] pb-4">
        <h1 className="text-[#ff9980] text-4xl mb-2">Terms and Conditions</h1>
        <p className="text-[#4a0072] italic text-sm">Last Updated: April 7, 2025</p>
      </div>

      {/* Main Content */}
      <div className="bg-white p-8 rounded-lg shadow-md mb-8 relative overflow-hidden">
        {/* Decorative elements */}
        <div
          className="absolute -left-20 top-5 w-[150px] h-[150px] opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Yb3efO6E8UH3w02RXMO7dourbaWSRe.png')",
            backgroundSize: "300px auto",
            backgroundPosition: "-20px -150px",
            backgroundRepeat: "no-repeat",
          }}
        ></div>
        <div
          className="absolute -right-20 bottom-5 w-[150px] h-[150px] opacity-20 pointer-events-none"
          style={{
            backgroundImage:
              "url('https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-Yb3efO6E8UH3w02RXMO7dourbaWSRe.png')",
            backgroundSize: "300px auto",
            backgroundPosition: "-1150px -150px",
            backgroundRepeat: "no-repeat",
          }}
        ></div>

        {/* Sections */}
        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 text-2xl">1. Introduction</h2>
          <p className="leading-relaxed my-4">
            Welcome to TabMark! These Terms and Conditions govern your use of our website and services. By accessing or
            using TabMark, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not
            access the service.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 text-2xl">2. Use of Service</h2>
          <p className="leading-relaxed my-4">
            TabMark provides a platform for managing bookmarks and projects. You are responsible for maintaining the
            confidentiality of your account and password and for restricting access to your computer. You agree to
            accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 text-2xl">3. Privacy Policy</h2>
          <p className="leading-relaxed my-4">
            Your privacy is important to us. It is TabMark's policy to respect your privacy regarding any information we
            may collect from you across our website. We only ask for personal information when we truly need it to
            provide a service to you. Please refer to our Privacy Policy for more details.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 text-2xl">4. Intellectual Property</h2>
          <p className="leading-relaxed my-4">
            The Service and its original content, features, and functionality are and will remain the exclusive property
            of TabMark and its licensors. The Service is protected by copyright, trademark, and other laws of both the
            United States and foreign countries.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 text-2xl">5. Termination</h2>
          <p className="leading-relaxed my-4">
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or
            liability, under our sole discretion, for any reason whatsoever and without limitation, including but not
            limited to a breach of the Terms.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 text-2xl">6. Limitations</h2>
          <p className="leading-relaxed my-4">
            In no event shall TabMark be liable for any indirect, incidental, special, consequential or punitive
            damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
            resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 text-2xl">7. Changes to Terms</h2>
          <p className="leading-relaxed my-4">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes
            a material change will be determined at our sole discretion. By continuing to access or use our Service
            after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 text-2xl">8. Governing Law</h2>
          <p className="leading-relaxed my-4">
            These Terms shall be governed and construed in accordance with the laws of the United States, without regard
            to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be
            considered a waiver of those rights.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 text-2xl">9. Contact Us</h2>
          <p className="leading-relaxed my-4">
            If you have any questions about these Terms, please contact us at support@tabmark.com.
          </p>
        </section>
      </div>
    </div>
  )
}

export default TermsAndConditions
