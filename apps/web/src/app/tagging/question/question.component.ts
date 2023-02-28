import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { MatCheckboxChange } from '@angular/material/checkbox';
import { MatRadioChange } from '@angular/material/radio';
import { QuestionWithOptions } from '../../supabase.service';

@Component({
  selector: 'app-question',
  templateUrl: './question.component.html',
  styleUrls: ['./question.component.sass']
})
export class QuestionComponent implements OnInit {
  // undefined means hasn't loaded yet, null means we're done (no more questions), Question means current question
  @Input() question: QuestionWithOptions | null | undefined = undefined;
  @Input() selectedTags: number[] = [];

  lastRadioSelection: number | undefined = undefined;

  @Output() tagAdded = new EventEmitter<number>();
  @Output() tagRemoved = new EventEmitter<number>();

  constructor() { }

  tagIsSelected(tagID: number | null): boolean {
    if (tagID == null) return false;
    return this.selectedTags.some(t => t == tagID);
  }

  isTagChecked(tagID: number | null): boolean {
    if (!this.question || tagID == null) {
      return false;
    }

    if (tagID == -1 && this.question.questionoptions) {
      // Check that none of the tag options in the question are in our selected list
      // O(N^2) but small data size
      return this.question.questionoptions.every((to: any) => !this.tagIsSelected(to.tagid));
    }

    return this.tagIsSelected(tagID);
  }

  radioChanged(event: MatRadioChange): void {
    this.question?.questionoptions.forEach((to: any) => {
      if (to.tagid == null) {
        return;
      }
      if (to.tagid == event.value) {
        // This is the tag option that we're adding: emit an added event
        this.tagAdded.emit(to.tagid);
        return;
      }
      if (this.selectedTags.some(t => t == to.tagid)) {
        // This is a tag option that was selected, but since this is a radio button it no longer will be
        // Emit a removed event
        this.tagRemoved.emit(to.tagid);
      }
      // This is a tag option that was not, and still is not selected: do nothing
    });
    if (this.lastRadioSelection) {
      this.tagRemoved.emit(this.lastRadioSelection);
    }
    this.lastRadioSelection = event.value;
  }

  checkboxChanged(forCheckbox: number | null) {
    return (event: MatCheckboxChange): void => {
      if (forCheckbox == null) {
        return;
      }
      if (event.checked) {
        this.tagAdded.emit(forCheckbox);
      } else {
        this.tagRemoved.emit(forCheckbox);
      }
    };
  }

  ngOnInit(): void {
  }

}
