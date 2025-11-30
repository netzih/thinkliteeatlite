/**
 * Login Page Layout
 * Bypasses the admin authentication check
 */

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <>{children}</>
}
