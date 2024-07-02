import { Test } from '@nestjs/testing';
import { AppModule } from '../src/app.module';
import {
  HttpCode,
  HttpStatus,
  INestApplication,
  ValidationPipe,
} from '@nestjs/common';
import { PrismaService } from '../src/prisma/prisma.service';
import * as pactum from 'pactum';
import { AuthDto } from 'src/auth/dto';

const BASE_URL = 'http://localhost:4000';

describe('App e2e', () => {
  let app: INestApplication;
  let prisma: PrismaService;
  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleRef.createNestApplication();
    app.useGlobalPipes(
      new ValidationPipe({
        whitelist: true,
      }),
    );
    await app.init();
    await app.listen(4000);

    prisma = app.get(PrismaService);
    await prisma.cleanDb();
  });

  afterAll(() => {
    app?.close();
  });

  describe('Auth', () => {
    const dto: AuthDto = {
      email: 'raazi@gmail.com',
      password: '123',
    };
    describe('Signup', () => {
      it('should throw error without email', () => {
        return pactum
          .spec()
          .post(BASE_URL + '/auth/signup')
          .withBody({ password: dto.password })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should throw error without password', () => {
        return pactum
          .spec()
          .post(BASE_URL + '/auth/signup')
          .withBody({ email: dto.email })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw error with no body', () => {
        return pactum
          .spec()
          .post(BASE_URL + '/auth/signup')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });

      it('should signup', () => {
        return pactum
          .spec()
          .post(BASE_URL + '/auth/signup')
          .withBody(dto)
          .expectStatus(HttpStatus.CREATED);
      });
    });
    describe('Login', () => {
      it('should throw error without email', () => {
        return pactum
          .spec()
          .post(BASE_URL + '/auth/login')
          .withBody({ password: dto.password })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw error without password', () => {
        return pactum
          .spec()
          .post(BASE_URL + '/auth/login')
          .withBody({ email: dto.email })
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should throw error with no body', () => {
        return pactum
          .spec()
          .post(BASE_URL + '/auth/login')
          .expectStatus(HttpStatus.BAD_REQUEST);
      });
      it('should login', () => {
        return pactum
          .spec()
          .post(BASE_URL + '/auth/login')
          .withBody(dto)
          .expectStatus(HttpStatus.OK)
          .stores('userAt', 'access_token');
      });
    });
  });

  describe('User', () => {
    it('should throw unauthorized with no token', () => {
      return pactum
        .spec()
        .get(BASE_URL + '/users/current')
        .expectStatus(HttpStatus.UNAUTHORIZED)
        .inspect();
    });
    it('should throw error without email', () => {
      return pactum
        .spec()
        .get(BASE_URL + '/users/current')
        .withHeaders({
          Authorization: 'Bearer $S{userAt}',
        })
        .expectStatus(HttpStatus.OK)
        .inspect();
    });
  });
});
