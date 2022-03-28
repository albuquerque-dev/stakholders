import { NgModule, LOCALE_ID } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { LoginComponent } from './pages/login/login.component';
import { DashboardComponent } from './pages/dashboard/dashboard.component';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { environment } from '../environments/environment';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideDatabase, getDatabase } from '@angular/fire/database';
import { provideFirestore, getFirestore } from '@angular/fire/firestore';
import { provideStorage, getStorage } from '@angular/fire/storage';
import { AngularFireModule } from '@angular/fire/compat';
import { AngularFireDatabaseModule } from '@angular/fire/compat/database';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RegisterComponent } from './pages/register/register.component';
import { AuthGuard } from "./auth.guard";
import { AuthService } from './services/auth.service';
import { DailyTaskComponent } from './pages/daily-task/daily-task.component';
import { HeaderComponent } from './header/header.component';
import { CardModule } from 'primeng/card';
import { HttpClientModule } from '@angular/common/http';
import { StepsModule } from 'primeng/steps';
import { ToastModule } from 'primeng/toast';
import { ButtonModule } from 'primeng/button';
import { ChartComponent } from './pages/chart/chart.component';
import { CompleteComponent } from './pages/complete/complete.component';
import { SubheaderComponent } from './subheader/subheader.component';
import { ConverterComponent } from './converter/converter.component';
import { InputNumberModule } from 'primeng/inputnumber';
import ptBr from '@angular/common/locales/pt';
import { registerLocaleData } from '@angular/common';
import { AirdropComponent } from './pages/airdrop/airdrop.component';
import { TableModule } from 'primeng/table';
import { ChartModule } from 'primeng/chart';
import { HomeComponent } from './pages/home/home.component';
import { AdministracaoComponent } from './pages/administracao/administracao.component';
import { ProfileComponent } from './pages/profile/profile.component';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { DialogModule } from 'primeng/dialog';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { FileUploadModule } from 'primeng/fileupload';
import { InputSwitchModule } from 'primeng/inputswitch';
import { UploaderComponent } from './uploader/uploader.component';
import { MenubarModule } from 'primeng/menubar';
import { MessagesModule } from 'primeng/messages';
import { ShopComponent } from './pages/shop/shop.component';
import { DropdownModule } from 'primeng/dropdown';
import { RendaComponent } from './pages/renda/renda.component';
import { ClipboardModule } from '@angular/cdk/clipboard'
import { TabViewModule } from 'primeng/tabview';
import { SpiderComponent } from './chart/spider/spider.component';
import { RadarComponent } from './chart/radar/radar.component';
import { ResgateComponent } from './pages/resgate/resgate.component';
import { PortalComponent } from './site/portal/portal.component';
import { FooterComponent } from './site/components/footer/footer.component';
import { PaginatorModule } from 'primeng/paginator';
import { FullCalendarModule } from '@fullcalendar/angular'; // must go before plugins
import dayGridPlugin from '@fullcalendar/daygrid'; // a plugin!

FullCalendarModule.registerPlugins([ // register FullCalendar plugins
  dayGridPlugin
]);

registerLocaleData(ptBr);

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    DashboardComponent,
    RegisterComponent,
    DailyTaskComponent,
    HeaderComponent,
    ChartComponent,
    CompleteComponent,
    SubheaderComponent,
    ConverterComponent,
    AirdropComponent,
    HomeComponent,
    AdministracaoComponent,
    ProfileComponent,
    UploaderComponent,
    ShopComponent,
    RendaComponent,
    SpiderComponent,
    RadarComponent,
    ResgateComponent,
    PortalComponent,
    FooterComponent
  ],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    IonicModule.forRoot(),
    HttpClientModule,
    FormsModule,
    AppRoutingModule,
    AngularFireModule.initializeApp(environment.firebase),
    AngularFireDatabaseModule,
    provideFirebaseApp(() => initializeApp(environment.firebase)),
    provideAuth(() => getAuth()),
    provideDatabase(() => getDatabase()),
    provideFirestore(() => getFirestore()),
    provideStorage(() => getStorage()),
    FormsModule,
    ReactiveFormsModule,
    CardModule,
    StepsModule,
    ToastModule,
    ButtonModule,
    InputNumberModule,
    TableModule,
    ChartModule,
    DialogModule,
    ConfirmDialogModule,
    FileUploadModule,
    InputSwitchModule,
    MenubarModule,
    MessagesModule,
    DropdownModule,
    ClipboardModule,
    TabViewModule,
    PaginatorModule,
    FullCalendarModule // register FullCalendar with you app
  ],
  providers: [AuthGuard, AuthService, { provide: LOCALE_ID, useValue: 'pt' }, ConfirmationService],
  bootstrap: [AppComponent]
})
export class AppModule { }
