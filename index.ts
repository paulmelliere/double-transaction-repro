import { forwardRequest, getSocket } from './nest-lambda-adapter';
import { ALBEvent, ALBResult } from 'aws-lambda';
import * as newrelic from 'newrelic';
import { startWebServer } from './webserver';

const unixSocket: string = getSocket();

export const restRoute = newrelic.setLambdaHandler(function (albEvent: ALBEvent): Promise<ALBResult> {
  return newrelic.startWebTransaction('albEvent', async function (): Promise<ALBResult> {
    const distributedTrace = (newrelic.getTransaction() as any).createDistributedTracePayload().httpSafe();
    albEvent.headers = {
      ...albEvent.headers,
      'newrelic-transaction': distributedTrace
    };

    await startWebServer(unixSocket);
    return forwardRequest(albEvent, unixSocket);
  });
});
