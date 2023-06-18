import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit } from '@angular/core';
import { Subject } from 'rxjs';
import { APIUtilityService } from '../apiutility.service';
import { SupabaseService, TaggedFileEntry } from '../supabase.service';

export type FileType = "image" | "video" | "unknown";

@Component({
  selector: 'app-fileviewer',
  templateUrl: './fileviewer.component.html',
  styleUrls: ['./fileviewer.component.sass']
})
export class FileviewerComponent implements OnInit {
  file: TaggedFileEntry | null = null;
  fileError: string | undefined = undefined;

  private _fileID: number = 0;
  imageNotFound: boolean = false;

  private _fileIDChanged: EventEmitter<number> = new EventEmitter<number>();

  @Input() set fileID(value: number) {
    this._fileID = value;
    this._fileIDChanged.next(value);
  }

  get fileID() {
    return this._fileID;
  }

  getFileType(): FileType {
    if (!this.file) {
      return "unknown";
    }
    const mimeType = this.file.mimeType;
    if (!mimeType) {
      return "unknown";
    }
    if (mimeType.startsWith("video")) {
      return "video";
    }
    if (mimeType.startsWith("image")) {
      return "image";
    }
    return "unknown";
  }

  constructor(public apiUtility: APIUtilityService, public supaService: SupabaseService) {
    const setFile = (f: TaggedFileEntry) => this.file = f;
    this._fileIDChanged.subscribe(async (value: number) => {
      const { data, error } = await this.supaService.getFileByID(value);
      if (error) {
        this.fileError = `${typeof error}: ${error.message}`;
        return;
      }
      if (data) {
        setFile(data);
      } else {
        this.imageNotFound = true;
      }
    });
  }

  ngOnInit(): void {
    this.apiUtility.updateTagCache();
  }
}
