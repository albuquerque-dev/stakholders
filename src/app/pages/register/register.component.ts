import { Component, OnInit } from '@angular/core';
import { AngularFireDatabase } from '@angular/fire/compat/database';
import { AngularFirestore } from '@angular/fire/compat/firestore';
import { FormBuilder, FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { PrimeNGConfig } from 'primeng/api';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {

  public carteiraForm: FormGroup;
  public userForm: FormGroup;
  userRef: any
  carteiraExist: boolean = false;
  userData: any;
  userName: string = '';
  showLoading: boolean = false;

  constructor(private primengConfig: PrimeNGConfig,
    private dbService: AuthService,
    public formBuilder: FormBuilder,
    private act: ActivatedRoute,
    private router: Router
  ) {
    this.carteiraForm = this.formBuilder.group({
      carteira: ['']
    })
    this.userForm = this.formBuilder.group({
      nome: [''],
      email: [''],
      password: [''],
      carteira: [''],
      tel: ['']
    })
  }
  ngOnInit() {
    this.primengConfig.ripple = true;
    // this.dbService
    // this.dbService.addHoldersInfo();
  }

  async checkMinimunBalance() {
    try {
      // let userBalancePermits = await this.dbService.canUserLogin(this.carteiraForm?.value?.carteira)
      // if (userBalancePermits) {
      this.checkHolders();
      // } else {
      // window.alert('Serviço temporariamente indispoinvel, contacte o suporte.')
      // }
    } catch (error) {
      console.error(error);
    }
  }

  async checkHolders() {
    try {
      // let userExist = await this.dbService.getHoldersFromDb(this.carteiraForm.value.carteira)
      // console.log('userExist')
      // if (userExist && userExist.length > 0 && userExist[0].address) {
      this.carteiraExist = true;
      // }
    } catch (error: any) {
      window.alert('Erro:' + error);
      console.error(error);
    } finally {
    }
  };

  registerUser() {
    this.userForm.value.carteira = this.carteiraForm.value.carteira;
    this.dbService.createUser(this.userForm.value);
  };
}
