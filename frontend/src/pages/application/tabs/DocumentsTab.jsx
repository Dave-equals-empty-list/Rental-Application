import { FileDrop, Section, SelectField } from "../fields";
import { ID_TYPES } from "../formSchema";

/** Tab 6: Form 22 sections 7, 8 and 9. */
export default function DocumentsTab({ data, update, errors }) {
  const files = (key, props) => ({ files: data[key], onChange: (v) => update({ [key]: v }), ...props });

  return (
    <>
      <div className="af-note">
        <p>
          Files stay on this device for now. Investorgate can't upload documents yet, so the property manager may ask you
          to send them separately.
        </p>
      </div>

      <Section title="Proof of income" source="Form 22 section 7"
        description="Attach at least one. Recent documents (from the last 3 months) are best.">
        <FileDrop label="Payslips" hint="Your 2 most recent payslips." {...files("payslips")} />
        <FileDrop label="Bank statements" {...files("bankStatements")} />
        <FileDrop label="Centrelink letters" {...files("centrelink")} />
        <FileDrop label="Proof of savings or assets" {...files("savings")} error={errors.financial} />
      </Section>

      <Section title="Identity" source="Form 22 section 8">
        <SelectField label="Type of ID" options={ID_TYPES} value={data.idType}
          onChange={(v) => update({ idType: v })} error={errors.idType} />
        <FileDrop label="Copy of your ID" hint="Make sure your name, photo and expiry date are easy to read."
          {...files("idFiles")} error={errors.idFiles} />
      </Section>

      <Section title="Other supporting documents" source="Form 22 section 9"
        description="Optional. For example a rental ledger, written references or a cover letter.">
        <FileDrop label="Supporting documents" {...files("suitability")} />
      </Section>
    </>
  );
}
