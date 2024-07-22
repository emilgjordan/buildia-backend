import { Module, OnModuleInit } from '@nestjs/common';
import { ProjectConverter } from './converters/project.converter';
import { UserConverter } from './converters/user.converter';
import { ConversionService } from './conversion.service';
import { MessageConverter } from './converters/message.converter';

@Module({
  providers: [ProjectConverter, UserConverter, ConversionService],
  exports: [ConversionService],
})
export class ConversionModule implements OnModuleInit {
  constructor(
    private readonly conversionService: ConversionService,
    private readonly userConverter: UserConverter,
    private readonly projectConverter: ProjectConverter,
    private readonly messageConverter: MessageConverter,
  ) {}

  onModuleInit() {
    this.registerConverters();
  }

  registerConverters() {
    this.conversionService.registerConverter('User', this.userConverter);
    this.conversionService.registerConverter('Project', this.projectConverter);
    this.conversionService.registerConverter('Message', this.messageConverter);
  }
}
