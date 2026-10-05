using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.ComponentModel.DataAnnotations.Schema;

namespace Investigate.API.Models
{
    // ── Enums ────────────────────────────────────────────────────────────────

    public enum UserRole { Tenant, Landlord, Agent, Admin }
    public enum ApplicationStatus { Draft, Submitted, UnderReview, Approved, Rejected, Withdrawn }
    public enum AgreementType { GeneralTenancy, MurrayDarlingCottonIrrigation, Moveable }
    public enum RentFrequency { Weekly, Fortnightly, Monthly }
    public enum ReviewerRole { Tenant, Landlord, Agent }
    public enum ServiceType { Gas, Electricity, Water, Internet, Other }
    public enum ResponsibleParty { Lessor, Tenant, Shared }
    public enum RepairType { Emergency, Routine }
    public enum OrganisationType { RealEstateAgency, PropertyManagement, Individual }

    // ── User ─────────────────────────────────────────────────────────────────

    public class User
    {
        [Key] public Guid UserId { get; set; } = Guid.NewGuid();
        [Required, MaxLength(100)] public string FirstName { get; set; } = string.Empty;
        [Required, MaxLength(100)] public string LastName { get; set; } = string.Empty;
        [Required, MaxLength(256)] public string Email { get; set; } = string.Empty;
        [MaxLength(20)] public string? Phone { get; set; }
        public UserRole Role { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public Organisation? Organisation { get; set; }
        public ICollection<RentalApplication> Applications { get; set; } = new List<RentalApplication>();
        public ICollection<Review> ReviewsGiven { get; set; } = new List<Review>();
        public ReputationScore? ReputationScore { get; set; }
    }

    // ── Organisation ─────────────────────────────────────────────────────────

    public class Organisation
    {
        [Key] public Guid OrganisationId { get; set; } = Guid.NewGuid();
        [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
        public OrganisationType Type { get; set; }
        [MaxLength(20)] public string? ABN { get; set; }
        [MaxLength(256)] public string? Email { get; set; }
        [MaxLength(20)] public string? Phone { get; set; }
        [MaxLength(300)] public string? Address { get; set; }

        public ICollection<User> Members { get; set; } = new List<User>();
        public ICollection<Property> Properties { get; set; } = new List<Property>();
    }

    // ── Property ─────────────────────────────────────────────────────────────

    public class Property
    {
        [Key] public Guid PropertyId { get; set; } = Guid.NewGuid();
        [Required, MaxLength(300)] public string Address { get; set; } = string.Empty;
        [MaxLength(100)] public string? Suburb { get; set; }
        [MaxLength(10)] public string? Postcode { get; set; }
        [MaxLength(50)] public string? State { get; set; }
        public int? Bedrooms { get; set; }
        public int? Bathrooms { get; set; }
        public int? CarSpaces { get; set; }
        public bool PetsAllowed { get; set; }
        public decimal? WeeklyRent { get; set; }

        public Guid? OrganisationId { get; set; }
        public Organisation? Organisation { get; set; }
        public ICollection<RentalApplication> Applications { get; set; } = new List<RentalApplication>();
        public ICollection<TenancyAgreement> Agreements { get; set; } = new List<TenancyAgreement>();
    }

    // ── RentalApplication ────────────────────────────────────────────────────

    public class RentalApplication
    {
        [Key] public Guid ApplicationId { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }
        public Guid PropertyId { get; set; }
        public ApplicationStatus Status { get; set; } = ApplicationStatus.Draft;
        public DateTime SubmittedAt { get; set; } = DateTime.UtcNow;
        public DateTime? LeaseExpiryDate { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal UrgencyScore { get; set; } = 10;

        [MaxLength(1000)] public string? Notes { get; set; }
        public int TotalOccupants { get; set; } = 1;

        public User User { get; set; } = null!;
        public Property Property { get; set; } = null!;
        public ICollection<Applicant> Applicants { get; set; } = new List<Applicant>();
        public TenancyAgreement? TenancyAgreement { get; set; }
    }

    // ── Applicant ────────────────────────────────────────────────────────────

