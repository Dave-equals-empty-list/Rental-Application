import { Section, SelectField, TextField } from "../fields";
import { STATES } from "../formSchema";

/** Tab 3: Form 22 section 5, plus an emergency contact (stored on the applicant record). */
export default function ApplicantTab({ data, update, errors }) {
  const f = (key, props = {}) => ({
    value: data[key],
    onChange: (v) => update({ [key]: v }),
    error: errors[key],
    ...props,
  });

  return (
    <>
      <Section title="About you" source="Form 22 section 5">
        <TextField label="First name" autoComplete="given-name" {...f("firstName")} />
        <TextField label="Last name" autoComplete="family-name" {...f("lastName")} />
        <TextField label="Date of birth" type="date" autoComplete="bday" {...f("dob")} />
        <span className="af-spacer" aria-hidden="true" />
        <TextField label="Email" type="email" autoComplete="email" {...f("email")} />
        <TextField label="Phone" type="tel" autoComplete="tel" {...f("phone")} />
      </Section>

      <Section title="Current address" source="Form 22 section 5">
        <TextField label="Street address" wide autoComplete="street-address" {...f("address")} />
        <TextField label="Suburb" autoComplete="address-level2" {...f("suburb")} />
        <SelectField label="State" options={STATES} {...f("state")} />
        <TextField label="Postcode" inputMode="numeric" maxLength={4} autoComplete="postal-code" {...f("postcode")} />
      </Section>

      <Section title="Emergency contact" description="Someone we can contact if we can't reach you. They don't need to live with you.">
        <TextField label="Full name" {...f("emergencyName")} />
        <TextField label="Phone" type="tel" {...f("emergencyPhone")} />
        <TextField label="Email" type="email" optional {...f("emergencyEmail")} />
      </Section>
    </>
  );
}
