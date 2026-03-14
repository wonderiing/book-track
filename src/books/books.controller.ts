import { Controller, Get, Post, Body, Patch, Param, Query, ParseUUIDPipe } from '@nestjs/common';
import { BooksService } from './books.service';
import { UUID } from 'typeorm/driver/mongodb/bson.typings';
import { of } from 'rxjs';
import { PaginationDto } from 'src/common/dtos/pagination.dto';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) { }


  @Get("search/google/:query")
  searchBooks(@Param("query") query: string, @Query("maxResults") maxResults: number, @Query("startIndex") startIndex: number) {
    return this.booksService.findAllByName(query, maxResults, startIndex);
  }

  @Get("search/google/:externalId")
  searchBookById(@Param("externalId") externalId: string) {
    return this.booksService.findOneByExternalId(externalId);
  }

  @Post(":id")
  addBook(@Param("id") id: string) {
    return this.booksService.create(id);
  }

  @Get(":uuid")
  getBook(@Param("uuid", ParseUUIDPipe) uuid: string) {
    return this.booksService.findOneById(uuid);
  }

  @Get()
  getAllBooks(@Query() paginationDto: PaginationDto) {
    return this.booksService.findAll(paginationDto);
  }

}
