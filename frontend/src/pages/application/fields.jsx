import { useId, useRef, useState } from "react";

/** A group of related fields, labelled with the RTA form section it covers. */
export function Section({ title, source, description, children, action }) {
  return (
    <fieldset className="af-section">
      <legend className="af-section__head">
        <span className="af-section__title">{title}</span>
        {source && <span className="af-section__source">{source}</span>}
      </legend>
      {description && <p className="af-section__desc">{description}</p>}
      <div className="af-grid">{children}</div>
      {action}
    </fieldset>
  );
}

function Shell({ id, label, optional, hint, error, wide, children }) {
  return (
    <div className={`af-field${wide ? " af-field--wide" : ""}${error ? " af-field--error" : ""}`}>
      <label htmlFor={id} className="af-label">
        {label}
        {optional && <span className="af-optional">Optional</span>}
      </label>
      {children}
      {hint && !error && <p className="af-hint" id={`${id}-hint`}>{hint}</p>}
      {error && <p className="af-error" id={`${id}-error`}>{error}</p>}
    </div>
  );
}

const describedBy = (id, hint, error) => (error ? `${id}-error` : hint ? `${id}-hint` : undefined);

export function TextField({ label, value, onChange, error, hint, optional, wide, type = "text", ...rest }) {
  const id = useId();
  return (
    <Shell id={id} label={label} optional={optional} hint={hint} error={error} wide={wide}>
      <input
        id={id}
        className="af-input"
        type={type}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
        {...rest}
      />
    </Shell>
  );
}

export function MoneyField({ label, value, onChange, error, hint, optional, wide, suffix = "per week" }) {
  const id = useId();
  return (
    <Shell id={id} label={label} optional={optional} hint={hint} error={error} wide={wide}>
      <div className="af-affix">
        <span className="af-affix__pre" aria-hidden="true">$</span>
        <input
          id={id}
          className="af-input"
          type="number"
          inputMode="decimal"
          min="0"
          step="0.01"
          value={value ?? ""}
          onChange={(e) => onChange(e.target.value)}
          aria-invalid={error ? true : undefined}
          aria-describedby={describedBy(id, hint, error)}
        />
        <span className="af-affix__post">{suffix}</span>
      </div>
    </Shell>
  );
}

export function TextArea({ label, value, onChange, error, hint, optional, rows = 3, maxLength }) {
  const id = useId();
  return (
    <Shell id={id} label={label} optional={optional} hint={hint} error={error} wide>
      <textarea
        id={id}
        className="af-input af-textarea"
        rows={rows}
        maxLength={maxLength}
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
      />
    </Shell>
  );
}

export function SelectField({ label, value, onChange, options, error, hint, optional, wide, placeholder = "Select" }) {
  const id = useId();
  return (
    <Shell id={id} label={label} optional={optional} hint={hint} error={error} wide={wide}>
      <select
        id={id}
        className="af-input af-select"
        value={value ?? ""}
        onChange={(e) => onChange(e.target.value)}
        aria-invalid={error ? true : undefined}
        aria-describedby={describedBy(id, hint, error)}
      >
        <option value="">{placeholder}</option>
        {options.map((o) => {
          const opt = typeof o === "string" ? { value: o, label: o } : o;
          return <option key={opt.value} value={opt.value}>{opt.label}</option>;
        })}
      </select>
    </Shell>
  );
}

/** − n + control for small counts (occupants, pets, vehicles). */
export function Stepper({ label, value, onChange, min = 0, max = 20, error, hint }) {
  const id = useId();
  const set = (n) => onChange(Math.min(max, Math.max(min, n)));
  return (
    <Shell id={id} label={label} hint={hint} error={error}>
      <div className="af-stepper">
        <button type="button" onClick={() => set(value - 1)} disabled={value <= min} aria-label={`Decrease ${label}`}>−</button>
        <input
          id={id}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          value={value}
          onChange={(e) => set(Number(e.target.value) || min)}
          aria-describedby={describedBy(id, hint, error)}
        />
        <button type="button" onClick={() => set(value + 1)} disabled={value >= max} aria-label={`Increase ${label}`}>+</button>
      </div>
    </Shell>
  );
}

