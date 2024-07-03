import { validateSync } from 'class-validator';
import { FieldsErrors, IValidatorFields } from '@/shared/domain/validators/validator-fields-interface';

export class ClassValidatorFields<PropsValidated> implements IValidatorFields<PropsValidated> {
  errors: FieldsErrors | null;
  validatedData: PropsValidated | null;

  validate(data: any): boolean {
    const errors = validateSync(data);
    if (errors) {
      this.errors = {};
      for (const error of errors) {
        const field = error.property;
        this.errors[field] = Object.values(error.constraints!);
      }
    } else {
      this.validatedData = data;
    }
    return !errors.length;
  }
}
