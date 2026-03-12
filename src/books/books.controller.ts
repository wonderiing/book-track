import { Controller, Get, Post, Body, Patch, Param, Query } from '@nestjs/common';
import { BooksService } from './books.service';

@Controller('books')
export class BooksController {
  constructor(private readonly booksService: BooksService) { }


  @Get("search/:query")
  searchBooks(@Param("query") query: string, @Query("maxResults") maxResults: number, @Query("startIndex") startIndex: number) {
    return this.booksService.searchBooks(query, maxResults, startIndex);
  }

}
