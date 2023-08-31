import type { IncomingHttpHeaders } from 'http'
import type { WebhookRequiredHeaders } from 'svix'
import { Webhook } from 'svix'
import { createAccount } from '@/lib/user.action'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

type EventType = 'user.created' | 'user.updated' | 'user.deleted'
interface Event {
  data: Record<string, string | number | Array<Record<string, string>>>
  object: 'event'
  type: EventType
}

const webhookSecret: string | undefined = process.env.WEBHOOK_SECRET

export const POST = async (req: Request) => {
  const payload = JSON.stringify(req.body)
  const header = headers()
  // Create a new Webhook instance with your webhook secret
  if (webhookSecret === undefined) {
    return NextResponse.json({ status: 400 })
  }
  const wh = new Webhook(webhookSecret)

  let evt: Event
  const heads = {
    'svix-id': header.get('svix-id'),
    'svix-timestamp': header.get('svix-timestamp'),
    'svix-signature': header.get('svix-signature')
  }
  try {
    // Verify the webhook payload and headers
    evt = wh.verify(
      JSON.stringify(payload),
      heads as IncomingHttpHeaders & WebhookRequiredHeaders
    ) as Event
  } catch (_) {
    // If the verification fails, return a 400 error
    return NextResponse.json({ status: 400 })
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
    return NextResponse.json({ message: 'User created' }, { status: 201 })
  }
  return NextResponse.json({ message: 'User created' }, { status: 201 })
}
