import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) { }


  @Get("search/:query")
  searchBooks(@Param("query") query: string, @Query("maxResults") maxResults: number, @Query("startIndex") startIndex: number) {
    return this.booksService.findAllByName(query, maxResults, startIndex);
  }

  @Get("search/id/:id")
  searchBookById(@Param("id") id : string) {
    return this.booksService.findOneById(id);
  }

  @Post(":id")
  addBook(@Param("id") id: string) {
    return this.booksService.create(id);

  }

}
