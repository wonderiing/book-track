import { BadRequestException, Inject, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { BookSource } from './dto/book.dto';
import { Book } from './entities/book.entity';
import { Repository } from 'typeorm';
import { InjectRepository } from '@nestjs/typeorm';
import { GoogleBooksProvider } from './providers/google-books.provider';

@Injectable()
export class BooksService {

  private readonly logger = new Logger(BooksService.name);

  constructor(
    @Inject(CACHE_MANAGER) private cacheManager: Cache,
    @InjectRepository(Book) private bookRepository: Repository<Book>,
    private readonly googleBooksProvider: GoogleBooksProvider,
  ) { }

  async findAllByName(query: string, maxResults: number, startIndex: number): Promise<BookSource[]> {

    const normalizedQuery = query.trim().toLowerCase();
    const cacheKey = `search:${normalizedQuery}:${maxResults}:${startIndex}`;

    const cached = await this.cacheManager.get<BookSource[]>(cacheKey);

    if (cached) {
      this.logger.log(`Cache HIT for: "${query}"`);
      return cached;
    }

    this.logger.log(`Cache MISS for: "${query}" — calling Google API`);

    const books = await this.googleBooksProvider.searchBooks(query, maxResults, startIndex);

    await this.cacheManager.set(cacheKey, books);
    return books;
  }

  async findOneByExternalId(id: string): Promise<BookSource> {

    const cacheKey = `book:${id}`;
    const cached = await this.cacheManager.get<BookSource>(cacheKey);
    if (cached) return cached;

    const book = await this.bookRepository.findOne({ where: { externalId: id } });
    if (book) {
      await this.cacheManager.set(cacheKey, book);
      return book;
    }

    const externalBook = await this.googleBooksProvider.findOneByExternalId(id);

    await this.cacheManager.set(cacheKey, externalBook);
    return externalBook;
  }

  async create(id: string): Promise<Book> {

    const book = await this.findOneByExternalId(id);
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

    let exists = false;
    if (bookSource.isbn10) {
      exists = await this.bookRepository.existsBy({ isbn10: bookSource.isbn10 });
    } else if (bookSource.isbn13) {
      exists = await this.bookRepository.existsBy({ isbn13: bookSource.isbn13 });
    } else if (bookSource.externalId) {
      exists = await this.bookRepository.existsBy({ externalId: bookSource.externalId });
    }

    if (exists) {
      throw new BadRequestException('Book already exists in DB');
    }
  }

  async findOneById(id: string): Promise<Book> {

    const book = await this.bookRepository.findOneBy({ id });

    if (!book) {
      throw new NotFoundException('Book not found for given ID');
    }

    return book;
  }

  // Pendiente de crear el DTO y cambiar el tipo de retorno.
  async findAll(offset: number, limit: number): Promise<Book[]> {
    const books = await this.bookRepository.find({
      skip: offset,
      take: limit,
    })
    return books;
  }
}
