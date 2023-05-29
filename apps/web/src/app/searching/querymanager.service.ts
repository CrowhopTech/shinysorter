import { HttpErrorResponse } from '@angular/common/http';
import { EventEmitter, Injectable, Output } from '@angular/core';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { Subscription } from 'rxjs';
import { SearchMode, FileQuery } from '../filequery';
import { SupabaseService, TaggedFileEntry } from '../supabase.service';

export const includeTagsParam = "includeTags";
export const excludeTagsParam = "excludeTags";
export const includeModeParam = "includeMode";
export const excludeModeParam = "excludeMode";
export const viewingFileParam = "view";

export const pageSize = 3;

export function getNumberArrayParam(params: Params, param: string): number[] {
  const val: string = params[param];
  if (!val) {
    return [];
  }

  const split = val.split(",");
  const parsed = split.map(s => s.trim()).filter(s => s.length > 0).map(s => parseInt(s));
  if (parsed.some(n => Number.isNaN(n))) {
    throw new SyntaxError("Invalid number in parameter");
  }
  return parsed;
}

export function getSearchModeParam(params: Params, param: string, def: SearchMode): SearchMode {
  const val: string = params[param]?.trim();
  if (!val || val.length == 0) {
    return def;
  }

  switch (val.trim()) {
    case "any":
      return "any";
    case "all":
      return "all";
    default:
      throw new SyntaxError(`${param} should be 'all' or 'any', got '${val}'`);
  }
}

@Injectable({
  providedIn: 'root'
})
export class QueryManagerService {
  @Output() paramsChanged = new EventEmitter<undefined>();
  @Output() searchResultReady = new EventEmitter<undefined>();

  private _query: FileQuery;
  private _viewingFileID: number;
  private _viewingFile: TaggedFileEntry | undefined;

  private _searchResult: TaggedFileEntry[] | undefined = undefined;
  private _searchSubscription: Subscription | null = null;
  private _searchError?: string;
  private _resultsCount?: number;
  private _noMoreResults: boolean = false;

  public get query(): FileQuery {
    return this._query;
  }

  public get viewingFileID(): number {
    return this._viewingFileID;
  }

  public get viewingFile(): TaggedFileEntry | undefined {
    return this._viewingFile;
  }

  public get searchResult(): TaggedFileEntry[] | undefined {
    return this._searchResult;
  }

  public get searchError(): string | undefined {
    return this._searchError;
  }

  public get noMoreResults(): boolean {
    return this._noMoreResults;
  }

  public get resultsCount(): number | undefined {
    return this._resultsCount;
  }

  public navigateToQuery(query: FileQuery) {
    this.router.navigate([], {
      queryParams: query.searchPageParams(includeTagsParam, includeModeParam, excludeTagsParam, excludeModeParam)
    });
  }

  public viewClose() {
    this.router.navigate([], {
      queryParamsHandling: 'merge',
      queryParams: {
        [viewingFileParam]: null
      }
    });
  }

  public viewFile(fileID?: number) {
    if (!fileID) {
      return;
    }
    this.router.navigate([], {
      queryParamsHandling: 'merge',
      queryParams: {
        [viewingFileParam]: fileID.toString()
      }
    });
  }

  public nextRandomFile() {
    this.router.navigate([]);
  }

  public getMoreResults() {
    if (this.searchRequestInFlight()) {
      return;
    }
    if (!this._searchResult || this._searchResult.length == 0 || this._searchError != undefined) {
      return;
    }

    this.listFileCall(this._searchResult[this._searchResult.length - 1].id, true);
  }

  public viewCanGoBack(): boolean {
    if (!this._searchResult) {
      return false;
    }
    // Index = -1, not found. Index = 0, first one. All else can go back.
    return this._searchResult.findIndex(f => f.id == this._viewingFileID) > 0;
  }

