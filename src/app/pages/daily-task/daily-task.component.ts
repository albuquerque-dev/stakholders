import { Component, HostListener, OnChanges, OnInit, SimpleChanges, ViewEncapsulation } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from 'src/app/services/auth.service';
import { StepsModule } from 'primeng/steps';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { IApiCoin } from '../home/home.component';
import { CalendarOptions } from '@fullcalendar/angular'; // useful for typechecking

@Component({
  selector: 'app-daily-task',
  templateUrl: './daily-task.component.html',
  styleUrls: ['./daily-task.component.css'],
})
export class DailyTaskComponent implements OnInit {

  presenceList: any[] = [];

  calendarOptions: CalendarOptions = {
    initialView: 'dayGridMonth',
    height: '100%',
    locale: 'pt-br',
    headerToolbar: {
      left: '',
      center: '',
      right: ''
    },
    buttonText: {
      today: 'Hoje',
      month: 'Mês',
      week: 'Semana',
      day: 'Hoje',
      list: 'Lista'
    },
    events: this.presenceList
  };

  items: MenuItem[] = [];
  tasks: any;
  twitterTasks: any;
  actualTask: any;
  tasksComplete: boolean = false;
  userWalletData: any;
  showLoading: any;
  tasksConcluidas: number = 0;
  navState: any;
  userInfo: any;
  taskInfo: any;
  userBalance = {
    BNB: 0,
    SH: 0
  };
  minimunBalance: number = 10000.000000000;
  taskPage: number = 0;
  userConfirmActionPartner: boolean = false;

  @HostListener('window:focus', ['$event'])
  onFocus(event: any): void {
    if (this.userConfirmActionPartner) {
      this.openConfirmationAction()
    }
  }

  constructor(private router: Router, private confirmationService: ConfirmationService, private authService: AuthService) {
    this.navState = router.getCurrentNavigation()?.extras.state;
  }

  async ngOnInit() {
    await this.setPageInfo();
    await this.getUserBalance();
    await this.getTaskInfo();
    // this.authService.getAccessToken();
    this.items = [
      { label: 'Helkin' },
      { label: 'X-MINE' },
      { label: 'VELOX' },
      { label: 'EVOCARDANO' },
      { label: 'HACKER SPACE' }
    ];
    this.tasksConcluidas = 0;
    let today = new Date();
    var lastDayOfMonth = new Date(today.getFullYear(), today.getMonth()+1, 0).getDate();
    console.log(lastDayOfMonth)
    for(let i = 0; i < lastDayOfMonth; i++){

    }
    let novaDataFim = new Date(new Date(today).setDate(new Date(today).getDate()));
  }

  async setPageInfo() {
    let tempData = localStorage.getItem('userDBData')
    if (tempData) {
      this.userInfo = JSON.parse(tempData)
    }
    await this.checkTasks();
  }

  async getUserBalance() {
    try {
      let userBalance = await this.authService.getAddressInfo(this.userInfo?.carteira)
      console.log('')
      if (userBalance && userBalance.length > 0) {
        this.userWalletData = userBalance;
        userBalance.find((d: any) => {
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

  validarTask(param: any) {
    this.tasks.find((d: any) => {
      if (d[param] != true) {
        d[param] = true
        this.checkTasks();
      } else {
        return;
      }
    })
  }

  async checkTasks() {
    if (this.userInfo && this.userInfo.taskLevel) {
      this.actualTask = this.userInfo.taskLevel;
    } else if (this.userInfo && !this.userInfo.taskLevel) {
      this.actualTask = 0;
    }
  }

  async getTaskInfo() {
    this.taskInfo = await this.authService.getTaskInfo(this.authService.userID).then(querySnapshot => {
      return querySnapshot.data()
    })
  }

  isTaskCompleted(param: any): any {
    if (this.taskInfo) {
      let lastActivity = this.taskInfo[param]?.actual.seconds
      let today = new Date().toLocaleDateString();
      lastActivity = new Date(lastActivity * 1000).toLocaleDateString();
      if (today === lastActivity) {
        return true
      } else {
        return false
      }
    }
  }

  checkTask(param: any) {
    window.alert('Atenção: Você será redirecionado para realizar as atividades no Telegram, Após realizar as tarefas, no Telegram, clique em Retorne ao Site para concluir.')
    // let tempUser: any;
    // let taskTemp: any;
    // tempUser = this.userInfo.uid
    // if (tempUser) {
    //   if (this.taskInfo && this.taskInfo[param]) {
    //     let actualTask = this.taskInfo[param].actual;
    //     let lastTask = this.taskInfo[param].last;
    //     if (lastTask) {
    //       lastTask.push(actualTask)
    //       taskTemp = { [param]: { "last": lastTask, "actual": new Date() } }
    //     } else {
    //       taskTemp = { [param]: { "last": [new Date()], "actual": new Date() } }
    //     }
    //   } else {
    //     // if (actualTask) {
    //     taskTemp = { [param]: { actual: new Date() } }
    //   }
    //   this.authService.addTaskInfo(tempUser, taskTemp)
    //   this.getTaskInfo();
    // }
  }

  openPartner(partner: string) {
    let messagePartner: string = '';
    let urlPartner: string = '';
    if (partner === 'coinmarketcap') {
      messagePartner = 'Acesse a pagina e adicione a Stakholders a sua Watchlist (☆), é necessário criar uma conta na plataforma.'
      urlPartner = 'https://coinmarketcap.com/pt-br/currencies/stakholders';
    }
    if (partner === 'coinsniper') {
      messagePartner = 'Acesse a pagina e adicione a Stakholders a sua Watchlist (☆), é necessário criar uma conta na plataforma.'
      urlPartner = 'https://coinsniper.net/coin/27218'
    }

    if (partner === 'coingecko') {
      messagePartner = 'Acesse a pagina e adicione a Stakholders a sua Watchlist (☆), é necessário criar uma conta na plataforma.'
      urlPartner = 'https://www.coingecko.com/pt/moedas/stakholders'
    }

    if (partner === 'coinscope') {
      messagePartner = 'Acesse a pagina e adicione a Stakholders a sua Watchlist (☆), é necessário criar uma conta na plataforma.'
      urlPartner = 'https://www.coinscope.co/coin/1-sh'
    }

    this.confirmationService.confirm({
      header: partner?.toUpperCase(),
      message: messagePartner,
      accept: () => {
        window.open(urlPartner, 'blank')
        this.userConfirmActionPartner = true;
      },
      reject: () => {
      }
    });
  }

  openConfirmationAction() {
    this.confirmationService.confirm({
      header: 'Confirma a Realização da Atividade?',
      message: 'Periodicamente realizamos auditoria interna, a fim de identificar atividades de usuários, avisamos que o reconhecimento da não conclusão da atividade implicará em banimento e perda dos investimentos.',
      accept: () => {
        this.userConfirmActionPartner = false;
      },
      reject: () => {
      }
    });
  }

}
