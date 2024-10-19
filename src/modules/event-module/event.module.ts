import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { FakeController } from '@/modules/event-module/fake.controller';
import { FakeService } from '@/modules/event-module/fake.service';

@Module({
  imports: [EventEmitterModule.forRoot()],
  controllers: [FakeController],
  providers: [FakeService],
})
export class EventModule {}
