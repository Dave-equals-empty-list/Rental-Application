import { apiPatch, apiPost } from "./client";

const orNull = (v) => (v === "" || v === undefined ? null : v);
const WORKING = ["Employed full time", "Employed part time", "Casual", "Self-employed"];

/**
 * The backend has no tables yet for preferences, referees, pets, vehicles or documents.
 * Until it does, a plain-text summary goes into the application's Notes field (max 1000
 * characters) so the property manager can still see it.
 */
export function buildNotes(form) {
  const { property: p, employment: e, history: h, petsVehicles: pv, documents: d } = form;
  const lines = [
    `Move-in: ${p.moveInDate}. Lease term: ${p.leaseTerm}.`,
    (p.targetSuburb || p.targetPostcode || p.bedrooms) &&
      `Looking in: ${[p.targetSuburb, p.targetPostcode].filter(Boolean).join(" ") || "any area"}, ${p.bedrooms || "any"} bedrooms.`,
    `Living arrangement: ${h.livingArrangement}. Employment: ${e.status}.`,
    `Income: $${e.weeklyIncome}/wk${e.otherIncome ? ` + $${e.otherIncome}/wk other` : ""}.`,
    `Referees: ${h.referees.map((r) => `${r.name} (${r.relationship}, ${r.phone})`).join("; ")}.`,
    pv.hasPets === "yes"
      ? `Pets: ${pv.pets.map((x) => `${x.count} ${x.type}${x.description ? ` - ${x.description}` : ""}`).join("; ")}.`
      : "Pets: none.",
    pv.hasVehicles === "yes"
      ? `Vehicles: ${pv.cars} car, ${pv.motorbikes} motorbike, ${pv.trailers} boat/trailer/caravan, ${pv.otherVehicles} other.`
      : "Vehicles: none.",
    `ID: ${d.idType}. Documents held by applicant, not uploaded.`,
  ].filter(Boolean);
  const text = lines.join("\n");
  return text.length > 1000 ? `${text.slice(0, 997)}...` : text;
}

/**
 * Sends the application to the API in the order its foreign keys require:
 * application, applicants, employment, rental history, then marks it Submitted.
 * `onStep` receives a short description of each stage for the progress display.
 */
export async function submitApplication(form, user, onStep = () => {}) {
  const { property, occupants, applicant: a, employment: e, history } = form;

  onStep("Creating your application");
  const app = await apiPost("/api/applications", {
    userId: user.userId,
    propertyId: property.propertyId,
    totalOccupants: occupants.total,
    leaseExpiryDate: orNull(history.leaseExpiry),
    notes: buildNotes(form),
  });

  onStep("Adding the people on your application");
  const primary = await apiPost("/api/applicants", {
    applicationId: app.applicationId,
    firstName: a.firstName,
    lastName: a.lastName,
    dateOfBirth: a.dob,
    phone: orNull(a.phone),
    email: orNull(a.email),
    isPrimary: true,
    emergencyContactName: orNull(a.emergencyName),
    emergencyContactPhone: orNull(a.emergencyPhone),
    emergencyContactEmail: orNull(a.emergencyEmail),
  });
  for (const p of occupants.people) {
    await apiPost("/api/applicants", {
      applicationId: app.applicationId,
      firstName: p.firstName,
      lastName: p.lastName,
      dateOfBirth: p.dob,
      phone: orNull(p.phone),
      email: orNull(p.email),
      isPrimary: false,
    });
  }

  if (WORKING.includes(e.status)) {
    onStep("Adding your employment");
    await apiPost("/api/employment", {
      applicantId: primary.applicantId,
      employerName: e.employerName,
      jobTitle: orNull(e.jobTitle),
      employerAddress: orNull(e.employerAddress),
      employerPhone: orNull(e.employerPhone),
      isCurrent: true,
      startDate: orNull(e.startDate),
      endDate: null,
      annualIncome: Math.round(Number(e.weeklyIncome) * 52 * 100) / 100,
    });
  }

  if (history.rentals.length) {
    onStep("Adding your rental history");
    for (const r of history.rentals) {
      await apiPost("/api/rentalhistory", {
        applicationId: app.applicationId,
        previousAddress: r.address,
        landlordName: orNull(r.managerName),
        landlordPhone: orNull(r.managerPhone),
        landlordEmail: orNull(r.managerEmail),
        tenancyStart: orNull(r.start),
        tenancyEnd: orNull(r.end),
        weeklyRent: r.weeklyRent === "" ? null : Number(r.weeklyRent),
        reasonForLeaving: orNull(r.reasonForLeaving),
      });
    }
  }

  onStep("Submitting");
  return apiPatch(`/api/applications/${app.applicationId}/status`, "Submitted");
}
