import { FieldsErrors } from '@/shared/domain/validators/validator-fields-interface';

export class EntityValidationError extends Error {
  constructor(
    public errors: FieldsErrors[],
    message = 'Entity Validation Error',
  ) {
    super(message);
  }
}
