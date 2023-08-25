import { Module } from '@nestjs/common';
import { RoutesService } from './routes.service';
import { RoutesController } from './routes.controller';
import { MapsModule } from 'src/maps/maps.module';
import { RoutesDriverService } from './routes-driver/routes-driver.service';
import { RoutesGateway } from './routes/routes.gateway';
import { BullModule } from '@nestjs/bull';
import { NewPointsJob } from './new-points.job';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { RouteKafkaProducerJob } from './route-kafka-producer.job';

@Module({
  imports: [
    MapsModule,
    BullModule.registerQueue(
      { name: 'new-points' },
      { name: 'kafka-producer' },
    ),
    ClientsModule.registerAsync([
      {
        name: 'KAFKA-SERVICE',
        useFactory: () => ({
          transport: Transport.KAFKA,
          options: {
            client: {
              clientId: 'nest',
              brokers: ['host.docker.internal:9094'],
              // brokers: ['kafka:9092'],
            },
          },
        }),
      },
    ]),
  ],
  controllers: [RoutesController],
  providers: [
    RoutesService,
    RoutesDriverService,
    RoutesGateway,
    NewPointsJob,
    RouteKafkaProducerJob,
  ],
})
export class RoutesModule {}
