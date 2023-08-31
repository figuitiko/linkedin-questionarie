import type { IncomingHttpHeaders } from 'http'
import type { NextApiRequest, NextApiResponse } from 'next'
import type { WebhookRequiredHeaders } from 'svix'
import { Webhook } from 'svix'
import { createAccount } from '@/lib/user.action'

type EventType = 'user.created' | 'user.updated' | 'user.deleted'
interface Event {
  data: Record<string, string | number | Array<Record<string, string>>>
  object: 'event'
  type: EventType
};

const webhookSecret: string | undefined = process.env.WEBHOOK_SECRET

export default async function handler (
  req: NextApiRequestWithSvixRequiredHeaders,
  res: NextApiResponse
) {
  const payload = JSON.stringify(req.body)
  const headers = req.headers
  // Create a new Webhook instance with your webhook secret
  if (webhookSecret === undefined) {
    res.status(500).json({})
    return
  }
  const wh = new Webhook(webhookSecret)

  let evt: Event
  try {
    // Verify the webhook payload and headers
    evt = wh.verify(payload, headers) as Event
  } catch (_) {
    // If the verification fails, return a 400 error
    res.status(400).json({})
    return
  }
  const eventType = evt.type
  console.log(`Received event of type ${eventType}`)
  const { id } = evt.data
  const { email_addresses: emailAddressArr } = evt.data
  const [email] = emailAddressArr as unknown as string[]
  console.log('Event data:', evt.data)
  if (eventType === 'user.created') {
    await createAccount({
      email,
      id: ''
    })
    // eslint-disable-next-line @typescript-eslint/restrict-template-expressions
    console.log(`User ${id} was ${eventType}`)
    res.status(201).json({})
  }
  res.status(200).json({ message: 'ok' })
}

type NextApiRequestWithSvixRequiredHeaders = NextApiRequest & {
  headers: IncomingHttpHeaders & WebhookRequiredHeaders
}
