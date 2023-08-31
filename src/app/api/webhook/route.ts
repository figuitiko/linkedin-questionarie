import type { IncomingHttpHeaders } from 'http'
import type { WebhookRequiredHeaders } from 'svix'
import { Webhook } from 'svix'
import { createAccount } from '@/lib/user.action'
import { headers } from 'next/headers'
import { NextResponse } from 'next/server'

type EventType = 'user.created' | 'user.updated' | 'user.deleted'
interface Event {
  data: Record<string, string | number | Record<string, string | number> | Array<Record<string, string>>>
  object: 'event'
  type: EventType
}

export const POST = async (req: Request) => {
  const webhookSecret: string | undefined = process.env.NEXT_CLERK_WEBHOOK_SECRET

  const payload = await req.json()
  const header = headers()
  // Create a new Webhook instance with your webhook secret
  if (webhookSecret === undefined) {
    return NextResponse.json({ status: 500 })
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
  } catch (e) {
    // If the verification fails, return a 400 error
    return NextResponse.json({ error: JSON.stringify(e) }, { status: 404 })
  }
  const eventType = evt.type
  console.log(`Received event of type ${eventType}`)
  console.error('evt Data', JSON.stringify(evt.data, null, 2))
  const { id } = evt.data
  const email = (evt.data.email_addresses as Array<Record<string, string>>)?.[0].email_address
  console.warn('Event data:', evt.data)
  if (eventType === 'user.created' || eventType === 'user.updated') {
    await createAccount({
      email,
      id: id as string
    })
    return NextResponse.json({ error: 'Not error user Created' }, { status: 201 })
  }
  return NextResponse.json({ error: 'Not event fired' }, { status: 200 })
}
