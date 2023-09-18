import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { distinctUntilChanged, filter, fromEvent, map, startWith } from 'rxjs';
import { APIUtilityService } from '../apiutility.service';
import { SupabaseService, TaggedFileEntry } from '../supabase.service';
import { QueryManagerService } from './querymanager.service';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ConfirmationDialogComponent } from '../confirmationdialog.component';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
@Component({
  selector: 'app-searching',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.sass']
})
export class SearchingComponent implements OnInit {
  viewerInfoOpen: boolean = false;
  windowIsSmall: boolean = false;
  sidebarToggled: boolean = false;

  constructor(public router: Router, public queryManager: QueryManagerService, public apiUtility: APIUtilityService, public supaService: SupabaseService, public dialog: MatDialog, public snackbar: MatSnackBar, private breakpointObserver: BreakpointObserver) { }

  get currentFileTags(): number[] | undefined {
    return this.queryManager.viewingFile?.filetags.map((t: any) => t.tagid);
  }

  get sidebarVisible(): boolean {
    return this.windowIsSmall ? this.sidebarToggled : true;
  }

  async ngOnInit(): Promise<void> {
    // Handler for escape to exit the image viewer
    fromEvent(document, 'keydown').
      pipe(
        filter(_ => this.queryManager.viewingFileID != -1), // Only when image viewer is open
        map((e: Event) => e as KeyboardEvent),
        filter((e: KeyboardEvent) => e.type === "keydown"),
        distinctUntilChanged(),
        filter((e: KeyboardEvent) => e.key == "Escape")).
      subscribe((_: KeyboardEvent) => {
        this.queryManager.viewClose();
      });
    await Promise.all([
      this.queryManager.ngOnInit(),
      this.apiUtility.updateTagCache()
    ]);
    this.breakpointObserver.observe([Breakpoints.HandsetPortrait, Breakpoints.TabletPortrait]).subscribe(result => this.windowIsSmall = result.matches);
  }

  deleteClick() {
    // Show confirmation first: if confirmed, then actually do the delete
    const dialogRef = this.dialog.open(ConfirmationDialogComponent, {
      data: {
        title: "Delete File",
        message: "Are you sure you want to delete this file? Once you do, it's gone forever!"
      }
    });
    dialogRef.afterClosed().subscribe(async (result: boolean) => {
      if (result) {
        try {
          // await this.questionManager.deleteCurrentFile();
          // this.questionManager.nextFile();
          await this.queryManager.deleteCurrentViewingFile();
          this.queryManager.viewClose();
          this.snackbar.open("File deleted successfully", undefined, { duration: 7500 });
        } catch (error: any) {
          this.snackbar.open(`Failed to delete file: ${error.toString()}`, undefined, { duration: 7500 });
        }
      }
    });
  }

  fileTrackFunc(_: number, item: TaggedFileEntry) {
    return item.id;
  }

  onImageViewerSwipeEnd($event: any) {
    if ($event.direction == 'y') {
      return;
    }

    if ($event.distance > 0) {
      // Swiping right
      if (this.queryManager.viewCanGoBack()) {
        this.queryManager.viewLastFile();
      }
    }
    else {
      // Swiping left
      if (this.queryManager.viewCanGoForward()) {
        this.queryManager.viewNextFile();
      }
    }
  }
}
