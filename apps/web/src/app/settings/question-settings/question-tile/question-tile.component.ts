import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { APIUtilityService } from '../../../apiutility.service';
import { QuestionWithOptions, QuestionPatch, QuestionOptionCreate, QuestionPatchWithOptions } from '../../../supabase.service';
import { QuestionEditDialogComponent } from '../question-edit-dialog/question-edit-dialog.component';
import { QuestionDeleteDialogComponent, QuestionReorderDialogComponent } from '../question-settings.component';

@Component({
  selector: 'app-question-tile',
  templateUrl: './question-tile.component.html',
  styleUrls: ['./question-tile.component.sass']
})
export class QuestionTileComponent implements OnInit {

  @Input() question?: QuestionWithOptions;

  public get questionTagIDs(): number[] | undefined {
    if (this.question == undefined || this.question.questionoptions == null) {
      return undefined;
    }
    return this.question.questionoptions.filter((to: any) => to.tagid != null).map((to: any) => to.tagid as number);
  }

  @Output() updateQuestion = new EventEmitter<{ question: QuestionPatch, options?: QuestionOptionCreate[]; }>();
  @Output() deleteQuestion = new EventEmitter<number>();
  @Output() reorderQuestions = new EventEmitter<number[]>();

  constructor(public apiUtility: APIUtilityService, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.apiUtility.updateTagCache();
  }

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

  editQuestion() {
    if (!this.question) {
      return;
    }

    this.dialog.open(QuestionEditDialogComponent, {
      data: {
        question: this.question
      }
    }).afterClosed().subscribe((result?: { question: QuestionPatchWithOptions, options?: QuestionOptionCreate[]; }) => {
      if (result && this.question) {
        this.updateQuestion.emit(result);
      }
    });
  }

  showDeleteDialog() {
    if (!this.question) {
      return;
    }

    this.dialog.open(QuestionDeleteDialogComponent, {
      data: {
        questionText: this.question.questionText
      }
    }).afterClosed().subscribe((result: boolean) => {
      if (result && this.question) {
        this.deleteQuestion.emit(this.question.id);
      }
    });
  }

  showReorderDialog() {
    this.dialog.open(QuestionReorderDialogComponent, {
      data: {
        reorderQuestion: this.question
      }
    }).afterClosed().subscribe((result?: QuestionWithOptions[]) => {
      if (!result) {
        return;
      }

      const newOrder = result.map(q => q.id);

      this.reorderQuestions.emit(newOrder);
    });
  }
}
