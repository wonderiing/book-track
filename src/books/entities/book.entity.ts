import { Column, Entity, Index, PrimaryGeneratedColumn } from "typeorm";

@Entity()
export class Book {

    @PrimaryGeneratedColumn('uuid')
    id: string;

    @Index()
    @Column({ unique: true, name: 'external_id', type: 'text' })
    externalId: string;

    @Column({ type: 'text', name: 'external_source' })
    externalSource: string;

    @Column({ type: 'text' })
    title: string;

    @Column({ type: 'text', array: true })
    authors: string[];

    @Column({ type: 'text', name: 'cover_url', nullable: true })
    coverUrl: string | null;

    @Column({ type: 'text', nullable: true })
    synopsis: string | null;

    @Column({ type: 'text', name: 'publication_date' })
    publicationDate: string;

    @Column({ type: 'text', name: 'isbn_10', nullable: true })
    isbn10: string | null;

    @Column({ type: 'text', name: 'isbn_13', nullable: true })
    isbn13: string | null;

    @Column({ type: 'int', name: 'page_count' })
    pageCount: number;

    @Column({ type: 'text', array: true })
    genres: string[];

    @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
    created_at: Date;

}
