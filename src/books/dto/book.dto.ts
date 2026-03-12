// dto/book-source.interface.ts
export interface BookSource {
    externalId: string;
    externalSource: 'google' | 'openlibrary' | string;
    title: string;
    authors: string[];
    coverUrl: string | null;
    synopsis: string | null;
    publicationDate: string | null
    isbn10: string | null;
    isbn13: string | null;
    pageCount: number;
    genres: string[];
}
