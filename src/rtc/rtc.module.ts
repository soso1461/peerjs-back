import { Module } from '@nestjs/common';
import { RtcController } from './rtc.controller';
import { RtcService } from './rtc.service';
import { Rtc } from './rtc/rtc';

@Module({
  controllers: [RtcController],
  providers: [RtcService, Rtc]
})
export class RtcModule {}
