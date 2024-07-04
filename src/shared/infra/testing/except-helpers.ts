import { ClassValidatorFields } from '@/shared/domain/validators/class-validator-fields';
import { EntityValidationError } from '@/shared/domain/validators/entity-validation.error';
import { FieldsErrors } from '@/shared/domain/validators/validator-fields-interface';

type Expected =
  | {
      validator: ClassValidatorFields<any>;
      data: any;
    }
  | (() => any);

function isValid() {
  return { pass: true, message: () => '' };
}

function assertContainsErrorMessages(expected: any, received: FieldsErrors) {
  const isMatch = expect.objectContaining(received).asymmetricMatch(expected);
  return isMatch
    ? isValid()
    : {
        pass: false,
        message: () => {
          return `The validation errors not contains ${JSON.stringify(received)}. Current: ${JSON.stringify(expected)}`;
        },
      };
}

expect.extend({
  containsErrorMessages(expected: Expected, received: FieldsErrors) {
    if (typeof expected === 'function') {
      try {
        expected();
        return isValid();
      } catch (e) {
        const error = e as EntityValidationError;
        return assertContainsErrorMessages(error.errors, received);
      }
    } else {
      const { validator, data } = expected;
      const validated = validator.validate(data);
      if (validated) return isValid();
      return assertContainsErrorMessages(validator.errors, received);
    }
  },
});
