import { NextRequest, NextResponse } from "next/server";
import { Webhook, WebhookRequiredHeaders } from "svix"; 

import prisma from "@/lib/prisma"; 
import { ClerkWebhookEvent } from "@/types/clerk-webhook";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
  const payload = await req.text(); 
  const headers = {
    "svix-id": req.headers.get("svix-id") || "",
    "svix-timestamp": req.headers.get("svix-timestamp") || "",
    "svix-signature": req.headers.get("svix-signature") || "",
  } as WebhookRequiredHeaders;

  const svix = new Webhook(webhookSecret);
  let event: ClerkWebhookEvent;

  try {
    event = svix.verify(payload, headers) as ClerkWebhookEvent; 
  } catch (err) {
    console.error("Webhook verification failed:", err);
    return NextResponse.json({ error: "Invalid webhook signature" }, { status: 400 });
  }

  // Handle the `user.created` event
  if (event.type === "user.created") {
    const { id: clerkUserId, username: clerkUsername } = event.data;

    try {
      await prisma.user.create({
        data: {
          id: clerkUserId,
          username: clerkUsername
        },
      });

      console.log(`User ${clerkUserId} created in database`);
      return NextResponse.json({ message: "Webhook processed successfully" });
    } catch (err) {
      console.error("Error creating user in database:", err);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  }

  // Handle the `user.updated` event
  if (event.type === "user.updated") {
    const { id: clerkUserId, username: clerkUsername } = event.data;

    try {
      await prisma.user.update({
        where: {
          id: clerkUserId,
        },
        data: {
          username: clerkUsername
        }
      });

      console.log(`User ${clerkUserId} deleted in database`);
      return NextResponse.json({ message: "Webhook processed successfully" });
    } catch (err) {
      console.error("Error deleting user in database:", err);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  }

  // Handle the `user.deleted` event
  if (event.type === "user.deleted") {
    const { id: clerkUserId } = event.data;

    try {
      await prisma.user.delete({
        where: {
          id: clerkUserId,
        },
      });

      console.log(`User ${clerkUserId} deleted in database`);
      return NextResponse.json({ message: "Webhook processed successfully" });
    } catch (err) {
      console.error("Error deleting user in database:", err);
      return NextResponse.json({ error: "Database error" }, { status: 500 });
    }
  }

  // Return 200 for other events to acknowledge receipt
  return NextResponse.json({ message: "Event ignored" });
}
