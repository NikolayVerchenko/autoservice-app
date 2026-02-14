import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ClientModule } from '../client/client.module';
import { DefectComplaint } from '../defect/defect-complaint.entity';
import { Defect } from '../defect/defect.entity';
import { UserModule } from '../user/user.module';
import { TelegramController } from './telegram.controller';
import { TelegramSession } from './telegram-session.entity';
import { TelegramService } from './telegram.service';

@Module({
  imports: [
    ClientModule,
    UserModule,
    TypeOrmModule.forFeature([TelegramSession, Defect, DefectComplaint]),
  ],
  controllers: [TelegramController],
  providers: [TelegramService],
  exports: [TelegramService],
})
export class TelegramModule {}
