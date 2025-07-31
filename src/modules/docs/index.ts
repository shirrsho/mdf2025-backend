import { INestApplication, Logger } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { RapidocCustomOptions, RapidocModule } from '@b8n/nestjs-rapidoc';
import {
  SWAGGER_API_ROOT,
  SWAGGER_API_NAME,
  SWAGGER_API_DESCRIPTION,
  SWAGGER_API_CURRENT_VERSION,
} from './constants';
import { ConfigService } from '@nestjs/config';

export const setupSwagger = (app: INestApplication) => {
  const configService = app.get<ConfigService>(ConfigService);
  const docName = configService.get('DOC_NAME');
  const docDescription = configService.get('DOC_DESCRIPTION');
  const docLogo = configService.get('DOC_LOGO');
  const siteName = configService.get('APP_NAME');
  const appVersion = configService.get('APP_VERSION');
  const options = new DocumentBuilder()
    .setTitle(docName ?? SWAGGER_API_NAME)
    .setDescription(docDescription ?? SWAGGER_API_DESCRIPTION)
    .setVersion(appVersion ?? SWAGGER_API_CURRENT_VERSION)
    .setContact(
      'Shirsho ',
      'https://marketron.com',
      'hniqbal01@gmail.com',
    )
    .setLicense('MIT License', 'https://opensource.org/licenses/MIT')
    .addServer(
      process.env.NODE_ENV === 'development'
        ? 'http://localhost:4000'
        : `${process.env.BACKEND_ADDRESS}`,
    )
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(app, options);
  const rapidocOptions: RapidocCustomOptions = {
    rapidocOptions: {
      headingText: `${docName}`,
      fillRequestFieldsWithExample: true,
      persistAuth: true,
      bgColor: '#232323',
      textColor: '#ffffff',
      headerColor: '#1a1a1a',
      primaryColor: '#F4612E',
      navBgColor: '#2a2a2a',
      navTextColor: '#e0e0e0',
      navHoverBgColor: '#3a3a3a',
      navHoverTextColor: '#ffffff',
      navAccentColor: '#F4612E',
      navAccentTextColor: '#ffffff',
      fontSize: 'default',
      renderStyle: 'read',
      layout: 'column',
      allowAuthentication: true,
      allowTry: true,
      showCurlBeforeTry: true,
      allowSearch: true,
      allowAdvancedSearch: true,
      schemaStyle: 'tree',
      schemaExpandLevel: 2,
      showMethodInNavBar: 'as-colored-block',
      showInfo: true,
      showComponents: true,
    },
    customSiteTitle: `${siteName}`,
    customLogo: `${docLogo}`,
  };
  RapidocModule.setup(SWAGGER_API_ROOT, app, document, rapidocOptions);
  // SwaggerModule.setup(SWAGGER_API_ROOT, app, document);

  const logger = new Logger('Documentation');
  logger.log(`API Documentation is avaible at "/${SWAGGER_API_ROOT}"`);
};
