import * as newrelic from 'newrelic';
import { NestFactory } from '@nestjs/core';
import { INestApplication } from '@nestjs/common';
import { FastifyAdapter, NestFastifyApplication } from '@nestjs/platform-fastify';
import NewRelicMiddleware from './NewRelicMiddleware';
import Server from './Server';
import { getCurrentSegment } from '../nest-lambda-adapter';
import * as Fastify from 'fastify';

let nestApplication: INestApplication | undefined;

export async function startWebServer (location: number | string): Promise<void> {
  return newrelic.startSegment('createNestApplication', true, async function (): Promise<void> {
    if (nestApplication) {
      return;
    }

    nestApplication = await NestFactory.create<NestFastifyApplication>(
      Server,
      new FastifyAdapter()
    );
    nestApplication.use(NewRelicMiddleware);

    const f = nestApplication.getHttpAdapter();
    const fastifyInstance: Fastify.FastifyInstance = f.getInstance();

    const origEmit = fastifyInstance.server.emit;
    fastifyInstance.server.emit = function (event, request) {
      if (event === 'request') {
        newrelic.agent.tracer.segment = getCurrentSegment();
      }

      return origEmit.apply(this, arguments);
    } as any;


    try {
      await nestApplication.listen(location);
    } catch (error) {
      console.log('Failed to start nest application', error);
      nestApplication = undefined;
      throw error;
    }
  });
}
