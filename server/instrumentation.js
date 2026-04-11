/**
 * Langfuse OTel instrumentation — must be imported FIRST in server/index.js
 * before any other module so the span processor is active for all LLM calls.
 */
import { NodeSDK } from '@opentelemetry/sdk-node';
import { LangfuseSpanProcessor } from '@langfuse/otel';

// Export so index.js can call forceFlush() if ever needed
export const langfuseProcessor = new LangfuseSpanProcessor();

const sdk = new NodeSDK({
  spanProcessors: [langfuseProcessor],
});

sdk.start();

// Cloud Run sends SIGTERM before killing the container — flush buffered spans first
process.on('SIGTERM', () => {
  sdk.shutdown().finally(() => process.exit(0));
});
