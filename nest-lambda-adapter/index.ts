import * as newrelic from 'newrelic';
import { ALBEvent, ALBResult } from 'aws-lambda';
import * as rp from 'request-promise-native';
import * as request from 'request';
import * as url from 'url';

function getPathWithQueryStringParams (event: ALBEvent): string {
  return url.format({
    pathname: event.path,
    query: event.multiValueQueryStringParameters
  });
}

function mapEventToHttpRequest (event: ALBEvent): rp.Options {
  return {
    body: event.body,
    headers: event.headers,
    forever: true,
    method: event.httpMethod,
    resolveWithFullResponse: true,
    simple: false,
    uri: getPathWithQueryStringParams(event)
  };
}

function convertResponse (response: request.Response): ALBResult {
  return {
    body: response.body,
    isBase64Encoded: false,
    headers: response.headers,
    statusCode: response.statusCode
  } as ALBResult;
}

export function getSocket (): string {
  const randomSuffix = Math.random().toString(36).substring(2, 15);
  return `/tmp/server-${randomSuffix}.sock`;
}

let currentSegment = null;

export function getCurrentSegment() {
  return currentSegment;
}

export async function forwardRequest (event: ALBEvent, socket: string): Promise<ALBResult> {
  const requestOptions: rp.Options = mapEventToHttpRequest(event);
  requestOptions.baseUrl = `http://unix:${socket}:/`;
  currentSegment = newrelic.agent.tracer.getSegment();

  try {
    const response: request.Response = await rp(requestOptions);
    return convertResponse(response);
  } catch (error) {
    console.log('Failed to send event to internal http server', error);

    return {
      body: JSON.stringify({
        code: 'internal.server.error',
        message: 'Internal Server Error',
        status: 500
      }),
      isBase64Encoded: false,
      statusCode: 500,
      statusDescription: '500 Internal Server Error'
    };
  }
}
