import { Checkbox, Section, TextField } from "../fields";
import { TABS } from "../formSchema";

const plural = (n, one, many) => `${n} ${n === 1 ? one : many}`;

function petsLine(pv) {
  if (pv.hasPets === "no") return "No pets";
  if (pv.hasPets !== "yes") return null;
  return plural(pv.pets.reduce((n, p) => n + p.count, 0), "pet", "pets");
}

function vehiclesLine(pv) {
  if (pv.hasVehicles === "no") return "no vehicles";
  if (pv.hasVehicles !== "yes") return null;
  return plural(pv.cars + pv.motorbikes + pv.trailers + pv.otherVehicles, "vehicle", "vehicles");
}

/** Tab 8: Form 22 sections 15 and 16. Staff-only "office use" fields are not shown to applicants. */
export default function DeclarationTab({ data, update, errors, form, completion, goTo, property }) {
  const others = TABS.filter((t) => t.id !== "declaration");
  const todayLabel = new Date().toLocaleDateString("en-AU", { day: "numeric", month: "long", year: "numeric" });
  const name = `${form.applicant.firstName} ${form.applicant.lastName}`.trim();

  const facts = {
    property: property ? [property.address, property.suburb].filter(Boolean).join(", ") : "No property chosen",
    occupants: `${form.occupants.total} ${form.occupants.total === 1 ? "occupant" : "occupants"}`,
    applicant: name || "Name missing",
    employment: form.employment.status || "Not answered",
    history: `${form.history.rentals.length} ${form.history.rentals.length === 1 ? "rental" : "rentals"}, ${form.history.referees.length} referees`,
    documents: `${["payslips", "bankStatements", "centrelink", "savings", "idFiles", "suitability"]
      .reduce((n, k) => n + form.documents[k].length, 0)} files attached`,
    petsVehicles: [
      petsLine(form.petsVehicles),
      vehiclesLine(form.petsVehicles),
    ].filter(Boolean).join(", ") || "Not answered",
  };

  return (
    <>
      <Section title="Check your application">
        <ul className="af-review af-field--wide">
          {others.map((t) => (
            <li key={t.id}>
              <span className={`af-review__mark${completion[t.id] ? " is-done" : ""}`} aria-hidden="true">
                {completion[t.id] ? "✓" : "!"}
              </span>
              <div>
                <p className="af-review__title">{t.title}</p>
                <p className="af-review__meta">
                  {completion[t.id] ? facts[t.id] : "Not finished yet"}
                </p>
              </div>
              <button type="button" className="text-link" onClick={() => goTo(t.id)}>
                {completion[t.id] ? "Edit" : "Finish"}<span className="visually-hidden"> {t.title}</span>
              </button>
            </li>
          ))}
        </ul>
      </Section>

      <Section title="Tenancy database check" source="Form 22 section 15">
        <div className="af-note af-field--wide">
          <p>
            The property manager may check whether you're listed on a residential tenancy database. If you are, they must
            tell you which database and how to contact its operator within 7 days.
          </p>
          <p>The agency hasn't named the database it uses yet. Ask the property manager if you'd like to know before you apply.</p>
        </div>
        <div className="af-field--wide">
          <Checkbox checked={data.databaseConsent} onChange={(v) => update({ databaseConsent: v })} error={errors.databaseConsent}>
            I understand the property manager may check a tenancy database before deciding on my application.
          </Checkbox>
        </div>
      </Section>

      <Section title="Declaration" source="Form 22 section 16">
        <div className="af-field--wide af-stack af-stack--tight">
          <Checkbox checked={data.truthful} onChange={(v) => update({ truthful: v })} error={errors.truthful}>
            The information in this application is true and complete. I understand that giving false or misleading
            information may lead to my application being refused or a tenancy being ended.
          </Checkbox>
          <Checkbox checked={data.privacy} onChange={(v) => update({ privacy: v })} error={errors.privacy}>
            I agree that the property manager can contact my referees, employer and previous property managers, and use
            my personal information to assess this application.
          </Checkbox>
        </div>
        <TextField label="Signature" placeholder="Type your full name" autoComplete="off"
          hint={name ? `Type ${name} to sign.` : "Type your full name to sign."}
          value={data.signature} onChange={(v) => update({ signature: v })} error={errors.signature} />
        <div className="af-field">
          <p className="af-label">Date signed</p>
          <p className="af-static">{todayLabel}</p>
        </div>
      </Section>
    </>
  );
}
