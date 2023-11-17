using VendorRegistrationForm.Models;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Web.Http;
using System.Configuration;
using System.Data;
using System.Data.SqlClient;

using System.Net.Mail;
using System.Net.Mime;

namespace VendorRegistrationForm.Controllers
{
    public class GeneralBusinessInformationController : ApiController
    {
        static readonly string ConnectionString = ConfigurationManager.ConnectionStrings["VendorRegistrationFormDB"].ConnectionString;

        private static readonly log4net.ILog log = log4net.LogManager.GetLogger(System.Reflection.MethodBase.GetCurrentMethod().DeclaringType);

        [HttpGet]
        [Route("api/getCompanyNameTable")]
        public HttpResponseMessage getCompanyNameTable()
        {
            try
            {
                string query = @"select * from [dbo].[CompanyNames]";
                DataTable CompanyNameTable = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(query, connection);
                    var dataAdapter = new SqlDataAdapter(command);
                    dataAdapter.Fill(CompanyNameTable);
                }
                log.Info("Company Table Retrieved successfully");
                return Request.CreateResponse(HttpStatusCode.OK, CompanyNameTable);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }

        }

        [HttpGet]
        [Route("api/getCountryNameList")]
        public HttpResponseMessage getCountryNameList()
        {
            try
            {
                string CountryNames = @"select * from CountryNames";
                DataTable CountryNameList = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(CountryNames, connection);
                    var dataAdapter = new SqlDataAdapter(command);
                    dataAdapter.Fill(CountryNameList);
                }
                log.Info("country names table retrieved successfully");
                return Request.CreateResponse(HttpStatusCode.OK, CountryNameList);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpPost]
        [Route("api/getStateNameList")]
        public HttpResponseMessage getStateNameList(VendorRegnModel vendor)
        {
            try
            {
                string StateNames = @"select * from StateNames where CountryID=" + vendor.CountryID;
                DataTable StateNameList = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(StateNames, connection);
                    var dataAdapter = new SqlDataAdapter(command);
                    dataAdapter.Fill(StateNameList);
                }
                log.Info("State names table retrieved successfully");
                return Request.CreateResponse(HttpStatusCode.OK, StateNameList);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpPost]
        [Route("api/getCityNameList")]
        public HttpResponseMessage getCityNameList(VendorRegnModel vendor)
        {
            try
            {
                string CityNames = @"select * from CityNames where StateID=" + vendor.StateID;
                DataTable CityNameList = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(CityNames, connection);
                    var dataAdapter = new SqlDataAdapter(command);
                    dataAdapter.Fill(CityNameList);
                }
                log.Info("City names table retrieved successfully");
                return Request.CreateResponse(HttpStatusCode.OK, CityNameList);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpPost]
        [Route("api/SMTPsendMail")]
        public HttpResponseMessage sendEmail(VendorRegnModel vendor)
        {
            try
            {
                int RowsCount = 0;
                string IsEmailExistsAlready = @"select count(VendorID) from VendorMaster where EmailID='"+vendor.EmailID+"'";
                SqlConnection CountCheckEmailQuery = new SqlConnection(ConnectionString);
                using (var command = new SqlCommand(IsEmailExistsAlready, CountCheckEmailQuery))
                {
                    CountCheckEmailQuery.Open();
                    RowsCount=(int)command.ExecuteScalar();
                    CountCheckEmailQuery.Close();
                }
                if (RowsCount == 0)
                {
                    string fromMail = ConfigurationManager.AppSettings["MailID"];
                    string password = ConfigurationManager.AppSettings["Password"];
                    int GenerateRandomNumber;

                    Random randomNumber = new Random();
                    GenerateRandomNumber = randomNumber.Next(1000, 9999);
                    vendor.OTP = GenerateRandomNumber;

                    MailMessage message = new MailMessage();
                    message.From = new MailAddress(fromMail);
                    message.Subject = "test subject";
                    message.To.Add(new MailAddress(vendor.EmailID));
                    message.Body = "<html><body> Your 4-digit OTP Number is :" + GenerateRandomNumber + "</body></html>";
                    message.IsBodyHtml = true;

                    var smtpclient = new SmtpClient(ConfigurationManager.AppSettings["SMTPclient"])
                    {
                        Port = 587,
                        Credentials = new NetworkCredential(fromMail, password),
                        EnableSsl = true
                    };
                    smtpclient.Send(message);
                    log.Info("4 Digit OTP Number generated");

                    string EmailAlreadyExistsinOTPtbl = @"select count(OTP) from SaveGeneratedOTP where EmailID='" + vendor.EmailID + "'";
                    SqlConnection connection = new SqlConnection(ConnectionString);
                    using (var command = new SqlCommand(EmailAlreadyExistsinOTPtbl, connection))
                    {
                        connection.Open();
                        RowsCount = (int)command.ExecuteScalar();
                        connection.Close();
                    }
                    if (RowsCount == 0)
                    {
                        string SaveGeneratedOTP = @"insert into SaveGeneratedOTP(EmailID,OTP) values('" + vendor.EmailID+"','" + vendor.OTP + "')";
                        SqlConnection InsertQuery = new SqlConnection(ConnectionString);
                        using (var command = new SqlCommand(SaveGeneratedOTP, InsertQuery))
                        {
                            InsertQuery.Open();
                            command.ExecuteNonQuery();
                            InsertQuery.Close();
                        }
                        log.Info("OTP Saved to DataBase");
                    }
                    else
                    {
                        string SaveGeneratedOTP = @"update SaveGeneratedOTP set OTP=" + vendor.OTP + ",SaveDate=getDate() where EmailID='" + vendor.EmailID + "'";
                        SqlConnection InsertQuery = new SqlConnection(ConnectionString);
                        using (var command = new SqlCommand(SaveGeneratedOTP, InsertQuery))
                        {
                            InsertQuery.Open();
                            command.ExecuteNonQuery();
                            InsertQuery.Close();
                        }
                        log.Info("OTP Updated for same MailID "+vendor.EmailID);
                    }
                    return Request.CreateResponse(HttpStatusCode.OK, vendor.OTP);
                }
                else
                {
                    return Request.CreateResponse(HttpStatusCode.OK,"Invalid");
                }
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpGet]
        [Route("api/FetchDesignationWithConfig")]
        public HttpResponseMessage DesignationWithConfiguaration()
        {
            try
            {
                string FetchDesignationTable = @"select * from [dbo].[Designation]";
                DataTable DesignationTblList = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(FetchDesignationTable, connection);
                    var dataAdapter = new SqlDataAdapter(command);
                    dataAdapter.Fill(DesignationTblList);
                }
                log.Info("Designation table retrieved successfully with necessary configurations for each designation");
                return Request.CreateResponse(HttpStatusCode.OK, DesignationTblList);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpGet]
        [Route("api/FetchManagementSystemTable")]
        public HttpResponseMessage FetchManagementSystemTable()
        {
            try
            {
                string FetchDesignationTable = @"select * from Certifications";
                DataTable DesignationTblList = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(FetchDesignationTable, connection);
                    var dataAdapter = new SqlDataAdapter(command);
                    dataAdapter.Fill(DesignationTblList);
                }
                log.Info("Certification table retrieved successfully containing certificate names");
                return Request.CreateResponse(HttpStatusCode.OK, DesignationTblList);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }
        [HttpPost]
        [Route("api/DeleteRecords")]
        public string DeleteRecords(VendorRegnModel vendor)
        {
            using (SqlConnection connection = new SqlConnection(ConnectionString))
            {
                connection.Open();
                SqlTransaction transaction = connection.BeginTransaction();
                try
                {
                    SqlCommand deleteQuery = new SqlCommand(@"delete from RegistrationCertificateFiles where VendorMasterID=" + vendor.VendorMasterID, connection, transaction);
                    deleteQuery.ExecuteNonQuery();
                    deleteQuery = new SqlCommand(@"delete from DeclarationFiles where VendorMasterID=" + vendor.VendorMasterID, connection, transaction);
                    deleteQuery.ExecuteNonQuery();
                    deleteQuery = new SqlCommand(@"delete from CompanyContacts where VendorMasterID=" + vendor.VendorMasterID, connection, transaction);
                    deleteQuery.ExecuteNonQuery();
                    deleteQuery = new SqlCommand(@"delete from ManagementSystem where VendorMasterID=" + vendor.VendorMasterID, connection, transaction);
                    deleteQuery.ExecuteNonQuery();
                    deleteQuery = new SqlCommand(@"delete from VendorMaster where VendorID=" + vendor.VendorMasterID, connection, transaction);
                    deleteQuery.ExecuteNonQuery();

                    transaction.Commit();
                    log.Info("Records deleted successfully on all tables for vendorID="+vendor.VendorMasterID);
                    return "Deleted Table Data for " + vendor.VendorMasterID + " from Tables";
                }
                catch(Exception exceptionMessage)
                {
                    transaction.Rollback();
                    log.Error(exceptionMessage);
                    return "Internal Server Error - " + exceptionMessage;
                }
            }
        }

        [HttpGet]
        [Route("api/FetchPurchaserName")]
        public HttpResponseMessage FetchPurchaserName()
        {
            try
            {
                string FetchPurchaserName = @"select * from PurchaserList";
                DataTable PurchaseTableData = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(FetchPurchaserName, connection);
                    var dataAdapter = new SqlDataAdapter(command);
                    dataAdapter.Fill(PurchaseTableData);
                }
                log.Info("Purchaser Table fetched successfully");
                return Request.CreateResponse(HttpStatusCode.OK, PurchaseTableData);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }


        [HttpPost]
        [Route("api/InsertIntoVendorTable")]
        public HttpResponseMessage InsertIntoVendorTable(VendorRegnModel vendorDetails)
        {
            try
            {
                SqlConnection connection = new SqlConnection(ConnectionString);
                SqlCommand command = new SqlCommand("InsertIntoTablesonSubmitProc", connection)
                {
                    CommandType = CommandType.StoredProcedure
                };
                command.Parameters.AddWithValue("@companyID", vendorDetails.CompanyID);
                command.Parameters.AddWithValue("@StreetAddress", vendorDetails.StreetAddress);
                command.Parameters.AddWithValue("@CountryID", vendorDetails.CountryID);
                command.Parameters.AddWithValue("@StateID", vendorDetails.StateID);
                command.Parameters.AddWithValue("@CityID", vendorDetails.CityID);
                command.Parameters.AddWithValue("@PhoneNumber", vendorDetails.PhoneNumber);
                command.Parameters.AddWithValue("@FaxNumber", vendorDetails.FaxNumber);
                command.Parameters.AddWithValue("@EmailID", vendorDetails.EmailID);
                command.Parameters.AddWithValue("@BusinessType", vendorDetails.BusinessType);
                command.Parameters.AddWithValue("@CompanyType", vendorDetails.CompanyType);
                command.Parameters.AddWithValue("@SubmittedBy", vendorDetails.SubmittedBy);
                command.Parameters.AddWithValue("@DateSubmitted", vendorDetails.DateSubmitted);
                command.Parameters.AddWithValue("@PurchaserName", vendorDetails.PurchaserName);

                SqlParameter outParameter = new SqlParameter
                {
                    ParameterName = "@vendorId",
                    SqlDbType = SqlDbType.Int,
                    Value = 101,
                    Direction = ParameterDirection.Output
                };

                command.Parameters.Add(outParameter);

                connection.Open();
                command.ExecuteNonQuery();
                int VendorID = (int)outParameter.Value;
                connection.Close();

                log.Info("Value is stored in VendorMaster table and in dependent tables Successfully");
                return Request.CreateResponse(HttpStatusCode.OK, VendorID);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpPost]
        [Route("api/InsertIntoCompanyContactsTable")]
        public HttpResponseMessage InsertIntoCompanyContactsTable(VendorRegnModel vendor)
        {
            try
            {
                string InsertIntoContactsTable = @"insert into CompanyContacts(DesignationID,ContactsName,ContactsPhoneNumber,ContactsEmailID,VendorMasterID) values('" + vendor.DesignationID+"', '"+vendor.ContactsName+"','"+vendor.ContactsPhoneNumber+"','"+vendor.ContactsEmailID+"','"+vendor.VendorMasterID+"')";
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(InsertIntoContactsTable, connection);
                    connection.Open();
                    command.ExecuteNonQuery();
                    connection.Close();
                }
                log.Info("Inserted values in Company Contact table successfully");
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpPost]
        [Route("api/InsertIntoManagementSystemTable")]
        public HttpResponseMessage InsertIntoManagementSystemTable(VendorRegnModel vendor)
        {
            try
            {
                string InsertIntoManagementTable = @"insert into ManagementSystem(CertificationID,DateCertified,CertificationBody,CertificationNumber,VendorMasterID) values('" + vendor.CertificationID + "', convert(datetime,'" + vendor.DateCertified + "',105),'" + vendor.CertificationBody+ "','" + vendor.CertificationNumber + "','" + vendor.VendorMasterID + "')";
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(InsertIntoManagementTable, connection);
                    connection.Open();
                    command.ExecuteNonQuery();
                    connection.Close();
                }
                log.Info("Inserted values in Management System table successfully");
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpGet]
        [Route("api/GetVendorList")]
        public HttpResponseMessage GetVendorList()
        {
            try
            {
                string GetVendorList = @"select VendorID,CompanyName,StreetAddress,CountryName,StateName,CityName,PhoneNumber,FaxNumber,EmailID,BusinessType,CompanyType,SubmittedBy,DateSubmitted,PurchaserName 
                                            from VendorMaster a 
                                            join CompanyNames b
                                            on a.CompanyID=b.companyID
                                            join CountryNames c
                                            on a.CountryID=c.CountryID
                                            join StateNames d
                                            on a.StateID=d.StateID
                                            join CityNames e
                                            on a.CityID=e.CityID";
                DataTable VendorTblList = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(GetVendorList, connection);
                    var dataAdapter = new SqlDataAdapter(command);
                    dataAdapter.Fill(VendorTblList);
                }
                log.Info("vendor list from table retrieved successfully");
                return Request.CreateResponse(HttpStatusCode.OK, VendorTblList);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        //pdf save
        [HttpPost]
        [Route("api/InsertIntoRegistrationCertificateTable")]
        public HttpResponseMessage InsertIntoRegistrationCertificateFilesTable(VendorRegnModel vendor)
        {
            try
            {
                string InsertIntoRegistrationCertificateFilesTable = @"insert into RegistrationCertificateFiles(RegistrationCertificates,SinglePDFFileName,VendorMasterID) values('" + vendor.RegistrationCertificates +"','"+vendor.SinglePDFFileName +"',"+ vendor.VendorMasterID+")";
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(InsertIntoRegistrationCertificateFilesTable, connection);
                    connection.Open();
                    command.ExecuteNonQuery();
                    connection.Close();
                }
                log.Info("Inserted values in RegistrationCertificateFiles table successfully");
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpPost]
        [Route("api/InsertIntoDeclarationFilesTable")]
        public HttpResponseMessage InsertIntoDeclarationFilesTable(VendorRegnModel vendor)
        {
            try
            {
                string InsertIntoDeclarationFilesTable = @"insert into DeclarationFiles(DeclarationDocuments,MultiplePDFFileName,VendorMasterID) values('" +vendor.DeclarationDocuments + "','"+vendor.MultiplePDFFileName +"'," + vendor.VendorMasterID + ")";
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(InsertIntoDeclarationFilesTable, connection);
                    connection.Open();
                    command.ExecuteNonQuery();
                    connection.Close();
                }
                log.Info("Inserted values in DeclarationFiles table successfully");
                return Request.CreateResponse(HttpStatusCode.OK);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpPost]
        [Route("api/GetVendorTableList")]
        public HttpResponseMessage GetVendorTableList(VendorRegnModel vendor)
        {
            try
            {
                string GetVendorList = @"select VendorID,CompanyName,StreetAddress,CountryName,StateName,CityName,PhoneNumber,FaxNumber,EmailID,BusinessType,CompanyType,SubmittedBy,DateSubmitted,PurchaserName 
                                            from VendorMaster a 
                                            join CompanyNames b
                                            on a.CompanyID=b.companyID
                                            join CountryNames c
                                            on a.CountryID=c.CountryID
                                            join StateNames d
                                            on a.StateID=d.StateID
                                            join CityNames e
                                            on a.CityID=e.CityID
                                            where vendorID="+vendor.VendorMasterID;
                DataTable VendorTblList = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(GetVendorList, connection);
                    var dataAdapter = new SqlDataAdapter(command);
                    dataAdapter.Fill(VendorTblList);
                }
                log.Info("vendor list retrieved successfully for particular vendorID");
                return Request.CreateResponse(HttpStatusCode.OK, VendorTblList);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpPost]
        [Route("api/FetchCompanycontactsTableForparticularVendor")]
        public HttpResponseMessage FetchCompanycontactsTableForparticularVendor(VendorRegnModel vendor)
        {
            try
            {
                string FetchPurchaserName = @"select Designation,ContactsName,ContactsPhoneNumber,ContactsEmailID,a.DesignationID,VendorMasterID,CompanyContactsID from CompanyContacts a
                                join [dbo].[Designation] b
                                on a.DesignationID=b.DesignationID where VendorMasterID=" + vendor.VendorMasterID;
                DataTable PurchaseTableData = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(FetchPurchaserName, connection);
                    var dataAdapter = new SqlDataAdapter(command);
                    dataAdapter.Fill(PurchaseTableData);
                }
                log.Info("CompanyContacts Table fetched successfully");
                return Request.CreateResponse(HttpStatusCode.OK, PurchaseTableData);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpPost]
        [Route("api/FetchManagementSystemForparticularVendor")]
        public HttpResponseMessage FetchManagementSystemForparticularVendor(VendorRegnModel vendor)
        {
            try
            {
                string FetchManagementSystemForparticularVendor = @"select CertifiedTo,DateCertified,CertificationNumber,CertificationBody from ManagementSystem a join [dbo].[Certifications] b on a.CertificationID=b.CertificationID where VendorMasterID=" + vendor.VendorMasterID;
                DataTable ManagementSystemTableData = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(FetchManagementSystemForparticularVendor, connection);
                    var dataAdapter = new SqlDataAdapter(command);
                    dataAdapter.Fill(ManagementSystemTableData);
                }
                log.Info("CompanyContacts Table fetched successfully");
                return Request.CreateResponse(HttpStatusCode.OK, ManagementSystemTableData);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpGet]
        [Route("api/BusinessTypesList")]
        public HttpResponseMessage BusinessTypesList()
        {
            try
            {
                string BusinessTypesList = @"select * from BusinessTypesList";
                DataTable BusinessTypesListData = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(BusinessTypesList, connection);
                    var dataAdapter = new SqlDataAdapter(command);
                    dataAdapter.Fill(BusinessTypesListData);
                }
                log.Info("BusinessTypesList Table fetched successfully");
                return Request.CreateResponse(HttpStatusCode.OK, BusinessTypesListData);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpGet]
        [Route("api/CompanyTypesList")]
        public HttpResponseMessage CompanyTypesList()
        {
            try
            {
                string CompanyTypesList = @"select * from CompanyTypesList";
                DataTable CompanyTypesListData = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(CompanyTypesList, connection);
                    var dataAdapter = new SqlDataAdapter(command);
                    dataAdapter.Fill(CompanyTypesListData);
                }
                log.Info("CompanyTypesList Table fetched successfully");
                return Request.CreateResponse(HttpStatusCode.OK, CompanyTypesListData);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpPost]
        [Route("api/FetchFromRegistrationCertificateTable")]
        public HttpResponseMessage FetchFromRegistrationCertificateTable(VendorRegnModel vendor)
        {
            try
            {
                string FetchPurchaserName = @"select * from RegistrationCertificateFiles where VendorMasterID=" + vendor.VendorMasterID;
                DataTable SingleFile = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(FetchPurchaserName, connection);
                    var dataAdapter = new SqlDataAdapter(command);
                    dataAdapter.Fill(SingleFile);
                }
                log.Info("Fetch From RegistrationCertificate Table Table was successful");
                return Request.CreateResponse(HttpStatusCode.OK, SingleFile);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }

        [HttpPost]
        [Route("api/FetchFromDeclarationFilesTable")]
        public HttpResponseMessage FetchFromDeclarationFilesTable(VendorRegnModel vendor)
        {
            try
            {
                string FetchPurchaserName = @"select * from DeclarationFiles where VendorMasterID=" + vendor.VendorMasterID;
                DataTable MultipleFiles = new DataTable();
                using (SqlConnection connection = new SqlConnection(ConnectionString))
                {
                    var command = new SqlCommand(FetchPurchaserName, connection);
                    var dataAdapter = new SqlDataAdapter(command);
                    dataAdapter.Fill(MultipleFiles);
                }
                log.Info("Fetch From Declaration Table was successful");
                return Request.CreateResponse(HttpStatusCode.OK, MultipleFiles);
            }
            catch (Exception exceptionMessage)
            {
                log.Error(exceptionMessage);
                return Request.CreateResponse(HttpStatusCode.InternalServerError, exceptionMessage);
            }
        }
    }
}