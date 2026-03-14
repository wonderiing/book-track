import { BadGatewayException, Injectable, Logger, NotFoundException } from '@nestjs/common';
import { BookSearchProvider } from './book-search.provider';
import { BookSource } from '../dto/book.dto';
import { GoogleBook } from '../dto/google-books.dto';
import { mapGoogleBookToBook } from '../helpers/googleBookMapper.helper';

@Injectable()
export class GoogleBooksProvider implements BookSearchProvider {

  private readonly logger = new Logger(GoogleBooksProvider.name);
  private readonly API_KEY = process.env.GOOGLE_LIBRARY_API_KEY;
  private readonly BASE_URL = 'https://www.googleapis.com/books/v1/volumes';

  async searchBooks(query: string, maxResults: number, startIndex: number): Promise<BookSource[]> {

    const url = `${this.BASE_URL}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}&key=${this.API_KEY}`;
    this.logger.debug(`Fetching Google Books API: ${query}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new BadGatewayException('Error fetching data from Google Books API');
    }

    const data = await response.json();

    if (!data.items || data.items.length === 0) {
      throw new NotFoundException('No books found for the given query');
    }

    return data.items.map((book: GoogleBook) => mapGoogleBookToBook(book));
  }

  async findOneByExternalId(id: string): Promise<BookSource> {

    const url = `${this.BASE_URL}/${id}?key=${this.API_KEY}`;
    this.logger.debug(`Fetching Google Books API by ID: ${id}`);

    const response = await fetch(url);

    if (!response.ok) {
      throw new BadGatewayException('Error fetching data from Google Books API');
    }

    const data: GoogleBook = await response.json();

    if (!data) {
      throw new NotFoundException('Book not found for given ID');
    }

    return mapGoogleBookToBook(data);
  }
}
