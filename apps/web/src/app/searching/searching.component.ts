import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { distinctUntilChanged, filter, fromEvent, map } from 'rxjs';
import { APIUtilityService } from '../apiutility.service';
import { SupabaseService } from '../supabase.service';
import { QueryManagerService } from './querymanager.service';

@Component({
  selector: 'app-searching',
  templateUrl: './searching.component.html',
  styleUrls: ['./searching.component.sass']
})
export class SearchingComponent implements OnInit {
  viewerInfoOpen: boolean = false;

  constructor(public router: Router, public queryManager: QueryManagerService, public apiUtility: APIUtilityService, public supaService: SupabaseService) { }

  get currentFileTags(): number[] | undefined {
    return this.queryManager.viewingFile?.filetags.map((t: any) => t.tagid);
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
  }
}
