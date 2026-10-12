/**
 * Investorgate rental application: structure, starting values and validation.
 *
 * The 16 sections of the Fields Mapping Matrix (based on RTA Form 22) are grouped
 * into 8 tabs. Lease start and term follow Form 18a (General Tenancy Agreement).
 */

export const TABS = [
  {
    id: "property",
    title: "Property and tenancy",
    lede: "Choose the property and tell us when you'd like to move in.",
    sections: "Form 22 sections 1, 2, 3, 14 and Form 18a items 2 and 6",
  },
  {
    id: "occupants",
    title: "Occupants",
    lede: "Everyone who will live at the property, including children.",
    sections: "Form 22 section 4",
  },
  {
    id: "applicant",
    title: "Your details",
    lede: "Details for the person completing this application.",
    sections: "Form 22 section 5",
  },
  {
    id: "employment",
    title: "Employment and income",
    lede: "Your current work and income, so the property manager can assess affordability.",
    sections: "Form 22 section 6",
  },
  {
    id: "history",
    title: "Rental history and references",
    lede: "Where you've lived before and who can vouch for you.",
    sections: "Form 22 sections 10 and 11",
  },
  {
    id: "documents",
    title: "Supporting documents",
    lede: "Proof of income, identity and suitability.",
    sections: "Form 22 sections 7, 8 and 9",
  },
  {
    id: "petsVehicles",
    title: "Pets and vehicles",
    lede: "Any pets you plan to keep and vehicles you'll park at the property.",
    sections: "Form 22 sections 12 and 13",
  },
  {
    id: "declaration",
    title: "Review and declaration",
    lede: "Check your application, read the declaration and sign.",
    sections: "Form 22 sections 15 and 16",
  },
];

export const LEASE_TERMS = ["6 months", "12 months", "18 months", "24 months", "Periodic (no fixed end)"];
export const ID_TYPES = ["Driver licence", "Passport", "Proof of age card", "Medicare card", "Other photo ID"];
export const LIVING_ARRANGEMENTS = ["Renting", "Own home", "Living with family or friends", "Boarding", "Other"];
export const EMPLOYMENT_STATUSES = ["Employed full time", "Employed part time", "Casual", "Self-employed", "Student", "Retired", "Not working"];
export const RELATIONSHIPS = ["Partner", "Child", "Parent", "Sibling", "Friend or housemate", "Other relative", "Other"];
export const STATES = ["QLD", "NSW", "VIC", "ACT", "SA", "WA", "TAS", "NT"];

let nextId = 1;
export const uid = () => `row-${Date.now().toString(36)}-${nextId++}`;

export const emptyOccupant = () => ({
  id: uid(), firstName: "", lastName: "", dob: "", relationship: "", email: "", phone: "", onLease: false,
});
export const emptyRental = () => ({
  id: uid(), address: "", start: "", end: "", managerName: "", managerPhone: "", managerEmail: "",
  weeklyRent: "", reasonForLeaving: "",
});
export const emptyReferee = () => ({ id: uid(), name: "", relationship: "", phone: "", email: "" });
export const emptyPet = () => ({ id: uid(), type: "", count: 1, description: "", photos: [] });

export function initialForm(user, propertyId = "") {
  return {
    property: {
      propertyId,
      moveInDate: "",
      leaseTerm: "12 months",
      targetSuburb: "",
      targetPostcode: "",
      bedrooms: "",
      submissionMethod: "Online",
    },
    occupants: { total: 1, under18: 0, people: [] },
    applicant: {
      firstName: user?.firstName ?? "",
      lastName: user?.lastName ?? "",
      dob: "",
      email: user?.email ?? "",
      phone: user?.phone ?? "",
      address: "", suburb: "", state: "QLD", postcode: "",
      emergencyName: "", emergencyPhone: "", emergencyEmail: "",
    },
    employment: {
      status: "",
      employerName: "", jobTitle: "", employerPhone: "", employerEmail: "", employerAddress: "",
      startDate: "", weeklyIncome: "", otherIncome: "",
    },
    history: {
      leaseExpiry: "",
      livingArrangement: "",
      rentals: [emptyRental()],
      referees: [emptyReferee(), emptyReferee()],
    },
    documents: {
      payslips: [], bankStatements: [], centrelink: [], savings: [],
      idType: "", idFiles: [],
      suitability: [],
    },
    petsVehicles: {
      hasPets: "",
      pets: [],
      hasVehicles: "",
      cars: 0, motorbikes: 0, trailers: 0, otherVehicles: 0,
    },
    declaration: {
      databaseConsent: false, truthful: false, privacy: false,
      signature: "", signedOn: "",
    },
  };
}

