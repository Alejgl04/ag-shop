import {
  BadRequestException,
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { FilesService } from './files.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { fileFilter } from './helpers/fileFilter.helper';
import { diskStorage } from 'multer';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Post('product')
  @UseInterceptors(
    FileInterceptor('file', {
      fileFilter: fileFilter,
      // limits: {},
      storage: diskStorage({
        destination: './static/uploads',
      }),
    }),
  )
  uploadProductFile(@UploadedFile('file') file: Express.Multer.File) {
    if (!file) {
      throw new BadRequestException(`make sure this file is an image`);
    }
    return { fileName: file.originalname };
  }
}
