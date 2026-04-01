import { ImageEntry } from './interfaces/element';

export class PlaitBoardContext {
    private uploadingFiles: ImageEntry[] = [];

    getUploadingFile(url: string) {
        return this.uploadingFiles.find((file) => file.url === url);
    }

    setUploadingFile(file: ImageEntry) {
        return this.uploadingFiles.push(file);
    }

    removeUploadingFile(fileEntry: ImageEntry) {
        this.uploadingFiles = this.uploadingFiles.filter((file) => file.url !== fileEntry.url);
    }
}
