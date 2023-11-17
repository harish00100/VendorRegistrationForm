import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from 'src/environments/environment.development';
import { VendorRegisteredList } from '../Model/VendorRegisteredList';
import { RegisteredCertificate } from '../Model/RegistrationCertificateList';
import { DeclarationDocumentsList } from '../Model/DeclarationDocuments';
import { BusinessTypeList } from '../Model/BusinessType';
import { CompanyTypeList } from '../Model/CompanyType';
import { CompanyNameList } from '../Model/CompanyList';
import { countryNames } from '../Model/Country';
import { StateNames } from '../Model/State';
import { CityNames } from '../Model/City';
import { PurchaserList } from '../Model/PurchaserList';
import { DesignationConfig } from '../Model/DesignationConfig';
import { CertificateList } from '../Model/Certifications';

@Injectable({
  providedIn: 'root'
})
export class GeneralBusinessInformationServiceService {

  constructor(private http: HttpClient) { }

  FetchCompanyTable() {
    return this.http.get<CompanyNameList[]>(environment.apiURL + 'getCompanyNameTable');
  }

  FetchCountryNameList() {
    return this.http.get<countryNames[]>(environment.apiURL + 'getCountryNameList');
  }

  FetchStateNameList(CountryID: any) {
    return this.http.post<StateNames[]>(environment.apiURL + 'getStateNameList', CountryID);
  }

  FetchCityNameList(StateID: any) {
    return this.http.post<CityNames[]>(environment.apiURL + 'getCityNameList', StateID);
  }

  MailSender(EmailID: any): Observable<string> {
    return this.http.post<string>(environment.apiURL + 'SMTPsendMail', EmailID);
  }

  FetchDesignationTable() {
    return this.http.get<DesignationConfig[]>(environment.apiURL + 'FetchDesignationWithConfig');
  }

  FetchManagementSystemTable() {
    return this.http.get<CertificateList[]>(environment.apiURL + 'FetchManagementSystemTable');
  }

  FetchPurchaserNameTable() {
    return this.http.get<PurchaserList[]>(environment.apiURL + 'FetchPurchaserName');
  }

  InsertDatatoVendorandDependencyTables(value: any): Observable<string> {
    return this.http.post<string>(environment.apiURL + 'InsertIntoVendorTable', value);
  }

  InsertDataIntoCompanyContactsTable(value: any): Observable<string> {
    return this.http.post<string>(environment.apiURL + 'InsertIntoCompanyContactsTable', value);
  }

  InsertDataIntoManagementSystemTable(value: any): Observable<string> {
    return this.http.post<string>(environment.apiURL + 'InsertIntoManagementSystemTable', value);
  }

  GetVendorTable() {
    return this.http.get<VendorRegisteredList[]>(environment.apiURL + 'GetVendorList');
  }

  DeleteRecords(val: any): Observable<string> {
    return this.http.post<string>(environment.apiURL + 'DeleteRecords', val);
  }

  InsertIntoRegistrationCertificateTable(value: any): Observable<string> {
    return this.http.post<string>(environment.apiURL + 'InsertIntoRegistrationCertificateTable', value);
  }

  InsertIntoDeclarationFilesTable(value: any): Observable<string> {
    return this.http.post<string>(environment.apiURL + 'InsertIntoDeclarationFilesTable', value);
  }

  GetVendorTableList(val: any) {
    return this.http.post<any>(environment.apiURL + 'GetVendorTableList', val);
  }

  FetchCompanycontactsTableForparticularVendor(val: any) {
    return this.http.post<any>(environment.apiURL + 'FetchCompanycontactsTableForparticularVendor', val);
  }

  FetchManagementSystemForparticularVendor(val: any) {
    return this.http.post<any>(environment.apiURL + 'FetchManagementSystemForparticularVendor', val);
  }

  BusinessTypesList() {
    return this.http.get<BusinessTypeList[]>(environment.apiURL + 'BusinessTypesList');
  }

  CompanyTypesList() {
    return this.http.get<CompanyTypeList[]>(environment.apiURL + 'CompanyTypesList');
  }

  FetchFromRegistrationCertificateTable(RegisteredCertificate: any) {
    return this.http.post<RegisteredCertificate[]>(environment.apiURL + 'FetchFromRegistrationCertificateTable', RegisteredCertificate);
  }

  FetchFromDeclarationFilesTable(DeclarationDocumentsList: any) {
    return this.http.post<DeclarationDocumentsList[]>(environment.apiURL + 'FetchFromDeclarationFilesTable', DeclarationDocumentsList);
  }
}