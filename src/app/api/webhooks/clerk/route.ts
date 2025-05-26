import { WebhookEvent } from '@clerk/nextjs/server';
import { headers } from 'next/headers';
import { Webhook } from 'svix';

import { createUser, UpdateUser, deleteUser } from '@/lib/users';
import { User } from '@prisma/client';

export async function POST(req: Request) {
  const WEBHOOK_SECRET = process.env.WEBHOOK_SECRET;

  if (!WEBHOOK_SECRET) {
    throw new Error('Missing WEBHOOK_SECRET in environment variables');
  }

  const headerPayload = await headers(); // ✅ no await
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
  if (!id) {
    return new Response('Missing user id', { status: 400 });
  }
  const eventType = evt.type;

  if (eventType === 'user.created') {
    const { id, email_addresses, username, image_url } = evt.data;

    if (!id || !email_addresses) {
      return new Response('Error occurred -- missing data', {
        status: 400,
      });
    }

    const user = {
      clerkUserId: id,
      email: email_addresses[0].email_address,
      ...(image_url ? { image: image_url } : {}),
      ...(username ? { username: username } : {}),
    };

    await createUser(user as User);
  }

  if (eventType === 'user.updated') {
    const { id, email_addresses, username, image_url } = evt.data;

    if (!id || !email_addresses) {
      return new Response('Error occurred -- missing data', {
        status: 400,
      });
    }

    await UpdateUser(id, {
      email: email_addresses[0].email_address,
      ...(image_url ? { image: image_url } : {}),
      ...(username ? { username: username } : {}),
    });
  }


  if (eventType === 'user.deleted') {
    try {
      await deleteUser(id);
    } catch (error) {
      console.error('Failed to delete user:', error);
      return new Response('User deletion failed', { status: 500 });
    }
  }

  console.log(`Unhandled webhook event type: ${eventType}`);
  return new Response('Event received', { status: 200 });
}
