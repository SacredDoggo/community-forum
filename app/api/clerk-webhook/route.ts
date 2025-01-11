import { NextApiRequest, NextApiResponse } from "next";
import { Webhook, WebhookRequiredHeaders } from "svix"; // Import Webhook and types from svix
import prisma from "@/lib/prisma"; // Prisma client
import { ClerkWebhookEvent } from "@/types/clerk-webhook";

const webhookSecret = process.env.CLERK_WEBHOOK_SECRET as string;

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
    if (req.method !== "POST") {
        return res.status(405).json({ error: "Method Not Allowed" });
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
        return res.status(400).json({ error: "Invalid webhook signature" });
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
            return res.status(200).json({ message: "Webhook processed successfully" });
        } catch (err) {
            console.error("Error creating user in database:", err);
            return res.status(500).json({ error: "Database error" });
        }
    }

    // Ignore other event types
    res.status(200).json({ message: "Event ignored" });
}
