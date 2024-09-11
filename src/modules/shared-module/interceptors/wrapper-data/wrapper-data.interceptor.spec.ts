import { lastValueFrom, of } from 'rxjs';
import { WrapperDataInterceptor } from '@/modules/shared-module/interceptors/wrapper-data/wrapper-data.interceptor';

describe('WrapperDataInterceptor', () => {
  let interceptor: WrapperDataInterceptor;

  beforeEach(() => {
    interceptor = new WrapperDataInterceptor();
  });

  it('should wrapper with data key', async () => {
    expect(interceptor).toBeDefined();
    const obs$ = interceptor.intercept({} as any, {
      handle: () => of({ name: 'tests' }),
    });
    const result = await lastValueFrom(obs$);
    expect(result).toEqual({ data: { name: 'tests' } });
  });

  it('should not wrapper when meta key is present', async () => {
    expect(interceptor).toBeDefined();
    const obs$ = interceptor.intercept({} as any, {
      handle: () => of({ data: { name: 'tests' }, meta: { total: 1 } }),
    });
    const result = await lastValueFrom(obs$);
    expect(result).toEqual({ data: { name: 'tests' }, meta: { total: 1 } });
  });
});
