import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {map, take} from 'rxjs/operators';
import {Observable} from 'rxjs';

interface PhotosSearchResponse {
  photos: PhotosPage;
  stat: string;
}

interface PhotosPage {
  page: number;
  pages: number;
  perpage: number;
  total: string;
  photo: Photo[];
}

interface Photo {
  farm: number;
  id: string;
  isfamily: number;
  isfriend: number;
  ispublic: number;
  owner: string;
  secret: string;
  server: string;
  title: string;
}

export interface SearchResult {
  photos: MinimalPhoto[];
  numOfPages: number;
}

export interface MinimalPhoto {
  title: string;
  url: string;
}

const baseUrl = 'https://api.flickr.com/services/rest/?method=flickr.photos.search';
const staticParams = '&safe_search=1&format=json&nojsoncallback=1&content_type=1&is_getty=1';
const apiKey = '&api_key=bac9f1ccfd854f27894fd47c4f01b1e8';

@Injectable({
  providedIn: 'root'
})
export class FlickrService {

  constructor(private httpClient: HttpClient) {
  }

  search(query: string, operation: string, pageNumer: number): Observable<SearchResult> {
    const tagMode = operation === 'or' ? 'any' : 'all';
    return this.httpClient.get(`${baseUrl}${staticParams}${apiKey}&tags=${query}&tag_mode=${tagMode}&page=${pageNumer}`)
      .pipe(
        take(1),
        (map((photosSearchResponse: PhotosSearchResponse) => {
        if (photosSearchResponse.stat === 'ok') {
          return {
            numOfPages: photosSearchResponse.photos.pages,
            photos: photosSearchResponse.photos.photo.map((photo) => {
              return {
                url: `https://farm${photo.farm}.staticflickr.com/${photo.server}/${photo.id}_${photo.secret}.jpg`,
                title: photo.title,
              };
            })
          };
        }
      })));
  }
}
