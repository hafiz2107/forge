import {
  authMiddleware,
  clerkMiddleware,
  createRouteMatcher,
} from '@clerk/nextjs/server';
import { NextResponse } from 'next/server';

// const isProtectedRoute = createRouteMatcher(['/agency(.*)']);
// const isPublicRoute = createRouteMatcher(['/site','/api/upload']);

// export default clerkMiddleware((auth, req) => {
//   if (isProtectedRoute(req)) auth().protect();
// });

export default authMiddleware({
  publicRoutes: ['/site', '/api/upload'],
  async beforeAuth(req, evt) {},
  async afterAuth(auth, req) {
    const url = req.nextUrl;
    const searchParams = url.searchParams.toString();
    let hostName = req.headers;

    const pathWithSearchParms = `${url.pathname}${
      searchParams.length > 0 ? `${searchParams}` : ''
    }`;

    // If Subdomain exist
    const customSubdomain = hostName
      .get('host')
      ?.split(`${process.env.NEXT_PUBLIC_DOMAIN}`)
      .filter(Boolean)[0];

    if (customSubdomain)
      return NextResponse.rewrite(
        new URL(`/${customSubdomain}${pathWithSearchParms}`, req.url)
      );

    if (url.pathname === '/sign-in' || url.pathname === '/sign-up')
      return NextResponse.redirect(new URL(`/agency/sign-in`, req.url));

    if (
      url.pathname === `/` ||
      (url.pathname === `/site` && url.host === process.env.NEXT_PUBLIC_DOMAIN)
    )
      return NextResponse.rewrite(new URL(`/site`, req.url));

    if (
      url.pathname.startsWith('/agency') ||
      url.pathname.startsWith('/subaccount')
    )
      return NextResponse.rewrite(new URL(`${pathWithSearchParms}`, req.url));
  },
});

export const config = {
  matcher: ['/((?!.+.[w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
};
