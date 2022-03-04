import { ChangeDetectorRef, Component, OnChanges, OnInit, SimpleChanges, ViewChild } from '@angular/core';
import { InputNumberModule } from 'primeng/inputnumber';
import { MenuItem } from 'primeng/api';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../services/auth.service';

@Component({
  selector: 'app-converter',
  templateUrl: './converter.component.html',
  styleUrls: ['./converter.component.css']
})
export class ConverterComponent implements OnInit {


  entry!: number;
  converted: number = 0;
  cotacaoValores: any;
  output!: any;


  constructor(private cd: ChangeDetectorRef, private http: HttpClient, private authService: AuthService) {
  }

  async ngOnInit() {
    this.cotacaoValores = await this.authService.getCotation()
    this.getCotationPrices(this.cotacaoValores.data)
  }


  convertCurrency() {
    this.output = this.converted * this.entry;
  }

  getCotationPrices(values: any) {
    if (values) {
      this.entry = values.amount;
      this.converted = values.quote[0]?.price;
      this.output = this.converted * this.entry;
    }
  }

}
