import { notFound } from 'next/navigation'
import { changelogs } from '@/lib/source'

const metaTitle = 'Changelogs'
const metaDescription = 'Latest changes , fixes and updates.'

export default async function Page({
	params
}: {
	params: Promise<{ slug?: string[] }>
}) {
	const { slug } = await params
	const page = changelogs.getPage(slug)

	if (!slug) {
		return
	}

	if (!page) {
		notFound()
	}
}
