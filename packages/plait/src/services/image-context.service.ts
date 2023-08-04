import { Injectable } from '@angular/core';
import { ImageEntry } from '../interfaces';

@Injectable()
export class PlaitContextService {
    private uploadingFiles: ImageEntry[] = [];

    getUploadingFile(url: string) {
        return this.uploadingFiles.find(file => file.url === url);
    }

    setUploadingFile(file: ImageEntry) {
        return this.uploadingFiles.push(file);
    }

    removeUploadingFile(fileEntry: ImageEntry) {
        this.uploadingFiles = this.uploadingFiles.filter(file => file.url !== fileEntry.url);
    }
}
