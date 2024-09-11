# codeflix-microservice-videos-backend-typescript


## instalação

```bash
# clonar o repositório
git clone https://github.com/netoudi/codeflix-microservice-videos-backend-typescript.git

# acessar o projeto
cd codeflix-microservice-videos-backend-typescript

# executar com docker
docker-compose up -d

# acessar a aplicação
docker-compose exec app bash

# configurar as variáveis de ambiente
cp envs/.env.test.example envs/.env.test
cp envs/.env.e2e.example envs/.env.e2e

# instalar as dependências
npm install
```


## execução

```bash
# executar os testes
npm run test

# executar os testes com coverage
npm run test:cov

# executar o typecheck do typescript
npm run tsc:check

# executar o lint (roda o eslint com prettier configurado)
npm run lint

# executar typecheck, lint e testes
npm run tsc:check && npm run lint && npm run test:cov

# executar os testes e2e
npm run test:e2e
```


## tecnologias

- [Docker](https://www.docker.com/)
- [Docker Compose](https://docs.docker.com/compose/)
- [TypeScript](https://www.typescriptlang.org/)
- [Node.js](https://nodejs.org/)
- [Sequelize](https://sequelize.org/)
- [Jest](https://jestjs.io/)
- [Nest.js](https://nestjs.com/)
