import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
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

  // swagger config
  const config = new DocumentBuilder()
    .setTitle('meetjoyer-api')
    .setDescription(
      "API that provides data for events/meetings and let's you chat with each other",
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  await app.listen(3333);
}
bootstrap();
