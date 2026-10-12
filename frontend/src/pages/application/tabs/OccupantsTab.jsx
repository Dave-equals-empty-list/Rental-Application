import { Checkbox, RepeatCard, Section, SelectField, Stepper, TextField } from "../fields";
import { RELATIONSHIPS, isChildSlot, resizeOccupants } from "../formSchema";

function summary(total, under18) {
  if (total === 1) return "Just you.";
  const adults = total - 1 - under18;
  const parts = [];
  if (adults) parts.push(`${adults} other ${adults === 1 ? "adult" : "adults"}`);
  if (under18) parts.push(`${under18} ${under18 === 1 ? "child" : "children"} under 18`);
  return `You, plus ${parts.join(" and ")}.`;
}

/** Tab 2: Form 22 section 4. Co-occupant cards follow the occupant count. */
export default function OccupantsTab({ data, update, errors }) {
  const setPerson = (i, patch) =>
    update({ people: data.people.map((p, j) => (j === i ? { ...p, ...patch } : p)) });

  let adultNo = 1;
  let childNo = 0;

  return (
    <>
      <Section title="How many people will live there" source="Form 22 section 4">
        <Stepper
          label="Total occupants, including you"
          value={data.total}
          min={1}
          max={10}
          onChange={(n) => update(resizeOccupants(data, n))}
          error={errors.total}
        />
        <Stepper
          label="Occupants under 18"
          value={data.under18}
          min={0}
          max={Math.max(0, data.total - 1)}
          onChange={(n) => update({ under18: n })}
          hint={data.total === 1 ? "Add more occupants first." : undefined}
        />
        <p className="af-summary af-field--wide" aria-live="polite">{summary(data.total, data.under18)}</p>
      </Section>

      {data.people.length > 0 && (
        <Section
          title="Other occupants"
          description="Adults who will also sign the lease need to complete their own Investorgate application."
        >
          <div className="af-field--wide af-stack">
            {data.people.map((p, i) => {
              const child = isChildSlot(data, i);
              const title = child ? `Child ${++childNo}` : `Adult ${++adultNo}`;
              const err = (k) => errors[`people.${i}.${k}`];
              return (
                <RepeatCard key={p.id} title={title}>
                  <TextField label="First name" value={p.firstName} onChange={(v) => setPerson(i, { firstName: v })} error={err("firstName")} autoComplete="off" />
                  <TextField label="Last name" value={p.lastName} onChange={(v) => setPerson(i, { lastName: v })} error={err("lastName")} autoComplete="off" />
                  <TextField label="Date of birth" type="date" value={p.dob} onChange={(v) => setPerson(i, { dob: v })} error={err("dob")} />
                  <SelectField label="Relationship to you" value={p.relationship} onChange={(v) => setPerson(i, { relationship: v })}
                    options={RELATIONSHIPS} error={err("relationship")} />
                  {!child && (
                    <>
                      <TextField label="Email" type="email" optional value={p.email} onChange={(v) => setPerson(i, { email: v })} error={err("email")} />
                      <TextField label="Phone" type="tel" optional value={p.phone} onChange={(v) => setPerson(i, { phone: v })} />
                      <div className="af-field--wide">
                        <Checkbox checked={p.onLease} onChange={(v) => setPerson(i, { onLease: v })}>
                          This person will also sign the lease
                        </Checkbox>
                      </div>
                    </>
                  )}
                </RepeatCard>
              );
            })}
          </div>
        </Section>
      )}
    </>
  );
}
