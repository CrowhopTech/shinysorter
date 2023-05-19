import { Component, Inject, OnInit } from '@angular/core';
import { MatDialog, MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSnackBar } from '@angular/material/snack-bar';
import { QuestionOptionCreate, QuestionPatch, QuestionPatchWithOptions, QuestionWithOptions, SupabaseService, Tag } from '../../supabase.service';
import { QuestionEditDialogComponent } from './question-edit-dialog/question-edit-dialog.component';

@Component({
  selector: 'app-question-settings',
  templateUrl: './question-settings.component.html',
  styleUrls: ['./question-settings.component.sass']
})
export class QuestionSettingsComponent implements OnInit {

  public questions?: QuestionWithOptions[];
  public allUnusedTags?: Map<number, Tag>;
  public get unusedTagIDs(): number[] | undefined {
    if (this.allUnusedTags == undefined) {
      return undefined;
    }
    const ids: number[] = [];
    this.allUnusedTags.forEach(t => ids.push(t.id));
    return ids;
  }

  private _fetchError?: Error = undefined;
  public get fetchError(): Error | undefined {
    return this._fetchError;
  }

  constructor(private supaService: SupabaseService, private snackbar: MatSnackBar, private dialog: MatDialog) { }

  ngOnInit(): void {
    this.refreshQuestions();
  }

  async refreshQuestions() {
    const { data: tagData, error: tagError } = await this.supaService.listTags();
    if (tagError) {
      this._fetchError = new Error(`Failed to fetch tags: ${tagError}`);
      return;
    }
    const tags = tagData as Tag[];

    const { data: questionData, error: questionError } = await this.supaService.listQuestions();
    if (questionError) {
      this._fetchError = new Error(`Failed to fetch questions: ${questionError}`);
      return;
    }
    this.questions = questionData as QuestionWithOptions[];

    // Need to extract this to a local variable because "this" is different inside of a forEach closure
    const unusedTags = new Map<number, Tag>();
    tags.forEach(tag => {
      unusedTags.set(tag.id, tag);
    });
    this.questions.forEach(q => q.questionoptions.forEach((to: any) => {
      if (to.tagid) unusedTags.delete(to.tagid);
    }));
    this.allUnusedTags = unusedTags;
  }

  openCreateDialog() {
    this.dialog.open(QuestionEditDialogComponent, {
      data: {
        question: {
          id: -1,
          orderingID: -1,
          questionText: "",
          mutuallyExclusive: false,
          questionoptions: [],
          description: null,
        } as QuestionWithOptions

      }
    }).afterClosed().subscribe(async (result?: { question: QuestionPatchWithOptions, options: QuestionOptionCreate[]; }) => {
      if (result) {
        var newOrderingID;
        if (result.question.orderingID != undefined && result.question.orderingID >= 0) {
          newOrderingID = result.question.orderingID;
        } else if (this.questions && this.questions.length > 0) {
          newOrderingID = this.questions[this.questions.length - 1].orderingID + 1;
        } else {
          newOrderingID = 0;
        }
        const error = await this.supaService.createQuestion({
          questionText: result.question.questionText ? result.question.questionText : "",
          orderingID: newOrderingID,
          mutuallyExclusive: result.question.mutuallyExclusive,
        }, result.options);
        if (error) {
          this.snackbar.open(`Failed to create question: ${error.message}`, undefined, { duration: 7500 });
          this.refreshQuestions();
          return;
        }
        this.refreshQuestions();
        this.snackbar.open("Question created successfully", undefined, {
          duration: 3000
        });
      }
    });
  }

  async updateQuestion(id: number, $event: QuestionPatch, options?: QuestionOptionCreate[]) {
    const patch = $event as QuestionPatch;
    const error = await this.supaService.patchQuestion(id, patch, options);
    if (error) {
      this.snackbar.open(`Failed to update question: ${error.message}`, undefined, { duration: 7500 });
      this.refreshQuestions();
      return;
    }
    this.refreshQuestions();
    this.snackbar.open("Question updated successfully", undefined, {
      duration: 3000
    });
  }

  async deleteQuestion(id: number) {
    const error = await this.supaService.deleteQuestion(id);
    if (error) {
      this.snackbar.open(`Failed to delete question: ${error.message}`, undefined, { duration: 7500 });
      this.refreshQuestions();
      return;
    }
    this.refreshQuestions();
    this.snackbar.open("Question deleted successfully", undefined, {
      duration: 3000
    });
  }

  async reorderQuestions(newOrder: number[]) {
    const error = await this.supaService.reorderQuestions(newOrder);
    if (error) {
      this.snackbar.open(`Failed to reorder questions: ${error.message}`, undefined, { duration: 7500 });
      this.refreshQuestions();
      return;
    }
    this.refreshQuestions();
    this.snackbar.open("Question reordered successfully", undefined, {
      duration: 3000
    });
  }
}

@Component({
  selector: 'app-question-delete-dialog',
  templateUrl: './question-delete-dialog.component.html',
  styleUrls: ['./question-delete-dialog.component.sass']
})
export class QuestionDeleteDialogComponent implements OnInit {

  constructor(public dialogRef: MatDialogRef<QuestionDeleteDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { questionText: string; }) { }

  ngOnInit(): void {
  }

}

@Component({
  selector: 'app-question-reorder-dialog',
  templateUrl: './question-reorder-dialog.component.html',
  styleUrls: ['./question-reorder-dialog.component.sass']
})
export class QuestionReorderDialogComponent implements OnInit {
  questions?: QuestionWithOptions[];
  questionsBackup?: QuestionWithOptions[]; // Keep a backup, it's easier to copy this and move around our entry
  questionErr?: string;

  newOrder?: number[] = undefined;

  selectedQuestionIndex: number = -1;

  constructor(public dialogRef: MatDialogRef<QuestionReorderDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { reorderQuestion: QuestionWithOptions; }, private supaService: SupabaseService) { }

  async ngOnInit(): Promise<void> {
    const { data, error } = await this.supaService.listQuestions();
    if (error) {
      this.questionErr = error.toString();
    } else {
      this.questions = data as QuestionWithOptions[];
      this.questionsBackup = data as QuestionWithOptions[];
      // Find index of given question, selected question is the one before that
      const indexOfOurQuestion = this.questions.findIndex(q => q.id == this.data.reorderQuestion.id);
      if (indexOfOurQuestion == 0) {
        this.selectedQuestionIndex = -1;
      } else {
        const questionBeforeOurs = this.questions[indexOfOurQuestion - 1];
        this.selectedQuestionIndex = questionBeforeOurs.id;
      }
    }
  }

  questionPrecursorChanged($event: MatSelectChange) {
    // Start building a new list in a loop
    // If the question we're on matches the one we're going after, also add the moving question
    let newOrder: QuestionWithOptions[] = [];
    if ($event.value == -1) {
      newOrder.push(this.data.reorderQuestion); // Move this question to be first
    }
    this.questionsBackup?.forEach(q => {
      if (q.id == this.data.reorderQuestion.id) {
        return;
      }

      newOrder.push(q);
      if (q.id == $event.value) {
        newOrder.push(this.data.reorderQuestion);
      }
    });

    this.questions = newOrder;
  }

}