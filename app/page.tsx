/**
 * Landing Page - The main entry point for users
 * This is where users will sign up for the free 8-minute course
 */

import { Button } from "@/components/ui/button"
import { CheckCircle2, TrendingDown, Heart, Sparkles } from "lucide-react"
import { SignupForm } from "@/components/signup-form"
import Link from "next/link"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-sage/10">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Decorative background elements */}
        <div className="absolute inset-0 -z-10">
          <div className="absolute top-20 right-10 h-64 w-64 rounded-full bg-brand-sage/20 blur-3xl"></div>
          <div className="absolute bottom-20 left-10 h-64 w-64 rounded-full bg-brand-lime/10 blur-3xl"></div>
        </div>

        <div className="container mx-auto px-4 py-16 md:py-24">
          <div className="flex flex-col items-center text-center">
            {/* Logo/Brand Name */}
            <div className="mb-8">
              <h1 className="font-crimson text-5xl md:text-7xl font-bold text-brand-charcoal mb-2">
                Think Lite
              </h1>
              <h1 className="font-crimson text-5xl md:text-7xl font-bold text-brand-forest mb-4">
                Eat Lite
              </h1>
              <p className="text-xl md:text-2xl text-brand-teal italic font-light">
                Break Free from YoYo Dieting Forever
              </p>
            </div>

            {/* Main Value Proposition */}
            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mb-8">
              Discover the simple mindset shifts that make healthy eating effortless.
              No more diets that don't last. Just sustainable change that works.
            </p>

            {/* CTA Box */}
            <div id="signup" className="w-full max-w-md bg-white rounded-2xl shadow-2xl p-8 mb-12 border-2 border-brand-sage/30">
              <div className="mb-6 text-center">
                <div className="inline-flex items-center gap-2 bg-brand-lime/20 text-brand-charcoal px-4 py-2 rounded-full mb-4">
                  <Sparkles className="h-4 w-4" />
                  <span className="font-semibold text-sm">FREE 8-MINUTE COURSE</span>
                </div>
                <h3 className="text-2xl font-crimson font-bold text-brand-forest mb-2">
                  Get Instant Access
                </h3>
                <p className="text-gray-600 text-sm">
                  Start your journey to food freedom today
                </p>
              </div>

              {/* Functional Signup Form */}
              <SignupForm />
            </div>

            {/* Social Proof / Trust Indicators */}
            <div className="flex flex-wrap items-center justify-center gap-6 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-brand-forest" />
                <span>No spam, ever</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-brand-forest" />
                <span>Science-backed methods</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-brand-forest" />
                <span>Join 1,000+ students</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl md:text-4xl font-crimson font-bold text-center text-brand-charcoal mb-12">
            What You'll Learn
          </h2>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Benefit 1 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-sage/20 mb-4">
                <TrendingDown className="h-8 w-8 text-brand-forest" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-brand-charcoal">
                Break the Cycle
              </h3>
              <p className="text-gray-600">
                Understand why traditional diets fail and discover a sustainable approach that actually works.
              </p>
            </div>

            {/* Benefit 2 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-sage/20 mb-4">
                <Heart className="h-8 w-8 text-brand-forest" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-brand-charcoal">
                Love Food Again
              </h3>
              <p className="text-gray-600">
                Stop feeling guilty about eating. Learn to enjoy food while nourishing your body.
              </p>
            </div>

            {/* Benefit 3 */}
            <div className="text-center">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-brand-sage/20 mb-4">
                <Sparkles className="h-8 w-8 text-brand-forest" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-brand-charcoal">
                Simple Strategies
              </h3>
              <p className="text-gray-600">
                Get practical, easy-to-implement habits that fit into your busy life.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer CTA */}
      <section className="py-16 brand-gradient text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-crimson font-bold mb-4">
            Ready to Start Your Journey?
          </h2>
          <p className="text-xl mb-8 text-white/90">
            Get instant access to your free 8-minute course
          </p>
          <Link href="#signup">
            <Button
              variant="accent"
              size="xl"
              className="text-lg"
            >
              Sign Up Now - It's Free
            </Button>
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-charcoal text-white/80 py-8">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Think Lite Eat Lite. All rights reserved.</p>
          <div className="flex justify-center gap-6 mt-4">
            <a href="#" className="hover:text-brand-lime transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-brand-lime transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-brand-lime transition-colors">Contact</a>
          </div>
        </div>
      </footer>
    </div>
  )
}
