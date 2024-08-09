import { Injectable } from '@nestjs/common';
import { ConversionService } from './conversion.service';
import { UserConverter } from './converters/main/user.converter';
import { ProjectConverter } from './converters/main/project.converter';
import { MessageConverter } from './converters/main/message.converter';
import { LikeConverter } from './converters/main/like.converter';
import { JoinRequestConverter } from './converters/main/join-request.converter';

@Injectable()
export class ConversionConfig {
  constructor(
    private readonly conversionService: ConversionService,
    private readonly userConverter: UserConverter,
    private readonly projectConverter: ProjectConverter,
    private readonly messageConverter: MessageConverter,
    private readonly likeConverter: LikeConverter,
    private readonly joinRequestConverter: JoinRequestConverter,
  ) {}

  onModuleInit() {
    this.registerConverters();
  }

  registerConverters() {
    this.conversionService.registerConverter('User', this.userConverter);
    this.conversionService.registerConverter('Project', this.projectConverter);
    this.conversionService.registerConverter('Message', this.messageConverter);
    this.conversionService.registerConverter('Like', this.likeConverter);
    this.conversionService.registerConverter(
      'JoinRequest',
      this.joinRequestConverter,
    );
  }
}
