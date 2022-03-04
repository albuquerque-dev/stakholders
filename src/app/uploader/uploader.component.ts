import { Component, OnInit } from '@angular/core';
import { FileUploadModel } from 'src/app/models/file-upload';
import { FileUploadService } from './file-upload.service';

@Component({
  selector: 'app-uploader',
  templateUrl: './uploader.component.html',
  styleUrls: ['./uploader.component.css']
})
export class UploaderComponent implements OnInit {

  selectedFiles?: FileList;
  currentFileUpload?: FileUploadModel;
  percentage = 0;
  uploadedFiles: any[] = [];

  constructor(private uploadService: FileUploadService) { }

  ngOnInit(): void {
  }

  selectFile(event: any): void {
    this.selectedFiles = event.target.files;
  }
}

