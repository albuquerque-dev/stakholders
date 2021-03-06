import { Injectable, Output } from '@angular/core';
import firebase from 'firebase/compat/app';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { AngularFireDatabase, AngularFireList } from '@angular/fire/compat/database';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { Auth, createUserWithEmailAndPassword, signInWithCustomToken } from '@angular/fire/auth';
import { Router, RouterModule, Routes } from '@angular/router';
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { TwitterAuthProvider } from "firebase/auth";
import { map, switchMap, take } from 'rxjs/operators';
import { from, Observable } from 'rxjs';
import { first, tap } from 'rxjs/operators';
import { async } from '@firebase/util';
import detectEthereumProvider from '@metamask/detect-provider';
import { IApiCoin } from '../pages/home/home.component';
import { getAnalytics, setUserProperties } from "firebase/analytics";
import { ConfirmationService } from 'primeng/api';

interface NonceResponse {
  nonce: string;
}
interface VerifyResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  providerTwitter: any = new TwitterAuthProvider();

  dbList?: AngularFireList<any>;
  items?: Observable<any[]>;
  vendasList: any;
  userData: any;
  jsonHolders: any;
  user$ = this.angularFireAuth.authState;
  userTempBalance: any;
  apiMinimunBalance: number = 10000.000000000;
  userInfo: any;

  constructor(private db: AngularFireDatabase,
    private angularFirestore: AngularFirestore,
    private angularFireAuth: AngularFireAuth,
    private router: Router,
    private auth: Auth,
    private http: HttpClient,
    private confirmationService: ConfirmationService) {
  }

  get balancesInformation(): any {
    if (this.userTempBalance && this.apiMinimunBalance) {
      return { 'usuario': this.userTempBalance, 'api': this.apiMinimunBalance }
    } else {
      return null
    }
  }

  get isLoggedIn(): any {
    return this.angularFireAuth?.user?.subscribe((user) => user ? true : false)
  }


  get userID() {
    let tempSession: any = localStorage.getItem('userData')
    if (tempSession) {
      tempSession = JSON.parse(tempSession)
      let UID = tempSession.uid
      if (UID) {
        return UID;
      }
    }
  }

  get userUid(): any {
    if (this.angularFireAuth?.user) {
      this.angularFireAuth?.user?.subscribe(
        (auth: any): any => {
          if (auth != null) {
            return auth.uid;
          }
        });
    }
    return ''
  }

  async minimunBalance(): Promise<number> {
    var minimunBalance: number = 0;
    let result = await this.http.get<any>('https://api.coinmarketcap.com/data-api/v3/tools/price-conversion?amount=0.1&convert_id=17031&id=1839').toPromise().then(
      (d) => {
        if (d.data) {
          minimunBalance = d?.data?.quote[0]?.price
        }
      }
    )
    return minimunBalance;
  }

  get userCarteira() {
    let tempSession: any = localStorage.getItem('userDBData')
    if (tempSession) {
      tempSession = JSON.parse(tempSession)
      let carteira = tempSession.carteira
      if (carteira) {
        return carteira;
      }
    }
  }

  async stakHoldersBalance(): Promise<any> {
    try {
      let tempUser: any = localStorage.getItem('userDBData')
      let tempObj = JSON.parse(tempUser);
      if (tempUser && tempObj && tempObj.carteira) {
        let userSHBalance = await this.getAddressInfo(tempObj.carteira)
        userSHBalance.find((d: any) => {
          if (d.contract_address === '0x0ae2c8280ccc6a765991eecc87f8d569b5d53e52') {
            this.userTempBalance = (d.balance / 1000000000);
          }
        })
      }
      return this.userTempBalance;
    } catch (error) {
      return 0;
    }
  }

  async bnbBalance(): Promise<any> {
    try {
      let tempUser: any = localStorage.getItem('userDBData')
      let tempObj = JSON.parse(tempUser);
      if (tempUser && tempObj && tempObj.carteira) {
        let userSHBalance = await this.getAddressInfo(tempObj.carteira)
        userSHBalance.find((d: any) => {
          if (d.contract_address === '0xeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeeee') {
            this.userTempBalance = (+d.balance / 1000000000000000000);
          }
        })
      }
      return this.userTempBalance;
    } catch (error) {
      return 0;
    }
  }

  async loginUser(user: userStakholders) {
    try {
      let userCredential = await this.angularFireAuth.signInWithEmailAndPassword(user.email, user.password);
      let userLocal = JSON.stringify(userCredential.user);
      localStorage.setItem('userData', userLocal)
      let querySnapshot = await this.getUserInfo(userCredential?.user?.uid);
      let data: any = querySnapshot?.data()
      await this.verifyUserInfo(data)
      // let dataJson = JSON.stringify(data)
      // localStorage.setItem('userDBData', dataJson);
      // let userLocal = JSON.stringify(userCredential.user);
      // localStorage.setItem('userData', userLocal)

      // let userSHBalance = await this.getAddressInfo(data.carteira)
      // userSHBalance.find(async (d: any): Promise<any> => {
      //   if (d.contract_address === '0x0ae2c8280ccc6a765991eecc87f8d569b5d53e52') {
      //     this.userTempBalance = (+d.balance / 1000000000);
      //   }
      // })
      // let userContract: any = await this.getContractInfo()
      // let compareBalance = (+this.userTempBalance >= +this.apiMinimunBalance || +this.userTempBalance >= 10000.000000000)
      // if (userContract?.empty == false || compareBalance) {
      //   this.addInfoToUser(data.uid, { 'canLogin': true })
      // }
      // let userCanLogin: boolean;
      // if (data?.carteira) {
      //   userCanLogin = await this.canUserLogin(data.carteira);
      // } else {
      //   window.alert('Carteira n??o localizada, favor contactar o suporte!')
      //   userCanLogin = false;
      // }
      // data.canLogin = userCanLogin;
      // let canLogin = JSON.stringify(data)
      // localStorage.setItem('userDBData', canLogin);
      // this.router.navigate(['home'])
    } catch (error: any) {
      this.addErrorInfo('login', { email: user.email, mensagem: error.message })
      if (error.code) {
        let errorCode = error.code;
        let errorMessage = this.VerifyErroCode(errorCode);
        if (errorMessage == null) {
          errorMessage = error.message;
        }
        this.confirmationService.confirm({
          message: errorMessage,
          header: 'Mensagem de Erro',
          rejectVisible: false,
          icon: 'pi pi-exclamation-triangle',
          accept: async () => {
          }
        })
      }
    }
  }

  async verifyUserInfo(session: any) {
    let dataJson = JSON.stringify(session)
    localStorage.setItem('userDBData', dataJson);
    this.router.navigate(['/home'])

    // let userSHBalance = await this.getShTokenBalance(session.carteira);
    // let userContract: any;
    // let compareBalance: any;
    // if (userSHBalance) {
    //   userSHBalance ? userSHBalance = userSHBalance / 1000000000 : ''
    //   userSHBalance ? this.userTempBalance = userSHBalance : '';
    //   userContract = await this.getContractInfo()
    //   compareBalance = (+this.userTempBalance >= +this.apiMinimunBalance || +this.userTempBalance >= 10000.000000000)
    // }
    // if (userContract?.empty == false || compareBalance) {
    //   this.addInfoToUser(session.uid, { 'canLogin': true })
    //   session.canLogin = true;
    //   this.router.navigate(['/home'])
    // }
  }

  async canUserLogin(carteira: string): Promise<any> {
    let loginState: boolean = false;
    let minimunBalance: number = 0;
    // this.apiMinimunBalance = await this.minimunBalance();
    // let tempUser: any = localStorage.getItem('userDBData')
    if (carteira && this.apiMinimunBalance) {
      // let userInfo = JSON.parse(tempUser)
      let userSHBalance = await this.getAddressInfo(carteira)
      userSHBalance.find(async (d: any): Promise<any> => {
        if (d.contract_address === '0x0ae2c8280ccc6a765991eecc87f8d569b5d53e52') {
          this.userTempBalance = (+d.balance / 1000000000);
        } else {
          this.userTempBalance = 1;
        }
      })
      let userContract: any = await this.getContractInfo()
      let compareBalance = (+this.userTempBalance >= +this.apiMinimunBalance || +this.userTempBalance >= 10000.000000000)
      if (!userContract.empty || compareBalance) {
        this.router.navigate(['home'])
        return true
      } else {
        // if (!userContract.empty) {
        //   return true
        // } else {
        //   if (this.userTempBalance >= 0 && this.apiMinimunBalance) {
        //     if (+this.userTempBalance > +this.apiMinimunBalance || +this.userTempBalance >= 11300.000000000) {
        //       loginState = true;
        //     } else {
        //       window.alert('Aviso: Saldo inferior ao minimo necess??rio, seu Saldo: ' + ' ' + this.userTempBalance + ', saldo minimo: ' + ' ' + this.apiMinimunBalance)
        //       loginState = false;
        //     }
        //   } else {
        //     window.alert('Problemas ao processar dados da carteira do usu??rio, fa??a login novamente para continuar.')
        //     this.logout();
        //   }
        // }
        // } else {
        //   return false
        return false;
      }
    }
  }

  getDBHoldersReports() {
    this.dbList = this.db.list('holders');
    return this.dbList;
  }

  async getCotation() {
    return await this.http.get<any>("https://api.coinmarketcap.com/data-api/v3/tools/price-conversion?amount=1&convert_id=17031&id=1839").toPromise()
  }

  async getCotationBNBUSD() {
    return await this.http.get<any>("https://api.coinmarketcap.com/data-api/v3/tools/price-conversion?amount=1&convert_id=825&id=1839").toPromise()
  }

  async getCotationBNBBRL() {
    return await this.http.get<any>("https://api.coinmarketcap.com/data-api/v3/tools/price-conversion?amount=1&convert_id=2783&id=1839").toPromise()
  }

  async getCotationSHUSD() {
    return await this.http.get<any>("https://api.coinmarketcap.com/data-api/v3/tools/price-conversion?amount=1&convert_id=2781&id=17031").toPromise()
  }

  async getCotationSHBRL() {
    return await this.http.get<any>("https://api.coinmarketcap.com/data-api/v3/tools/price-conversion?amount=1&convert_id=2783&id=17031").toPromise()
  }

  async getHoldersFromDb(param: any) {
    let userData: userHolder[] = [];
    let jsonHolders = await this.http.get<any>('https://api.covalenthq.com/v1/56/tokens/0x0Ae2c8280ccc6A765991EECC87F8d569B5d53e52/token_holders/?quote-currency=USD&format=JSON&block-height=&page-size=5000&key=ckey_docs').toPromise()
    jsonHolders.data.items.filter((element: any) => {
      if (element.address && param) {
        if (element.address.toString().toUpperCase() === param.toString().toUpperCase()) {
          userData.push(element);
        }
      }
    });
    return userData;
  }

  async getContractTransations(): Promise<any> {
    let result = await this.http.get<any>('https://api.bscscan.com/api?module=account&action=tokentx&contract=0x0ae2c8280ccc6a765991eecc87f8d569b5d53e52&address=0x8d151d900fc5c85ea7b032cd5deac0c2c577240a&apikey=7YF5Z835K59ESTEMIT9T9WHVNUS2IPQXKP').toPromise()
    return result;
  }

  async verifyHashTransaction(carteiraInput: string, token?: string): Promise<any> {
    if (carteiraInput && carteiraInput?.trim()) {
      let url = '';
      if (token === 'Bnb') {
        url = 'https://api.bscscan.com/api?module=account&action=txlist&address=' + carteiraInput + '&apikey=7YF5Z835K59ESTEMIT9T9WHVNUS2IPQXKP'
      } else {
        url = 'https://api.bscscan.com/api?module=account&action=tokentx&address=' + carteiraInput + '&apikey=7YF5Z835K59ESTEMIT9T9WHVNUS2IPQXKP'
      }
      let result = await this.http.get<any>(url).toPromise()
      return result;
    }
  }

  async consultAddress(contractAddress: string, token?: string): Promise<any> {
    if (contractAddress && contractAddress?.trim()) {
      let url = '';
      url = 'https://api.bscscan.com/api?module=account&action=tokentx&address=' + contractAddress + '&apikey=7YF5Z835K59ESTEMIT9T9WHVNUS2IPQXKP'
      let result = await this.http.get<any>(url).toPromise()
      return result;
    }
  }

  public signInWithMetaMask() {
    let ethereum: any;

    return from(detectEthereumProvider()).pipe(
      // Step 1: Request (limited) access to users ethereum account
      switchMap(async (provider) => {
        if (!provider) {
          throw new Error('Please install MetaMask');
        }

        ethereum = provider;

        return await ethereum.request({ method: 'eth_requestAccounts' });
      }),
      // Step 2: Retrieve the current nonce for the requested address
      switchMap(() =>
        this.http.post<NonceResponse>(
          'https://us-central1-stakholders-c5fec.cloudfunctions.net/getNonceToSign',
          {
            address: ethereum.selectedAddress, uid: this.userID
          }
        )
      ),
      // Step 3: Get the user to sign the nonce with their private key
      switchMap(
        async (response) =>
          await ethereum.request({
            method: 'personal_sign',
            params: [
              `0x${this.toHex(response.nonce)}`,
              ethereum.selectedAddress,
            ],
          })
      ),
      // Step 4: If the signature is valid, retrieve a custom auth token for Firebase
      switchMap((sig) =>
        this.http.post<VerifyResponse>(
          'https://us-central1-stakholders-c5fec.cloudfunctions.net/verifySignedMessage',
          { uid: this.userID, address: ethereum.selectedAddress, signature: sig }
        )
      ),
      // Step 5: Use the auth token to auth with Firebase
      // switchMap(
      //   async (response) =>
      //     await signInWithCustomToken(this.auth, response.token)
      // )
    );
  }

  public async paymentWithMetamask(value: any): Promise<any> {
    let ethereum: any;
    this.userInfo = await this.getUserInfo(await this.userID)
    this.userInfo ? this.userInfo = this.userInfo?.data() : ''
    if (this.userInfo) {
      return from(detectEthereumProvider()).pipe(
        // Step 1: Request (limited) access to users ethereum account
        switchMap(async (provider) => {
          if (!provider) {
            throw new Error('Please install MetaMask');
          } else {
            ethereum = provider;
            let result = await ethereum?.request({ method: 'eth_requestAccounts' });
            return result;
          }
        }),
        // Step 2: Retrieve the current nonce for the requested address
        switchMap(async (response) => {
          const switchParams = {
            chainId: '0x56', // A 0x-prefixed hexadecimal string
            chainName: 'Smart Chain',
            nativeCurrency: {
              name: 'Stakholders',
              symbol: 'SH', // 2-6 characters long
              decimals: 9,
            },
            rpcUrls: 'https://bsc-dataseed.binance.org/',
            blockExplorerUrls: 'https://bscscan.com'
          }
        }
        ),
        // Step 3: Get the user to sign the nonce with their private key
        switchMap(
          async (response) => {

            const transactionParameters = {
              nonce: `0x${this.toHex(this.userInfo.nonce)}`, // ignored by MetaMask
              from: ethereum.selectedAddress, // must match user's active address.
              to: '0x0ae2c8280ccc6a765991eecc87f8d569b5d53e52', // Required except during contract publications.
              data: '0x8d151d900FC5C85Ea7b032cD5DEAC0C2C577240a', // Optional, but used for defining smart contract creation and interaction.
            };

            ethereum?.request({
              method: 'eth_sendTransaction',
              params: [transactionParameters],
            })
          }
        ),
        // Step 4: If the signature is valid, retrieve a custom auth token for Firebase
        // switchMap((sig) =>
        //   this.http.post<VerifyResponse>(
        //     'https://us-central1-stakholders-c5fec.cloudfunctions.net/verifySignedMessage',
        //     { uid: this.userInfo?.uid, address: ethereum.selectedAddress, signature: sig }
        //   )
        // )
      );
    }
  }

  private toHex(stringToConvert: string) {
    return stringToConvert
      .split('')
      .map((c) => c.charCodeAt(0).toString(16).padStart(2, '0'))
      .join('');
  }

  async getAddressInfo(carteira: string) {
    try {
      let url = 'https://api.covalenthq.com/v1/56/address/' + carteira + '/balances_v2/?quote-currency=USD&format=JSON&nft=false&no-nft-fetch=false&key=ckey_docs'
      // let url = 'https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=' + contrato + '&address=' + carteira + '&tag=latest&apikey=7YF5Z835K59ESTEMIT9T9WHVNUS2IPQXKP'
      let userBalanceReq = await this.http.get<any>(url).toPromise()
      let userBalance: any = [];
      if (userBalanceReq && userBalanceReq.data?.items) {
        userBalance = userBalanceReq.data.items;
      }
      return userBalance;
    } catch (error) {
      return null
    }
  }

  async getShTokenBalance(carteira: string): Promise<any> {
    let url = 'https://api.bscscan.com/api?module=account&action=tokenbalance&contractaddress=0x0ae2c8280ccc6a765991eecc87f8d569b5d53e52&address=' + carteira + '&tag=latest&apikey=7YF5Z835K59ESTEMIT9T9WHVNUS2IPQXKP'
    let userBalanceReq = await this.http.get<any>(url).toPromise()
    let userBalance: any;
    if (userBalanceReq && userBalanceReq.result) {
      userBalance = +userBalanceReq.result;
    } else {
      userBalance = 0
    }
    return userBalance;
  }


  getDBReports() {
    this.dbList = this.db.list('stakholders-c5fec-default-rtdb');
    return this.dbList;
  }


  resetPassword(data: any) {
    return this.angularFireAuth.sendPasswordResetEmail(
      data.email,
      { url: 'http://stakholders.app.br/login' });
  }

  AuthLogin(provider: any) {
    return this.angularFireAuth.signInWithPopup(provider)
      .then((result) => {
        console.log('You have been successfully logged in!')
      }).catch((error: any) => {
        if (error.code) {
          let errorCode = error.code;
          let errorMessage = this.VerifyErroCode(errorCode);
          if (errorMessage == null) {
            errorMessage = error.message;
          }
          this.confirmationService.confirm({
            message: errorMessage,
            header: 'N??o foi possivel prosseguir:',
            rejectVisible: false,
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
            }
          })
        }
      })
  }

  createUser(user: userStakholders) {
    this.angularFireAuth.createUserWithEmailAndPassword(user.email, user.password)
      .then(value => {
        let objUser: any;
        objUser = user;
        objUser.uid = value.user?.uid
        if (objUser.password) {
          delete objUser.password
        }
        this.addUserInfo(objUser);
      })
      .catch(error => {
        if (error.code) {
          let errorCode = error.code;
          let errorMessage = this.VerifyErroCode(errorCode);
          if (errorMessage == null) {
            errorMessage = error.message;
          }
          this.confirmationService.confirm({
            message: errorMessage,
            header: 'N??o foi possivel prosseguir:',
            rejectVisible: false,
            icon: 'pi pi-exclamation-triangle',
            accept: async () => {
            }
          })
        }
      });
  }

  addUserInfo(user: any) {
    return new Promise<any>((resolve, reject) => {
      this.angularFirestore
        .collection("users")
        .doc(user?.uid)
        .set(user)
        .then(response => { this.router.navigate(['login']) }, error => reject(error));
    });
  }


  updateUserInfo(user: any) {
    return new Promise<any>((resolve, reject) => {
      this.angularFirestore
        .collection("users")
        .doc(user?.uid)
        .update(user)
        .then(response => window.alert('Atividade Concluida'), error => reject(error));
    });
  }

  modifyUserInfo(user: any) {
    return new Promise<any>((resolve, reject) => {
      this.angularFirestore
        .collection("users")
        .doc(user?.uid)
        .set(user)
        .then(response => window.location.reload(), error => reject(error));
    });
  }

  addInfoToUser(user: any, data: any) {
    return new Promise<any>((resolve, reject) => {
      this.angularFirestore
        .collection("users")
        .doc(user)
        .update(data)
        .then(response => window.location.reload(), error => reject(error));
    });
  }

  addComprovanteInfo(uid: any, data: any) {
    return new Promise<any>((resolve, reject) => {
      this.angularFirestore
        .collection("users")
        .doc(uid)
        .collection("comprovantes")
        .add(data)
        .then(response => window.alert('Contrato Enviado com Sucesso'), error => window.alert('Erro no envio das informa????es! Por favor, entre em contato com o suporte.'));
    });
  }

  addTaskInfo(user: any, data: any) {
    return new Promise<any>((resolve, reject) => {
      this.angularFirestore
        .collection("users")
        .doc(user)
        .collection("tasks")
        .doc(user)
        .set(data)
        .then(response => this.router.navigate(['daily-task']), error => reject(error));
    });
  }

  getUserInfo(id: any) {
    return this.angularFirestore
      .collection('users')
      .doc(id)
      .get()
      .toPromise()
  }

  async getInfo() {
    let uid = await this.userUid;
    return this.angularFirestore
      .collection('users')
      .doc(uid)
      .get()
      .toPromise()
  }

  getTaskInfo(id: any) {
    return this.angularFirestore
      .collection('users')
      .doc(id)
      .collection('tasks')
      .doc(id)
      .get()
      .toPromise()
  }

  getAllContractInfo() {
    return this.angularFirestore
      .collectionGroup('comprovantes')
      .get()
      .toPromise()
  }

  getAllContractUpdate() {
    return this.angularFirestore
      .collectionGroup('atualizacao')
      .get()
      .toPromise()
  }

  getAllContractResgate() {
    return this.angularFirestore
      .collectionGroup('resgate')
      .get()
      .toPromise()
  }

  getAllUSerInfo() {
    return this.angularFirestore
      .collectionGroup('users')
      .get()
      .toPromise()
  }

  searchUserInfo(param: any) {
    return this.angularFirestore
      .collectionGroup(param)
      .get()
      .toPromise()
  }

  changeContractStatus(path: string, status: any) {
    return this.angularFirestore
      .doc(path)
      .update(status)
  }

  changeContractComprovantes(userId: string, contractId: any, data: any) {
    return this.angularFirestore
      .collection('users')
      .doc(userId)
      .collection('comprovantes')
      .doc(contractId)
      .update(data)
  }

  changeContractPendente(userId: string, contractId: any, data: any) {
    return this.angularFirestore
      .collection('users')
      .doc(userId)
      .collection('atualizacao')
      .doc(contractId)
      .update(data)
  }

  addDocumentTo(userId: string, contractId: any, data: any, path: string) {
    return this.angularFirestore
      .collection('users')
      .doc(userId)
      .collection(path)
      .doc(contractId)
      .set(data)
  }

  backupContract(userId: string, status: any) {
    return this.angularFirestore
      .collection('users')
      .doc(userId)
      .collection('backup')
      .add(status)
  }

  backupEditedContract(userId: string, status: any) {
    return this.angularFirestore
      .collection('users')
      .doc(userId)
      .collection('logs')
      .add(status)
  }

  getContractInfo() {
    return this.angularFirestore
      .collection('users')
      .doc(this.userID)
      .collection('comprovantes')
      .get()
      .toPromise()
  }


  getMyContractInfo(UID: any) {
    return this.angularFirestore
      .collection('users')
      .doc(UID)
      .collection('comprovantes')
      .get()
      .toPromise()
  }

  getHashInfoBsc(hash: string) {
    let urlParam = 'https://api.bscscan.com/api?module=proxy&action=eth_getTransactionReceipt&txhash=' + hash + '&apikey=7YF5Z835K59ESTEMIT9T9WHVNUS2IPQXKP'
    return this.http.get<any>(urlParam).toPromise()
  }

  updateContractInfo(row_id: any, param: any) {
    return this.angularFirestore
      .collection('users')
      .doc(this.userID)
      .collection('comprovantes')
      .doc(row_id)
      .update(param)
  }

  updateContract(path: string) {
    return this.angularFirestore
      .doc(path)
      .get()
      .toPromise()
  }

  addErrorInfo(error_type: any, param: any) {
    return this.angularFirestore
      .collection('erros')
      .doc(error_type)
      .collection(param.email)
      .add(param)
  }

  deleteContractInfo(row_id: any) {
    return this.angularFirestore
      .collection('users')
      .doc(this.userID)
      .collection('comprovantes')
      .doc(row_id)
      .delete()
  }

  async logout() {
    localStorage.removeItem('userDBData');
    localStorage.removeItem('userData');
    await this.angularFireAuth.signOut();
    this.router.navigate(['login'])
  }
  async coinMarketCapStats() {
    return await this.http.get<any>('https://3rdparty-apis.coinmarketcap.com/v1/cryptocurrency/widget?id=17031&convert_id=1,2781,2781').toPromise()
  }


  VerifyErroCode(errorCode: string): any {
    switch (errorCode) {
      case 'auth/app-deleted':
        return 'O banco de dados n??o foi localizado.';
      case 'auth/expired-action-code':
        return 'O c??digo da a????o o ou link expirou.';
      case 'auth/invalid-action-code':
        return 'O c??digo da a????o ?? inv??lido. Isso pode acontecer se o c??digo estiver malformado ou j?? tiver sido usado.';
      case 'auth/user-disabled':
        return 'O usu??rio correspondente ?? credencial fornecida foi desativado.';
      case 'auth/user-not-found':
        return 'O usu??rio n??o correponde ?? nenhuma credencial.';
      case 'auth/weak-password':
        return 'A senha ?? muito fraca.';
      case 'auth/email-already-in-use':
        return 'J?? existe uma conta com o endere??o de email fornecido.';
      case 'auth/invalid-email':
        return 'O endere??o de e-mail n??o ?? v??lido.';
      case 'auth/operation-not-allowed':
        return 'O tipo de conta correspondente ?? esta credencial, ainda n??o encontra-se ativada.';
      case 'auth/account-exists-with-different-credential':
        return 'E-mail j?? associado a outra conta.';
      case 'auth/auth-domain-config-required':
        return 'A configura????o para autentica????o n??o foi fornecida.';
      case 'auth/credential-already-in-use':
        return 'J?? existe uma conta para esta credencial.';
      case 'auth/operation-not-supported-in-this-environment':
        return 'Esta opera????o n??o ?? suportada no ambiente que est?? sendo executada. Verifique se deve ser http ou https.';
      case 'auth/timeout':
        return 'Excedido o tempo de resposta. O dom??nio pode n??o estar autorizado para realizar opera????es.';
      case 'auth/missing-android-pkg-name':
        return 'Deve ser fornecido um nome de pacote para instala????o do aplicativo Android.';
      case 'auth/missing-continue-uri':
        return 'A pr??xima URL deve ser fornecida na solicita????o.';
      case 'auth/missing-ios-bundle-id':
        return 'Deve ser fornecido um nome de pacote para instala????o do aplicativo iOS.';
      case 'auth/invalid-continue-uri':
        return 'A pr??xima URL fornecida na solicita????o ?? inv??lida.';
      case 'auth/unauthorized-continue-uri':
        return 'O dom??nio da pr??xima URL n??o est?? na lista de autoriza????es.';
      case 'auth/invalid-dynamic-link-domain':
        return 'O dom??nio de link din??mico fornecido, n??o est?? autorizado ou configurado no projeto atual.';
      case 'auth/argument-error':
        return 'Verifique a configura????o de link para o aplicativo.';
      case 'auth/invalid-persistence-type':
        return 'O tipo especificado para a persist??ncia dos dados ?? inv??lido.';
      case 'auth/unsupported-persistence-type':
        return 'O ambiente atual n??o suportar o tipo especificado para persist??ncia dos dados.';
      case 'auth/invalid-credential':
        return 'A credencial expirou ou est?? mal formada.';
      case 'auth/wrong-password':
        return 'Senha incorreta.';
      case 'auth/invalid-verification-code':
        return 'O c??digo de verifica????o da credencial n??o ?? v??lido.';
      case 'auth/invalid-verification-id':
        return 'O ID de verifica????o da credencial n??o ?? v??lido.';
      case 'auth/custom-token-mismatch':
        return 'O token est?? diferente do padr??o solicitado.';
      case 'auth/invalid-custom-token':
        return 'O token fornecido n??o ?? v??lido.';
      case 'auth/captcha-check-failed':
        return 'O token de resposta do reCAPTCHA n??o ?? v??lido, expirou ou o dom??nio n??o ?? permitido.';
      case 'auth/invalid-phone-number':
        return 'O n??mero de telefone est?? em um formato inv??lido (padr??o E.164).';
      case 'auth/missing-phone-number':
        return 'O n??mero de telefone ?? requerido.';
      case 'auth/quota-exceeded':
        return 'A cota de SMS foi excedida.';
      case 'auth/cancelled-popup-request':
        return 'Somente uma solicita????o de janela pop-up ?? permitida de uma s?? vez.';
      case 'auth/popup-blocked':
        return 'A janela pop-up foi bloqueado pelo navegador.';
      case 'auth/popup-closed-by-user':
        return 'A janela pop-up foi fechada pelo usu??rio sem concluir o login no provedor.';
      case 'auth/unauthorized-domain':
        return 'O dom??nio do aplicativo n??o est?? autorizado para realizar opera????es.';
      case 'auth/invalid-user-token':
        return 'O usu??rio atual n??o foi identificado.';
      case 'auth/user-token-expired':
        return 'O token do usu??rio atual expirou.';
      case 'auth/null-user':
        return 'O usu??rio atual ?? nulo.';
      case 'auth/app-not-authorized':
        return 'Aplica????o n??o autorizada para autenticar com a chave informada.';
      case 'auth/invalid-api-key':
        return 'A chave da API fornecida ?? inv??lida.';
      case 'auth/network-request-failed':
        return 'Falha de conex??o com a rede.';
      case 'auth/requires-recent-login':
        return 'O ??ltimo hor??rio de acesso do usu??rio n??o atende ao limite de seguran??a.';
      case 'auth/too-many-requests':
        return 'O acesso a esta conta foi temporariamente desativado devido a muitas tentativas de login malsucedidas. Pode restaur??-la imediatamente, redefinindo a sua senha ou pode tentar novamente mais tarde. ';
      case 'auth/web-storage-unsupported':
        return 'O navegador n??o suporta armazenamento ou se o usu??rio desativou este recurso.';
      case 'auth/invalid-claims':
        return 'Os atributos de cadastro personalizado s??o inv??lidos.';
      case 'auth/claims-too-large':
        return 'O tamanho da requisi????o excede o tamanho m??ximo permitido de 1 Megabyte.';
      case 'auth/id-token-expired':
        return 'O token informado expirou.';
      case 'auth/id-token-revoked':
        return 'O token informado perdeu a validade.';
      case 'auth/invalid-argument':
        return 'Um argumento inv??lido foi fornecido a um m??todo.';
      case 'auth/invalid-creation-time':
        return 'O hor??rio da cria????o precisa ser uma data UTC v??lida.';
      case 'auth/invalid-disabled-field':
        return 'A propriedade para usu??rio desabilitado ?? inv??lida.';
      case 'auth/invalid-display-name':
        return 'O nome do usu??rio ?? inv??lido.';
      case 'auth/invalid-email-verified':
        return 'O e-mail ?? inv??lido.';
      case 'auth/invalid-hash-algorithm':
        return 'O algoritmo de HASH n??o ?? uma criptografia compat??vel.';
      case 'auth/invalid-hash-block-size':
        return 'O tamanho do bloco de HASH n??o ?? v??lido.';
      case 'auth/invalid-hash-derived-key-length':
        return 'O tamanho da chave derivada do HASH n??o ?? v??lido.';
      case 'auth/invalid-hash-key':
        return 'A chave de HASH precisa ter um buffer de byte v??lido.';
      case 'auth/invalid-hash-memory-cost':
        return 'O custo da mem??ria HASH n??o ?? v??lido.';
      case 'auth/invalid-hash-parallelization':
        return 'O carregamento em paralelo do HASH n??o ?? v??lido.';
      case 'auth/invalid-hash-rounds':
        return 'O arredondamento de HASH n??o ?? v??lido.';
      case 'auth/invalid-hash-salt-separator':
        return 'O campo do separador de SALT do algoritmo de gera????o de HASH precisa ser um buffer de byte v??lido.';
      case 'auth/invalid-id-token':
        return 'O c??digo do token informado n??o ?? v??lido.';
      case 'auth/invalid-last-sign-in-time':
        return 'O ??ltimo hor??rio de login precisa ser uma data UTC v??lida.';
      case 'auth/invalid-page-token':
        return 'A pr??xima URL fornecida na solicita????o ?? inv??lida.';
      case 'auth/invalid-password':
        return 'A senha ?? inv??lida, precisa ter pelo menos 6 caracteres.';
      case 'auth/invalid-password-hash':
        return 'O HASH da senha n??o ?? v??lida.';
      case 'auth/invalid-password-salt':
        return 'O SALT da senha n??o ?? v??lido.';
      case 'auth/invalid-photo-url':
        return 'A URL da foto de usu??rio ?? inv??lido.';
      case 'auth/invalid-provider-id':
        return 'O identificador de provedor n??o ?? compat??vel.';
      case 'auth/invalid-session-cookie-duration':
        return 'A dura????o do COOKIE da sess??o precisa ser um n??mero v??lido em milissegundos, entre 5 minutos e 2 semanas.';
      case 'auth/invalid-uid':
        return 'O identificador fornecido deve ter no m??ximo 128 caracteres.';
      case 'auth/invalid-user-import':
        return 'O registro do usu??rio a ser importado n??o ?? v??lido.';
      case 'auth/invalid-provider-data':
        return 'O provedor de dados n??o ?? v??lido.';
      case 'auth/maximum-user-count-exceeded':
        return 'O n??mero m??ximo permitido de usu??rios a serem importados foi excedido.';
      case 'auth/missing-hash-algorithm':
        return '?? necess??rio fornecer o algoritmo de gera????o de HASH e seus par??metros para importar usu??rios.';
      case 'auth/missing-uid':
        return 'Um identificador ?? necess??rio para a opera????o atual.';
      case 'auth/reserved-claims':
        return 'Uma ou mais propriedades personalizadas fornecidas usaram palavras reservadas.';
      case 'auth/session-cookie-revoked':
        return 'O COOKIE da sess??o perdeu a validade.';
      case 'auth/uid-alread-exists':
        return 'O indentificador fornecido j?? est?? em uso.';
      case 'auth/email-already-exists':
        return 'O e-mail fornecido j?? est?? em uso.';
      case 'auth/phone-number-already-exists':
        return 'O telefone fornecido j?? est?? em uso.';
      case 'auth/project-not-found':
        return 'Nenhum projeto foi encontrado.';
      case 'auth/insufficient-permission':
        return 'A credencial utilizada n??o tem permiss??o para acessar o recurso solicitado.';
      case 'auth/internal-error':
        return 'O servidor de autentica????o encontrou um erro inesperado ao tentar processar a solicita????o.';
      default:
        return null;
    }
  }
}

export interface userStakholders {
  name?: string;
  email: string;
  carteira?: string;
  tel: string;
  password: string;
}

export interface userHolder {
  contract_decimals: number;
  contract_name: string;
  contract_ticker_symbol: string;
  contract_address: string;
  supports_erc: [];
  logo_url: string;
  address: string;
  balance: number;
  total_supply: number;
  block_height: number;
}

// export interface userHolder {
//   carteira: string;
//   saldo: string;
//   blockHeight: number;
// }
