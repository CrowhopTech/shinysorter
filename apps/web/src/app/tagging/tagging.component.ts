import { HttpErrorResponse } from '@angular/common/http';
import { Component, ElementRef, OnInit, ViewChild } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription, fromEvent, startWith } from 'rxjs';
import { APIUtilityService } from '../apiutility.service';
import { QuestionManagerService } from './questionmanager.service';
import { MatDialog } from '@angular/material/dialog';
import { ConfirmationDialogComponent } from '../confirmationdialog.component';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SplitComponent } from 'angular-split';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';

@Component({
  selector: 'app-tagging',
  templateUrl: './tagging.component.html',
  styleUrls: ['./tagging.component.sass']
})
export class TaggingComponent implements OnInit {
  noMoreFiles: boolean = false;
  navigateError: string | undefined = undefined;

  queryParamSub: Subscription | undefined = undefined;

  windowIsSmall: boolean = false;
  @ViewChild("questionarea") questionArea: ElementRef<SplitComponent> | undefined;

  constructor(public router: Router, private route: ActivatedRoute, public apiUtility: APIUtilityService, public questionManager: QuestionManagerService, public dialog: MatDialog, public snackbar: MatSnackBar, private breakpointObserver: BreakpointObserver) { }

  pastelColorForText(text: string | undefined): string {
    if (!text) {
      return "";
    }
    const hash = text.split("").reduce((a, b) => {
      a = (a << 5) - a + b.charCodeAt(0);
      return a & a;
    }, 0);
    const pastelStrength = '93%';
    return `hsl(${hash % 360}, ${pastelStrength}, ${pastelStrength})`;
  }

  tagAdded(tag: number) {
    this.questionManager.addTag(tag);
  }

  tagRemoved(tag: number) {
    this.questionManager.removeTag(tag);
  }

  nextQuestion() {
    this.questionManager.nextQuestion();
  }

  prevQuestion() {
    this.questionManager.previousQuestion();
  }

  deleteFile() {
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
          await this.questionManager.deleteCurrentFile();
          this.questionManager.nextFile();
          this.snackbar.open("File deleted successfully", undefined, { duration: 7500 });
        } catch (error: any) {
          this.snackbar.open(`Failed to delete file: ${error.toString()}`, undefined, { duration: 7500 });
        }
      }
    });
  }

  toolbarNavigate(path: string) {
    this.unsubscribe();
    this.router.navigate([path]);
  }

  unsubscribe() {
    this.queryParamSub?.unsubscribe();
    this.questionManager.unsubscribe();
  }

  ngOnInit(): void {
    this.queryParamSub = this.route.queryParamMap.subscribe(async params => {
      const image = params.get("image");

      if (image != null && image != "") {
        // We have an image: handle it and get out!
        const imageID = parseInt(image);

        if (this.questionManager.currentFileID != imageID) {
          this.questionManager.establishFile(imageID);
        }
        return;
      }

      const avoidFileRaw = params.get("avoidFile");
      var avoidFile: number | undefined = undefined;
      if (avoidFileRaw != null && avoidFileRaw != "") {
        avoidFile = parseInt(avoidFileRaw);
      }

      // Handle if we need to pick a new image
      const { file: untaggedFile, error } = await this.apiUtility.getRandomUntaggedFile(avoidFile);
      if (error) {
        if (error instanceof HttpErrorResponse) {
          this.navigateError = error.message;
        } else {
          this.navigateError = error.toString();
        }
      }

      this.navigateError = undefined;
      if (untaggedFile === null) {
        this.noMoreFiles = true;
        return;
      }

      this.router.navigate(["/tag"], { queryParams: { "image": untaggedFile.id } });
    });
    this.breakpointObserver.observe([Breakpoints.HandsetPortrait]).subscribe(result => this.windowIsSmall = result.matches);
  };
}
