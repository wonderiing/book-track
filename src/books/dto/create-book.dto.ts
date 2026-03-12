import { IsArray, IsInt, IsNotEmpty, IsOptional, IsString } from "class-validator";

export class CreateBookDto {

    @IsString()
    @IsNotEmpty()
    externalId: string;

    @IsString()
    @IsNotEmpty()
    externalSource: string;

    @IsString()
    @IsNotEmpty()
    title: string;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    authors: string[];

    @IsOptional()
    @IsString()
    coverUrl?: string;

    @IsString()
    @IsNotEmpty()
    synopsis: string;

    @IsInt()
    @IsNotEmpty()
    publicationYear: number;

    @IsOptional()
    @IsString()
    isbn10?: string;

    @IsOptional()
    @IsString()
    isbn13?: string;

    @IsInt()
    @IsNotEmpty()
    pageCount: number;

    @IsArray()
    @IsString({ each: true })
    @IsNotEmpty({ each: true })
    genres: string[];

}
