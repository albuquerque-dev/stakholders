import { AbstractType, Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService, Message, PrimeNGConfig } from 'primeng/api';
import { FileUploadModel } from 'src/app/models/file-upload';
import { AuthService } from 'src/app/services/auth.service';
import { FileUploadService } from 'src/app/uploader/file-upload.service';

@Component({
  selector: 'app-shop',
  templateUrl: './shop.component.html',
  styleUrls: ['./shop.component.css']
})
export class ShopComponent implements OnInit {

  msgs: Message[] = [];
  selectedFiles?: FileList;
  currentFileUpload?: FileUploadModel;
  uploadedFiles: any[] = [];
  public compraPicpay: FormGroup;
  public compraPix: FormGroup;
  public walletTableConfirmation: FormGroup;
  selectedRowToDeleteId: any;
  insertWalletDelete: boolean = false;
  displayResponsive: boolean = false;
  position: string = '';
  userConfirmForm: boolean = false;
  tasks: any;
  showLoading: boolean = false;
  twitterTasks: any;
  actualTask: any;
  tasksComplete: boolean = false;
  tasksConcluidas: number = 0;
  navState: any;
  userInfo: any;
  taskInfo: any;
  userBalance = {
    BNB: 0,
    SH: 0
  };
  displayShopMehtod: boolean = false;
  amountPix: any;
  periodo30Dias: boolean = false;
  periodo60Dias: boolean = false;
  periodo90Dias: boolean = false;
  periodo120Dias: boolean = false;
  periodo150Dias: boolean = false;
  periodoText: string = '';
  periodoTitle: string = '';
  openedPeriodo: string = '';
  selectedPeriodo!: string;
  valueEntry?: number;
  cotacaoValoresSH: any;
  cotacaoValoresBNB: any;
  cotacaoValoresBRLBNB: any;
  cotacaoValoresBRL: any;
  convertedEntrySH: any;
  convertedEntryBNB: any;
  convertedEntryBRL: any;
  convertedEntryBNBBRL: any;
  outputEntryUsd: any;
  outputEntry: any;
  outputEntryBRL: any;
  bonusPercentSelected: number = 0;
  compensacaoStakholders: any;
  bonusPercentual: any;
  dataInicioContrato: Date;
  dataFimContrato: Date;
  dataClickedContract: number = 0;
  userApprovedRendaPassiva: boolean = false;
  shopMethod: string = ''
  openPeriodoAluguel: number = 0;
  selectedPeriodoAluguel: number = 0;
  displayContract: string = '';
  isUser18: boolean = false;
  userTempBalance: any;
  bnbUserBalance: any;
  closeContractModal: any = false;
  compraDataToDB: ICompraMoeda = {
    nome: '',
    email: '',
    telefone: '',
    carteira: '',
    uid: '',
    rendimento_usuario: 0,
    saldo_usuario_sh: 0,
    saldo_usuario_bnb: 0,
    modalidade: '',
    periodo: 0,
    data_incio: new Date,
    data_fim: new Date,
    data_compra: new Date,
    comprovante_filename: 0,
    status: ''
  }
  reportContractsData: any;

  constructor(private router: Router,
    private authService: AuthService,
    private confirmationService: ConfirmationService,
    private primengConfig: PrimeNGConfig,
    private uploadService: FileUploadService,
    public formBuilder: FormBuilder) {
    this.navState = router.getCurrentNavigation()?.extras.state;
    this.compraPicpay = this.formBuilder.group({
      hashTransacao: ['']
    })
    this.compraPix = this.formBuilder.group({
      hashTransacao: ['']
    })
    this.walletTableConfirmation = this.formBuilder.group({
      carteira: ['']
    })
    this.dataInicioContrato = new Date();
    this.dataFimContrato = new Date(new Date().setDate(this.dataInicioContrato.getDate() + 30));
  }

  async ngOnInit() {
    this.showLoading = true;
    this.primengConfig.ripple = true;
    await this.setPageInfo();
    // await this.getReportFromContracts();
    this.userTempBalance = await this.authService.stakHoldersBalance();
    this.bnbUserBalance = await this.authService.bnbBalance();
    this.cotacaoValoresSH = await this.authService.getCotationSHUSD()
    this.cotacaoValoresBRL = await this.authService.getCotationSHBRL()
    this.cotacaoValoresBNB = await this.authService.getCotationBNBUSD()
    this.cotacaoValoresBRLBNB = await this.authService.getCotationBNBBRL()
    this.getCotationPricesSH(this.cotacaoValoresSH.data)
    this.getCotationPricesBRL(this.cotacaoValoresBRL.data)
    this.getCotationPricesBNB(this.cotacaoValoresBNB.data)
    this.getCotationPricesBNBBRL(this.cotacaoValoresBRLBNB.data)
    this.showLoading = false;
  }

  async setPageInfo() {
    let tempData = localStorage.getItem('userDBData')
    if (tempData) {
      this.userInfo = JSON.parse(tempData)
    }
  }

  showShopModal() {
    this.displayShopMehtod = true;
  }

