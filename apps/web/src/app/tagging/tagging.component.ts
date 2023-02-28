import { HttpErrorResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { APIUtilityService } from '../apiutility.service';
import { QuestionManagerService } from './questionmanager.service';

@Component({
  selector: 'app-tagging',
  templateUrl: './tagging.component.html',
  styleUrls: ['./tagging.component.sass']
})
export class TaggingComponent implements OnInit {
  noMoreFiles: boolean = false;
  navigateError: string | undefined = undefined;

  queryParamSub: Subscription | undefined = undefined;

  constructor(public router: Router, private route: ActivatedRoute, public apiUtility: APIUtilityService, public questionManager: QuestionManagerService) { }

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

  skipImage() {
    // TODO: fix this better so we don't have a chance to redirect to the same image again
    //       Maybe add a "not" flag, so we go to any image except that one?

    // TODO: I think this is broken cuz we need to add the specific "no params" thing
    this.router.navigate(["/tag"]);
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

      // Handle if we need to pick a new image
      const { file: untaggedFile, error } = await this.apiUtility.getRandomUntaggedFile();
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
  }
}
