import { clerkMiddleware } from '@clerk/nextjs/server';
import { NextResponse, type NextRequest, type NextFetchEvent } from 'next/server';
import { isClerkConfigured } from '@/lib/clerk-config';

const isAdminRoute = (pathname: string): boolean => {
  if (pathname === '/admin') return true;
  if (pathname.startsWith('/admin/')) {
    if (pathname.startsWith('/admin/login') || pathname.startsWith('/admin/unauthorized')) {
      return false;
    }
    return true;
  }
  if (pathname.startsWith('/api/admin')) return true;
  return false;
};

// Next.js 16 Proxy handler
export default async function proxy(request: NextRequest, event: NextFetchEvent) {
  // If Clerk credentials are not yet set or are placeholders, use custom proxy logic
  // to avoid Clerk SDK throwing a malformed publishable key error
  if (!isClerkConfigured()) {
    if (isAdminRoute(request.nextUrl.pathname)) {
      if (request.nextUrl.pathname.startsWith('/api/admin')) {
        return NextResponse.json(
          { error: 'Unauthorized: Administrator authentication required' },
          { status: 401 }
        );
      }
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
    return NextResponse.next();
  }

  // When live Clerk keys are present, delegate to Clerk's official middleware
  const clerkHandler = clerkMiddleware(async (auth, req) => {
    if (isAdminRoute(req.nextUrl.pathname)) {
      const { userId } = await auth();

      if (!userId) {
        if (req.nextUrl.pathname.startsWith('/api/admin')) {
          return NextResponse.json(
            { error: 'Unauthorized: Administrator authentication required' },
            { status: 401 }
          );
        }
        return NextResponse.redirect(new URL('/admin/login', req.url));
      }
    }

    return NextResponse.next();
  });

  return clerkHandler(request, event);
}

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
