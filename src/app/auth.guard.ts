import { Injectable, OnInit } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/compat/auth';
import { ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot } from '@angular/router';
import { user } from 'rxfire/auth';
import { Observable } from 'rxjs';
import { AuthService } from './services/auth.service';

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate {
  // canActivate(
  //   route: ActivatedRouteSnapshot,
  //   state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
  //   return true;
  // }
  userInfo: any;
  userSHBalance: any;
  userUid: any;

  constructor(
    private angularFireAuth: AngularFireAuth,
    public authService: AuthService, public router: Router) {
  }
  async canActivate(): Promise<any> {
    if (this.authService.isLoggedIn !== true) {
      this.authService.logout();
      return false;
    } else {
      return true
    }
  }
}
