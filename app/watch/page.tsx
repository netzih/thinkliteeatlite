/**
 * Protected Video Page
 * Users access this page via the personalized link in their email
 * URL format: /watch?token=abc123xyz
 *
 * How it works:
 * 1. Gets token from URL query parameter
 * 2. Validates token against database
 * 3. If valid, shows video and marks as accessed
 * 4. If invalid, shows error and signup link
 */

import { redirect } from 'next/navigation'
import { db } from '@/lib/db'
import { CheckCircle2, XCircle, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

interface PageProps {
  searchParams: { token?: string }
}

export default async function WatchPage({ searchParams }: PageProps) {
  const token = searchParams.token

  // No token provided
  if (!token) {
    return <InvalidTokenPage message="No access token provided. Please use the link from your email." />
  }

  // Validate token and get user
  const user = await db.user.findUnique({
    where: { accessToken: token }
  })

  // Invalid token
  if (!user) {
    return <InvalidTokenPage message="This access link is invalid or has expired." />
  }

  // Mark video as accessed (if not already)
  if (!user.videoAccessed) {
    await db.user.update({
      where: { id: user.id },
      data: { videoAccessed: true }
    })
  }

  // Show video page
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-sage/10">
      {/* Header */}
      <header className="border-b border-brand-sage/30 bg-white">
        <div className="container mx-auto px-4 py-6">
          <Link href="/">
            <h1 className="font-crimson text-3xl font-bold text-brand-forest text-center">
              Think Lite Eat Lite
            </h1>
          </Link>
        </div>
      </header>

      {/* Video Section */}
      <section className="container mx-auto px-4 py-12 max-w-4xl">
        {/* Welcome Message */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 bg-brand-lime/20 text-brand-charcoal px-4 py-2 rounded-full mb-4">
            <Sparkles className="h-4 w-4" />
            <span className="font-semibold text-sm">YOUR FREE COURSE</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-crimson font-bold text-brand-charcoal mb-3">
            Welcome, {user.firstName}! 🌱
          </h2>
          <p className="text-lg text-gray-700">
            Your journey to breaking free from yo-yo dieting starts here
          </p>
        </div>

        {/* Video Container */}
        <div className="bg-white rounded-2xl shadow-xl overflow-hidden border-2 border-brand-sage/30 mb-8">
          {/* Video Player - Replace with your actual video embed */}
          <div className="aspect-video bg-gray-900 flex items-center justify-center relative">
            {/* Placeholder - Replace with actual video embed */}
            <div className="text-center text-white p-8">
              <p className="text-xl mb-4">📹 Video Player Placeholder</p>
              <p className="text-sm text-gray-300 mb-4">
                Replace this with your Vimeo, YouTube, or Mux embed code
              </p>
              <div className="bg-white/10 rounded-lg p-4 text-left text-xs font-mono max-w-md mx-auto">
                <p className="text-yellow-300">Example for Vimeo:</p>
                <p className="text-gray-300 mt-2">
                  &lt;iframe src="https://player.vimeo.com/video/YOUR_VIDEO_ID"<br />
                  &nbsp;&nbsp;width="100%"<br />
                  &nbsp;&nbsp;height="100%"<br />
                  &nbsp;&nbsp;frameborder="0"<br />
                  &nbsp;&nbsp;allow="autoplay; fullscreen"<br />
                  &nbsp;&nbsp;allowfullscreen&gt;<br />
                  &lt;/iframe&gt;
                </p>
              </div>
            </div>

            {/* When you have the video, replace the above div with: */}
            {/*
            <iframe
              src="https://player.vimeo.com/video/YOUR_VIDEO_ID"
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="autoplay; fullscreen; picture-in-picture"
              allowFullScreen
              title="Think Lite Eat Lite Free Course"
            />
            */}

            {/* Or for YouTube: */}
            {/*
            <iframe
              src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
              className="absolute inset-0 w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title="Think Lite Eat Lite Free Course"
            />
            */}
          </div>

          {/* Video Info */}
          <div className="p-6">
            <h3 className="text-2xl font-crimson font-bold text-brand-charcoal mb-2">
              Break Free from YoYo Dieting Forever
            </h3>
            <p className="text-gray-600 mb-4">
              In this 8-minute course, you'll discover the simple mindset shifts that make healthy eating effortless.
            </p>

            {/* Key Takeaways */}
            <div className="space-y-2">
              <p className="font-semibold text-brand-forest">What you'll learn:</p>
              <ul className="space-y-2 text-gray-700">
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand-forest flex-shrink-0 mt-0.5" />
                  <span>Why traditional diets fail and what works instead</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand-forest flex-shrink-0 mt-0.5" />
                  <span>The mindset shift that makes healthy eating effortless</span>
                </li>
                <li className="flex items-start gap-2">
                  <CheckCircle2 className="h-5 w-5 text-brand-forest flex-shrink-0 mt-0.5" />
                  <span>Simple strategies you can start using today</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* CTA Section */}
        <div className="bg-brand-forest text-white rounded-2xl p-8 text-center">
          <h3 className="text-2xl md:text-3xl font-crimson font-bold mb-4">
            Ready for More?
          </h3>
          <p className="text-lg mb-6 text-white/90">
            This is just the beginning. Join our full course to transform your relationship with food.
          </p>
          <Button variant="accent" size="xl" className="text-lg">
            Learn More About the Full Course
          </Button>
          <p className="text-sm text-white/70 mt-4">
            Coming soon! We'll email you when it launches.
          </p>
        </div>

        {/* Bookmark This Page */}
        <div className="mt-8 text-center">
          <p className="text-gray-600">
            💡 <strong>Tip:</strong> Bookmark this page to rewatch anytime!
          </p>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-brand-charcoal text-white/80 py-8 mt-12">
        <div className="container mx-auto px-4 text-center text-sm">
          <p>&copy; {new Date().getFullYear()} Think Lite Eat Lite. All rights reserved.</p>
        </div>
      </footer>
    </div>
  )
}

/**
 * Component shown when token is invalid
 */
function InvalidTokenPage({ message }: { message: string }) {
  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-brand-sage/10 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border-2 border-red-200 text-center">
        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <XCircle className="h-8 w-8 text-red-600" />
        </div>

        <h2 className="text-2xl font-crimson font-bold text-brand-charcoal mb-3">
          Access Denied
        </h2>

        <p className="text-gray-700 mb-6">
          {message}
        </p>

        <Link href="/">
          <Button variant="default" size="lg" className="w-full">
            Go to Homepage & Sign Up
          </Button>
        </Link>

        <p className="text-sm text-gray-500 mt-4">
          Already signed up? Check your email for the access link.
        </p>
      </div>
    </div>
  )
}
