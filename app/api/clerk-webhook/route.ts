import { NextRequest } from "next/server";
import { Webhook, WebhookRequiredHeaders } from "svix"; // Import Webhook and types from svix
import prisma from "@/lib/prisma"; // Prisma client
import { ClerkWebhookEvent } from "@/types/clerk-webhook";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET as string;

export async function POST(req: NextRequest) {
    if (req.method !== "POST") {
        return Response.json({ error: "Method Not Allowed" }, {status: 405});
    }

    const payload = req.body;
    const headers = req.headers;

    // Verify webhook signature
    const svix = new Webhook(webhookSecret);
    let event: ClerkWebhookEvent; // Use a specific type if you have one for Clerk events

    try {
        event = svix.verify(
            JSON.stringify(payload),
            headers as unknown as WebhookRequiredHeaders
        ) as ClerkWebhookEvent; // Explicitly cast to ClerkWebhookEvent
    } catch (err) {
        console.error("Webhook verification failed:", err);
        return Response.json({ error: "Invalid webhook signature" }, {status: 400});
    }


    // Handle the `user.created` event
    if (event.type === "user.created") {
        const { id: clerkUserId, email_addresses } = event.data;

        try {
            // Create user in your database
            await prisma.user.create({
                data: {
                    id: clerkUserId,
                    email: email_addresses[0]?.email_address,
                },
            });

            console.log(`User ${clerkUserId} created in database`);
            return Response.json({ message: "Webhook processed successfully" }, {status: 200});
        } catch (err) {
            console.error("Error creating user in database:", err);
            return Response.json({ error: "Database error" }, {status: 500});
        }
    }

    // Ignore other event types
    return Response.json({ message: "Event ignored" });
}
