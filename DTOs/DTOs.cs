using Investigate.API.Models;

namespace Investigate.API.DTOs
{
    // ── Application ──────────────────────────────────────────────────────────

    public record CreateApplicationRequest(
        Guid UserId,
        Guid PropertyId,
        int TotalOccupants,
        DateTime? LeaseExpiryDate,
        string? Notes
    );

    public record ApplicationResponse(
        Guid ApplicationId,
        Guid UserId,
        Guid PropertyId,
        string Status,
        int TotalOccupants,
        DateTime? LeaseExpiryDate,
        decimal UrgencyScore,
        DateTime SubmittedAt,
        string? Notes
    );

    // ── Applicant ────────────────────────────────────────────────────────────

    public record CreateApplicantRequest(
        Guid ApplicationId,
        string FirstName,
        string LastName,
        DateTime DateOfBirth,
        string? Phone,
        string? Email,
        bool IsPrimary,
        string? EmergencyContactName,
        string? EmergencyContactPhone,
        string? EmergencyContactEmail
    );

    public record ApplicantResponse(
        Guid ApplicantId,
        Guid ApplicationId,
        string FirstName,
        string LastName,
        DateTime DateOfBirth,
        string? Phone,
        string? Email,
        bool IsPrimary,
        string? EmergencyContactName,
        string? EmergencyContactPhone,
        string? EmergencyContactEmail
    );

    // ── Employment ───────────────────────────────────────────────────────────

    public record CreateEmploymentRequest(
        Guid ApplicantId,
        string EmployerName,
        string? JobTitle,
        string? EmployerAddress,
        string? EmployerPhone,
        bool IsCurrent,
        DateTime? StartDate,
        DateTime? EndDate,
        decimal? AnnualIncome
    );

    public record EmploymentResponse(
        Guid EmploymentId,
        Guid ApplicantId,
        string EmployerName,
        string? JobTitle,
        bool IsCurrent,
        DateTime? StartDate,
        DateTime? EndDate,
        decimal? AnnualIncome
    );

    // ── Rental History ───────────────────────────────────────────────────────

    public record CreateRentalHistoryRequest(
        Guid ApplicationId,
        string? PreviousAddress,
        string? LandlordName,
        string? LandlordPhone,
        string? LandlordEmail,
        DateTime? TenancyStart,
        DateTime? TenancyEnd,
        decimal? WeeklyRent,
        string? ReasonForLeaving
    );

    public record RentalHistoryResponse(
        Guid RentalHistoryId,
        Guid ApplicationId,
        string? PreviousAddress,
        string? LandlordName,
        string? LandlordPhone,
        DateTime? TenancyStart,
        DateTime? TenancyEnd,
        decimal? WeeklyRent,
        string? ReasonForLeaving
    );

    // ── Tenancy Agreement ────────────────────────────────────────────────────

    public record CreateAgreementRequest(
        Guid ApplicationId,
        Guid PropertyId,
        string ContractNumber,
        string AgreementType,
        DateTime LeaseStartDate,
        DateTime LeaseEndDate,
        decimal WeeklyRent,
        string RentFrequency,
        decimal BondAmount,
        bool WaterChargesPaid,
        bool PetsApproved
    );

    public record AgreementResponse(
        Guid AgreementId,
        Guid ApplicationId,
        Guid PropertyId,
        string ContractNumber,
        string AgreementType,
        DateTime LeaseStartDate,
        DateTime LeaseEndDate,
        decimal WeeklyRent,
        string RentFrequency,
        decimal BondAmount,
        bool WaterChargesPaid,
        bool PetsApproved,
        DateTime CreatedAt
    );

    // ── Review ───────────────────────────────────────────────────────────────
    // NOTE: ReviewerId is intentionally omitted from ReviewResponse — anonymity enforced at API layer

    public record CreateReviewRequest(
        Guid ReviewerId,
        Guid RevieweeId,
        string ReviewerRole,
        int Rating,
        string? Comment
    );

    public record ReviewResponse(
        Guid ReviewId,
        // ReviewerId deliberately excluded
        Guid RevieweeId,
        string ReviewerRole,
        int Rating,
        string? Comment,
        DateTime CreatedAt
    );

    // ── Reputation Score ─────────────────────────────────────────────────────

    public record ReputationScoreResponse(
        Guid UserId,
        decimal AverageRating,
        int TotalReviews,
        DateTime LastUpdated
    );
}
