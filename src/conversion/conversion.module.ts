import { Module, OnModuleInit } from '@nestjs/common';
import { ProjectConverter } from './converters/main/project.converter';
import { UserConverter } from './converters/main/user.converter';
import { ConversionService } from './conversion.service';
import { MessageConverter } from './converters/main/message.converter';
import { PlainProjectConverter } from './converters/plain/plain-project.converter';
import { PlainUserConverter } from './converters/plain/plain-user.converter';
import { PlainMessageConverter } from './converters/plain/plain-message.converter';
import { ConversionConfig } from './conversion.config';
import { LikeConverter } from './converters/main/like.converter';
import { PlainLikeConverter } from './converters/plain/plain-like.converter';

@Module({
  providers: [
    ProjectConverter,
    PlainProjectConverter,
    UserConverter,
    PlainUserConverter,
    MessageConverter,
    LikeConverter,
    PlainLikeConverter,
    PlainMessageConverter,
    ConversionService,
    ConversionConfig,
  ],
  exports: [ConversionService],
})
export class ConversionModule {}
