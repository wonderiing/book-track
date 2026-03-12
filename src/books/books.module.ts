import { Module } from '@nestjs/common';
import { CacheModule } from '@nestjs/cache-manager';
import { BooksService } from './books.service';
import { BooksController } from './books.controller';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Book } from './entities/book.entity';

@Module({
  controllers: [BooksController],
  providers: [BooksService],
  imports: [
    CacheModule.register({
      ttl: 900_000, // 15 minutos en ms
    }),
    TypeOrmModule.forFeature([
      Book
    ]),
  ],
})
export class BooksModule {}
