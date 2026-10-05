using Investigate.API.Data;
using Investigate.API.DTOs;
using Investigate.API.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace Investigate.API.Controllers
{
    // ── Applications ─────────────────────────────────────────────────────────

    [ApiController]
    [Route("api/[controller]")]
    public class ApplicationsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ApplicationsController(AppDbContext db) => _db = db;

        [HttpGet]
        public async Task<IActionResult> GetAll() =>
            Ok(await _db.RentalApplications.Select(a => ToResponse(a)).ToListAsync());

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var app = await _db.RentalApplications.FindAsync(id);
            return app is null ? NotFound() : Ok(ToResponse(app));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateApplicationRequest req)
        {
            var app = new RentalApplication
            {
                UserId        = req.UserId,
                PropertyId    = req.PropertyId,
                TotalOccupants = req.TotalOccupants,
                LeaseExpiryDate = req.LeaseExpiryDate,
                Notes         = req.Notes,
                UrgencyScore  = CalculateUrgency(req.LeaseExpiryDate)
            };
            _db.RentalApplications.Add(app);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = app.ApplicationId }, ToResponse(app));
        }

        [HttpPatch("{id}/status")]
        public async Task<IActionResult> UpdateStatus(Guid id, [FromBody] string status)
        {
            var app = await _db.RentalApplications.FindAsync(id);
            if (app is null) return NotFound();
            if (!Enum.TryParse<ApplicationStatus>(status, out var parsed)) return BadRequest("Invalid status.");
            app.Status = parsed;
            await _db.SaveChangesAsync();
            return Ok(ToResponse(app));
        }

        private static decimal CalculateUrgency(DateTime? expiry)
        {
            if (expiry is null) return 10;
            var days = (expiry.Value - DateTime.UtcNow).TotalDays;
            return days switch
            {
                <= 14 => 100,
                <= 30 => 80,
                <= 60 => 50,
                <= 90 => 30,
                _     => 10
            };
        }

        private static ApplicationResponse ToResponse(RentalApplication a) => new(
            a.ApplicationId, a.UserId, a.PropertyId,
            a.Status.ToString(), a.TotalOccupants, a.LeaseExpiryDate,
            a.UrgencyScore, a.SubmittedAt, a.Notes
        );
    }

    // ── Applicants ───────────────────────────────────────────────────────────

    [ApiController]
    [Route("api/[controller]")]
    public class ApplicantsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ApplicantsController(AppDbContext db) => _db = db;

        [HttpGet("by-application/{applicationId}")]
        public async Task<IActionResult> GetByApplication(Guid applicationId) =>
            Ok(await _db.Applicants
                .Where(a => a.ApplicationId == applicationId)
                .Select(a => ToResponse(a))
                .ToListAsync());

        [HttpPost]
        public async Task<IActionResult> Create(CreateApplicantRequest req)
        {
            var applicant = new Applicant
            {
                ApplicationId         = req.ApplicationId,
                FirstName             = req.FirstName,
                LastName              = req.LastName,
                DateOfBirth           = req.DateOfBirth,
                Phone                 = req.Phone,
                Email                 = req.Email,
                IsPrimary             = req.IsPrimary,
                EmergencyContactName  = req.EmergencyContactName,
                EmergencyContactPhone = req.EmergencyContactPhone,
                EmergencyContactEmail = req.EmergencyContactEmail
            };
            _db.Applicants.Add(applicant);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(GetByApplication),
                new { applicationId = applicant.ApplicationId }, ToResponse(applicant));
        }

        private static ApplicantResponse ToResponse(Applicant a) => new(
            a.ApplicantId, a.ApplicationId, a.FirstName, a.LastName,
            a.DateOfBirth, a.Phone, a.Email, a.IsPrimary,
            a.EmergencyContactName, a.EmergencyContactPhone, a.EmergencyContactEmail
        );
    }

    // ── Employment ───────────────────────────────────────────────────────────

    [ApiController]
    [Route("api/[controller]")]
    public class EmploymentController : ControllerBase
    {
        private readonly AppDbContext _db;
        public EmploymentController(AppDbContext db) => _db = db;

        [HttpGet("by-applicant/{applicantId}")]
        public async Task<IActionResult> GetByApplicant(Guid applicantId) =>
            Ok(await _db.Employments
                .Where(e => e.ApplicantId == applicantId)
                .Select(e => ToResponse(e))
                .ToListAsync());

        [HttpPost]
        public async Task<IActionResult> Create(CreateEmploymentRequest req)
        {
            var emp = new Employment
            {
                ApplicantId     = req.ApplicantId,
                EmployerName    = req.EmployerName,
                JobTitle        = req.JobTitle,
                EmployerAddress = req.EmployerAddress,
                EmployerPhone   = req.EmployerPhone,
                IsCurrent       = req.IsCurrent,
                StartDate       = req.StartDate,
                EndDate         = req.EndDate,
                AnnualIncome    = req.AnnualIncome
            };
            _db.Employments.Add(emp);
            await _db.SaveChangesAsync();
            return Created(string.Empty, ToResponse(emp));
        }

        private static EmploymentResponse ToResponse(Employment e) => new(
            e.EmploymentId, e.ApplicantId, e.EmployerName, e.JobTitle,
            e.IsCurrent, e.StartDate, e.EndDate, e.AnnualIncome
        );
    }

    // ── Rental History ───────────────────────────────────────────────────────

    [ApiController]
    [Route("api/[controller]")]
    public class RentalHistoryController : ControllerBase
    {
        private readonly AppDbContext _db;
        public RentalHistoryController(AppDbContext db) => _db = db;

        [HttpGet("by-application/{applicationId}")]
        public async Task<IActionResult> GetByApplication(Guid applicationId) =>
            Ok(await _db.RentalHistories
                .Where(r => r.ApplicationId == applicationId)
                .Select(r => ToResponse(r))
                .ToListAsync());

        [HttpPost]
        public async Task<IActionResult> Create(CreateRentalHistoryRequest req)
        {
            var history = new RentalHistory
            {
                ApplicationId   = req.ApplicationId,
                PreviousAddress = req.PreviousAddress,
                LandlordName    = req.LandlordName,
                LandlordPhone   = req.LandlordPhone,
                LandlordEmail   = req.LandlordEmail,
                TenancyStart    = req.TenancyStart,
                TenancyEnd      = req.TenancyEnd,
                WeeklyRent      = req.WeeklyRent,
                ReasonForLeaving = req.ReasonForLeaving
            };
            _db.RentalHistories.Add(history);
            await _db.SaveChangesAsync();
            return Created(string.Empty, ToResponse(history));
        }

        private static RentalHistoryResponse ToResponse(RentalHistory r) => new(
            r.RentalHistoryId, r.ApplicationId, r.PreviousAddress,
            r.LandlordName, r.LandlordPhone, r.TenancyStart,
            r.TenancyEnd, r.WeeklyRent, r.ReasonForLeaving
        );
    }

    // ── Agreements ───────────────────────────────────────────────────────────

    [ApiController]
    [Route("api/[controller]")]
    public class AgreementsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public AgreementsController(AppDbContext db) => _db = db;

        [HttpGet("{id}")]
        public async Task<IActionResult> Get(Guid id)
        {
            var ag = await _db.TenancyAgreements.FindAsync(id);
            return ag is null ? NotFound() : Ok(ToResponse(ag));
        }

        [HttpPost]
        public async Task<IActionResult> Create(CreateAgreementRequest req)
        {
            if (!Enum.TryParse<AgreementType>(req.AgreementType, out var agType))
                return BadRequest("Invalid AgreementType.");
            if (!Enum.TryParse<RentFrequency>(req.RentFrequency, out var freq))
                return BadRequest("Invalid RentFrequency.");

            var ag = new TenancyAgreement
            {
                ApplicationId   = req.ApplicationId,
                PropertyId      = req.PropertyId,
                ContractNumber  = req.ContractNumber,
                AgreementType   = agType,
                LeaseStartDate  = req.LeaseStartDate,
                LeaseEndDate    = req.LeaseEndDate,
                WeeklyRent      = req.WeeklyRent,
                RentFrequency   = freq,
                BondAmount      = req.BondAmount,
                WaterChargesPaid = req.WaterChargesPaid,
                PetsApproved    = req.PetsApproved
            };
            _db.TenancyAgreements.Add(ag);
            await _db.SaveChangesAsync();
            return CreatedAtAction(nameof(Get), new { id = ag.AgreementId }, ToResponse(ag));
        }

        private static AgreementResponse ToResponse(TenancyAgreement a) => new(
            a.AgreementId, a.ApplicationId, a.PropertyId, a.ContractNumber,
            a.AgreementType.ToString(), a.LeaseStartDate, a.LeaseEndDate,
            a.WeeklyRent, a.RentFrequency.ToString(), a.BondAmount,
            a.WaterChargesPaid, a.PetsApproved, a.CreatedAt
        );
    }

    // ── Reviews ──────────────────────────────────────────────────────────────

    [ApiController]
    [Route("api/[controller]")]
    public class ReviewsController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ReviewsController(AppDbContext db) => _db = db;

        [HttpGet("by-reviewee/{revieweeId}")]
        public async Task<IActionResult> GetByReviewee(Guid revieweeId) =>
            Ok(await _db.Reviews
                .Where(r => r.RevieweeId == revieweeId)
                .Select(r => ToResponse(r))
                .ToListAsync());

        [HttpPost]
        public async Task<IActionResult> Create(CreateReviewRequest req)
        {
            if (req.Rating < 1 || req.Rating > 5) return BadRequest("Rating must be 1–5.");
            if (!Enum.TryParse<ReviewerRole>(req.ReviewerRole, out var role))
                return BadRequest("Invalid ReviewerRole.");

            var review = new Review
            {
                ReviewerId   = req.ReviewerId,
                RevieweeId   = req.RevieweeId,
                AnonymousHash = Guid.NewGuid().ToString("N"),  // server-generated, never returned
                ReviewerRole = role,
                Rating       = req.Rating,
                Comment      = req.Comment
            };
            _db.Reviews.Add(review);
            await _db.SaveChangesAsync();

            await RecalculateScore(req.RevieweeId);

            return Created(string.Empty, ToResponse(review));
        }

        private async Task RecalculateScore(Guid revieweeId)
        {
            var reviews = await _db.Reviews.Where(r => r.RevieweeId == revieweeId).ToListAsync();
            var score = await _db.ReputationScores.FirstOrDefaultAsync(s => s.UserId == revieweeId);
            if (score is null)
            {
                score = new ReputationScore { UserId = revieweeId };
                _db.ReputationScores.Add(score);
            }
            score.TotalReviews  = reviews.Count;
            score.AverageRating = reviews.Count > 0 ? (decimal)reviews.Average(r => r.Rating) : 0;
            score.LastUpdated   = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        // ReviewerId deliberately excluded from response
        private static ReviewResponse ToResponse(Review r) => new(
            r.ReviewId, r.RevieweeId, r.ReviewerRole.ToString(),
            r.Rating, r.Comment, r.CreatedAt
        );
    }

    // ── Reputation ───────────────────────────────────────────────────────────

    [ApiController]
    [Route("api/[controller]")]
    public class ReputationController : ControllerBase
    {
        private readonly AppDbContext _db;
        public ReputationController(AppDbContext db) => _db = db;

        [HttpGet("{userId}")]
        public async Task<IActionResult> Get(Guid userId)
        {
            var score = await _db.ReputationScores.FirstOrDefaultAsync(s => s.UserId == userId);
            if (score is null) return NotFound();
            return Ok(new ReputationScoreResponse(
                score.UserId, score.AverageRating, score.TotalReviews, score.LastUpdated
            ));
        }
    }
}
