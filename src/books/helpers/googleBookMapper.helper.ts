import { BookSource } from "../dto/book.dto";
import { GoogleBook } from "../dto/google-books.dto";
import { Book } from "../entities/book.entity";

export const mapGoogleBookToBook = (googleBook: GoogleBook): BookSource => {

    const book: BookSource = {
        externalId: googleBook.id,
        externalSource: 'google',
        title: googleBook.volumeInfo.title,
        authors: googleBook.volumeInfo.authors || [],
        coverUrl: googleBook.volumeInfo.imageLinks?.thumbnail || null,
        synopsis: googleBook.volumeInfo.description || null,
        publicationDate: googleBook.volumeInfo.publishedDate || null,
        isbn10: googleBook.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_10")?.identifier ?? null,
        isbn13: googleBook.volumeInfo.industryIdentifiers?.find(id => id.type === "ISBN_13")?.identifier ?? null,
        pageCount: googleBook.volumeInfo.pageCount,
        genres: googleBook.volumeInfo.categories || [],

    }

    return book;
}