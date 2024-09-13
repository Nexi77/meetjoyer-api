import { registerDecorator, ValidationOptions } from 'class-validator';
import { IsGeoLocationConstraint } from '../validators/geo-location.validator';

export function IsGeoLocation(validationOptions?: ValidationOptions) {
  return function (object: object, propertyName: string) {
    registerDecorator({
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      constraints: [],
      validator: IsGeoLocationConstraint,
    });
  };
}
