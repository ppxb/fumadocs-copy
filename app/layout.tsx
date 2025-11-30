import { RootProvider } from 'fumadocs-ui/provider/next'
import { GeistMono } from 'geist/font/mono'
import { GeistSans } from 'geist/font/sans'
import type { ReactNode } from 'react'

import { AnchorScroll } from '@/components/anchor-scroll-fix'
import { ThemeProvider } from '@/components/theme-provider'
import { baseUrl, createMetadata } from '@/lib/metadata'

import './globals.css'

export const metadata = createMetadata({
	title: {
		template: '%s | Better Auth',
		default: 'Better Auth'
	},
	description:
		'The most comprehensive authentication framework for TypeScript.',
	metadataBase: baseUrl
})

export default function Layout({ children }: { children: ReactNode }) {
	return (
		<html lang="en" suppressHydrationWarning>
			<head>
				<link rel="icon" href="/favicon/favicon.ico" sizes="any" />
				<script
					dangerouslySetInnerHTML={{
						__html: `
                    try {
                      if (localStorage.theme === 'dark' || ((!('theme' in localStorage) || localStorage.theme === 'system') && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                        document.querySelector('meta[name="theme-color"]').setAttribute('content')
                      }
                    } catch (_) {}
                  `
					}}
				/>
			</head>
			<body
				className={`${GeistSans.variable} ${GeistMono.variable} bg-background font-sans relative`}
			>
				<ThemeProvider
					attribute="class"
					defaultTheme="dark"
					enableSystem
					disableTransitionOnChange
				>
					<RootProvider
						theme={{ enableSystem: true, defaultTheme: 'dark' }}
						search={{ enabled: true }}
					>
						<AnchorScroll />
						{children}
					</RootProvider>
					{children}
				</ThemeProvider>
			</body>
		</html>
	)
}
