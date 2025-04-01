import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Use these two libs to get list of language and locale preferences from browser settings etc
import { match } from '@formatjs/intl-localematcher'
import Negotiator from 'negotiator'

const supportedLocales = ['en-GB', 'de-DE', 'en-SG']
const defaultLocale = 'en-GB'


/**
 * Reads the accept-language header from the request and returns the most preferred locale as a string. Multiple language headers are parsed and ranked in order of preference. Locale is defaulted to 'en-GB' if no match is found.
 *
 * @param {NextRequest} request 
 * @returns {string} 
 */
function getLocale(request: NextRequest): string {
    const negotiatorHeaders = { 'accept-language': request.headers.get('accept-language') || '' };
    const languages = new Negotiator({ headers: negotiatorHeaders }).languages();
    return match(languages, supportedLocales, defaultLocale);
}

// This function can be marked `async` if using `await` inside
export function middleware(request: NextRequest) {
    // Check if there is any supported locale in the pathname
    const { pathname } = request.nextUrl
    const pathnameHasLocale = supportedLocales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    )

    if (pathnameHasLocale) return

    // Redirect if there is no locale
    const locale = getLocale(request)
    request.nextUrl.pathname = `/${locale}${pathname}`
    return NextResponse.redirect(request.nextUrl)
}

export const config = {
    matcher: [
        // Skip all internal paths (_next), useful if we want to extend language resolution further later on.
        '/((?!_next).*)',
        // only run the language middleware on registry pages
        '/registry/*'
    ],
}