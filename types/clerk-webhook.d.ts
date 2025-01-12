export interface ClerkUserCreatedEvent {
    type: "user.created";
    data: {
      id: string; // Clerk User ID
      email_addresses: { email_address: string }[];
    };
  }
  
  export interface ClerkUserUpdatedEvent {
    type: "user.updated";
    data: {
      id: string;
      email_addresses: { email_address: string }[];
    };
  }

  export interface ClerkUserDeletedEvent {
    type: "user.deleted";
    data: {
      id: string;
      email_addresses: { email_address: string }[];
    };
  }
  
  // Add more event types as needed
  export type ClerkWebhookEvent = ClerkUserCreatedEvent | ClerkUserUpdatedEvent | ClerkUserDeletedEvent;
  