  // async getReportFromContracts() {
  //   let dbResult = await this.authService.getContractInfo();
  //   this.reportContractsData = dbResult.docs.map((d: any) => ({ id: d.id, ...d.data() }))
  //   console.log('')
  // }

  // confirmWalletTable(id: any) {
  //   this.insertWalletDelete = true;
  //   this.selectedRowToDeleteId = id;
  // }

  // async verifyConfirmationTable() {
  //   if (this.walletTableConfirmation.value.carteira && this.walletTableConfirmation.value.carteira === this.userInfo.carteira && this.selectedRowToDeleteId) {
  //     await this.deleteContractRow(this.selectedRowToDeleteId)
  //   } else {
  //     this.msgs = [{ severity: 'info', summary: 'Informação', detail: 'Carteira digitada não confere com a carteira do usuário' }];
  //   }
  // }

  // async deleteContractRow(id: any) {
  //   if (id) {
  //     this.confirmationService.confirm({
  //       message: 'Deseja confirmar o cancelamento do contrato?',
  //       accept: async () => {
  //         this.showLoading = true;
  //         await this.authService.deleteContractInfo(id);
  //         await this.getReportFromContracts();
  //         this.showLoading = false;
  //         this.insertWalletDelete = false;
  //         this.msgs = [{ severity: 'info', summary: 'Informação', detail: 'Contrato cancelado com sucesso.' }];
  //       }
  //     });
  //   }
  // }

  confirmPeriodo() {
    this.selectedPeriodoAluguel = this.openPeriodoAluguel;
    this.openPeriodoAluguel = 0;
  }

  convertCurrency(evt: any) {
    if (evt.value || +evt.value === 0) {
      this.valueEntry = +evt.value;
      if (this.shopMethod === 'ShPix' || this.shopMethod === 'ShPicpay') {
        if (this.convertedEntrySH) {
          this.outputEntry = this.valueEntry * this.convertedEntrySH;
          this.outputEntryBRL = this.valueEntry * this.convertedEntryBRL;
        }
      }
      if (this.shopMethod === 'BnbPix' || this.shopMethod === 'BnbPicpay') {
        if (this.convertedEntrySH) {
          this.outputEntry = this.valueEntry * this.convertedEntryBNB;
          this.outputEntryBRL = this.valueEntry * this.convertedEntryBNBBRL;
        }
      }
    }
  }


  clearFormData() {
    this.compraDataToDB = {
      nome: '',
      email: '',
      telefone: '',
      carteira: '',
      uid: '',
      rendimento_usuario: 0,
      quantidade_compra_usuario: 0,
      saldo_usuario_sh: 0,
      saldo_usuario_bnb: 0,
      modalidade: '',
      periodo: 0,
      hash: '',
      data_incio: new Date,
      data_fim: new Date,
      data_compra: new Date,
      comprovante_filename: 0,
      status: ''
    }
    this.outputEntry = 0;
    this.outputEntryBRL = 0;
    this.compraPicpay.reset();
    this.compraPix.reset();
    // window.location.reload();
  }

  getCotationPricesSH(values: any) {
    if (values) {
      this.convertedEntrySH = values.quote[0]?.price?.toFixed(6);
      if (this.convertedEntrySH) {
        this.convertedEntrySH = +this.convertedEntrySH
      } else {
        this.convertedEntrySH = 0;
      }
    }
  }

  getCotationPricesBRL(values: any) {
    if (values) {
      this.convertedEntryBRL = values.quote[0]?.price?.toFixed(6);
      if (this.convertedEntryBRL) {
        this.convertedEntryBRL = +this.convertedEntryBRL
      } else {
        this.convertedEntryBRL = 0;
      }
    }
  }

  getCotationPricesBNB(values: any) {
    if (values) {
      this.convertedEntryBNB = values.quote[0]?.price?.toFixed(2);
      if (this.convertedEntryBNB) {
        this.convertedEntryBNB = +this.convertedEntryBNB
      } else {
        this.convertedEntryBNB = 0;
      }
    }
  }
  getCotationPricesBNBBRL(values: any) {
    if (values) {
      this.convertedEntryBNBBRL = values.quote[0]?.price?.toFixed(2);
      if (this.convertedEntryBNB) {
        this.convertedEntryBNBBRL = +this.convertedEntryBNBBRL
      } else {
        this.convertedEntryBNBBRL = 0;
      }
    }
  }


  uploadComprovante(event: any) {
    for (let file of event.files) {
      this.uploadedFiles.push(file);
    }
  }

  async uploadFileToStorage(): Promise<void> {
    if (this.uploadedFiles) {
      const file: File | null = this.uploadedFiles[0];
      this.uploadedFiles = [];
      if (file) {
        this.currentFileUpload = new FileUploadModel(file);
        if (this.shopMethod && this.authService.userID && this.userInfo.carteira && this.selectedPeriodoAluguel && this.dataClickedContract) {
          this.uploadService.pushFileToStorage(this.currentFileUpload, `comprovantes/${this.shopMethod}/${this.authService.userID}/${this.userInfo.carteira}/${this.selectedPeriodoAluguel}/${this.dataClickedContract?.toString()}`);
        } else {
          window.alert('Erro ao processar o envio do comprovante, Por favor, entre em contato com o suporte.')
        }
      }
    }
  }

