
import { Controller, Get, Body, Patch, Param, UseGuards } from '@nestjs/common';
import { SystemConfigsService } from './system-configs.service';
import { UpdateSystemConfigDto, SystemConfigKey } from '@turborepo/shared';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../../auth/guards/roles.guard';
import { Roles } from '../../auth/decorators/roles.decorator';
import { UserRole } from '@turborepo/shared';

@Controller('system-configs')
@UseGuards(JwtAuthGuard, RolesGuard)
export class SystemConfigsController {
  constructor(private readonly systemConfigsService: SystemConfigsService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.STAFF)
  findAll() {
    return this.systemConfigsService.findAll();
  }

  @Patch(':key')
  @Roles(UserRole.ADMIN)
  update(
    @Param('key') key: SystemConfigKey,
    @Body() updateSystemConfigDto: UpdateSystemConfigDto
  ) {
    return this.systemConfigsService.update(key, updateSystemConfigDto);
  }
}
