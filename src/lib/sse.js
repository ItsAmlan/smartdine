import { EventEmitter } from "events";

const globalForSSE = globalThis;

if (!globalForSSE.__sseEmitter) {
  globalForSSE.__sseEmitter = new EventEmitter();
  globalForSSE.__sseEmitter.setMaxListeners(100);
}

const emitter = globalForSSE.__sseEmitter;

/**
 * Emit an event to a specific channel
 * Channels: 'kitchen', 'steward', 'customer-{orderId}'
 */
export function emitSSE(channel, data) {
  emitter.emit(channel, data);
}

/**
 * Create a ReadableStream that listens to SSE events on a channel.
 * Used in API route handlers to stream events to connected clients.
 */
export function createSSEStream(channel) {
  let listener;

  const stream = new ReadableStream({
    start(controller) {
      // Send initial connection event
      controller.enqueue(
        `data: ${JSON.stringify({ type: "connected", channel })}\n\n`
      );

      listener = (data) => {
        try {
          controller.enqueue(`data: ${JSON.stringify(data)}\n\n`);
        } catch {
          // Client disconnected
          emitter.removeListener(channel, listener);
        }
      };

      emitter.on(channel, listener);
    },
    cancel() {
      if (listener) {
        emitter.removeListener(channel, listener);
      }
    },
  });

  return stream;
}

/**
 * Helper to create proper SSE Response
 */
export function createSSEResponse(channel) {
  const stream = createSSEStream(channel);

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-store, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}

