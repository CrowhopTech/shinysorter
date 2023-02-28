import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Question, QuestionWithOptions, SupabaseService, TaggedFileEntry } from '../supabase.service';

const imageParam = "image";
const selectedTagsParam = "selectedTags";
const orderingIDParam = "orderingID";

// Responsible for:
// * Managing which question we're on (query params, navigating to next question, etc.)
// * Managing which tags we have selected
// * Giving us info about available/unavailable tags on a given question
@Injectable({
  providedIn: 'root'
})
export class QuestionManagerService {
  private _querySubscription?: Subscription = undefined;

  private _currentFileID?: number = undefined;
  public get currentFileID() { return this._currentFileID; }
  private _currentFile?: TaggedFileEntry = undefined;
  public get currentFile() { return this._currentFile; }

  private _selectedTags: number[] = [];
  public get selectedTags() { return this._selectedTags; }

  private _completionPercentage: number = 0;
  public get completionPercentage() { return this._completionPercentage; }

  private _fetchErr?: string;
  public get fetchErr() { return this._fetchErr; }

  private _questions?: QuestionWithOptions[] = undefined;
  private _orderingID?: number = undefined;
  private _currentQuestion: QuestionWithOptions | null | undefined = undefined; // undefined means hasn't loaded yet, null means we're done (no more questions), Question means current question
  public get currentQuestion() { return this._currentQuestion; }

  constructor(private router: Router, private route: ActivatedRoute, private supaService: SupabaseService) {
  }

  private getNumberArrayParam(params: Params, param: string): number[] {
    const val: string = params[param];
    if (!val) {
      return [];
    }

    const split = val.split(",");
    const parsed = split.map(s => parseInt(s));
    return parsed;
  }

  private renavigate() {
    this.router.navigate([],
      {
        queryParamsHandling: 'merge',
        queryParams: {
          [orderingIDParam]: this._orderingID,
          [selectedTagsParam]: this._selectedTags.join(","),
        }
      }
    );
  }

  private wipeVars() {
    // Clear any stale data from past file
    this._currentFileID = undefined;
    this._currentFile = undefined;
    this._selectedTags = [];
    this._questions = undefined;
    this._currentQuestion = undefined;
    this._orderingID = 0;

    this._fetchErr = undefined;
  }

  // Call when navigating to a new file
  public async establishFile(fileID: number, orderingID: number = 0): Promise<void> {
    this.wipeVars();

    this._currentFileID = fileID;
    this._orderingID = orderingID;

    // Get file and questions from the database
    const { data: filedata, error: fileerr } = await this.supaService.getFileByID(this._currentFileID);
    if (fileerr) {
      throw fileerr;
    }
    this._currentFile = filedata as TaggedFileEntry;
    // Default selected tags to the tags on the file: the query params will overwrite this later if we have something else
    this._selectedTags = this._currentFile.filetags.map(t => t.tagid);

    const { data: questiondata, error: questionerr } = await this.supaService.listQuestions();
    if (questionerr) {
      throw questionerr;
    }
    this._questions = questiondata as QuestionWithOptions[];

    if (this._querySubscription) {
      this._querySubscription.unsubscribe();
    }
    // Once the query parameters have loaded (we can probably shorten this further),
    // see if we're between questions and move up if we need to
    this._querySubscription = this.route.queryParams.subscribe(queryParams => {
      if (!this._questions) {
        console.error("this._questions is undefined");
        return;
      }

      this._selectedTags = this.getNumberArrayParam(queryParams, selectedTagsParam);

      const oid: number = queryParams[orderingIDParam];
      if (oid) {
        this._orderingID = oid;
      } else {
        this._orderingID = 0; // This marks that query params have loaded, and that there was no ordering ID
      }

      // Find next highest ordering ID
      const nextQuestionIndex = this._questions.findIndex(q => this._orderingID != undefined && (q.orderingID ? q.orderingID : 0) >= this._orderingID);
      const nextQuestion = nextQuestionIndex >= 0 ? this._questions[nextQuestionIndex] : undefined;
      if (nextQuestion === undefined) {
        // We're done! No more questions
        this._currentQuestion = null;
        this._completionPercentage = 100;
        return;
      }
      if ((nextQuestion.orderingID ? nextQuestion.orderingID : 0) == this._orderingID) {
        // Our ordering ID matches! This is our current question
        this._currentQuestion = nextQuestion;
        this._completionPercentage = (nextQuestionIndex / this._questions.length) * 100;
        return;
      }

      // Navigate if not equal, we're on an ID between questions
      this.router.navigate([`/tag`], { queryParamsHandling: 'merge', queryParams: { [orderingIDParam]: nextQuestion.orderingID, [imageParam]: this._currentFileID } });
    });
  }

  public async nextQuestion(): Promise<void> {
    if (!this._questions || !this._currentFileID || !this._orderingID) {
      return;
    }

    const lastQuestion = this._questions[this._questions.length - 1];

    if (lastQuestion.orderingID && this._orderingID > lastQuestion.orderingID) {
      // If we're past the end, let's save this file
      // TODO: gracefully handle errors on tagging!
      const error = await this.supaService.patchFile(this._currentFileID, {
        hasBeenTagged: true,
      }, this._selectedTags);
      if (error) {
        throw error;
      }
      this.nextFile();
      return;
    }

    this._orderingID++;
    this._orderingID = lastQuestion.orderingID ? Math.min(lastQuestion.orderingID + 1, this._orderingID) : undefined; // 1 over is okay, denotes we're done

    this.renavigate();
  }

  public previousQuestion() {
    if (!this._questions || !this._orderingID) {
      // Questions haven't loaded yet, don't do anything
      return;
    }

    const allLowerQuestions = this._questions.filter(q => this._orderingID && q.orderingID && q.orderingID < this._orderingID);
    this._orderingID = allLowerQuestions.length > 0 ? allLowerQuestions[allLowerQuestions.length - 1].orderingID : 0;

    this.renavigate();
  }

  public nextFile() {
    this.wipeVars();
    this.wipeVars();
    this.router.navigate(["/tag"], { queryParams: { [imageParam]: null, [orderingIDParam]: null, [selectedTagsParam]: null } });
  }

  public addTag(tag: number) {
    if (!this._selectedTags.some(t => t == tag)) {
      this._selectedTags.push(tag);
    }
    this.renavigate();
  }

  public removeTag(tag: number) {
    const idx = this._selectedTags.indexOf(tag);
    if (idx == -1) {
      return;
    }
    this._selectedTags.splice(idx, 1);
    this.renavigate();
  }

  public unsubscribe() {
    this._querySubscription?.unsubscribe();
  }
}