  prepareDataToSend() {
    if (this.shopMethod === 'Pix') {
      this.compraDataToDB = {
        nome: this.userInfo.nome,
        email: this.userInfo.email,
        telefone: this.userInfo.tel,
        carteira: this.userInfo.carteira,
        uid: this.userInfo.uid,
        rendimento_usuario: this.outputEntry,
        rendimento_usuario_usd: this.outputEntryUsd,
        quantidade_compra_usuario: this.valueEntry,
        saldo_usuario_sh: this.userTempBalance,
        saldo_usuario_bnb: this.bnbUserBalance,
        modalidade: this.shopMethod,
        periodo: this.selectedPeriodoAluguel,
        hash: this.compraPix.value.hashTransacao,
        data_incio: this.dataInicioContrato,
        data_fim: this.dataFimContrato,
        data_compra: new Date,
        comprovante_filename: this.dataClickedContract,
        status: 'pendente'
      }
    }
    if (this.shopMethod === 'Picpay') {
      this.compraDataToDB = {
        nome: this.userInfo.nome,
        email: this.userInfo.email,
        telefone: this.userInfo.tel,
        carteira: this.userInfo.carteira,
        uid: this.userInfo.uid,
        rendimento_usuario: this.outputEntry,
        quantidade_compra_usuario: this.valueEntry || 0,
        saldo_usuario_sh: this.userTempBalance || 0,
        saldo_usuario_bnb: this.bnbUserBalance || 0,
        modalidade: this.shopMethod,
        periodo: this.selectedPeriodoAluguel,
        hash: this.compraPicpay.value.hashTransacao,
        data_incio: this.dataInicioContrato,
        data_fim: this.dataFimContrato,
        data_compra: new Date,
        comprovante_filename: this.dataClickedContract,
        status: 'pendente'
      }
    }
  }

  async sendComprovanteInfo() {
    if (this.userInfo.uid && this.compraDataToDB) {
      this.authService.addComprovanteInfo(this.userInfo.uid, this.compraDataToDB)
    } else {
      window.alert('Erro ao processar o envio das informações, Por favor, entre em contato com o suporte.')
    }
  }

  async checkTasks() {
    if (this.userInfo && this.userInfo.taskLevel) {
      this.actualTask = this.userInfo.taskLevel;
    } else if (this.userInfo && !this.userInfo.taskLevel) {
      this.actualTask = 0;
    }
  }

  closeModal() {
    this.displayShopMehtod = false;
    this.openPeriodoAluguel = 0;
    this.selectedPeriodoAluguel = 0;
    this.outputEntry = 0;
  }

  async sendDataToDb(param: string) {
    let dateTime = new Date;
    this.dataClickedContract = dateTime.getTime();
    let uploadingFile = await this.uploadFileToStorage()
    this.uploadedFiles = [];
    this.prepareDataToSend()
    let sendingToDb = await this.sendComprovanteInfo()
  }

  sendPurchaseData(param: any) {
    this.confirmationService.confirm({
      message: 'Suas informações foram recebidas com sucesso e serão processadas em até 24hs. Após confirmado seu Status aparecerá <b>ativado</b>. Caso apresente alguma divergência será cancelado.',
      header: 'Confirmado',
      icon: 'pi pi-exclamation-triangle',
      accept: async () => {
        let send = await this.sendDataToDb('a');
        this.msgs = [{ severity: 'info', summary: 'Informação', detail: 'Suas informações foram recebidas com sucesso e serão processadas em até 24hs. Após confirmado seu Status aparecerá ativado. Caso apresente alguma divergência será cancelado.' }];
        this.displayShopMehtod = false;
        this.openPeriodoAluguel = 0;
        this.selectedPeriodoAluguel = 0;
        this.outputEntry = 0;
        this.clearFormData();
      },
      reject: () => {
        this.msgs = [{ severity: 'info', summary: 'Informação', detail: 'Contrato recusado.' }];
        this.displayShopMehtod = false;
        this.openPeriodoAluguel = 0;
        this.selectedPeriodoAluguel = 0;
        this.outputEntry = 0;
        this.clearFormData();
        // this.msgs = [{ severity: 'info', summary: 'Recusado', detail: 'Contrato cancelado' }];
      }
    });
  }

}

export interface ICompraMoeda {
  nome: string;
  email: string;
  telefone: string;
  carteira: string;
  uid: string;
  rendimento_usuario: number;
  rendimento_usuario_usd?: number;
  quantidade_compra_usuario?: number;
  saldo_usuario_sh: number;
  saldo_usuario_bnb: number;
  modalidade: string;
  periodo: number;
  hash?: string;
  data_incio: Date,
  data_fim: Date,
  data_compra: Date,
  comprovante_filename: number;
  status: string;
}
