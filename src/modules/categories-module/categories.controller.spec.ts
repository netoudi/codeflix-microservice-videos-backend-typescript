import { Test, TestingModule } from '@nestjs/testing';
import { CategoriesController } from '@/modules/categories-module/categories.controller';
import { CategoriesModule } from '@/modules/categories-module/categories.module';
import { DatabaseModule } from '@/modules/database/database.module';

describe('CategoriesController', () => {
  let controller: CategoriesController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [DatabaseModule, CategoriesModule],
    }).compile();

    controller = module.get<CategoriesController>(CategoriesController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
