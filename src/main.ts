import { config } from 'dotenv';

const envPath =
  process.env.NODE_ENV === 'production'
    ? '.env.production'
    : process.env.NODE_ENV === 'test'
      ? '.env.test'
      : '.env.development';

config({ path: envPath });

import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

const PORT = process.env.PORT || 3000;

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );
  if (!process.env.MONGO_CONNECTION_URI) {
    console.error('MONGO_CONNECTION_URI must be defined');
    process.exit(1); // Exit with a failure code
  }
  await app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}
bootstrap();
