import { HttpErrorResponse } from '@angular/common/http';
import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { FileQuery, SearchMode } from '../../filequery';
import { Tag, SupabaseService } from '../../supabase.service';

@Component({
  selector: 'app-searchinput',
  templateUrl: './searchinput.component.html',
  styleUrls: ['./searchinput.component.sass']
})
export class SearchinputComponent implements OnInit {

  @Input() query = new FileQuery([], [], "all", "all", true);

  @Output() queryChanged = new EventEmitter<FileQuery>();

  allTags: Tag[] | undefined = undefined;
  tagsErr: string | undefined = undefined;

  constructor(private supaService: SupabaseService) { }

  ngOnInit(): void {
    this.supaService.listTags().then(tags => {
      if (tags.data != null) {
        this.allTags = tags.data as Tag[];
      }
      if (tags.error != null) {
        this.allTags = undefined;
        if (tags.error instanceof HttpErrorResponse) {
          this.tagsErr = tags.error.message;
        } else {
          this.tagsErr = tags.error.toString();
        }
      }
    });
  }

  emitQueryChange(includeTags: number[], excludeTags: number[], includeMode: SearchMode, excludeMode: SearchMode) {
    this.queryChanged.emit(new FileQuery(
      includeTags, excludeTags, includeMode, excludeMode, true
    ));
  }

  // Called when a tag is moved from one category to another
  tagAction(action: "include" | "exclude" | "neutral", tag?: number) {
    if (tag == undefined) {
      return;
    }
    const newInclude = new Set<number>();
    const newExclude = new Set<number>();
    switch (action) {
      case "include":
        newInclude.add(tag);
        this.query.includeTags.forEach(t => newInclude.add(t));

        this.query.excludeTags.filter(t => t !== tag).forEach(t => newExclude.add(t));
        break;
      case "exclude":
        newExclude.add(tag);
        this.query.excludeTags.forEach(t => newExclude.add(t));

        this.query.includeTags.filter(t => t !== tag).forEach(t => newInclude.add(t));
        break;
      case "neutral":
        // Remove from both included and excluded
        this.query.excludeTags.filter(t => t !== tag).forEach(t => newExclude.add(t));
        this.query.includeTags.filter(t => t !== tag).forEach(t => newInclude.add(t));
        break;
    }

    this.queryChanged.emit(new FileQuery(
      Array.from(newInclude),
      Array.from(newExclude),
      this.query.includeMode,
      this.query.excludeMode,
      true
    ));
  }
}
