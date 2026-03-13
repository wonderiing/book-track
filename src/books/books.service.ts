import { BadGatewayException, BadRequestException, HttpException, HttpStatus, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { GoogleBook } from './dto/google-books.dto';
import { BookSource } from './dto/book.dto';
import { mapGoogleBookToBook } from './helpers/googleBookMapper.helper';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { error } from 'console';

@Injectable()
export class BooksService {

  private readonly logger = new Logger(BooksService.name);
  private readonly API_KEY = process.env.GOOGLE_LIBRARY_API_KEY;
  private readonly BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Book) private bookRepository: Repository<Book>,
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

    const normalizedQuery = query.trim().toLowerCase();

    const cacheKey = `search:${normalizedQuery}:${maxResults}:${startIndex}`

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

  async findOneById(id: string): Promise<BookSource> {

    const cacheKey = `book:${id}`;
    const cached = await this.cacheManager.get<BookSource>(cacheKey);
    if (cached) return cached;

    const book = await this.bookRepository.findOne({where: { externalId: id}});
    if (book) {
      await this.cacheManager.set(cacheKey, book);
      return book;
    } 
    
    const url = `${this.BASE_URL}/${id}?key=${this.API_KEY}`;
    const response = await fetch(url);

    if (!response.ok) {
      throw new BadGatewayException('Error fetching data from Google Books API');
    }

    const data: GoogleBook = await response.json();

    if (!data) {
      throw new NotFoundException('Book not found for give ID');
    }
    
    const mappedBook = mapGoogleBookToBook(data);

    await this.cacheManager.set(cacheKey, mappedBook);
    return mappedBook;

  }

  async create(id: string): Promise<Book> {

    const book = await this.findOneById(id);
    await this.assertBookDoesNotExist(book);

    try {
      
      const newBook = this.bookRepository.create({
        externalId: book.externalId,
        externalSource: book.externalSource,
        title: book.title,
        authors: book.authors,
        coverUrl: book.coverUrl,
        synopsis: book.synopsis,
        publicationDate: book.publicationDate || 'Unknown',
        isbn10: book.isbn10,
        isbn13: book.isbn13,
        pageCount: book.pageCount,
        genres: book.genres
      });

      const savedBook = await this.bookRepository.save(newBook);
      return savedBook;

    } catch (error) {

      this.logger.error('Error saving book', error);
      throw new BadRequestException('Something happened while saving the book.');
    }

  }

  async assertBookDoesNotExist(bookSource: BookSource): Promise<void> {

      let exists = false
      if (bookSource.isbn10) {
        exists = await this.bookRepository.existsBy({isbn10: bookSource.isbn10});
      } else if (bookSource.isbn13) {
        exists = await this.bookRepository.existsBy({isbn13: bookSource.isbn13});
      } else if (bookSource.externalId) {
        exists = await this.bookRepository.existsBy({externalId: bookSource.externalId});
      }

      if (exists) {
        throw new BadRequestException('Book already exists in DB');
      }

  }



}
