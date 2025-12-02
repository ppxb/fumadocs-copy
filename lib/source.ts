import { loader } from 'fumadocs-core/source'
import { toFumadocsSource } from 'fumadocs-mdx/runtime/server'

import { blogCollection, changelogCollection, docs } from '@/.source/server'
import { getPageTree } from '@/components/sidebar-content'

const docSource = loader({
	baseUrl: '/docs',
	source: docs.toFumadocsSource()
})

export const source = { ...docSource, pageTree: getPageTree() }

export const changelogs = loader({
	baseUrl: '/changelogs',
	source: toFumadocsSource(changelogCollection, [])
})

export const blogs = loader({
	baseUrl: '/blogs',
	source: toFumadocsSource(blogCollection, [])
})
