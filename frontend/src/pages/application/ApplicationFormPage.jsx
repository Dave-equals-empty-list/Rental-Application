import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, Navigate, useParams } from "react-router-dom";
import Logo from "../../components/Logo";
import { useAuth } from "../../auth/useAuth";
import { apiGet } from "../../api/client";
import { submitApplication } from "../../api/applications";
import { TABS, initialForm, validateTab } from "./formSchema";
import PropertyTab from "./tabs/PropertyTab";
import OccupantsTab from "./tabs/OccupantsTab";
import ApplicantTab from "./tabs/ApplicantTab";
import EmploymentTab from "./tabs/EmploymentTab";
import HistoryTab from "./tabs/HistoryTab";
import DocumentsTab from "./tabs/DocumentsTab";
import PetsVehiclesTab from "./tabs/PetsVehiclesTab";
import DeclarationTab from "./tabs/DeclarationTab";
import "./ApplicationForm.css";

const TAB_COMPONENTS = {
  property: PropertyTab,
  occupants: OccupantsTab,
  applicant: ApplicantTab,
  employment: EmploymentTab,
  history: HistoryTab,
  documents: DocumentsTab,
  petsVehicles: PetsVehiclesTab,
  declaration: DeclarationTab,
};

/* ── Draft storage: per-tab save state, kept in the browser ──────────────── */

const draftKey = (user) => `ig.application-draft.${user.userId}`;

// File objects can't be saved, so drafts keep only each file's name and size.
function stripFiles(value) {
  if (Array.isArray(value)) return value.map(stripFiles);
  if (value && typeof value === "object") {
    if (value.file instanceof File) return { name: value.name, size: value.size };
    return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, stripFiles(v)]));
  }
  return value;
}