    public class Applicant
    {
        [Key] public Guid ApplicantId { get; set; } = Guid.NewGuid();
        public Guid ApplicationId { get; set; }
        [Required, MaxLength(100)] public string FirstName { get; set; } = string.Empty;
        [Required, MaxLength(100)] public string LastName { get; set; } = string.Empty;
        public DateTime DateOfBirth { get; set; }
        [MaxLength(20)] public string? Phone { get; set; }
        [MaxLength(256)] public string? Email { get; set; }
        public bool IsPrimary { get; set; } = false;

        // Emergency contact
        [MaxLength(200)] public string? EmergencyContactName { get; set; }
        [MaxLength(20)] public string? EmergencyContactPhone { get; set; }
        [MaxLength(256)] public string? EmergencyContactEmail { get; set; }

        public RentalApplication Application { get; set; } = null!;
        public ICollection<Employment> Employments { get; set; } = new List<Employment>();
        public ICollection<FinancialDocument> FinancialDocuments { get; set; } = new List<FinancialDocument>();
        public ICollection<Pet> Pets { get; set; } = new List<Pet>();
        public ICollection<Vehicle> Vehicles { get; set; } = new List<Vehicle>();
    }

    // ── Employment ───────────────────────────────────────────────────────────

    public class Employment
    {
        [Key] public Guid EmploymentId { get; set; } = Guid.NewGuid();
        public Guid ApplicantId { get; set; }
        [Required, MaxLength(200)] public string EmployerName { get; set; } = string.Empty;
        [MaxLength(100)] public string? JobTitle { get; set; }
        [MaxLength(300)] public string? EmployerAddress { get; set; }
        [MaxLength(20)] public string? EmployerPhone { get; set; }
        public bool IsCurrent { get; set; } = true;
        public DateTime? StartDate { get; set; }
        public DateTime? EndDate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? AnnualIncome { get; set; }

        public Applicant Applicant { get; set; } = null!;
    }

    // ── FinancialDocument ────────────────────────────────────────────────────

    public class FinancialDocument
    {
        [Key] public Guid DocumentId { get; set; } = Guid.NewGuid();
        public Guid ApplicantId { get; set; }
        [Required, MaxLength(100)] public string DocumentType { get; set; } = string.Empty; // e.g. "Payslip", "BankStatement", "TaxReturn"
        [MaxLength(500)] public string? FileUrl { get; set; }
        public DateTime UploadedAt { get; set; } = DateTime.UtcNow;

        public Applicant Applicant { get; set; } = null!;
    }

    // ── RentalHistory ────────────────────────────────────────────────────────

    public class RentalHistory
    {
        [Key] public Guid RentalHistoryId { get; set; } = Guid.NewGuid();
        public Guid ApplicationId { get; set; }
        [MaxLength(300)] public string? PreviousAddress { get; set; }
        [MaxLength(200)] public string? LandlordName { get; set; }
        [MaxLength(20)] public string? LandlordPhone { get; set; }
        [MaxLength(256)] public string? LandlordEmail { get; set; }
        public DateTime? TenancyStart { get; set; }
        public DateTime? TenancyEnd { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal? WeeklyRent { get; set; }

        [MaxLength(500)] public string? ReasonForLeaving { get; set; }

        public RentalApplication Application { get; set; } = null!;
        public ICollection<Reference> References { get; set; } = new List<Reference>();
    }

    // ── Reference ────────────────────────────────────────────────────────────

    public class Reference
    {
        [Key] public Guid ReferenceId { get; set; } = Guid.NewGuid();
        public Guid RentalHistoryId { get; set; }
        [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
        [MaxLength(100)] public string? Relationship { get; set; }
        [MaxLength(20)] public string? Phone { get; set; }
        [MaxLength(256)] public string? Email { get; set; }

        public RentalHistory RentalHistory { get; set; } = null!;
    }

    // ── Pet ──────────────────────────────────────────────────────────────────

    public class Pet
    {
        [Key] public Guid PetId { get; set; } = Guid.NewGuid();
        public Guid ApplicantId { get; set; }
        [Required, MaxLength(100)] public string Species { get; set; } = string.Empty;
        [MaxLength(100)] public string? Breed { get; set; }
        [MaxLength(100)] public string? Name { get; set; }

