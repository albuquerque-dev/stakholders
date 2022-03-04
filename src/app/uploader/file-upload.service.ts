import { Injectable } from '@angular/core';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AngularFireStorage } from '@angular/fire/compat/storage';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';
import { FileUploadModel } from '../models/file-upload';

@Injectable({
  providedIn: 'root'
})
export class FileUploadService {
  private basePath = '/uploads';

  constructor(private db: AngularFireDatabase, private storage: AngularFireStorage) { }


  pushFileToStorage(fileUpload: FileUploadModel, path: string, file_name?: any): Observable<number | undefined> {
    // const filePath = `${this.basePath}/${fileUpload.file.name}`;
    // let today = new Date()
    // let date = today.toISOString().split('T')[0]
    const filePath = path;
    const storageRef = this.storage.ref(filePath);
    const uploadTask = this.storage.upload(filePath, fileUpload.file);

    uploadTask.snapshotChanges().pipe(
      finalize(() => {
        storageRef.getDownloadURL().subscribe((downloadURL: any) => {
          let fileNameFormated = file_name + '.' + fileUpload?.file?.name?.split('.')[1]
          if (fileNameFormated) {
            fileUpload.url = downloadURL;
            fileUpload.name = fileNameFormated;
            this.saveFileData(fileUpload);
          } else {
            window.alert('Erro ao realizar envio do comprovante, Por favor, entre em contato com o suporte!')
          }
        });
      })
    ).subscribe();
    return uploadTask.percentageChanges();
  }

  private saveFileData(fileUpload: FileUploadModel): void {
    this.db.list(this.basePath).push(fileUpload);
  }

  getFiles(numberItems?: number): AngularFireList<FileUploadModel> {
    return this.db.list(this.basePath, ref =>
      ref)
      // .limitToLast(numberItems));
  }

  deleteFile(fileUpload: FileUploadModel): void {
    this.deleteFileDatabase(fileUpload.key)
      .then(() => {
        this.deleteFileStorage(fileUpload.name);
      })
      .catch(error => console.log(error));
  }

  private deleteFileDatabase(key: string): Promise<void> {
    return this.db.list(this.basePath).remove(key);
  }

  private deleteFileStorage(name: string): void {
    const storageRef = this.storage.ref(this.basePath);
    storageRef.child(name).delete();
  }
}
