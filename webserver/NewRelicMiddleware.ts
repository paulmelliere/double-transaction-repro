import { IncomingMessage, ServerResponse } from 'http';
import * as newrelic from 'newrelic';

export default function (request: IncomingMessage, response: ServerResponse, next: () => void) {
  const transaction = newrelic.getTransaction();
  const distributedTrace = request.headers['newrelic-transaction'];

  if (distributedTrace) {
    (transaction as any).acceptDistributedTracePayload(distributedTrace);
  }

  const transactionName = `${request.url}#${request.method}`.substring(1);
  newrelic.setTransactionName(transactionName);

  next();
}
