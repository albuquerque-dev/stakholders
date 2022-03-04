import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './auth.guard';
import { LoginGuard } from './login-guard.guard';
import { AdministracaoComponent } from './pages/administracao/administracao.component';
import { AirdropComponent } from './pages/airdrop/airdrop.component';
import { ChartComponent } from './pages/chart/chart.component';
import { CompleteComponent } from './pages/complete/complete.component';
import { DailyTaskComponent } from './pages/daily-task/daily-task.component';
import { HomeComponent } from './pages/home/home.component';
import { LoginComponent } from './pages/login/login.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { RegisterComponent } from './pages/register/register.component';
import { ShopComponent } from './pages/shop/shop.component';
import { AngularFireAuthGuard, hasCustomClaim, redirectUnauthorizedTo, redirectLoggedInTo } from '@angular/fire/compat/auth-guard';
import { RendaComponent } from './pages/renda/renda.component';
import { ResgateComponent } from './pages/resgate/resgate.component';
import { PortalComponent } from './site/portal/portal.component';

const adminOnly = () => hasCustomClaim('admin');
const redirectUnauthorizedToLogin = () => redirectUnauthorizedTo(['login']);
const redirectLoggedInToHome = () => redirectLoggedInTo(['home']);
const belongsToAccount = (next: any) => hasCustomClaim(`account-${next.params.id}`);

const routes: Routes = [
  { path: "", redirectTo: 'login', pathMatch: 'full' },
  { path: "portal", component: PortalComponent },
  { path: "login", component: LoginComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectLoggedInToHome } },
  { path: "register", component: RegisterComponent },
  { path: "home", component: HomeComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: "daily-task", component: DailyTaskComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: "renda-passiva", component: RendaComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: "renda", component: RendaComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: "resgate", component: ResgateComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: "shop", component: ShopComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: "profile", component: ProfileComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: "administracao", component: AdministracaoComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: "chart", component: ChartComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: "complete/:atividade", component: CompleteComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
  { path: "airdrop/:atividade", component: AirdropComponent, canActivate: [AngularFireAuthGuard], data: { authGuardPipe: redirectUnauthorizedToLogin } },
];
// , canActivate: [AuthGuard]
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
