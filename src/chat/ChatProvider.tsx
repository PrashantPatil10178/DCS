import type { PropsWithChildren } from "react";
// When you're ready to wire Voltagent chat streams, uncomment the provider import below
// and initialize it with your configuration.
// import { ChatKitProvider } from "@openai/chatkit-react";

/**
 * ChatProvider
 * A lightweight wrapper we can swap to ChatKitProvider later without touching the app tree.
 */
export function ChatProvider({ children }: PropsWithChildren) {
  // TODO: Replace with <ChatKitProvider ...>{children}</ChatKitProvider>
  return <>{children}</>;
}
