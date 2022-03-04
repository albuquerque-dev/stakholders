import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup } from '@angular/forms';
import { Router } from '@angular/router';
import { FirebaseError } from 'firebase/app';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  passwordResetForm: boolean = false;
  showLoading: boolean = false;
  public userForm: FormGroup;
  public resetUserForm: FormGroup;

  constructor(private dbService: AuthService,
    public formBuilder: FormBuilder,
    private router: Router) {
    this.userForm = this.formBuilder.group({
      email: [''],
      password: ['']
    })
    this.resetUserForm = this.formBuilder.group({
      email: ['']
    })
  }

  ngOnInit(): void {

  }


  gotoRegister() {
    this.router.navigate(['register'])
  }

  async loginUser() {
    try {
      this.showLoading = true;
      this.userForm.value.email = this.userForm.value.email;
      this.userForm.value.password = this.userForm.value.password;
      await this.dbService.loginUser(this.userForm.value);
      this.showLoading = false;
    } catch (error: any) {
    } finally {

    }
  };

  forgotPassword() {
    this.passwordResetForm = true;
  }
  async resetUserPassword() {
    await this.dbService.resetPassword(this.resetUserForm.value);
    window.alert('Enviamos um email com um link para você poder entrar novamente na sua conta.')
  }
}
