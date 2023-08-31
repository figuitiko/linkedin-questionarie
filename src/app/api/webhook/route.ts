import type { IncomingHttpHeaders } from 'http'
import type { WebhookRequiredHeaders } from 'svix'
import { Webhook } from 'svix'
import { createAccount, updateUser } from '@/lib/user.action'
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
  const { id, first_name: name, image_url: image } = evt.data
  const email = (evt.data.email_addresses as Array<Record<string, string>>)?.[0].email_address
  if (eventType === 'user.created' || eventType === 'user.updated') {
    const account = await createAccount({
      email,
      id: id as string
    })
    await updateUser({
      email,
      name: name as string,
      image: image as string,
      accountId: account.id
    })
    return NextResponse.json({ status: 201 })
  }
  return NextResponse.json({ status: 200 })
}
