import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url)
  const code = searchParams.get('code')
  
  // FIXED: Default redirect to '/profile' instead of '/'
  // This ensures that after clicking the email link or Google Login, 
  // the user lands on their orders/profile page.
  const next = searchParams.get('next') ?? '/profile'

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // The `setAll` method was called from a Server Component.
              // This can be ignored if you have middleware refreshing user sessions.
            }
          },
        },
      }
    )
    
    // Exchange the temporary code for a permanent user session
    const { error } = await supabase.auth.exchangeCodeForSession(code)
    
    if (!error) {
      // Redirect to the profile page on success
      return NextResponse.redirect(`${origin}${next}`)
    }
  }

  // If there is an authentication error, send them back to login 
  // with a generic error state
  return NextResponse.redirect(`${origin}/login?error=session_expired`)
}