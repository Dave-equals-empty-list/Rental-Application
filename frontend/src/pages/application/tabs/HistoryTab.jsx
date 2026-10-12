import { MoneyField, RepeatCard, Section, SelectField, TextArea, TextField } from "../fields";
import { LIVING_ARRANGEMENTS, emptyRental, emptyReferee } from "../formSchema";

/** How the backend ranks applications by lease expiry (see CalculateUrgency in the API). */
function urgencyHint(date) {
  if (!date) return "Applicants whose lease ends sooner are reviewed first.";
  const days = Math.ceil((new Date(date) - new Date()) / 86400000);
  if (days < 0) return "This date has passed. If you're out of your lease, it will be treated as urgent.";
  if (days <= 14) return `${days} days away. Your application will be marked most urgent.`;
  if (days <= 30) return `${days} days away. Your application will be marked high priority.`;
  if (days <= 90) return `${days} days away. Your application will be marked medium priority.`;
  return `${days} days away. Applicants whose lease ends sooner are reviewed first.`;
}

/** Tab 5: Form 22 sections 10 and 11, plus current lease expiry (used for urgency). */
export default function HistoryTab({ data, update, errors }) {
  const setRow = (key, i, patch) => update({ [key]: data[key].map((r, j) => (j === i ? { ...r, ...patch } : r)) });
  const removeRow = (key, i) => update({ [key]: data[key].filter((_, j) => j !== i) });

  return (
    <>
      <Section title="Where you live now" source="Form 22 section 10">
        <SelectField label="Current living arrangement" options={LIVING_ARRANGEMENTS}
          value={data.livingArrangement} onChange={(v) => update({ livingArrangement: v })} error={errors.livingArrangement} />
        <TextField label="Current lease end date" type="date" optional={data.livingArrangement !== "Renting"}
          value={data.leaseExpiry} onChange={(v) => update({ leaseExpiry: v })}
          error={errors.leaseExpiry} hint={urgencyHint(data.leaseExpiry)} />
      </Section>

      <Section
        title="Rental history"
        source="Form 22 section 10"
        description="Start with your current or most recent rental. Add up to 3."
        action={data.rentals.length < 3 && (
          <button type="button" className="af-add" onClick={() => update({ rentals: [...data.rentals, emptyRental()] })}>
            Add another rental
          </button>
        )}
      >
        <div className="af-field--wide af-stack">
          {data.rentals.length === 0 && <p className="af-empty">No rentals added. Add one if you've rented before.</p>}
          {data.rentals.map((r, i) => {
            const err = (k) => errors[`rentals.${i}.${k}`];
            const set = (patch) => setRow("rentals", i, patch);
            return (
              <RepeatCard key={r.id} title={i === 0 ? "Most recent rental" : `Earlier rental ${i}`}
                onRemove={() => removeRow("rentals", i)}>
                <TextField label="Address" wide value={r.address} onChange={(v) => set({ address: v })} error={err("address")} />
                <TextField label="Moved in" type="date" value={r.start} onChange={(v) => set({ start: v })} error={err("start")} />
                <TextField label="Moved out" type="date" optional hint="Leave blank if you still live there."
                  value={r.end} onChange={(v) => set({ end: v })} error={err("end")} />
                <MoneyField label="Rent" optional value={r.weeklyRent} onChange={(v) => set({ weeklyRent: v })} />
                <TextField label="Property manager or owner" optional value={r.managerName} onChange={(v) => set({ managerName: v })} />
                <TextField label="Their phone" type="tel" optional value={r.managerPhone} onChange={(v) => set({ managerPhone: v })} />
                <TextField label="Their email" type="email" optional value={r.managerEmail} onChange={(v) => set({ managerEmail: v })} error={err("managerEmail")} />
                <TextArea label="Reason for leaving" optional rows={2} maxLength={500}
                  value={r.reasonForLeaving} onChange={(v) => set({ reasonForLeaving: v })} />
              </RepeatCard>
            );
          })}
        </div>
      </Section>

      <Section
        title="References"
        source="Form 22 section 11"
        description="People who aren't related to you, such as a past property manager, employer or colleague."
        action={data.referees.length < 3 && (
          <button type="button" className="af-add" onClick={() => update({ referees: [...data.referees, emptyReferee()] })}>
            Add another referee
          </button>
        )}
      >
        <div className="af-field--wide af-stack">
          {data.referees.map((r, i) => {
            const err = (k) => errors[`referees.${i}.${k}`];
            const set = (patch) => setRow("referees", i, patch);
            return (
              <RepeatCard key={r.id} title={`Referee ${i + 1}`}
                onRemove={data.referees.length > 1 ? () => removeRow("referees", i) : undefined}>
                <TextField label="Full name" value={r.name} onChange={(v) => set({ name: v })} error={err("name")} />
                <TextField label="How they know you" placeholder="For example, previous property manager"
                  value={r.relationship} onChange={(v) => set({ relationship: v })} error={err("relationship")} />
                <TextField label="Phone" type="tel" value={r.phone} onChange={(v) => set({ phone: v })} error={err("phone")} />
                <TextField label="Email" type="email" optional value={r.email} onChange={(v) => set({ email: v })} />
              </RepeatCard>
            );
          })}
        </div>
      </Section>
    </>
  );
}
