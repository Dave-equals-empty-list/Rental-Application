using Investigate.API.Models;
using Microsoft.EntityFrameworkCore;

namespace Investigate.API.Data
{
    public class AppDbContext : DbContext
    {
        public AppDbContext(DbContextOptions<AppDbContext> options) : base(options) { }

        public DbSet<User> Users => Set<User>();
        public DbSet<Organisation> Organisations => Set<Organisation>();
        public DbSet<Property> Properties => Set<Property>();
        public DbSet<RentalApplication> RentalApplications => Set<RentalApplication>();
        public DbSet<Applicant> Applicants => Set<Applicant>();
        public DbSet<Employment> Employments => Set<Employment>();
        public DbSet<FinancialDocument> FinancialDocuments => Set<FinancialDocument>();
        public DbSet<RentalHistory> RentalHistories => Set<RentalHistory>();
        public DbSet<Reference> References => Set<Reference>();
        public DbSet<Pet> Pets => Set<Pet>();
        public DbSet<Vehicle> Vehicles => Set<Vehicle>();
        public DbSet<TenancyAgreement> TenancyAgreements => Set<TenancyAgreement>();
        public DbSet<ServiceCharge> ServiceCharges => Set<ServiceCharge>();
        public DbSet<Repairer> Repairers => Set<Repairer>();
        public DbSet<Review> Reviews => Set<Review>();
        public DbSet<ReputationScore> ReputationScores => Set<ReputationScore>();

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // ── Enum → string conversions ────────────────────────────────────
            modelBuilder.Entity<User>().Property(u => u.Role).HasConversion<string>();
            modelBuilder.Entity<RentalApplication>().Property(a => a.Status).HasConversion<string>();
            modelBuilder.Entity<TenancyAgreement>().Property(a => a.AgreementType).HasConversion<string>();
            modelBuilder.Entity<TenancyAgreement>().Property(a => a.RentFrequency).HasConversion<string>();
            modelBuilder.Entity<ServiceCharge>().Property(s => s.ServiceType).HasConversion<string>();
            modelBuilder.Entity<ServiceCharge>().Property(s => s.ResponsibleParty).HasConversion<string>();
            modelBuilder.Entity<Repairer>().Property(r => r.RepairType).HasConversion<string>();
            modelBuilder.Entity<Review>().Property(r => r.ReviewerRole).HasConversion<string>();
            modelBuilder.Entity<Organisation>().Property(o => o.Type).HasConversion<string>();

            // ── Unique indexes ────────────────────────────────────────────────
            modelBuilder.Entity<User>().HasIndex(u => u.Email).IsUnique();
            modelBuilder.Entity<TenancyAgreement>().HasIndex(a => a.ContractNumber).IsUnique();
            modelBuilder.Entity<Review>().HasIndex(r => r.AnonymousHash).IsUnique();

            // ── Relationships ─────────────────────────────────────────────────

            // User → Organisation (many-to-one)
            modelBuilder.Entity<User>()
                .HasOne(u => u.Organisation)
                .WithMany(o => o.Members)
                .HasForeignKey("OrganisationId")
                .IsRequired(false)
                .OnDelete(DeleteBehavior.SetNull);

            // User → ReputationScore (one-to-one)
            modelBuilder.Entity<ReputationScore>()
                .HasOne(r => r.User)
                .WithOne(u => u.ReputationScore)
                .HasForeignKey<ReputationScore>(r => r.UserId)
                .OnDelete(DeleteBehavior.Cascade);

            // Review → Reviewer (restrict to avoid cycles)
            modelBuilder.Entity<Review>()
                .HasOne(r => r.Reviewer)
                .WithMany(u => u.ReviewsGiven)
                .HasForeignKey(r => r.ReviewerId)
                .OnDelete(DeleteBehavior.Restrict);

            // RentalApplication → User
            modelBuilder.Entity<RentalApplication>()
                .HasOne(a => a.User)
                .WithMany(u => u.Applications)
                .HasForeignKey(a => a.UserId)
                .OnDelete(DeleteBehavior.Restrict);

            // TenancyAgreement → Application (one-to-one)
            modelBuilder.Entity<TenancyAgreement>()
                .HasOne(t => t.Application)
                .WithOne(a => a.TenancyAgreement)
                .HasForeignKey<TenancyAgreement>(t => t.ApplicationId)
                .OnDelete(DeleteBehavior.Restrict);

            // TenancyAgreement → Property
            modelBuilder.Entity<TenancyAgreement>()
                .HasOne(t => t.Property)
                .WithMany(p => p.Agreements)
                .HasForeignKey(t => t.PropertyId)
                .OnDelete(DeleteBehavior.Restrict);
        }
    }
}
