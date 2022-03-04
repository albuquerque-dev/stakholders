import { AfterViewInit, Component, ElementRef, EventEmitter, OnInit, Output, Renderer2, ViewChild } from '@angular/core';
import { Firestore, collectionData, collection } from '@angular/fire/firestore';
import { Router, ActivatedRoute } from "@angular/router";
import { percentage } from 'rxfire/storage';
import { Observable, Subscription } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { AuthService } from 'src/app/services/auth.service';
import { Table } from 'primeng/table';
import { PrimeNGConfig } from 'primeng/api';
import { NavController } from '@ionic/angular';

declare const TradingView: any;

@Component({
  selector: 'app-dashboard',
  // template: `<script src="https://widget.nomics.com/embed.js"></script>`,
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.css']
})
export class DashboardComponent implements OnInit, AfterViewInit {

  showLoading: boolean = false;
  data: any;
  prevendaReport: any;
  userInfo: any;
  userBalance: ICoins = {};
  startedEmbed = 1;
  userWalletData: any;
  navState: any;
  coinStats: any;
  dataToGraph: any;

  public loadScript() {
    let body = <HTMLDivElement>document.body;
    let scriptData = document.createElement('script');
    scriptData.innerHTML = '';
    scriptData.src = '../assets/currency.js';
    scriptData.async = true;
    scriptData.defer = true;
    body.appendChild(scriptData);
  }

  public embedScript() {
    let body = <HTMLDivElement>document.body;
    let scriptTrading = document.createElement('script');
    scriptTrading.innerHTML = '';
    scriptTrading.src = '../assets/tv.js';
    body.appendChild(scriptTrading);
  }

  public embedSettings() {
    let body = <HTMLDivElement>document.body;
    let embedConfig = this._renderer2.createElement('script');
    embedConfig.type = `text/javascript`;
    embedConfig.text = `
    let TradingView =
    new TradingView.widget(
      {
        "autosize": true,
        "symbol": "BNB/USDT",
        "interval": "240",
        "timezone": "Etc/UTC",
        "theme": "dark",
        "style": "1",
        "locale": "br",
        "toolbar_bg": "#f1f3f6",
        "enable_publishing": false,
        "hide_top_toolbar": true,
        "hide_legend": false,
        "withdateranges": true,
        "save_image": false,
        "container_id": "bnbChart"
      })`;
    body.appendChild(embedConfig);
  }

  constructor(private _renderer2: Renderer2, private router: Router, private act: ActivatedRoute, private authService: AuthService) {
    this.navState = router.getCurrentNavigation()?.extras.state;
  };

  async ngOnInit() {
    this.showLoading = true;
    await this.getCoinStats();
    await this.setPageInfo();
    await this.getUserBalance();
    // this.subscription = this.authService.paymentComplete$.subscribe((personalInformation) => {
    //   this.messageService.add({ severity: 'success', summary: 'Order submitted', detail: 'Dear, ' + personalInformation.firstname + ' ' + personalInformation.lastname + ' your order completed.' });
    // });
    // await this.authService.getAccessToken()
    // this.embedScript();
    this.loadScript();
    // this.embedScript();
    this.dataToGraph = {
      labels: ['1H(%)', '24H(%)', '7D(%)'],
      options: {
        plugins: {
          legend: {
            labels: {
              color: '#e2e3e3'
            }
          }
        }
      },
      datasets: [
        {
          data: [
            this.coinStats.data[17031]?.quote[2781]?.percent_change_1h,
            this.coinStats.data[17031]?.quote[2781]?.percent_change_24h,
            this.coinStats.data[17031]?.quote[2781]?.percent_change_7d
          ],
          backgroundColor: [
            "#f3ba2f",
            "#000000",
            "#2a9fd6"
          ],
          hoverBackgroundColor: [
            "#f3ba2f",
            "#000000",
            "#2a9fd6"
          ]
        }]
    };
  }

  ngAfterViewInit() {
    setTimeout(function () {
      new TradingView.widget(
        {
          "autosize": true,
          "symbol": "BNB/USDT",
          "interval": "240",
          "timezone": "Etc/UTC",
          "theme": "dark",
          "style": "1",
          "locale": "br",
          "toolbar_bg": "#f1f3f6",
          "enable_publishing": false,
          "hide_top_toolbar": false,
          "hide_legend": false,
          "withdateranges": true,
          "save_image": false,
          "container_id": "bnbChart"
        })
    }, 1000)
  }

  async setPageInfo() {
    this.userInfo = await this.authService.getUserInfo(this.authService.userID).then(querySnapshot => {
      return querySnapshot.data()
    })
    console.log(this.userInfo)
  }

  async getCoinStats() {
    try {
      this.coinStats = await this.authService.coinMarketCapStats();
    } catch (error) {
      console.error(error);
    }
  }

  async getUserBalance() {
    try {
      let userBalance = await this.authService.getAddressInfo(this.userInfo?.carteira)
      console.log('')
      if (userBalance && userBalance.length > 0) {
        this.userWalletData = userBalance;
        userBalance.find((d: IApiCoin) => {
          if (d.contract_address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            if (+d.balance > 0) {
              d.balance = (parseFloat(d.balance) / 1000000000).toString();
              this.userBalance.BNB = d;
            }
          }
          if (d.contract_address === '0x0ae2c8280ccc6a765991eecc87f8d569b5d53e52') {
            if (+d.balance > 0) {
              d.balance = (parseFloat(d.balance) / 1000000000).toString();
              this.userBalance.SH = d;
            }
          }
        })
      }
    } catch (error: any) {
      console.error(error);
    } finally {
      this.showLoading = false;
    }
  }

}
export interface ICoins {
  BNB?: IApiCoin;
  SH?: IApiCoin;
}
export interface IApiCoin {
  balance: string;
  balance_24h?: any;
  contract_address: string;
  contract_decimals?: number;
  contract_name: string;
  contract_ticker_symbol?: string;
  last_transferred_at?: string;
  logo_url?: string;
  nft_data?: any;
  quote?: number;
  quote_24h?: any
  quote_rate?: number
  quote_rate_24h?: number
  supports_erc?: any
  type?: string;
}
