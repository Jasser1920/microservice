import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { Eureka } from 'eureka-js-client';

import { AppModule } from './app.module';

type EurekaClient = {
  start: () => void;
};

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService = app.get(ConfigService);

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
    }),
  );

  const port = parseInt(configService.get<string>('PORT', '3007'), 10);
  const serviceName = configService.get<string>('SERVICE_NAME', 'ms-transport');
  const eurekaHost = configService.get<string>('EUREKA_HOST', 'localhost');
  const eurekaPort = parseInt(
    configService.get<string>('EUREKA_PORT', '8761'),
    10,
  );

  await app.listen(port);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-call
  const client = new Eureka({
    instance: {
      app: serviceName,
      hostName: 'localhost',
      ipAddr: '127.0.0.1',
      port: {
        $: port,
        '@enabled': true,
      },
      vipAddress: serviceName,
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
    },
    eureka: {
      host: eurekaHost,
      port: eurekaPort,
      servicePath: '/eureka/apps/',
    },
  }) as EurekaClient;

  client.start();
}
void bootstrap();