function loadDraft(user) {
  try {
    const raw = localStorage.getItem(draftKey(user));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const timeLabel = (iso) =>
  new Date(iso).toLocaleTimeString("en-AU", { hour: "numeric", minute: "2-digit" });

/* ── Page ─────────────────────────────────────────────────────────────── */

export default function ApplicationFormPage() {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;
  return <ApplicationForm user={user} />;
}

function ApplicationForm({ user }) {
  const { propertyId: routePropertyId } = useParams();

  const [draft] = useState(() => loadDraft(user));
  const [form, setForm] = useState(() => {
    const base = draft?.form ?? initialForm(user);
    return routePropertyId ? { ...base, property: { ...base.property, propertyId: routePropertyId } } : base;
  });
  const [active, setActive] = useState(draft?.active ?? TABS[0].id);
  const [attempted, setAttempted] = useState(() => new Set(draft?.attempted ?? []));
  const [savedAt, setSavedAt] = useState(draft?.savedAt ?? null);
  const [dirty, setDirty] = useState(false);

  const [properties, setProperties] = useState([]);
  const [propertiesError, setPropertiesError] = useState("");

  const [submitting, setSubmitting] = useState(false);
  const [submitStep, setSubmitStep] = useState("");
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(null);

  const mainRef = useRef(null);

  useEffect(() => {
    apiGet("/api/properties")
      .then(setProperties)
      .catch(() => setPropertiesError("Couldn't load properties. Check the backend is running, then reload."));
  }, []);

  const property = properties.find((p) => p.propertyId === form.property.propertyId) ?? null;

  const errorsByTab = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.id, validateTab(t.id, form)])),
    [form]
  );
  const completion = useMemo(
    () => Object.fromEntries(TABS.map((t) => [t.id, Object.keys(errorsByTab[t.id]).length === 0])),
    [errorsByTab]
  );
  // A tab only shows as complete once it has been saved with "Save and continue".
  const shownDone = Object.fromEntries(TABS.map((t) => [t.id, completion[t.id] && attempted.has(t.id)]));
  const doneCount = TABS.filter((t) => shownDone[t.id]).length;

  const saveDraft = useCallback(
    (overrides = {}) => {
      const stamp = new Date().toISOString();
      const payload = {
        form: stripFiles(overrides.form ?? form),
        active: overrides.active ?? active,
        attempted: [...(overrides.attempted ?? attempted)],
        savedAt: stamp,
      };
      try {
        localStorage.setItem(draftKey(user), JSON.stringify(payload));
        setSavedAt(stamp);
        setDirty(false);
      } catch {
        // Storage full or blocked: the form still works, it just won't survive a reload.
      }
    },
    [form, active, attempted, user]
  );

  const update = useCallback((tabId, patch) => {
    setForm((f) => ({ ...f, [tabId]: { ...f[tabId], ...patch } }));
    setDirty(true);
  }, []);

  function goTo(tabId) {
    setActive(tabId);
    saveDraft({ active: tabId });
    mainRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    // Move focus to the new tab's heading for keyboard and screen reader users.
    requestAnimationFrame(() => {
      document.getElementById("af-tab-title")?.focus({ preventScroll: true });
      // On small screens the step list scrolls sideways; keep the current step visible.
      document.querySelector(".af-step.is-active")?.scrollIntoView({ block: "nearest", inline: "nearest" });
    });
  }

  function focusFirstError() {
    requestAnimationFrame(() => {
      const el = mainRef.current?.querySelector('[aria-invalid="true"], .af-field--error input, .af-field--error button');
      el?.focus();
      el?.scrollIntoView({ behavior: "smooth", block: "center" });
    });
  }

  const index = TABS.findIndex((t) => t.id === active);
  const tab = TABS[index];
  const showErrors = attempted.has(active);
  const errors = showErrors ? errorsByTab[active] : {};
  const errorCount = Object.keys(errors).length;

  function saveAndContinue() {
    const nextAttempted = new Set(attempted).add(active);
    setAttempted(nextAttempted);
    if (!completion[active]) {
      saveDraft({ attempted: nextAttempted });
      focusFirstError();
      return;
    }
    const next = TABS[index + 1]?.id ?? active;
    saveDraft({ attempted: nextAttempted, active: next });
    goTo(next);
  }

  async function handleSubmit() {
    const all = new Set(TABS.map((t) => t.id));
    setAttempted(all);
    setSubmitError("");
    const firstIncomplete = TABS.find((t) => !completion[t.id]);
    if (firstIncomplete) {
      if (firstIncomplete.id === active) focusFirstError();
      else setSubmitError(`Finish "${firstIncomplete.title}" before submitting.`);
      return;
    }
    setSubmitting(true);
    try {
      const result = await submitApplication(form, user, setSubmitStep);
      localStorage.removeItem(draftKey(user));
      setSubmitted(result);
    } catch (err) {
      setSubmitError(
        err.code === "OFFLINE"
          ? "Can't reach the Investorgate server. Your draft is saved. Start the backend, then submit again."
          : `The server rejected the application (${err.status ?? "error"}). Your draft is saved. ${err.message}`.trim()
      );
    } finally {
      setSubmitting(false);
      setSubmitStep("");
    }
  }

  if (submitted) return <Submitted application={submitted} property={property} />;

  const TabComponent = TAB_COMPONENTS[active];
  const isLast = index === TABS.length - 1;

  return (
    <div className="af-page">
      <header className="af-topbar">
        <Link to="/properties" aria-label="Investorgate home"><Logo /></Link>
        <div className="af-topbar__save">
          <span className="af-topbar__status" aria-live="polite">
            {dirty ? "Unsaved changes" : savedAt ? `Draft saved at ${timeLabel(savedAt)}` : "Not saved yet"}
          </span>
          <button type="button" className="af-btn af-btn--quiet" onClick={() => saveDraft()} disabled={!dirty}>
            Save draft
          </button>
        </div>
      </header>

      <div className="af-layout">
        {/* ── Step rail ──────────────────────────────────────────────── */}
        <nav className="af-rail" aria-label="Application sections">
          <div className="af-rail__property">
            <p className="af-rail__label">Applying for</p>
            <p className="af-rail__address">{property ? property.address : "No property chosen yet"}</p>
            {property && <p className="af-rail__suburb">{[property.suburb, property.state, property.postcode].filter(Boolean).join(" ")}</p>}
          </div>

          <div className="af-rail__progress">
            <p>{doneCount} of {TABS.length} sections complete</p>
            <div className="af-rail__bar" role="progressbar" aria-valuemin={0} aria-valuemax={TABS.length} aria-valuenow={doneCount}
              aria-label="Sections complete">
              <span style={{ width: `${(doneCount / TABS.length) * 100}%` }} />
            </div>
          </div>

          <ol className="af-steps">
            {TABS.map((t, i) => {
              const done = shownDone[t.id];
              const flagged = attempted.has(t.id) && !done;
              const state = done ? "Complete" : flagged ? "Needs attention" : "Not started";
              return (
                <li key={t.id}>
                  <button
                    type="button"
                    className={`af-step${t.id === active ? " is-active" : ""}${done ? " is-done" : ""}${flagged ? " is-flagged" : ""}`}
                    aria-current={t.id === active ? "step" : undefined}
                    onClick={() => goTo(t.id)}
                  >
                    <span className="af-step__num" aria-hidden="true">{done ? "✓" : i + 1}</span>
                    <span className="af-step__text">
                      <span className="af-step__title">{t.title}</span>
                      <span className="af-step__state">{state}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ol>
        </nav>

        {/* ── Current tab ────────────────────────────────────────────── */}
        <main className="af-main" ref={mainRef}>
          <div className="af-head">
            <p className="af-head__step">Step {index + 1} of {TABS.length}</p>
            <h1 id="af-tab-title" tabIndex={-1}>{tab.title}</h1>
            <p className="af-head__lede">{tab.lede}</p>
            <p className="af-head__source">Covers {tab.sections}</p>
          </div>

          {showErrors && errorCount > 0 && (
            <p className="af-alert" role="alert">
              {errorCount === 1 ? "1 answer needs" : `${errorCount} answers need`} attention before you can continue.
            </p>
          )}

          <form className="af-form" noValidate onSubmit={(e) => e.preventDefault()}>
            <TabComponent
              data={form[active]}
              update={(patch) => update(active, patch)}
              errors={errors}
              form={form}
              property={property}
              properties={properties}
              propertiesError={propertiesError}
              completion={shownDone}
              goTo={goTo}
            />
          </form>

          {submitError && <p className="af-alert" role="alert">{submitError}</p>}

          <div className="af-actions">
            {index > 0 ? (
              <button type="button" className="af-btn af-btn--quiet" onClick={() => goTo(TABS[index - 1].id)}>
                Back
              </button>
            ) : <span />}
            {isLast ? (
              <button type="button" className="af-btn af-btn--primary" onClick={handleSubmit} disabled={submitting}>
                {submitting && <span className="spinner" aria-hidden="true" />}
                {submitting ? submitStep || "Submitting" : "Submit application"}
              </button>
            ) : (
              <button type="button" className="af-btn af-btn--primary" onClick={saveAndContinue}>
                Save and continue
              </button>
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

function Submitted({ application, property }) {
  return (
    <div className="af-page af-done">
      <div className="af-done__card">
        <Logo />
        <div className="af-done__mark" aria-hidden="true">
          <svg viewBox="0 0 48 48"><path d="M14 25l7 7 14-15" /></svg>
        </div>
        <h1>Application submitted</h1>
        <p>
          The property manager for {property ? property.address : "this property"} has your application. You'll get a
          message when its status changes.
        </p>
        <dl className="af-facts af-facts--center">
          <div><dt>Reference</dt><dd>{application.applicationId.slice(0, 8).toUpperCase()}</dd></div>
          <div><dt>Status</dt><dd>{application.status}</dd></div>
          <div><dt>Submitted</dt><dd>{new Date(application.submittedAt).toLocaleDateString("en-AU")}</dd></div>
        </dl>
        <Link to="/applications" className="af-btn af-btn--primary">View my applications</Link>
      </div>
    </div>
  );
}
