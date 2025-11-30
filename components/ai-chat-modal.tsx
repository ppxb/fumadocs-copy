'use client'

import { betterFetch } from '@better-fetch/fetch'
import { atom } from 'jotai'
import { AlertCircle, Bot } from 'lucide-react'
import { useEffect, useRef, useState } from 'react'

// TODO: MESSAGES RENDER

import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogHeader,
	DialogTitle
} from '@/components/ui/dialog'

interface Message {
	id: string
	role: 'user' | 'assistant'
	content: string
	timestamp: Date
	isStreaming?: boolean
}

export const aiChatModalAtom = atom(false)

interface AIChatModalProps {
	isOpen: boolean
	onClose: () => void
}

export function AIChatModal({ isOpen, onClose }: AIChatModalProps) {
	const [messages, setMessages] = useState<Message[]>([])
	const [input, setInput] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [apiError, setApiError] = useState<string | null>(null)
	const [sessionId, setSessionId] = useState<string | null>(null)
	const [externalUserId] = useState<string>(
		() =>
			`better-auth-user-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`
	)
	const messagesEndRef = useRef<HTMLDivElement>(null)
	const abortControllerRef = useRef<AbortController | null>(null)

	function scrollToBottom() {
		messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
	}

	useEffect(() => {
		scrollToBottom()
	}, [messages])

	useEffect(() => {
		return () => {
			if (abortControllerRef.current) {
				abortControllerRef.current.abort()
			}
		}
	})

	useEffect(() => {
		if (!isOpen) {
			setSessionId(null)
			setMessages([])
			setInput('')
			setApiError(null)
		}
	}, [isOpen])

	async function handleSubmit(e: React.FormEvent) {
		e.preventDefault()
		if (!input.trim() || isLoading) {
			return
		}

		const userMessage: Message = {
			id: Date.now().toString(),
			role: 'user',
			content: input.trim(),
			timestamp: new Date()
		}

		setMessages(prev => [...prev, userMessage])
		setInput('')
		setIsLoading(true)
		setApiError(null)

		const thinkingMessage: Message = {
			id: `thinking-${Date.now()}`,
			role: 'assistant',
			content: '',
			timestamp: new Date(),
			isStreaming: true
		}

		setMessages(prev => [...prev, thinkingMessage])

		abortControllerRef.current = new AbortController()

		try {
			const payload = {
				question: userMessage.content,
				stream: false, // Use non-streaming to get session_id
				session_id: sessionId, // Use existing session_id if available
				external_user_id: externalUserId, // Use consistent external_user_id for consistency on getting the context right
				fetch_existing: false
			}

			const { data, error } = await betterFetch<{
				content?: string
				answer?: string
				response?: string
				session_id?: string
			}>('/api/ai-chat', {
				method: 'POST',
				headers: {
					'content-type': 'application/json'
				},
				body: JSON.stringify(payload),
				signal: abortControllerRef.current.signal
			})

			if (error) {
				console.error('API Error Response:', error)
				throw new Error(`HTTP ${error.status}: ${error.message}`)
			}

			if (data.session_id) {
				setSessionId(data.session_id)
			}

			let answer = ''
			if (data.content) {
				answer = data.content
			} else if (data.answer) {
				answer = data.answer
			} else if (data.response) {
				answer = data.response
			} else if (typeof data === 'string') {
				answer = data
			} else {
				console.error('Unexpected response format:', data)
				throw new Error('Unexpected response format from API')
			}

			await simulateStreamingEffect(answer, thinkingMessage.id)
		} catch (error) {
			if (error instanceof Error && error.name === 'AbortError') {
				console.log('Request was aborted')
				return
			}

			console.error('Error calling AI API:', error)

			setMessages(prev =>
				prev.map(msg =>
					msg.id.startsWith('thinking-')
						? {
								id: (Date.now() + 1).toString(),
								role: 'assistant' as const,
								content: `I encountered an error while processing your request. Please try again.`,
								timestamp: new Date(),
								isStreaming: false
							}
						: msg
				)
			)

			if (error instanceof Error) {
				setApiError(error.message)
			}
		} finally {
			setIsLoading(false)
			abortControllerRef.current = null
		}
	}

	async function simulateStreamingEffect(
		fullContent: string,
		thinkingMessageId: string
	) {
		const assistantMessageId = (Date.now() + 1).toString()
		let displayedContent = ''

		setMessages(prev =>
			prev.map(msg =>
				msg.id === thinkingMessageId
					? {
							id: assistantMessageId,
							role: 'assistant' as const,
							content: '',
							timestamp: new Date(),
							isStreaming: true
						}
					: msg
			)
		)

		const words = fullContent.split(' ')
		for (let i = 0; i < words.length; i++) {
			displayedContent += (i > 0 ? ' ' : '') + words[i]

			setMessages(prev =>
				prev.map(msg =>
					msg.id === assistantMessageId
						? { ...msg, content: displayedContent }
						: msg
				)
			)

			const delay = Math.random() * 50 + 20
			await new Promise(resolve => setTimeout(resolve, delay))
		}

		setMessages(prev =>
			prev.map(msg =>
				msg.id === assistantMessageId ? { ...msg, isStreaming: false } : msg
			)
		)
	}

	return (
		<Dialog open={isOpen} onOpenChange={onClose}>
			<DialogContent className="max-w-4xl border-b h-[80vh] flex flex-col">
				<DialogHeader>
					<DialogTitle className="flex items-center gap-2">
						<Bot className="h-5 w-5 text-primary" />
						Ask AI About Better Auth
					</DialogTitle>
					<DialogDescription>
						Ask questions about Better-Auth and get AI-powered answers
						{apiError && (
							<div className="flex items-center gap-2 mt-2 text-amber-600 dark:text-amber-400">
								<AlertCircle className="h-4 w-4" />
								<span className="text-xs">
									API Error: Something went wrong. Please try again.
								</span>
							</div>
						)}
					</DialogDescription>
				</DialogHeader>
			</DialogContent>
		</Dialog>
	)
}
