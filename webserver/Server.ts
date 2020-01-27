import { Module } from '@nestjs/common';
import EchoController from './EchoController';

@Module({
  controllers: [
    EchoController
  ]
})
export default class Server {}
