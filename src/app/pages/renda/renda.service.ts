import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class RendaService {

  constructor(
    private http: HttpClient,
  ) { }

  async getCotationBNBUSD(): Promise<any> {
    let result = await this.http.get('https://api.bscscan.com/api?module=stats&action=bnbprice&apikey=7YF5Z835K59ESTEMIT9T9WHVNUS2IPQXKP').toPromise()
    return result;
  }

}
