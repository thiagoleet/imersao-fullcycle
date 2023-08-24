import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma/prisma.service';
import { CreateRouteDriverDto } from '../dto/create-route-driver.dto';

@Injectable()
export class RoutesDriverService {
  constructor(private prismaService: PrismaService) {}

  async createOrUpdate(dto: CreateRouteDriverDto) {
    // const countRouteDriver = await this.prismaService.routeDriver.count({
    //   where: {
    //     route_id: createRouteDriverDto.route_id,
    //   },
    // });

    return await this.prismaService.routeDriver.upsert({
      include: { route: true },
      where: {
        route_id: dto.route_id,
      },
      create: {
        route_id: dto.route_id,
        points: {
          set: {
            location: {
              lat: dto.lat,
              lng: dto.lng,
            },
          },
        },
      },
      update: {
        points: {
          push: {
            location: {
              lat: dto.lat,
              lng: dto.lng,
            },
          },
        },
      },
    });
  }
}
