import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { ApiResponseDto } from './common/dto/api-response.dto';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @Get('up')
  healthCheck() {
    return ApiResponseDto.success({
      status: 'healthy',
      database: 'connected',
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'development',
    }, 'Sistema funcionando corretamente');
  }
}
