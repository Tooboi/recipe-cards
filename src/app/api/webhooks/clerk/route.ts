import { clerkClient, WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createUser } from '@/lib/actions/user.actions';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing WEBHOOK_SECRET in environment variables');
  }

  const headerPayload = headers() as unknown as Headers; // ✅ no await
  const svix_id = headerPayload.get('svix-id');
  const svix_timestamp = headerPayload.get('svix-timestamp');
  const svix_signature = headerPayload.get('svix-signature');

  if (!svix_id || !svix_timestamp || !svix_signature) {
    return new Response('Missing svix headers', { status: 400 });
  }

  const payload = await req.json();
  const body = JSON.stringify(payload);

  const wh = new Webhook(WEBHOOK_SECRET);

  let evt: WebhookEvent;
  try {
    evt = wh.verify(body, {
      'svix-id': svix_id,
      'svix-timestamp': svix_timestamp,
      'svix-signature': svix_signature,
    }) as WebhookEvent;
  } catch (err) {
    console.error('Webhook verification failed:', err);
    return new Response('Invalid signature', { status: 400 });
  }

  const { id } = evt.data;
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { email_addresses, image_url, username } = evt.data;

    const user = {
      clerkId: id,
      email: email_addresses[0].email_address,
      name: username || email_addresses[0].email_address,
      image: image_url,
    };

    const newUser = await createUser(user);

    if (newUser) {
      await clerkClient.users.updateUserMetadata(id, {
        publicMetadata: {
          userId: newUser._id,
        },
      });
    }

    return NextResponse.json({ message: 'User created', user: newUser });
  }

  console.log(`Unhandled webhook event type: ${eventType}`);
  return new Response('Event received', { status: 200 });
}
