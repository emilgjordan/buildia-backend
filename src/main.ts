import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService)
  const PORT = configService.get<number>('PORT');

  app.enableCors({
    origin: 'http://localhost:5173',
    credentials: true
  })

  app.use(cookieParser())

  app.useGlobalPipes(new ValidationPipe({
    transform: true, // <- turn on transformation
    whitelist: true, // optional, recommended to strip unknown properties
    forbidNonWhitelisted: true // optional, recommended
  }));

  await app.listen(PORT || 3000, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT || 3000}`);
  });
}
bootstrap();
