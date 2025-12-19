import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';
import { NestExpressApplication } from '@nestjs/platform-express';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  // 🔥 CORS FORZADO PARA AZURE (preflight)
  app.use((req, res, next) => {
    res.header(
      'Access-Control-Allow-Origin',
      'https://studymate-frontend-app-cgh9hge2csdbhkeb.canadacentral-01.azurewebsites.net'
    );
    res.header(
      'Access-Control-Allow-Methods',
      'GET,POST,PUT,PATCH,DELETE,OPTIONS'
    );
    res.header(
      'Access-Control-Allow-Headers',
      'Content-Type, Authorization'
    );
    res.header('Access-Control-Allow-Credentials', 'true');

    if (req.method === 'OPTIONS') {
      return res.sendStatus(204);
    }

    next();
  });

  // ✅ CORS estándar (solo un origin)
  app.enableCors({
    origin:
      'https://studymate-frontend-app-cgh9hge2csdbhkeb.canadacentral-01.azurewebsites.net',
    credentials: true,
  });

  app.useGlobalPipes(new ValidationPipe());

  const port = process.env.PORT || 8080;
  await app.listen(port, '0.0.0.0');
  console.log(`Server running on port ${port}`);
}

void bootstrap();
