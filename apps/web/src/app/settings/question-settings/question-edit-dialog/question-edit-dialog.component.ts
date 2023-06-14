import { Component, EventEmitter, Inject, Input, OnInit, Output } from '@angular/core';
import { MatDialogRef, MAT_DIALOG_DATA } from '@angular/material/dialog';
import { MatSelectChange } from '@angular/material/select';
import { MatSlideToggleChange } from '@angular/material/slide-toggle';
import { APIUtilityService } from '../../../apiutility.service';
import { QuestionOptionCreate, QuestionPatch, QuestionWithOptions, SupabaseService, Tag } from '../../../supabase.service';

@Component({
  selector: 'app-question-edit-dialog',
  templateUrl: './question-edit-dialog.component.html',
  styleUrls: ['./question-edit-dialog.component.sass']
})
export class QuestionEditDialogComponent implements OnInit {
  public questionCopy: QuestionPatch;
  public questionOptionsCopy: QuestionOptionCreate[];
  public mutexString = "";
  public tags?: Tag[];
  public unusedTags?: number[];

  boolToStr = (b: boolean) => b ? 'true' : 'false';

  constructor(public dialogRef: MatDialogRef<QuestionEditDialogComponent>, @Inject(MAT_DIALOG_DATA) public data: { question: QuestionWithOptions, unusedTags: number[]; }, public apiUtility: APIUtilityService, private supaService: SupabaseService) {
    this.questionCopy = {
      id: data.question.id,
      orderingID: data.question.orderingID,
      questionText: data.question.questionText,
      mutuallyExclusive: data.question.mutuallyExclusive,
      description: data.question.description,
      requiredOptions: data.question.requiredOptions,
    };
    this.questionOptionsCopy = data.question.questionoptions;
    this.mutexString = data.question.mutuallyExclusive ? "Allow only one selection" : "Allow selecting multiple";
    this.unusedTags = data.unusedTags;
  }

  public get unusedTagIDs(): number[] | undefined {
    if (this.unusedTags == undefined) {
      return undefined;
    }
    // Remove any tags that are already in use in the UI but not yet persisted to the DB
    return this.unusedTags.filter(t => !this.questionOptionsCopy.map(to => to.tagid).includes(t));
  }

  public getTagByID(id: number): Tag | undefined {
    return this.tags?.find(t => t.id == id);
  }

  async ngOnInit(): Promise<void> {
    this.apiUtility.updateTagCache();
    const { data, error } = await this.supaService.listTags();
    if (error) {
      throw error;
    }
    this.tags = data as Tag[];
  };

  mutexChange($event: MatSlideToggleChange) {
    this.questionCopy.mutuallyExclusive = $event.checked;
    this.mutexString = $event.checked ? "Allow only one selection" : "Allow selecting multiple";
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

  removeTag(tagID: number) {
    if (!this.questionCopy || !this.questionOptionsCopy) {
      return;
    }

    const idx = this.questionOptionsCopy.findIndex(to => to.tagid == tagID);
    if (idx == -1) {
      return;
    }

    this.questionOptionsCopy.splice(idx, 1);
  }

  addOption() {
    if (!this.tags) {
      return;
    }

    // Find the lowest tag ID, just to give a consistent starting value
    const lowestTagID = this.tags.map(t => t.id).reduce((p, c) => Math.min(p, c));
    const lowestTagName = this.apiUtility.getTagName(lowestTagID);

    this.questionOptionsCopy.push({ tagid: lowestTagID, optiontext: lowestTagName ? lowestTagName : "", questionid: this.questionCopy.id });
  }
}

@Component({
  selector: 'app-tag-option-edit',
  templateUrl: './tag-option-edit.component.html',
  styleUrls: ['./tag-option-edit.component.sass']
})
/**
 * This is abstracted out to a separate class because it makes management of individual tag options a *lot* easier to reason about.
 * Renders a selector for which tag(s) goes to which options, and a text box for the text displayed
 */
export class TagOptionEditComponent implements OnInit {
  private _tagOption?: QuestionOptionCreate;
  @Input() set tagOption(to: QuestionOptionCreate | undefined) {
    this._tagOption = to;
    this._originalText = to ? to.optiontext : "";
    this._originalTag = to ? to.tagid : -1;
    this._originalDescription = to ? to.description : "";
  }
  get tagOption() {
    return this._tagOption;
  }

  @Input() unusedTagIDs?: number[];
  @Input() tags?: Tag[]; // Pass this in as an input so we don't have to fetch it n times

  public get unusedTags(): Tag[] | undefined {
    return this.tags?.filter(t => this.unusedTagIDs?.includes(t.id));
  }

  public get usedTags(): Tag[] | undefined {
    return this.tags?.filter(t => !this.unusedTagIDs?.includes(t.id));
  }

  private _originalText?: string | null = null;
  private _originalTag?: number | null = -1;
  private _originalDescription?: string | null = null;

  @Output() removeTag = new EventEmitter<number>();

  constructor() {
  }

  ngOnInit(): void {

  };

  optionTextChange($event: any) {
    if (!this.tagOption) {
      return;
    }

    this.tagOption.optiontext = $event.target.value;
  }

  optionDescriptionChange($event: any) {
    if (!this.tagOption) {
      return;
    }

    this.tagOption.description = $event.target.value;
  }

  resetOption() {
    if (!this.tagOption) { return; }

    this.tagOption.optiontext = this._originalText;
    this.tagOption.tagid = this._originalTag;
    this.tagOption.description = this._originalDescription;
  }

  tagChange($event: MatSelectChange) {
    if (!this.tagOption) {
      return;
    }

    this.tagOption.tagid = $event.value;
    this.tagOption.optiontext = this.tags?.find(t => t.id == $event.value)?.name;
  }
}