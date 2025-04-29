import "../styles/globalfonts.css"
import {Leaf} from "lucide-react"

const TermsAndConditions = () => {
  return (
    <div className="w-full p-8 bg-[#f8eece] text-[#333333]">
      {/* Header */}
      <div className="text-center mb-8 border-b-2 border-[#ff9980] pb-4">
        <div className="flex justify-center items-center mb-4 relative">
          <h1 className="text-[#FF8C6B] text-8xl mb-2 font-jomhuria">Terms and Conditions</h1>
          <img
            src="https://hebbkx1anhila5yf.public.blob.vercel-storage.com/bookmark-64-VzKKVpB39vMeN9d3EyRBWofXUPNhoW.png"
            alt="TabMark Logo"
            className="h-12 w-12 ml-8 mb-5 right-0"
          />
        </div>
        <p className="text-[#4a0072] italic text-lg racing-sans-one-regular">Last Updated: April 7, 2025</p>
      </div>

      {/* Main Content */}
      <div className="bg-[#f8eece] p-8 rounded-lg shadow-md mb-8 relative overflow-hidden">
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
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 font-abril-fatface font-abril-fatface text-2xl">1. Introduction</h2>
          <p className="leading-relaxed my-4 font-spline-sans-tab">
            Welcome to TabMark! These Terms and Conditions govern your use of our website and services. By accessing or
            using TabMark, you agree to be bound by these Terms. If you disagree with any part of the terms, you may not
            access the service.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 font-abril-fatface text-2xl">2. Use of Service</h2>
          <p className="leading-relaxed my-4 font-spline-sans-tab">
            TabMark provides a platform for managing bookmarks and projects. You are responsible for maintaining the
            confidentiality of your account and password and for restricting access to your computer. You agree to
            accept responsibility for all activities that occur under your account.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 font-abril-fatface text-2xl">3. Privacy Policy</h2>
          <p className="leading-relaxed my-4 font-spline-sans-tab">
            Your privacy is important to us. It is TabMark's policy to respect your privacy regarding any information we
            may collect from you across our website. We only ask for personal information when we truly need it to
            provide a service to you. Please refer to our Privacy Policy for more details.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 font-abril-fatface text-2xl">4. Intellectual Property</h2>
          <p className="leading-relaxed my-4 font-spline-sans-tab">
            The Service and its original content, features, and functionality are and will remain the exclusive property
            of TabMark and its licensors. The Service is protected by copyright, trademark, and other laws of both the
            United States and foreign countries.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 font-abril-fatface text-2xl">5. Termination</h2>
          <p className="leading-relaxed my-4 font-spline-sans-tab">
            We may terminate or suspend your account and bar access to the Service immediately, without prior notice or
            liability, under our sole discretion, for any reason whatsoever and without limitation, including but not
            limited to a breach of the Terms.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 font-abril-fatface text-2xl">6. Limitations</h2>
          <p className="leading-relaxed my-4 font-spline-sans-tab">
            In no event shall TabMark be liable for any indirect, incidental, special, consequential or punitive
            damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses,
            resulting from your access to or use of or inability to access or use the Service.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 font-abril-fatface text-2xl">7. Changes to Terms</h2>
          <p className="leading-relaxed my-4 font-spline-sans-tab">
            We reserve the right, at our sole discretion, to modify or replace these Terms at any time. What constitutes
            a material change will be determined at our sole discretion. By continuing to access or use our Service
            after those revisions become effective, you agree to be bound by the revised terms.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 font-abril-fatface text-2xl">8. Governing Law</h2>
          <p className="leading-relaxed my-4 font-spline-sans-tab">
            These Terms shall be governed and construed in accordance with the laws of the United States and Canada, without regard
            to its conflict of law provisions. Our failure to enforce any right or provision of these Terms will not be
            considered a waiver of those rights.
          </p>
        </section>

        <section className="mb-8 relative z-10">
          <h2 className="text-[#4a0072] border-b border-[#ff9980] pb-2 font-abril-fatface text-2xl">9. Contact Us</h2>
          <p className="leading-relaxed my-4 font-spline-sans-tab">
            If you have any questions about these Terms, please contact us at <span className = "text-[#4a0072] font-bold"> tabmarkservices@gmail.com </span>
          </p>
        </section>
      </div>
      <div className="p-4 flex items-center justify-start">
          <p className="text-lg racing-sans-one-regular text-[#FF8C6B] flex items-center gap-4">
            Bays Inc. 2025 ©
            <Leaf size={22} className="text-[#FF8C6B] translate-y-0" />
          </p>
        </div>
    </div>
  )
}

export default TermsAndConditions