/** Yes / No question as a pair of radio buttons. */
export function YesNo({ label, value, onChange, error, hint }) {
  const name = useId();
  return (
    <div className={`af-field af-field--wide${error ? " af-field--error" : ""}`} role="radiogroup" aria-labelledby={`${name}-l`}>
      <p className="af-label" id={`${name}-l`}>{label}</p>
      <div className="af-choice">
        {[["yes", "Yes"], ["no", "No"]].map(([v, text]) => (
          <label key={v} className={`af-choice__opt${value === v ? " is-on" : ""}`}>
            <input type="radio" name={name} value={v} checked={value === v} onChange={() => onChange(v)} />
            {text}
          </label>
        ))}
      </div>
      {hint && !error && <p className="af-hint">{hint}</p>}
      {error && <p className="af-error">{error}</p>}
    </div>
  );
}

export function Checkbox({ checked, onChange, children, error }) {
  return (
    <div className={`af-check${error ? " af-field--error" : ""}`}>
      <label>
        <input type="checkbox" checked={checked} onChange={(e) => onChange(e.target.checked)} aria-invalid={error ? true : undefined} />
        <span>{children}</span>
      </label>
      {error && <p className="af-error">{error}</p>}
    </div>
  );
}

const MAX_BYTES = 10 * 1024 * 1024;
const formatSize = (b) => (b < 1024 * 1024 ? `${Math.round(b / 1024)} KB` : `${(b / 1024 / 1024).toFixed(1)} MB`);

/**
 * File picker with drag and drop. Files stay in the browser: the backend has
 * no upload endpoint yet, so only names and sizes go into the saved draft.
 */
export function FileDrop({ label, files, onChange, accept = ".pdf,.jpg,.jpeg,.png", hint, error, multiple = true }) {
  const id = useId();
  const input = useRef(null);
  const [dragging, setDragging] = useState(false);
  const [rejected, setRejected] = useState("");

  function add(list) {
    const incoming = Array.from(list);
    const tooBig = incoming.filter((f) => f.size > MAX_BYTES);
    const ok = incoming.filter((f) => f.size <= MAX_BYTES).map((f) => ({ name: f.name, size: f.size, file: f }));
    setRejected(tooBig.length ? `${tooBig.map((f) => f.name).join(", ")} is over 10 MB and wasn't added.` : "");
    onChange(multiple ? [...files, ...ok] : ok.slice(0, 1));
  }

  return (
    <div className={`af-field af-field--wide${error ? " af-field--error" : ""}`}>
      <p className="af-label" id={`${id}-l`}>{label}</p>
      <div
        className={`af-drop${dragging ? " is-dragging" : ""}`}
        onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={(e) => { e.preventDefault(); setDragging(false); add(e.dataTransfer.files); }}
      >
        <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 16V4m0 0-4.5 4.5M12 4l4.5 4.5M4.5 15v3.5a1.5 1.5 0 0 0 1.5 1.5h12a1.5 1.5 0 0 0 1.5-1.5V15" /></svg>
        <span>
          Drag files here or{" "}
          <button type="button" className="text-link" onClick={() => input.current?.click()} aria-describedby={`${id}-l`}>
            choose files
          </button>
        </span>
        <span className="af-drop__meta">PDF, JPG or PNG, up to 10 MB each</span>
        <input
          ref={input}
          type="file"
          hidden
          accept={accept}
          multiple={multiple}
          onChange={(e) => { add(e.target.files); e.target.value = ""; }}
        />
      </div>
      {files.length > 0 && (
        <ul className="af-files">
          {files.map((f, i) => (
            <li key={`${f.name}-${i}`} className={f.file ? "" : "is-stale"}>
              <span className="af-files__name">{f.name}</span>
              <span className="af-files__size">{f.file ? formatSize(f.size) : "Re-attach after reload"}</span>
              <button type="button" className="af-icon-btn" aria-label={`Remove ${f.name}`}
                onClick={() => onChange(files.filter((_, j) => j !== i))}>×</button>
            </li>
          ))}
        </ul>
      )}
      {hint && !error && !rejected && <p className="af-hint">{hint}</p>}
      {rejected && <p className="af-error">{rejected}</p>}
      {error && <p className="af-error">{error}</p>}
    </div>
  );
}

/** A repeatable card (co-occupant, previous rental, referee, pet). */
export function RepeatCard({ title, onRemove, removeLabel, children }) {
  return (
    <div className="af-card">
      <div className="af-card__head">
        <h3>{title}</h3>
        {onRemove && <button type="button" className="text-link af-card__remove" onClick={onRemove}>{removeLabel ?? "Remove"}</button>}
      </div>
      <div className="af-grid">{children}</div>
    </div>
  );
}
