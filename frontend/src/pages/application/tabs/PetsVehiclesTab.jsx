import { FileDrop, RepeatCard, Section, Stepper, TextArea, TextField, YesNo } from "../fields";
import { emptyPet } from "../formSchema";

/** Tab 7: Form 22 sections 12 and 13. */
export default function PetsVehiclesTab({ data, update, errors, property }) {
  const setPet = (i, patch) => update({ pets: data.pets.map((p, j) => (j === i ? { ...p, ...patch } : p)) });

  function answerPets(v) {
    update({ hasPets: v, pets: v === "yes" && data.pets.length === 0 ? [emptyPet()] : v === "no" ? [] : data.pets });
  }

  return (
    <>
      <Section
        title="Pets"
        source="Form 22 section 12"
        action={data.hasPets === "yes" && (
          <button type="button" className="af-add" onClick={() => update({ pets: [...data.pets, emptyPet()] })}>
            Add another pet
          </button>
        )}
      >
        {property && (
          <p className={`af-rule af-field--wide${property.petsAllowed ? "" : " af-rule--warn"}`}>
            {property.petsAllowed
              ? "The owner allows pets at this property, subject to approval."
              : "This property's listing says pets aren't allowed. You can still tell us about them, but approval is unlikely."}
          </p>
        )}
        <YesNo label="Do you plan to keep any pets at the property?" value={data.hasPets} onChange={answerPets}
          error={errors.hasPets || errors.pets} />
        {data.hasPets === "yes" && (
          <div className="af-field--wide af-stack">
            {data.pets.map((p, i) => {
              const err = (k) => errors[`pets.${i}.${k}`];
              return (
                <RepeatCard key={p.id} title={`Pet ${i + 1}`}
                  onRemove={data.pets.length > 1 ? () => update({ pets: data.pets.filter((_, j) => j !== i) }) : undefined}>
                  <TextField label="Type of animal" placeholder="For example, dog" value={p.type}
                    onChange={(v) => setPet(i, { type: v })} error={err("type")} />
                  <Stepper label="How many" value={p.count} min={1} max={10}
                    onChange={(n) => setPet(i, { count: n })} error={err("count")} />
                  <TextArea label="Description" optional rows={2} maxLength={300}
                    hint="Breed, size, age, and whether they live inside or outside."
                    value={p.description} onChange={(v) => setPet(i, { description: v })} />
                  <FileDrop label="Photos" accept=".jpg,.jpeg,.png" files={p.photos}
                    onChange={(v) => setPet(i, { photos: v })} />
                </RepeatCard>
              );
            })}
          </div>
        )}
      </Section>

      <Section title="Vehicles" source="Form 22 section 13">
        {property && (
          <p className="af-rule af-field--wide">
            {property.carSpaces
              ? `This property has ${property.carSpaces} car ${property.carSpaces === 1 ? "space" : "spaces"}.`
              : "This property's listing doesn't include off-street parking."}
          </p>
        )}
        <YesNo label="Will you park any vehicles at the property?" value={data.hasVehicles}
          onChange={(v) => update({ hasVehicles: v })} error={errors.hasVehicles || errors.vehicles} />
        {data.hasVehicles === "yes" && (
          <>
            <Stepper label="Cars" value={data.cars} onChange={(n) => update({ cars: n })} max={10} />
            <Stepper label="Motorbikes" value={data.motorbikes} onChange={(n) => update({ motorbikes: n })} max={10} />
            <Stepper label="Boats, trailers or caravans" value={data.trailers} onChange={(n) => update({ trailers: n })} max={10} />
            <Stepper label="Other vehicles" value={data.otherVehicles} onChange={(n) => update({ otherVehicles: n })} max={10} />
          </>
        )}
      </Section>
    </>
  );
}
