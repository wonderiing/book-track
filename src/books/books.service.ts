import { HttpException, HttpStatus, Inject, Injectable, Logger } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GoogleBook } from './dto/google-books.dto';
import { BookSource } from './dto/book.dto';
import { mapGoogleBookToBook } from './helpers/googleBookMapper.helper';

@Injectable()
export class BooksService {

  private readonly logger = new Logger(BooksService.name);
  private readonly API_KEY = process.env.GOOGLE_LIBRARY_API_KEY;
  private readonly BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
  ) { }



  async searchBooks(query: string, maxResults: number, startIndex: number): Promise<GoogleBook[]> {


    const url = `${this.BASE_URL}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}&key=${this.API_KEY}`;

    this.logger.debug(`Fetching Google Books API: ${query}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new HttpException('Error fetching data from Google Books API', HttpStatus.BAD_GATEWAY);
    }

    const data = await response.json();


    if (!data.items || data.items.length === 0) {
      throw new HttpException('No books found for the given query', HttpStatus.NOT_FOUND);
    }

    return data.items;
  }

  async findAllByName(query: string, maxResults: number, startIndex: number): Promise<BookSource[]> {

    const cacheKey = `search:${query}:${maxResults}:${startIndex}`

    const cached = await this.cacheManager.get<BookSource[]>(cacheKey)

    if (cached) {
      this.logger.log(`Cache HIT for: "${query}"`);
      return cached;
    }

    this.logger.log(`Cache MISS for: "${query}" — calling Google API`);

    const books: GoogleBook[] = await this.searchBooks(query, maxResults, startIndex);

    const mappedBooks: BookSource[] = books.map(book => mapGoogleBookToBook(book))

    await this.cacheManager.set(cacheKey, mappedBooks);
    return mappedBooks
  }



}
