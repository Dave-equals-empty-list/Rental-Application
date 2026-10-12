import { MoneyField, Section, SelectField, TextField } from "../fields";
import { EMPLOYMENT_STATUSES } from "../formSchema";

const WORKING = ["Employed full time", "Employed part time", "Casual", "Self-employed"];

function lengthSince(date) {
  if (!date) return undefined;
  const start = new Date(date);
  const now = new Date();
  let months = (now.getFullYear() - start.getFullYear()) * 12 + now.getMonth() - start.getMonth();
  if (now.getDate() < start.getDate()) months--;
  if (months < 0) return undefined;
  const y = Math.floor(months / 12);
  const m = months % 12;
  const parts = [];
  if (y) parts.push(`${y} ${y === 1 ? "year" : "years"}`);
  if (m || !y) parts.push(`${m} ${m === 1 ? "month" : "months"}`);
  return `${parts.join(" ")} with this employer`;
}

/** Tab 4: Form 22 section 6. */
export default function EmploymentTab({ data, update, errors }) {
  const f = (key) => ({ value: data[key], onChange: (v) => update({ [key]: v }), error: errors[key] });
  const working = WORKING.includes(data.status);
  const weekly = Number(data.weeklyIncome) + Number(data.otherIncome || 0);

  return (
    <>
      <Section title="Current employment" source="Form 22 section 6">
        <SelectField label="Employment status" options={EMPLOYMENT_STATUSES} {...f("status")} />
        {working && (
          <>
            <span className="af-spacer" aria-hidden="true" />
            <TextField label={data.status === "Self-employed" ? "Business name" : "Employer"} {...f("employerName")} />
            <TextField label="Job title" {...f("jobTitle")} />
            <TextField label="Start date" type="date" hint={lengthSince(data.startDate)} {...f("startDate")} />
            <span className="af-spacer" aria-hidden="true" />
            <TextField label="Employer phone" type="tel" optional {...f("employerPhone")} />
            <TextField label="Employer email" type="email" optional {...f("employerEmail")} />
            <TextField label="Employer address" wide optional {...f("employerAddress")} />
          </>
        )}
      </Section>

      <Section title="Income" source="Form 22 section 6"
        description="Gross means before tax. Your income is only shared with the property manager for this application.">
        <MoneyField label="Gross weekly income" {...f("weeklyIncome")} />
        <MoneyField label="Other weekly income" optional hint="For example Centrelink, child support or rental income."
          {...f("otherIncome")} />
        {weekly > 0 && (
          <p className="af-summary af-field--wide">
            Total ${weekly.toLocaleString(undefined, { maximumFractionDigits: 2 })} per week, about $
            {Math.round(weekly * 52).toLocaleString()} a year.
          </p>
        )}
      </Section>
    </>
  );
}
