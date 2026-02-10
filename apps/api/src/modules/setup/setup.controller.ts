import { Body, Controller, Post } from '@nestjs/common';
import { SetupService } from './setup.service';
import { SetupDto } from './dto/setup.dto';

@Controller('setup')
export class SetupController {
  constructor(private readonly setupService: SetupService) {}

  @Post()
  setup(@Body() dto: SetupDto) {
    return this.setupService.setup(dto);
  }
}
