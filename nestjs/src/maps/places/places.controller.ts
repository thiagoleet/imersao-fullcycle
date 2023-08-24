import { Controller, Get, Query } from '@nestjs/common';
import { PlacesService } from './places.service';

@Controller('places')
export class PlacesController {
  constructor(private service: PlacesService) {}

  @Get()
  findPlace(@Query('text') text: string) {
    return this.service.findPlace(text);
  }
}
