import { Controller, Get } from '@nestjs/common';
import { AlertsService } from './alerts.service';
import { ActiveUser } from '../auth/decorators/active-user.decorator';
import type{ JwtPayload } from '@supabase/supabase-js';

@Controller('alerts')
export class AlertsController {
    constructor(private readonly alertsService: AlertsService) {}

    @Get()
    getAlerts(@ActiveUser() user: JwtPayload) {
        return this.alertsService.findAlertsByUserId(user.sub);
    }
}
