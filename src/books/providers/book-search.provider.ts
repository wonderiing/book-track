import { BookSource } from "../dto/book.dto";

export interface BookSearchProvider {
    searchBooks(query: string, maxResults: number, startIndex: number): Promise<BookSource[]>;
    findOneByExternalId(id: string): Promise<BookSource>;
} 