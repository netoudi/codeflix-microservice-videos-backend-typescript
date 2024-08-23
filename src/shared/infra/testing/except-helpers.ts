import { Notification } from '@/shared/domain/validators/notification';
import { FieldsErrors } from '@/shared/domain/validators/validator-fields-interface';

expect.extend({
  notificationContainsErrorMessages(expected: Notification, received: Array<FieldsErrors>) {
    const every = received.every((error) => {
      if (typeof error === 'string') {
        return expected.errors.has(error);
      } else {
        return Object.entries(error).every(([field, messages]) => {
          const fieldMessages = expected.errors.get(field) as string[];
          return fieldMessages && fieldMessages.length && fieldMessages.every((message) => messages.includes(message));
        });
      }
    });
    return every
      ? { pass: true, message: () => '' }
      : {
          pass: false,
          message: () => {
            return `The validation errors not contains ${JSON.stringify(received)}. Current: ${JSON.stringify(expected.toJSON())}`;
          },
        };
  },
});
