import { Injectable } from '@angular/core';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { Question, QuestionWithOptions, SupabaseService, TaggedFileEntry } from '../supabase.service';

const imageParam = "image";
const selectedTagsParam = "selectedTags";
const orderingIDParam = "orderingID";
const avoidFileParam = "avoidFile";

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

  private async getNewLocalParams(fileID: number): Promise<{ currentFile: TaggedFileEntry, selectedTags: number[], questions: QuestionWithOptions[]; }> {
    // Get file and questions from the database
    const { data: filedata, error: fileerr } = await this.supaService.getFileByID(fileID);
    if (fileerr) {
      throw fileerr;
    }
    const currentFile = filedata as TaggedFileEntry;
    // Default selected tags to the tags on the file: the query params will overwrite this later if we have something else
    const selectedTags = currentFile.filetags.map(t => t.tagid);

    const { data: questiondata, error: questionerr } = await this.supaService.listQuestions();
    if (questionerr) {
      throw questionerr;
    }
    const questions = questiondata as QuestionWithOptions[];

    return { currentFile, selectedTags, questions };
  }

  // getNextQuestion will find the next question, and return it along with the completion percentage.
  // It will account for gaps in ordering ID, as well as questions that don't match the "required options"
  private getNextQuestion(questions: QuestionWithOptions[], orderingID: number, selectedTags?: number[]): { nextQuestion: QuestionWithOptions | null, completionPercentage: number; } {
    if (orderingID == undefined) {
      throw new Error("orderingID is undefined");
    }

    var currentOID = orderingID;
    while (true) {
      // Find the question with the next highest ordering ID
      const nextQuestionIndex = questions.findIndex(q => (q.orderingID ? q.orderingID : 0) >= currentOID);
      if (nextQuestionIndex == -1) {
        // We're done! No more questions
        return { nextQuestion: null, completionPercentage: 100 };
      }
      const nextQuestion: QuestionWithOptions = questions[nextQuestionIndex];

      // Check if this question meets our required tags
      if (selectedTags && nextQuestion.requiredOptions.length > 0) {
        // Check if any of the required tags are present in our selected tags
        const hasRequiredTags = nextQuestion.requiredOptions.some(rt => selectedTags.some(st => st == rt));
        if (!hasRequiredTags) {
          // We haven't selected any tags that would show this question, so skip it
          currentOID = nextQuestion.orderingID ? nextQuestion.orderingID + 1 : 0;
          continue;
        }
      }

      // We found the question with the next highest ordering ID (that also matches our required tags)
      return { nextQuestion, completionPercentage: (nextQuestionIndex / questions.length) * 100 };
    }
  }

  public onQueryParamChange(queryParams: Params) {
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

    const { nextQuestion, completionPercentage } = this.getNextQuestion(this._questions, this._orderingID, this._selectedTags);
    if (completionPercentage == 100 || (nextQuestion ? nextQuestion.orderingID : 0) == this._orderingID) {
      // Our ordering ID matches! This is our current question
      this._currentQuestion = nextQuestion;
      this._completionPercentage = completionPercentage;
      return;
    }

    // Navigate if not equal, we're on an ID between questions
    // TODO: can we remove the '/tag' part and replace with an empty array?
    this.router.navigate([`/tag`], { queryParamsHandling: 'merge', queryParams: { [orderingIDParam]: nextQuestion ? nextQuestion.orderingID : 0, [imageParam]: this._currentFileID } });
  }

  // Call when navigating to a new file
  public async establishFile(fileID: number, orderingID: number = 0): Promise<void> {
    this.wipeVars();

    this._currentFileID = fileID;
    this._orderingID = orderingID;

    const { currentFile, selectedTags, questions } = await this.getNewLocalParams(fileID);
    this._currentFile = currentFile;
    this._selectedTags = selectedTags;
    this._questions = questions;

    if (this._querySubscription) {
      this._querySubscription.unsubscribe();
    }
    // Once the query parameters have loaded (we can probably shorten this further),
    // see if we're between questions and move up if we need to
    this._querySubscription = this.route.queryParams.subscribe(this.onQueryParamChange.bind(this)); // TODO: test w/out "bind"
  }

  public async nextQuestion(): Promise<void> {
    if (!this._questions || !this._currentFileID || (this._orderingID == undefined)) {
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
    if (!this._questions || (this._orderingID == undefined)) {
      // Questions haven't loaded yet, don't do anything
      return;
    }

    const allLowerQuestions = this._questions.filter(q => this._orderingID && q.orderingID && q.orderingID < this._orderingID);
    this._orderingID = allLowerQuestions.length > 0 ? allLowerQuestions[allLowerQuestions.length - 1].orderingID : 0;

    this.renavigate();
  }

  public nextFile() {
    const lastFileID = this._currentFileID;
    this.wipeVars();
    this.router.navigate(["/tag"], { queryParams: { [imageParam]: null, [orderingIDParam]: null, [selectedTagsParam]: null, [avoidFileParam]: lastFileID } });
  }

  public async deleteCurrentFile(): Promise<void> {
    if (!this._currentFileID) {
      return;
    }

    return this.supaService.deleteFile(this._currentFileID);
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
