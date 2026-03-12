import { HttpException, HttpStatus, Injectable } from '@nestjs/common';
import { CreateBookDto } from './dto/create-book.dto';

@Injectable()
export class BooksService {

  private readonly API_KEY = process.env.GOOGLE_LIBRARY_API_KEY;
  private readonly BASE_URL = 'https://www.googleapis.com/books/v1/volumes';


  async searchBooks(query: string, maxResults: number, startIndex: number): Promise<any> {


    const url = `${this.BASE_URL}?q=${encodeURIComponent(query)}&startIndex=${startIndex}&maxResults=${maxResults}&key=${this.API_KEY}`;

    console.log(url);
    console.log(query)

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



}