        public Applicant Applicant { get; set; } = null!;
    }

    // ── Vehicle ──────────────────────────────────────────────────────────────

    public class Vehicle
    {
        [Key] public Guid VehicleId { get; set; } = Guid.NewGuid();
        public Guid ApplicantId { get; set; }
        [MaxLength(50)] public string? Make { get; set; }
        [MaxLength(50)] public string? Model { get; set; }
        [MaxLength(20)] public string? RegistrationNumber { get; set; }
        [MaxLength(10)] public string? Year { get; set; }

        public Applicant Applicant { get; set; } = null!;
    }

    // ── TenancyAgreement ─────────────────────────────────────────────────────

    public class TenancyAgreement
    {
        [Key] public Guid AgreementId { get; set; } = Guid.NewGuid();
        public Guid ApplicationId { get; set; }
        public Guid PropertyId { get; set; }

        // Links to Cobbled RTA API record
        [Required, MaxLength(50)] public string ContractNumber { get; set; } = string.Empty; // Format: INV-2026-XXXXXXXX

        public AgreementType AgreementType { get; set; } = AgreementType.GeneralTenancy;
        public DateTime LeaseStartDate { get; set; }
        public DateTime LeaseEndDate { get; set; }

        [Column(TypeName = "decimal(18,2)")]
        public decimal WeeklyRent { get; set; }

        public RentFrequency RentFrequency { get; set; } = RentFrequency.Weekly;

        [Column(TypeName = "decimal(18,2)")]
        public decimal BondAmount { get; set; }

        public bool WaterChargesPaid { get; set; }
        public bool PetsApproved { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public RentalApplication Application { get; set; } = null!;
        public Property Property { get; set; } = null!;
        public ICollection<ServiceCharge> ServiceCharges { get; set; } = new List<ServiceCharge>();
        public ICollection<Repairer> Repairers { get; set; } = new List<Repairer>();
    }

    // ── ServiceCharge ────────────────────────────────────────────────────────

    public class ServiceCharge
    {
        [Key] public Guid ChargeId { get; set; } = Guid.NewGuid();
        public Guid AgreementId { get; set; }
        public ServiceType ServiceType { get; set; }
        public ResponsibleParty ResponsibleParty { get; set; }
        [MaxLength(300)] public string? Notes { get; set; }

        public TenancyAgreement Agreement { get; set; } = null!;
    }

    // ── Repairer ─────────────────────────────────────────────────────────────

    public class Repairer
    {
        [Key] public Guid RepairerId { get; set; } = Guid.NewGuid();
        public Guid AgreementId { get; set; }
        [Required, MaxLength(200)] public string Name { get; set; } = string.Empty;
        [MaxLength(100)] public string? Trade { get; set; }
        [MaxLength(20)] public string? Phone { get; set; }
        public RepairType RepairType { get; set; }

        public TenancyAgreement Agreement { get; set; } = null!;
    }

    // ── Review ───────────────────────────────────────────────────────────────

    public class Review
    {
        [Key] public Guid ReviewId { get; set; } = Guid.NewGuid();
        public Guid ReviewerId { get; set; }  // FK to User — never returned in API responses
        public Guid RevieweeId { get; set; }  // FK to User being reviewed

        // Server-generated anonymous identifier — never exposed in API responses
        [Required, MaxLength(100)] public string AnonymousHash { get; set; } = Guid.NewGuid().ToString("N");

        public ReviewerRole ReviewerRole { get; set; }
        public int Rating { get; set; }  // 1–5
        [MaxLength(2000)] public string? Comment { get; set; }
        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public User Reviewer { get; set; } = null!;
    }

    // ── ReputationScore ──────────────────────────────────────────────────────

    public class ReputationScore
    {
        [Key] public Guid ScoreId { get; set; } = Guid.NewGuid();
        public Guid UserId { get; set; }

        [Column(TypeName = "decimal(5,2)")]
        public decimal AverageRating { get; set; } = 0;

        public int TotalReviews { get; set; } = 0;
        public DateTime LastUpdated { get; set; } = DateTime.UtcNow;

        public User User { get; set; } = null!;
    }
}
