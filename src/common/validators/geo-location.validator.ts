import {
  ValidatorConstraint,
  ValidatorConstraintInterface,
} from 'class-validator';

// ValidatorConstraint for checking [number, number]
@ValidatorConstraint({ async: false })
export class IsGeoLocationConstraint implements ValidatorConstraintInterface {
  validate(value: any) {
    return (
      Array.isArray(value) &&
      value.length === 2 &&
      typeof value[0] === 'number' &&
      typeof value[1] === 'number'
    );
  }

  defaultMessage() {
    return 'Geolocation must be picked';
  }
}
