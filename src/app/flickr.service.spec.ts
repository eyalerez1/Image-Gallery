import { TestBed } from '@angular/core/testing';

import { FlickrService } from './flickr.service';
import {HttpClientModule} from '@angular/common/http';

describe('FlickrService', () => {
  beforeEach(() => TestBed.configureTestingModule({
    imports: [HttpClientModule]
  }));

  it('should be created', () => {
    const service: FlickrService = TestBed.get(FlickrService);
    expect(service).toBeTruthy();
  });
});