  public viewCanGoForward(): boolean {
    if (!this._searchResult) {
      return false;
    }
    const idx = this._searchResult.findIndex(f => f.id == this._viewingFileID);
    if (idx == -1) {
      return false;
    }
    // If we're at the end of our current files, and we already tried to get more
    // then we really can't go forward. Otherwise, let us try.
    return idx != this._searchResult.length - 1 || !this._noMoreResults;
  }

  public viewNextFile() {
    // Get index of current file
    if (!this._searchResult) {
      return;
    }
    const idx = this._searchResult.findIndex(f => f.id == this._viewingFileID);
    if (idx == -1) {
      return;
    }
    if (idx == this._searchResult.length - 1) {
      this.getMoreResults();
    }
    const nextFile = this._searchResult[Math.min(this._searchResult.length - 1, idx + 1)];
    if (nextFile == undefined) {
      return;
    }
    this.viewFile(nextFile.id);
  }

  public viewLastFile() {
    // Get index of current file
    if (!this._searchResult) {
      return;
    }
    const idx = this._searchResult.findIndex(f => f.id == this._viewingFileID);
    if (idx <= 0) {
      return;
    }
    const lastFileID = this._searchResult[Math.max(0, idx - 1)].id;
    this.viewFile(lastFileID);
  }

  public searchRequestInFlight() {
    return this._searchSubscription && !this._searchSubscription.closed;
  }

  public async listFileCall(cont?: number, append: boolean = false): Promise<void> {
    if (!append) {
      this._searchResult = undefined;
      this._noMoreResults = false;
      this._resultsCount = undefined;
    }
    this._searchError = undefined;
    const { data, error } = await this.supaService.listFiles(this.query.includeTags, this.query.includeMode, this.query.excludeTags, this.query.excludeMode, true, pageSize, cont);
    if (error) {
      this._searchResult = [];
      if (error instanceof HttpErrorResponse) {
        this._searchError = error.message;
      } else {
        this._searchError = error.toString();
      }
      this.searchResultReady.error(this._searchError);
      return;
    }
    if (!data) {
      return;
    }
    const files = data;

    if (!cont || (cont && cont == 0)) {
      // Page zero, let's get the overall count
      const { count, error } = await this.supaService.countFiles(this.query.includeTags, this.query.includeMode, this.query.excludeTags, this.query.excludeMode, true, pageSize, cont);
      if (error) {
        throw error;
      }
      if (count > -1) {
        this._resultsCount = count;
      }
    }

    if (append) {
      if (files.length == 0) {
        this._noMoreResults = true;
      }
      files.forEach(f => this._searchResult?.push(f));
    } else {
      this._searchResult = files;
    }
    this._searchError = undefined;
    this.searchResultReady.emit();
  }

  constructor(private router: Router, private route: ActivatedRoute, private supaService: SupabaseService, private snackbar: MatSnackBar) {
    this._query = new FileQuery([], [], "all", "all", true);
    this._viewingFileID = -1;
    this._viewingFile = undefined;
  }

  async ngOnInit(): Promise<void> {
    this.route.queryParams.subscribe(async (params) => {
      const newQuery = new FileQuery([], [], "all", "all", true);
      newQuery.includeTags = getNumberArrayParam(params, includeTagsParam);
      newQuery.excludeTags = getNumberArrayParam(params, excludeTagsParam);
      newQuery.includeMode = getSearchModeParam(params, includeModeParam, "all");
      newQuery.excludeMode = getSearchModeParam(params, excludeModeParam, "all");
      newQuery.hasBeenTagged = true;

      let viewingFile: number = params[viewingFileParam];

      if (!newQuery.equals(this._query) || viewingFile != this._viewingFileID) {
        this.paramsChanged.emit();
      }
      this._query = newQuery;
      this._viewingFileID = viewingFile ? viewingFile : -1;
      if (this._viewingFileID != -1) {
        let file = await this.supaService.getFileByID(this.viewingFileID);
        if (file.data) {
          this._viewingFile = file.data as TaggedFileEntry;
        }
      }
      this.listFileCall();
    });

  }
}
