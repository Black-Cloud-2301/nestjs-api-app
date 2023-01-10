import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../src/prisma/prisma.service';
import { AppModule } from '../src/app.module';
import * as pactum from 'pactum';

const PORT = 3002;
describe('App EndToEnd tests', () => {
  let app: INestApplication;
  let prismaService: PrismaService;
  beforeAll(async () => {
    const appModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();
    app = appModule.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
    await app.listen(PORT);
    prismaService = app.get(PrismaService);
    await prismaService.cleanDatabase();
    pactum.request.setBaseUrl(`http://localhost:${PORT}`);
  });

  describe('Test Authentication', () => {
    describe('Register', () => {
      it('Should Register', () => {
        return pactum
          .spec()
          .post(`/auth/register`)
          .withBody({
            email: 'testemail01@gmail.com',
            password: 'a123456',
            firstname: 'Nguyen',
            lastname: 'Tu Ank',
          })
          .expectStatus(201)
          .expectBody({
            id: 1,
            email: 'testemail01@gmail.com',
            firstname: 'Nguyen',
            lastname: 'Tu Ank',
          })
          .inspect();
      });
    });

    describe('Register', () => {
      it('Should show error with empty email', () => {
        return pactum
          .spec()
          .post(`/auth/register`)
          .withBody({
            email: '',
            password: 'a123456',
            firstname: 'Nguyen',
            lastname: 'Tu Ank',
          })
          .expectStatus(400)
          .expectBody({
            error: 'Bad Request',
            message: ['email should not be empty', 'email must be an email'],
            statusCode: 400,
          });
      });
    });

    describe('Register', () => {
      it('Should show error with empty password', () => {
        return pactum
          .spec()
          .post(`/auth/register`)
          .withBody({
            email: 'testemail01@gmail.com',
            password: '',
            firstname: 'Nguyen',
            lastname: 'Tu Ank',
          })
          .expectStatus(400)
          .expectBody({
            error: 'Bad Request',
            message: ['password should not be empty'],
            statusCode: 400,
          });
      });
    });

    describe('Login', () => {
      it('Should Login', () => {
        return pactum
          .spec()
          .post('/auth/login')
          .withBody({
            email: 'testemail01@gmail.com',
            password: 'a123456',
          })
          .expectStatus(201)
          .stores('accessToken', 'accessToken');
      });
    });

    describe('User', () => {
      it('Should get detail user', () => {
        return pactum
          .spec()
          .get('/user/me')
          .withHeaders({
            Authorization: 'Bearer $S{accessToken}',
          })
          .expectStatus(200)
          .stores('userId', 'id');
      });
    });
  });

  describe('Note', () => {
    describe('Insert Note', () => {
      it('Should insert first note', () => {
        return pactum
          .spec()
          .post('/note')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody({
            title: 'test title',
            description: 'test description',
            url: 'test url',
          })
          .expectStatus(201);
      });
    });
    describe('Insert Second Note', () => {
      it('Should insert second note', () => {
        return pactum
          .spec()
          .post('/note')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .withBody({
            title: 'test title 2',
            description: 'test description 2',
            url: 'test url 2',
          })
          .expectStatus(201);
        // .stores('noteId1', '[0]');
      });
    });
    describe('Get all Notes', () => {
      it('Should get 2 notes', () => {
        return pactum
          .spec()
          .get('/note')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200)
          .expectJsonLength(2);
      });
    });

    describe('Get note by Id', () => {
      it('Should get note id 1', () => {
        return pactum
          .spec()
          .get('/note/1')
          .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
          .expectStatus(200)
          .expectJsonLength(1)
          .inspect();
      });
    });

    describe('Delete note by ID', () => {
      return pactum
        .spec()
        .delete('/note/1')
        .withHeaders({ Authorization: 'Bearer $S{accessToken}' })
        .expectStatus(204)
        .inspect();
    });
  });

  afterAll(async () => {
    app.close();
  });
});
