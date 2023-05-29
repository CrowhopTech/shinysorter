import { HttpClientModule } from '@angular/common/http';
import { TestBed } from '@angular/core/testing';
import { Router, RouterModule } from '@angular/router';
import { RouterTestingModule } from '@angular/router/testing';

import { QueryManagerService, excludeModeParam, excludeTagsParam, getNumberArrayParam, getSearchModeParam, includeModeParam, includeTagsParam, viewingFileParam } from './querymanager.service';
import { AppConfig, TOKEN } from '../app.service';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { FileQuery, SearchMode } from '../filequery';
import { SupabaseService } from '../supabase.service';

// Tests for the getNumberArrayParam function
describe('getNumberArrayParam', () => {
  it('should return an empty array if the parameter is undefined', () => {
    const params = {};
    const param = "asdf";
    const result = getNumberArrayParam(params, param);
    expect(result).toEqual([]);
  });

  it('should return an empty array if the parameter is empty', () => {
    const params = { asdf: "" };
    const param = "asdf";
    const result = getNumberArrayParam(params, param);
    expect(result).toEqual([]);
  });

  it('should return an empty array if the parameter is whitespace', () => {
    const params = { asdf: "  " };
    const param = "asdf";
    const result = getNumberArrayParam(params, param);
    expect(result).toEqual([]);
  });

  it('should return an empty array if the parameter is whitespace with commas', () => {
    const params = { asdf: "  , , " };
    const param = "asdf";
    const result = getNumberArrayParam(params, param);
    expect(result).toEqual([]);
  });

  it('should return an array of numbers if the parameter is a single number', () => {
    const params = { asdf: "123" };
    const param = "asdf";
    const result = getNumberArrayParam(params, param);
    expect(result).toEqual([123]);
  });

  it('should return an array of numbers if the parameter is a single number with whitespace', () => {
    const params = { asdf: " 123 " };
    const param = "asdf";
    const result = getNumberArrayParam(params, param);
    expect(result).toEqual([123]);
  });

  it('should return an array of numbers if the parameter is a single number with whitespace and commas', () => {
    const params = { asdf: " 123, , " };
    const param = "asdf";
    const result = getNumberArrayParam(params, param);
    expect(result).toEqual([123]);
  });

  it('should return an array of numbers if the parameter is a single number with whitespace and commas', () => {
    const params = { asdf: " 123, , " };
    const param = "asdf";
    const result = getNumberArrayParam(params, param);
    expect(result).toEqual([123]);
  });

  it('should return an array of numbers if the parameter is multiple numbers with whitepsace and commas', () => {
    const params = { asdf: " 123, , 456, 789 " };
    const param = "asdf";
    const result = getNumberArrayParam(params, param);
    expect(result).toEqual([123, 456, 789]);
  });

  it('should throw an error if an invalid value is provided', () => {
    const params = { asdf: "  lmao " };
    const param = "asdf";
    expect(() => getNumberArrayParam(params, param)).toThrowError(SyntaxError);
  });
});

// Tests for the getSearchModeParam function
// Test:
// * Whitespace
// * Undefined
// * Invalid values
// * Valid values
// * Valid values with whitespace
describe('getSearchModeParam', () => {
  it('should return the default if the parameter is undefined', () => {
    const params = {};
    const param = "asdf";
    const def = "all";
    const result = getSearchModeParam(params, param, def);
    expect(result).toEqual(def);
  });

  it('should return the default if the parameter is empty', () => {
    const params = { asdf: "" };
    const param = "asdf";
    const def = "any";
    const result = getSearchModeParam(params, param, def);
    expect(result).toEqual(def);
  });

  it('should return the default if the parameter is whitespace', () => {
    const params = { asdf: "  " };
    const param = "asdf";
    const def = "all";
    const result = getSearchModeParam(params, param, def);
    expect(result).toEqual(def);
  });

  it('should return "all" if the parameter is "all" with whitespace', () => {
    const params = { asdf: "  all " };
    const param = "asdf";
    const def = "any";
    const result = getSearchModeParam(params, param, def);
    expect(result).toEqual("all");
  });

  it('should return "any" if the parameter is "any" with whitespace', () => {
    const params = { asdf: "  any " };
    const param = "asdf";
    const def = "all";
    const result = getSearchModeParam(params, param, def);
    expect(result).toEqual("any");
  });

  it('should throw an error if an invalid value is provided', () => {
    const params = { asdf: "  lmao " };
    const param = "asdf";
    const def = "all";
    expect(() => getSearchModeParam(params, param, def)).toThrowError(SyntaxError);
  });
});

describe('QueryManagerService', () => {
  let service: QueryManagerService;
  let router: Router;
  let supaClient: SupabaseService;
  let appConfig = new AppConfig();
  appConfig.supabaseAddress = "http://localhost:8080";
  appConfig.supabaseKey = "asdfasdf";
  appConfig.queryServerAddress = "http://localhost:8081";

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientModule,
        RouterTestingModule,
        RouterModule,
        MatSnackBarModule
      ],
      providers: [
        { provide: TOKEN, useValue: appConfig }
      ]
    });
    service = TestBed.inject(QueryManagerService);
    router = TestBed.inject(Router);
    supaClient = TestBed.inject(SupabaseService);
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  it('should go to the correct URL when going to a random new file', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    service.nextRandomFile();
    expect(navigateSpy).toHaveBeenCalledWith([]);
  });

  it('should do nothing when going to an undefined file ID', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    service.viewFile(undefined);
    expect(navigateSpy).not.toHaveBeenCalled();
  });

  it('should navigate to the proper location when viewing a file', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    service.viewFile(1234);
    expect(navigateSpy).toHaveBeenCalledWith([], {
      queryParamsHandling: 'merge',
      queryParams: {
        [viewingFileParam]: "1234",
      }
    });
  });

  it('should navigate to the proper location when closing a file viewer', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    service.viewClose();
    expect(navigateSpy).toHaveBeenCalledWith([], {
      queryParamsHandling: 'merge',
      queryParams: {
        [viewingFileParam]: null,
      }
    });
  });

  it('should navigate to the proper location when given a file query', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');
    service.navigateToQuery(new FileQuery([1, 2], [3], "all", "any", true));
    expect(navigateSpy).toHaveBeenCalledWith([], {
      queryParams: {
        [includeTagsParam]: "1,2",
        [excludeTagsParam]: "3",
        [includeModeParam]: "all",
        [excludeModeParam]: "any",
      }
    });
  });

  it('should have the proper calculations for going forward and backward through images', () => {
    const navigateSpy = jest.spyOn(router, 'navigate');

    service.navigateToQuery(new FileQuery([1, 2], [3], "all", "any", true));
    expect(navigateSpy).toHaveBeenCalledWith([], {
      queryParams: {
        [includeTagsParam]: "1,2",
        [excludeTagsParam]: "3",
        [includeModeParam]: "all",
        [excludeModeParam]: "any",
      }
    });
  });
});
