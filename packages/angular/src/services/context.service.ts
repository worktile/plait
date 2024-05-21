import { Injectable } from '@angular/core';
import { ImageEntry } from '@plait/core';
import { Subject } from 'rxjs';

@Injectable()
export class PlaitContextService {
    private _stable = new Subject();

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

    onStable() {
        return this._stable.asObservable();
    }

    nextStable() {
        this._stable.next('');
    }
}
