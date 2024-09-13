export class EventLocationDto {
  lat: number;
  lng: number;

  constructor(init: EventLocationDto) {
    Object.assign(this, init);
  }
}
