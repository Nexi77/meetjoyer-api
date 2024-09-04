import { PaginationDto } from '../pagination/dto/pagination.dto';

export function getParsedPaginationAndRest<T>(queryObject: T & PaginationDto) {
  const parsedQueryObject: T & { limit: number; page: number } = {
    ...queryObject,
    page: 1,
    limit: 10,
  };
  parsedQueryObject.limit = Number(queryObject.limit);
  parsedQueryObject.page = Number(queryObject.page);
  return parsedQueryObject;
}
