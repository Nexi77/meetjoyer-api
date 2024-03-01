import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { BadRequestException, ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  app.useGlobalPipes(
    new ValidationPipe({
      exceptionFactory: (errors) => {
        const result = errors.map((error) => ({
          property: error.property,
          message:
            error.constraints?.[Object.keys(error.constraints || {})[0]] ||
            error.constraints,
        }));
        return new BadRequestException(result);
      },
    }),
  );
  app.enableCors();
  await app.listen(3333);
}
bootstrap();
