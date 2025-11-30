'use client'

import { OramaClient } from '@oramacloud/client'
import { SharedProps } from 'fumadocs-ui/components/dialog/search'
import { useI18n } from 'fumadocs-ui/contexts/i18n'

const client = new OramaClient({
	endpoint: process.env.NEXT_PUBLIC_ORAMA_ENDPOINT!,
	api_key: process.env.NEXT_PUBLIC_ORAMA_PUBLIC_API_KEY!
})

export function CustomSearchDialog(props: SharedProps) {
	const { locale } = useI18n()
}