/** Keep the co-occupant list in step with the occupant count (the applicant is occupant 1). */
export function resizeOccupants(occupants, total) {
  const wanted = Math.max(0, total - 1);
  const people = occupants.people.slice(0, wanted);
  while (people.length < wanted) people.push(emptyOccupant());
  return { ...occupants, total, under18: Math.min(occupants.under18, wanted), people };
}

/** Co-occupants are listed adults first; the last `under18` cards are children. */
export const isChildSlot = (occupants, index) => index >= occupants.people.length - occupants.under18;

/* ── Validation ────────────────────────────────────────────────────────── */

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE = /^[+\d][\d\s()-]{7,}$/;
const POSTCODE = /^\d{4}$/;

const blank = (v) => v === undefined || v === null || String(v).trim() === "";
const today = () => new Date(new Date().toDateString());

export function ageOn(dob, when = new Date()) {
  const d = new Date(dob);
  let age = when.getFullYear() - d.getFullYear();
  const m = when.getMonth() - d.getMonth();
  if (m < 0 || (m === 0 && when.getDate() < d.getDate())) age--;
  return age;
}

function req(errors, key, value, message) {
  if (blank(value)) errors[key] = message;
}

const validators = {
  property(d) {
    const e = {};
    req(e, "propertyId", d.propertyId, "Choose the property you're applying for.");
    req(e, "moveInDate", d.moveInDate, "Enter your preferred move-in date.");
    if (!blank(d.moveInDate) && new Date(d.moveInDate) < today()) e.moveInDate = "Choose a date from today onwards.";
    req(e, "leaseTerm", d.leaseTerm, "Choose a lease term.");
    if (!blank(d.targetPostcode) && !POSTCODE.test(d.targetPostcode)) e.targetPostcode = "Postcodes have 4 digits.";
    return e;
  },

  occupants(d) {
    const e = {};
    if (!(d.total >= 1)) e.total = "At least one person must live at the property.";
    d.people.forEach((p, i) => {
      const child = isChildSlot(d, i);
      req(e, `people.${i}.firstName`, p.firstName, "Enter a first name.");
      req(e, `people.${i}.lastName`, p.lastName, "Enter a last name.");
      req(e, `people.${i}.dob`, p.dob, "Enter a date of birth.");
      req(e, `people.${i}.relationship`, p.relationship, "Choose their relationship to you.");
      if (!blank(p.dob)) {
        const age = ageOn(p.dob);
        if (child && age >= 18) e[`people.${i}.dob`] = "This person is 18 or over. Lower the number of occupants under 18.";
        if (!child && age < 18) e[`people.${i}.dob`] = "This person is under 18. Raise the number of occupants under 18.";
      }
      if (!child && !blank(p.email) && !EMAIL.test(p.email)) e[`people.${i}.email`] = "Enter a valid email address.";
    });
    return e;
  },

  applicant(d) {
    const e = {};
    req(e, "firstName", d.firstName, "Enter your first name.");
    req(e, "lastName", d.lastName, "Enter your last name.");
    req(e, "dob", d.dob, "Enter your date of birth.");
    if (!blank(d.dob) && ageOn(d.dob) < 18) e.dob = "The main applicant must be 18 or over.";
    if (!EMAIL.test(d.email ?? "")) e.email = "Enter a valid email address.";
    if (!PHONE.test(d.phone ?? "")) e.phone = "Enter a phone number with at least 8 digits.";
    req(e, "address", d.address, "Enter your current street address.");
    req(e, "suburb", d.suburb, "Enter your suburb.");
    if (!POSTCODE.test(d.postcode ?? "")) e.postcode = "Postcodes have 4 digits.";
    req(e, "emergencyName", d.emergencyName, "Enter an emergency contact.");
    if (!PHONE.test(d.emergencyPhone ?? "")) e.emergencyPhone = "Enter a phone number with at least 8 digits.";
    return e;
  },

  employment(d) {
    const e = {};
    req(e, "status", d.status, "Choose your employment status.");
    const working = ["Employed full time", "Employed part time", "Casual", "Self-employed"].includes(d.status);
    if (working) {
      req(e, "employerName", d.employerName, "Enter your employer's name.");
      req(e, "jobTitle", d.jobTitle, "Enter your job title.");
      req(e, "startDate", d.startDate, "Enter the date you started.");
      if (!blank(d.employerEmail) && !EMAIL.test(d.employerEmail)) e.employerEmail = "Enter a valid email address.";
    }
    if (blank(d.weeklyIncome) || Number(d.weeklyIncome) < 0) e.weeklyIncome = "Enter your gross weekly income. Use 0 if you have none.";
    return e;
  },

  history(d) {
    const e = {};
    req(e, "livingArrangement", d.livingArrangement, "Choose your current living arrangement.");
    if (d.livingArrangement === "Renting") req(e, "leaseExpiry", d.leaseExpiry, "Enter when your current lease ends.");
    d.rentals.forEach((r, i) => {
      req(e, `rentals.${i}.address`, r.address, "Enter the address.");
      req(e, `rentals.${i}.start`, r.start, "Enter the start date.");
      if (!blank(r.start) && !blank(r.end) && new Date(r.end) < new Date(r.start)) e[`rentals.${i}.end`] = "The end date must be after the start date.";
      if (!blank(r.managerEmail) && !EMAIL.test(r.managerEmail)) e[`rentals.${i}.managerEmail`] = "Enter a valid email address.";
    });
    d.referees.forEach((r, i) => {
      req(e, `referees.${i}.name`, r.name, "Enter the referee's name.");
      req(e, `referees.${i}.relationship`, r.relationship, "Enter how they know you.");
      if (!PHONE.test(r.phone ?? "")) e[`referees.${i}.phone`] = "Enter a phone number with at least 8 digits.";
    });
    return e;
  },

  documents(d) {
    const e = {};
    const income = d.payslips.length + d.bankStatements.length + d.centrelink.length + d.savings.length;
    if (income === 0) e.financial = "Attach at least one proof of income or savings.";
    req(e, "idType", d.idType, "Choose the type of ID you're providing.");
    if (d.idFiles.length === 0) e.idFiles = "Attach a copy of your ID.";
    return e;
  },

  petsVehicles(d) {
    const e = {};
    req(e, "hasPets", d.hasPets, "Tell us whether you'll keep pets.");
    if (d.hasPets === "yes") {
      if (d.pets.length === 0) e.pets = "Add at least one pet.";
      d.pets.forEach((p, i) => {
        req(e, `pets.${i}.type`, p.type, "Enter the type of animal.");
        if (!(p.count >= 1)) e[`pets.${i}.count`] = "Enter how many.";
      });
    }
    req(e, "hasVehicles", d.hasVehicles, "Tell us whether you'll park vehicles.");
    if (d.hasVehicles === "yes" && d.cars + d.motorbikes + d.trailers + d.otherVehicles === 0) {
      e.vehicles = "Enter at least one vehicle.";
    }
    return e;
  },

  declaration(d, form) {
    const e = {};
    if (!d.databaseConsent) e.databaseConsent = "You need to accept the tenancy database check to apply.";
    if (!d.truthful) e.truthful = "Confirm the information you've given is true.";
    if (!d.privacy) e.privacy = "Accept the privacy statement to continue.";
    const expected = `${form.applicant.firstName} ${form.applicant.lastName}`.trim().toLowerCase();
    if (blank(d.signature)) e.signature = "Type your full name to sign.";
    else if (expected && d.signature.trim().toLowerCase() !== expected) {
      e.signature = `Type your name exactly as it appears in Your details: ${form.applicant.firstName} ${form.applicant.lastName}.`;
    }
    return e;
  },
};

export function validateTab(tabId, form) {
  return validators[tabId](form[tabId], form);
}
