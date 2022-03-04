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
import { AngularFireAuth } from '@angular/fire/compat/auth';

declare const TradingView: any;

@Component({
  selector: 'app-home',
  // template: `<script src="https://widget.nomics.com/embed.js"></script>`,
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit, AfterViewInit {

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
  donutOptions: any;
  variationRate = {
    oneHour: 0,
    oneDay: 0,
    sevenDay: 0
  };
  minimunBalance: number = 10000.000000000;
  dataToRadarChart: any;
  radarChartOptions: any;
  contractsDatareport: any;
  hashtransactions: any;

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

  constructor(private _renderer2: Renderer2,
    private router: Router,
    private act: ActivatedRoute,
    private authService: AuthService,
    private angularFireAuth: AngularFireAuth,
    private navCtrl: NavController) {
    this.navState = router.getCurrentNavigation()?.extras.state;
  };

  async ngOnInit() {
    this.showLoading = true;
    // await this.getMinimunBalance();
    await this.getCoinStats();
    await this.setPageInfo();
    await this.getUserBalance();
    await this.getUserTransactions();

    let resultContract: any = await this.authService.getAllContractInfo();
    let transformContract = resultContract.docs.map((d: any) => ({ contract_id: d.id, ...d.data() }));
    this.contractsDatareport = transformContract;
    this.setDataToGraph();
    // this.subscription = this.authService.paymentComplete$.subscribe((personalInformation) => {
    //   this.messageService.add({ severity: 'success', summary: 'Order submitted', detail: 'Dear, ' + personalInformation.firstname + ' ' + personalInformation.lastname + ' your order completed.' });
    // });
    // await this.authService.getAccessToken()
    // this.embedScript();
    // this.loadScript();
    // this.embedScript();
  }

  async ngAfterViewInit() {
  }


  logoutUser() {
    localStorage.removeItem('userData');
    this.router.navigate(['login']);
  }

  async setPageInfo() {
    let tempData = localStorage.getItem('userDBData')
    if (tempData) {
      this.userInfo = JSON.parse(tempData)
    } else {
      if (!this.userInfo) {
        this.angularFireAuth.authState.subscribe(async (user: any) => {
          if (user && user.uid) {
            let result: any = await this.authService.getUserInfo(user.uid);
            let data = result?.data();
            if (data) {
              this.userInfo = data;
              let jsonString = JSON.stringify(data);
              if (jsonString) {
                localStorage.setItem('userDBData', jsonString);
              }
            }
          }
        })
      }
    }
  }


  // async getMinimunBalance() {
  //   try {
  //     this.minimunBalance = await this.authService.minimunBalance()
  //     console.log(this.minimunBalance)
  //   } catch (error) {

  //   }
  // }

  async getCoinStats() {
    try {
      this.coinStats = await this.authService.coinMarketCapStats();
      this.variationRate.oneDay = this.coinStats.data[17031]?.quote[2781]?.percent_change_1h;
      this.variationRate.oneHour = this.coinStats.data[17031]?.quote[2781]?.percent_change_24h;
      this.variationRate.sevenDay = this.coinStats.data[17031]?.quote[2781]?.percent_change_7d;
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
    } catch (error) {
      console.error(error);
    }
  }

  async getUserTransactions() {
    let data = await this.authService.verifyHashTransaction(this.userInfo.carteira);
    this.hashtransactions = data.result;
  }

  async getUserBalance() {
    try {
      let userBalance = await this.authService.getAddressInfo(this.userInfo?.carteira)
      console.log('')
      if (userBalance && userBalance.length > 0) {
        this.userWalletData = userBalance;
        userBalance.find((d: IApiCoin) => {
          if (d.contract_address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            if (+d.balance >= 0) {
              d.balance = (parseFloat(d.balance) / 1000000000000000000).toString();
              this.userBalance.BNB = d;
            }
          }
          if (d.contract_address === '0x0ae2c8280ccc6a765991eecc87f8d569b5d53e52') {
            if (+d.balance >= 0) {
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

  setDataToGraph() {
    var quantidade30 = 0;
    var quantidade60 = 0;
    var quantidade90 = 0;
    var quantidade120 = 0;
    var quantidade150 = 0;
    var recebiveis30 = 0;
    var recebiveis60 = 0;
    var recebiveis90 = 0;
    var recebiveis120 = 0;
    var recebiveis150 = 0;
    var quantidadeTotal = 0;
    var recebiveisTotal = 0;
    this.contractsDatareport.map((d: any) => {
      if (d.modalidade === 'Stakholders' && d.status?.toLowerCase() === 'aprovado') {
        quantidadeTotal += +d.quantidade_compra_usuario || 0;
        recebiveisTotal += (+d.total_recebiveis_aluguel - +d.total_pelo_aluguel) || 0;
        if (d.periodo === 30) {
          quantidade30 += +d.quantidade_compra_usuario || 0;
          recebiveis30 += (+d.total_recebiveis_aluguel - +d.total_pelo_aluguel) || 0;
        }
        if (d.periodo === 60) {
          quantidade60 += +d.quantidade_compra_usuario || 0;
          recebiveis60 += (+d.total_recebiveis_aluguel - +d.total_pelo_aluguel) || 0;
        }
        if (d.periodo === 90) {
          quantidade90 += +d.quantidade_compra_usuario || 0;
          recebiveis90 += (+d.total_recebiveis_aluguel - +d.total_pelo_aluguel) || 0;
        }
        if (d.periodo === 120) {
          quantidade120 += +d.quantidade_compra_usuario || 0;
          recebiveis120 += (+d.total_recebiveis_aluguel - +d.total_pelo_aluguel) || 0;
        }
        if (d.periodo === 150) {
          quantidade150 += +d.quantidade_compra_usuario || 0;
          recebiveis150 += (+d.total_recebiveis_aluguel - +d.total_pelo_aluguel) || 0;
        }
      }
    })
    this.dataToRadarChart = [
      {
        periodo: '30 Dias',
        quantidade_compra_usuario: quantidade30,
        total_recebiveis_aluguel: recebiveis30
      }, {
        periodo: '60 Dias',
        quantidade_compra_usuario: quantidade60,
        total_recebiveis_aluguel: recebiveis60
      }, {
        periodo: '90 Dias',
        quantidade_compra_usuario: quantidade90,
        total_recebiveis_aluguel: recebiveis90
      }, {
        periodo: '120 Dias',
        quantidade_compra_usuario: quantidade120,
        total_recebiveis_aluguel: recebiveis120
      }, {
        periodo: '150 Dias',
        quantidade_compra_usuario: quantidade150,
        total_recebiveis_aluguel: recebiveis150
      }, {
        periodo: 'Total',
        quantidade_compra_usuario: quantidadeTotal,
        total_recebiveis_aluguel: recebiveisTotal
      }
    ]
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
