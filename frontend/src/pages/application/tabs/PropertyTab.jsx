import { Section, SelectField, TextField } from "../fields";
import { LEASE_TERMS } from "../formSchema";

const money = (n) => (n == null ? "Not listed" : `$${Number(n).toLocaleString()} per week`);

/** Tab 1: Form 22 sections 1, 2, 3 and 14, Form 18a items 2 and 6, plus search preferences. */
export default function PropertyTab({ data, update, errors, properties, property, propertiesError }) {
  const options = properties.map((p) => ({
    value: p.propertyId,
    label: [p.address, p.suburb, p.postcode].filter(Boolean).join(", "),
  }));

  return (
    <>
      <Section title="Property you're applying for" source="Form 22 section 2">
        <SelectField
          wide
          label="Property"
          value={data.propertyId}
          onChange={(v) => update({ propertyId: v })}
          options={options}
          placeholder={properties.length ? "Choose a property" : "No properties available"}
          error={errors.propertyId || propertiesError}
        />
        {property && (
          <dl className="af-facts af-field--wide">
            <div><dt>Bedrooms</dt><dd>{property.bedrooms ?? "–"}</dd></div>
            <div><dt>Bathrooms</dt><dd>{property.bathrooms ?? "–"}</dd></div>
            <div><dt>Car spaces</dt><dd>{property.carSpaces ?? "–"}</dd></div>
            <div><dt>Rent</dt><dd>{money(property.weeklyRent)}</dd></div>
            <div><dt>Pets</dt><dd>{property.petsAllowed ? "Allowed" : "Not allowed"}</dd></div>
          </dl>
        )}
      </Section>

      <Section title="Property manager or owner" source="Form 22 sections 1 and 3">
        <div className="af-note af-field--wide">
          <p>
            {property?.organisationId
              ? "This property is managed by an agency on Investorgate. Their contact details will be shared with you once your application is received."
              : "The property manager hasn't linked their agency details to this listing yet. You can still apply."}
          </p>
          <p>You're applying online through Investorgate. The property manager may also accept applications by email or in person.</p>
        </div>
      </Section>

      <Section title="Tenancy you're after" source="Form 22 section 14, Form 18a items 2 and 6">
        <TextField
          label="Preferred move-in date"
          type="date"
          value={data.moveInDate}
          onChange={(v) => update({ moveInDate: v })}
          error={errors.moveInDate}
        />
        <SelectField
          label="Lease term"
          value={data.leaseTerm}
          onChange={(v) => update({ leaseTerm: v })}
          options={LEASE_TERMS}
          error={errors.leaseTerm}
        />
      </Section>

      <Section
        title="What you're looking for"
        description="If this property isn't the right fit, these help property managers suggest others."
      >
        <TextField label="Preferred suburb" optional value={data.targetSuburb} onChange={(v) => update({ targetSuburb: v })} />
        <TextField label="Preferred postcode" optional inputMode="numeric" maxLength={4} value={data.targetPostcode}
          onChange={(v) => update({ targetPostcode: v })} error={errors.targetPostcode} />
        <SelectField label="Bedrooms needed" optional value={data.bedrooms} onChange={(v) => update({ bedrooms: v })}
          options={["1", "2", "3", "4", "5+"]} placeholder="Any" />
      </Section>
    </>
  );
}
