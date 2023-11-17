import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { VendorRegistrationFormComponent } from './components/vendor-registration-form/vendor-registration-form.component';
import { ErrorPageComponent } from './components/error-page/error-page.component';
import { VendorListComponent } from './components/vendor-list/vendor-list.component';

const routes: Routes = [
  {path:'',redirectTo:'VendorRegistrationForm',pathMatch:'full'},
  {path:'VendorRegistrationForm',component:VendorRegistrationFormComponent},
  {path:'VendorRegistrationForm/:id',component:VendorRegistrationFormComponent},
  {path:'VendorList',component:VendorListComponent},
  {path:'**',component:ErrorPageComponent}
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
