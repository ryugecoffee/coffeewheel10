import React, { useEffect, useMemo, useRef, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import FlavorWheel from "./FlavorWheel";
import CoffeeFlavorWheelPDF from "./CoffeeFlavorWheelPDF";
import { buildMainWheelSegments } from "./wheelGeometry";

const CURRENT_NOTE_KEY = "coffee-note-current";
const SAVED_NOTES_KEY = "coffee-note-saved";
const FARM_HISTORY_KEY = "coffee-note-farm-history";
const VARIETY_HISTORY_KEY = "coffee-note-variety-history";
const DRIPPER_HISTORY_KEY = "coffee-note-dripper-history";
const ROASTER_HISTORY_KEY = "coffee-note-roaster-history";

const COUNTRY_OPTIONS = [
  "Brazil",
  "Colombia",
  "Costa Rica",
  "Ethiopia",
  "Guatemala",
  "Honduras",
  "Indonesia",
  "Kenya",
  "Nicaragua",
  "Panama",
  "Peru",
  "Rwanda",
  "Tanzania",
  "Uganda",
  "Yemen",
  "Bolivia",
  "Burundi",
  "China",
  "El Salvador",
  "India",
  "Jamaica",
  "Mexico",
  "Papua New Guinea",
  "Thailand",
  "Vietnam",
  "Japan",
];

const MAIN_WHEEL_TOP_LABELS = [
  "FRUITY",
  "SOUR/ FERMENTED",
  "GREEN/ VEGETATIVE",
  "OTHER",
  "ROASTED",
  "SPICES",
  "NUTTY/ COCOA",
  "SWEET",
  "FLORAL",
];

const emptyNote = {
  country: "",
  farm: "",
  roastDate: "",
  variety: "",
  dripper: "",
  roaster: "",
  memo: "",
  lang: "en",
  cupProfileSelections: [],
  mainSelections: [],
  secondarySelections: [],
};

function safeArray(value) {
  return Array.isArray(value) ? value : [];
}

function normalizeSavedNote(note) {
  return {
    country: note?.country || "",
    farm: note?.farm || "",
    roastDate: note?.roastDate || "",
    variety: note?.variety || "",
    dripper: note?.dripper || "",
    roaster: note?.roaster || "",
    memo: note?.memo || "",
    lang: note?.lang || "en",
    cupProfileSelections: safeArray(note?.cupProfileSelections),
    mainSelections: safeArray(note?.mainSelections),
    secondarySelections: safeArray(note?.secondarySelections),
    savedAt: note?.savedAt || "",
  };
}

function normalizeHistory(raw) {
  if (!Array.isArray(raw)) return [];

  const map = new Map();

  raw.forEach((item) => {
    if (typeof item === "string") {
      const value = item.trim();
      if (!value) return;
      map.set(value, (map.get(value) || 0) + 1);
      return;
    }

    if (item && typeof item === "object") {
      const value = String(item.value || "").trim();
      const count = Number(item.count || 0);
      if (!value) return;
      map.set(value, (map.get(value) || 0) + Math.max(1, count));
    }
  });

  return Array.from(map.entries())
    .map(([value, count]) => ({ value, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function loadJson(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
}

function loadCurrentNote() {
  const raw = loadJson(CURRENT_NOTE_KEY, emptyNote);
  return {
    ...emptyNote,
    ...raw,
    mainSelections: safeArray(raw?.mainSelections),
    secondarySelections: safeArray(raw?.secondarySelections),
    cupProfileSelections: safeArray(raw?.cupProfileSelections),
  };
}
const ring1LabelSet = new Set(
  buildMainWheelSegments().ring1Segments.map((seg) => seg.label)
);

const getVisibleFlavorSelections = (selections = []) => {
  if (!Array.isArray(selections)) return [];
  return [...new Set(selections.filter((label) => label && !ring1LabelSet.has(label)))];
};

function loadSavedNotes() {
  const raw = loadJson(SAVED_NOTES_KEY, []);
  return Array.isArray(raw) ? raw.map(normalizeSavedNote) : [];
}

function loadHistory(key) {
  return normalizeHistory(loadJson(key, []));
}

function saveHistory(key, history) {
  localStorage.setItem(key, JSON.stringify(history));
}

function addToHistory(history, value) {
  const trimmed = String(value || "").trim();
  if (!trimmed) return history;

  const map = new Map(history.map((item) => [item.value, item.count]));
  map.set(trimmed, (map.get(trimmed) || 0) + 1);

  return Array.from(map.entries())
    .map(([v, count]) => ({ value: v, count }))
    .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value));
}

function formatSavedAt(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleString("ja-JP");
}

function createNoteIdentity(note) {
  return [
    note.savedAt || "",
    note.country || "",
    note.farm || "",
    note.roastDate || "",
    note.variety || "",
    note.dripper || "",
    note.roaster || "",
    note.memo || "",
    JSON.stringify(note.mainSelections || []),
    JSON.stringify(note.secondarySelections || []),
    JSON.stringify(note.cupProfileSelections || []),
  ].join("__");
}

function getVisibleMainSelections(mainSelections) {
  return safeArray(mainSelections).filter(
    (item) => !MAIN_WHEEL_TOP_LABELS.includes(String(item).trim().toUpperCase())
  );
}

function getVisibleOuterSelections(secondarySelections) {
  return safeArray(secondarySelections).filter(Boolean);
}

function App() {
  const initialCurrent = loadCurrentNote();

  const [country, setCountry] = useState(initialCurrent.country);
  const [farm, setFarm] = useState(initialCurrent.farm);
  const [roastDate, setRoastDate] = useState(initialCurrent.roastDate);
  const [variety, setVariety] = useState(initialCurrent.variety);
  const [dripper, setDripper] = useState(initialCurrent.dripper);
  const [roaster, setRoaster] = useState(initialCurrent.roaster);
  const [memo, setMemo] = useState(initialCurrent.memo);
  const [lang, setLang] = useState(initialCurrent.lang);
  const [mainSelections, setMainSelections] = useState(initialCurrent.mainSelections);
  const [secondarySelections, setSecondarySelections] = useState(
    initialCurrent.secondarySelections
  );
  const [cupProfileSelections, setCupProfileSelections] = useState(
    initialCurrent.cupProfileSelections
  );

  const [savedNotes, setSavedNotes] = useState(loadSavedNotes);
  const [editingIdentity, setEditingIdentity] = useState(null);
  const [savedToast, setSavedToast] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const [farmHistory, setFarmHistory] = useState(() => loadHistory(FARM_HISTORY_KEY));
  const [varietyHistory, setVarietyHistory] = useState(() => loadHistory(VARIETY_HISTORY_KEY));
  const [dripperHistory, setDripperHistory] = useState(() => loadHistory(DRIPPER_HISTORY_KEY));
  const [roasterHistory, setRoasterHistory] = useState(() => loadHistory(ROASTER_HISTORY_KEY));

  const [showCountrySuggestions, setShowCountrySuggestions] = useState(false);
  const [showFarmSuggestions, setShowFarmSuggestions] = useState(false);
  const [showVarietySuggestions, setShowVarietySuggestions] = useState(false);
  const [showDripperSuggestions, setShowDripperSuggestions] = useState(false);
  const [showRoasterSuggestions, setShowRoasterSuggestions] = useState(false);

  const countryBlurTimerRef = useRef(null);
  const farmBlurTimerRef = useRef(null);
  const varietyBlurTimerRef = useRef(null);
  const dripperBlurTimerRef = useRef(null);
  const roasterBlurTimerRef = useRef(null);
  const toastTimerRef = useRef(null);

  useEffect(() => {
    const currentNote = {
      country,
      farm,
      roastDate,
      variety,
      dripper,
      roaster,
      memo,
      lang,
      cupProfileSelections,
      mainSelections,
      secondarySelections,
    };

    localStorage.setItem(CURRENT_NOTE_KEY, JSON.stringify(currentNote));
  }, [
    country,
    farm,
    roastDate,
    variety,
    dripper,
    roaster,
    memo,
    lang,
    cupProfileSelections,
    mainSelections,
    secondarySelections,
  ]);

  useEffect(() => {
    localStorage.setItem(SAVED_NOTES_KEY, JSON.stringify(savedNotes));
  }, [savedNotes]);

  useEffect(() => {
    saveHistory(FARM_HISTORY_KEY, farmHistory);
  }, [farmHistory]);

  useEffect(() => {
    saveHistory(VARIETY_HISTORY_KEY, varietyHistory);
  }, [varietyHistory]);

  useEffect(() => {
    saveHistory(DRIPPER_HISTORY_KEY, dripperHistory);
  }, [dripperHistory]);

  useEffect(() => {
    saveHistory(ROASTER_HISTORY_KEY, roasterHistory);
  }, [roasterHistory]);

  useEffect(() => {
    return () => {
      clearTimeout(countryBlurTimerRef.current);
      clearTimeout(farmBlurTimerRef.current);
      clearTimeout(varietyBlurTimerRef.current);
      clearTimeout(dripperBlurTimerRef.current);
      clearTimeout(roasterBlurTimerRef.current);
      clearTimeout(toastTimerRef.current);
    };
  }, []);

  const countrySuggestions = useMemo(() => {
    const keyword = country.trim().toLowerCase();
    if (!keyword) return [];
    return COUNTRY_OPTIONS.filter((item) => item.toLowerCase().includes(keyword)).slice(0, 8);
  }, [country]);

  const makeHistorySuggestions = (value, history) => {
    const keyword = value.trim().toLowerCase();
    if (!keyword) return [];
    return history
      .filter((item) => item.value.toLowerCase().includes(keyword))
      .sort((a, b) => b.count - a.count || a.value.localeCompare(b.value))
      .slice(0, 8);
  };

  const farmSuggestions = useMemo(
    () => makeHistorySuggestions(farm, farmHistory),
    [farm, farmHistory]
  );
  const varietySuggestions = useMemo(
    () => makeHistorySuggestions(variety, varietyHistory),
    [variety, varietyHistory]
  );
  const dripperSuggestions = useMemo(
    () => makeHistorySuggestions(dripper, dripperHistory),
    [dripper, dripperHistory]
  );
  const roasterSuggestions = useMemo(
    () => makeHistorySuggestions(roaster, roasterHistory),
    [roaster, roasterHistory]
  );

  const filteredSavedNotes = useMemo(() => {
    const keyword = searchTerm.trim().toLowerCase();
    if (!keyword) return savedNotes;

    return savedNotes.filter((note) => {
      const searchableText = [
        note.country,
        note.farm,
        note.roastDate,
        note.variety,
        note.dripper,
        note.roaster,
        note.memo,
        ...(note.mainSelections || []),
        ...(note.secondarySelections || []),
        ...(note.cupProfileSelections || []),
        formatSavedAt(note.savedAt),
      ]
        .join(" ")
        .toLowerCase();

      return searchableText.includes(keyword);
    });
  }, [savedNotes, searchTerm]);

  const showToast = () => {
    setSavedToast(true);
    clearTimeout(toastTimerRef.current);
    toastTimerRef.current = setTimeout(() => {
      setSavedToast(false);
    }, 1600);
  };

  const resetForm = () => {
    setCountry("");
    setFarm("");
    setRoastDate("");
    setVariety("");
    setDripper("");
    setRoaster("");
    setMemo("");
    setLang("en");
    setMainSelections([]);
    setSecondarySelections([]);
    setCupProfileSelections([]);
    setEditingIdentity(null);
    localStorage.setItem(CURRENT_NOTE_KEY, JSON.stringify(emptyNote));
  };

  const handleSave = () => {
    const now = new Date().toISOString();

    const noteData = {
      country: country.trim(),
      farm: farm.trim(),
      roastDate,
      variety: variety.trim(),
      dripper: dripper.trim(),
      roaster: roaster.trim(),
      memo: memo.trim(),
      lang,
      cupProfileSelections: safeArray(cupProfileSelections),
      mainSelections: safeArray(mainSelections),
      secondarySelections: safeArray(secondarySelections),
      savedAt: now,
    };

    if (
      !noteData.country &&
      !noteData.farm &&
      !noteData.roastDate &&
      !noteData.variety &&
      !noteData.dripper &&
      !noteData.roaster &&
      !noteData.memo &&
      noteData.mainSelections.length === 0 &&
      noteData.secondarySelections.length === 0 &&
      noteData.cupProfileSelections.length === 0
    ) {
      return;
    }

    const nextSavedNotes = [...savedNotes];

    if (editingIdentity) {
      const targetIndex = nextSavedNotes.findIndex(
        (note) => createNoteIdentity(note) === editingIdentity
      );

      if (targetIndex >= 0) {
        noteData.savedAt = nextSavedNotes[targetIndex].savedAt || now;
        nextSavedNotes[targetIndex] = noteData;
      } else {
        nextSavedNotes.unshift(noteData);
      }
    } else {
      nextSavedNotes.unshift(noteData);
    }

    setSavedNotes(nextSavedNotes);

    setFarmHistory((prev) => addToHistory(prev, noteData.farm));
    setVarietyHistory((prev) => addToHistory(prev, noteData.variety));
    setDripperHistory((prev) => addToHistory(prev, noteData.dripper));
    setRoasterHistory((prev) => addToHistory(prev, noteData.roaster));

    showToast();
    resetForm();
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleEdit = (note) => {
    setCountry(note.country || "");
    setFarm(note.farm || "");
    setRoastDate(note.roastDate || "");
    setVariety(note.variety || "");
    setDripper(note.dripper || "");
    setRoaster(note.roaster || "");
    setMemo(note.memo || "");
    setLang(note.lang || "en");
    setMainSelections(safeArray(note.mainSelections));
    setSecondarySelections(safeArray(note.secondarySelections));
    setCupProfileSelections(safeArray(note.cupProfileSelections));
    setEditingIdentity(createNoteIdentity(note));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleDelete = (noteToDelete) => {
    const deleteIdentity = createNoteIdentity(noteToDelete);

    setSavedNotes((prev) =>
      prev.filter((note) => createNoteIdentity(note) !== deleteIdentity)
    );

    if (editingIdentity === deleteIdentity) {
      setEditingIdentity(null);
    }
  };

  const handleDownloadPDF = async (note) => {
    try {
      const blob = await pdf(
        <CoffeeFlavorWheelPDF
          country={note.country}
          farm={note.farm}
          roastDate={note.roastDate}
          variety={note.variety}
          dripper={note.dripper}
          roaster={note.roaster}
          memo={note.memo}
          lang={note.lang}
          mainSelections={note.mainSelections}
          secondarySelections={note.secondarySelections}
          cupProfileSelections={note.cupProfileSelections}
          selectedMainLabels={note.mainSelections}
          selectedSecondaryLabels={note.secondarySelections}
          selectedCupProfileLabels={note.cupProfileSelections}
        />
      ).toBlob();

      const datePart = note.savedAt
        ? new Date(note.savedAt).toISOString().slice(0, 10)
        : new Date().toISOString().slice(0, 10);

      const filename = [note.country || "Coffee", note.farm || "Note", datePart]
        .filter(Boolean)
        .join("_")
        .replace(/[\\/:*?"<>|]/g, "-");

      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `${filename}.pdf`;
      link.click();
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF export failed:", error);
    }
  };

  const inputWrapStyle = {
    position: "relative",
    width: "100%",
  };

  const suggestionBoxStyle = {
    position: "absolute",
    top: "calc(100% + 6px)",
    left: 0,
    right: 0,
    background: "#fff",
    border: "1px solid #ddd",
    borderRadius: 12,
    boxShadow: "0 10px 24px rgba(0,0,0,0.08)",
    zIndex: 30,
    maxHeight: 220,
    overflowY: "auto",
  };

  const suggestionRowStyle = {
    padding: "10px 12px",
    cursor: "pointer",
    borderBottom: "1px solid #f1f1f1",
    fontSize: 14,
    lineHeight: 1.4,
    display: "flex",
    justifyContent: "space-between",
    gap: 10,
  };

  const SuggestionList = ({ items, onSelect, showCount = false }) => {
    if (!items.length) return null;

    return (
      <div style={suggestionBoxStyle}>
        {items.map((item, idx) => {
          const label = typeof item === "string" ? item : item.value;
          const count = typeof item === "string" ? null : item.count;

          return (
            <div
              key={`${label}-${idx}`}
              style={{
                ...suggestionRowStyle,
                borderBottom: idx === items.length - 1 ? "none" : suggestionRowStyle.borderBottom,
              }}
              onMouseDown={(e) => {
                e.preventDefault();
                onSelect(label);
              }}
            >
              <span>{label}</span>
              {showCount && typeof count === "number" ? (
                <span style={{ color: "#888", fontSize: 12 }}>{count}x</span>
              ) : null}
            </div>
          );
        })}
      </div>
    );
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#fafafa",
        color: "#111",
      }}
    >
      {savedToast ? (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            background: "rgba(17, 17, 17, 0.92)",
            color: "#fff",
            padding: "14px 24px",
            borderRadius: 999,
            fontSize: 16,
            fontWeight: 600,
            zIndex: 1000,
            boxShadow: "0 12px 40px rgba(0,0,0,0.22)",
            pointerEvents: "none",
          }}
        >
          Saved!
        </div>
      ) : null}

      <div
        style={{
          maxWidth: 1320,
          margin: "0 auto",
          padding: "20px 16px 40px",
        }}
      >
        <div className="main-layout">
          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: 16,
              boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
              minHeight: 500,
            }}
          >
            <FlavorWheel
              lang={lang}
              mainSelections={mainSelections}
              setMainSelections={setMainSelections}
              secondarySelections={secondarySelections}
              setSecondarySelections={setSecondarySelections}
              cupProfileSelections={cupProfileSelections}
              setCupProfileSelections={setCupProfileSelections}
              selectedMainLabels={mainSelections}
              setSelectedMainLabels={setMainSelections}
              selectedSecondaryLabels={secondarySelections}
              setSelectedSecondaryLabels={setSecondarySelections}
              selectedCupProfileLabels={cupProfileSelections}
              setSelectedCupProfileLabels={setCupProfileSelections}
            />
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 24,
              padding: 18,
              boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
              position: "sticky",
              top: 12,
            }}
          >
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 16,
              }}
            >
              <h2
                style={{
                  margin: 0,
                  fontSize: 20,
                  lineHeight: 1.2,
                }}
              >
                Tasting Info
              </h2>

              <div style={{ display: "flex", gap: 6 }}>
                {["en", "ja", "es"].map((code) => (
                  <button
                    key={code}
                    type="button"
                    onClick={() => setLang(code)}
                    style={{
                      border: "1px solid #ddd",
                      background: lang === code ? "#111" : "#fff",
                      color: lang === code ? "#fff" : "#111",
                      borderRadius: 999,
                      fontSize: 12,
                      padding: "6px 10px",
                      cursor: "pointer",
                    }}
                  >
                    {code.toUpperCase()}
                  </button>
                ))}
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div style={{ ...inputWrapStyle, gridColumn: "span 2" }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Country</label>
                <input
                  value={country}
                  onChange={(e) => {
                    setCountry(e.target.value);
                    setShowCountrySuggestions(!!e.target.value.trim());
                  }}
                  onFocus={() => setShowCountrySuggestions(!!country.trim())}
                  onBlur={() => {
                    countryBlurTimerRef.current = setTimeout(() => {
                      setShowCountrySuggestions(false);
                    }, 120);
                  }}
                  placeholder="Country"
                  style={inputStyle}
                />
                {showCountrySuggestions && country.trim() ? (
                  <SuggestionList
                    items={countrySuggestions}
                    onSelect={(value) => {
                      setCountry(value);
                      setShowCountrySuggestions(false);
                    }}
                  />
                ) : null}
              </div>

              <div style={inputWrapStyle}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Farm</label>
                <input
                  value={farm}
                  onChange={(e) => {
                    setFarm(e.target.value);
                    setShowFarmSuggestions(!!e.target.value.trim());
                  }}
                  onFocus={() => setShowFarmSuggestions(!!farm.trim())}
                  onBlur={() => {
                    farmBlurTimerRef.current = setTimeout(() => {
                      setShowFarmSuggestions(false);
                    }, 120);
                  }}
                  placeholder="Farm"
                  style={inputStyle}
                />
                {showFarmSuggestions && farm.trim() ? (
                  <SuggestionList
                    items={farmSuggestions}
                    showCount
                    onSelect={(value) => {
                      setFarm(value);
                      setShowFarmSuggestions(false);
                    }}
                  />
                ) : null}
              </div>

              <div>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Roast Date</label>
                <input
                  type="date"
                  value={roastDate}
                  onChange={(e) => setRoastDate(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={inputWrapStyle}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Variety</label>
                <input
                  value={variety}
                  onChange={(e) => {
                    setVariety(e.target.value);
                    setShowVarietySuggestions(!!e.target.value.trim());
                  }}
                  onFocus={() => setShowVarietySuggestions(!!variety.trim())}
                  onBlur={() => {
                    varietyBlurTimerRef.current = setTimeout(() => {
                      setShowVarietySuggestions(false);
                    }, 120);
                  }}
                  placeholder="Variety"
                  style={inputStyle}
                />
                {showVarietySuggestions && variety.trim() ? (
                  <SuggestionList
                    items={varietySuggestions}
                    showCount
                    onSelect={(value) => {
                      setVariety(value);
                      setShowVarietySuggestions(false);
                    }}
                  />
                ) : null}
              </div>

              <div style={inputWrapStyle}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Dripper</label>
                <input
                  value={dripper}
                  onChange={(e) => {
                    setDripper(e.target.value);
                    setShowDripperSuggestions(!!e.target.value.trim());
                  }}
                  onFocus={() => setShowDripperSuggestions(!!dripper.trim())}
                  onBlur={() => {
                    dripperBlurTimerRef.current = setTimeout(() => {
                      setShowDripperSuggestions(false);
                    }, 120);
                  }}
                  placeholder="Dripper"
                  style={inputStyle}
                />
                {showDripperSuggestions && dripper.trim() ? (
                  <SuggestionList
                    items={dripperSuggestions}
                    showCount
                    onSelect={(value) => {
                      setDripper(value);
                      setShowDripperSuggestions(false);
                    }}
                  />
                ) : null}
              </div>

              <div style={{ ...inputWrapStyle, gridColumn: "span 2" }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Roaster</label>
                <input
                  value={roaster}
                  onChange={(e) => {
                    setRoaster(e.target.value);
                    setShowRoasterSuggestions(!!e.target.value.trim());
                  }}
                  onFocus={() => setShowRoasterSuggestions(!!roaster.trim())}
                  onBlur={() => {
                    roasterBlurTimerRef.current = setTimeout(() => {
                      setShowRoasterSuggestions(false);
                    }, 120);
                  }}
                  placeholder="Roaster"
                  style={inputStyle}
                />
                {showRoasterSuggestions && roaster.trim() ? (
                  <SuggestionList
                    items={roasterSuggestions}
                    showCount
                    onSelect={(value) => {
                      setRoaster(value);
                      setShowRoasterSuggestions(false);
                    }}
                  />
                ) : null}
              </div>

              <div style={{ gridColumn: "span 2" }}>
                <label style={{ display: "block", marginBottom: 6, fontSize: 13 }}>Memo</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  placeholder="Memo"
                  style={{
                    ...inputStyle,
                    minHeight: 100,
                    resize: "vertical",
                  }}
                />
              </div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                marginTop: 16,
                flexWrap: "wrap",
              }}
            >
              <button type="button" onClick={handleSave} style={primaryButtonStyle}>
                {editingIdentity ? "Update Note" : "Save Note"}
              </button>

              <button type="button" onClick={resetForm} style={secondaryButtonStyle}>
                Reset
              </button>
            </div>
          </div>
        </div>

        <div
          style={{
            marginTop: 24,
            background: "#fff",
            borderRadius: 24,
            padding: 18,
            boxShadow: "0 6px 24px rgba(0,0,0,0.05)",
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              gap: 12,
              alignItems: "center",
              flexWrap: "wrap",
              marginBottom: 16,
            }}
          >
            <h2 style={{ margin: 0, fontSize: 20 }}>Saved Notes</h2>

            <input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search saved notes..."
              style={{
                ...inputStyle,
                width: "min(360px, 100%)",
              }}
            />
          </div>

          {filteredSavedNotes.length === 0 ? (
            <div
              style={{
                padding: "18px 0 8px",
                color: "#666",
                fontSize: 14,
              }}
            >
              No saved notes found.
            </div>
          ) : (
            <div
              style={{
                display: "grid",
                gap: 14,
              }}
            >
              {filteredSavedNotes.map((note, index) => {
                const visibleOuterSelections = getVisibleOuterSelections(note.secondarySelections);

                return (
                  <div
                    key={`${createNoteIdentity(note)}-${index}`}
                    style={{
                      border: "1px solid #eee",
                      borderRadius: 18,
                      padding: 16,
                      background: "#fcfcfc",
                    }}
                  >
                    <div
                      style={{
                        display: "flex",
                        justifyContent: "space-between",
                        gap: 12,
                        alignItems: "flex-start",
                        flexWrap: "wrap",
                        marginBottom: 12,
                      }}
                    >
                      <div>
                        <div
                          style={{
                            fontSize: 16,
                            fontWeight: 600,
                            marginBottom: 4,
                          }}
                        >
                          {[note.country, note.farm].filter(Boolean).join(" / ") || "Untitled Note"}
                        </div>

                        {note.savedAt ? (
                          <div style={{ fontSize: 12, color: "#777" }}>
                            Saved at: {formatSavedAt(note.savedAt)}
                          </div>
                        ) : null}
                      </div>

                      <div
                        style={{
                          display: "flex",
                          gap: 8,
                          flexWrap: "wrap",
                        }}
                      >
                        <button
                          type="button"
                          onClick={() => handleEdit(note)}
                          style={smallButtonStyle}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(note)}
                          style={smallButtonStyle}
                        >
                          Delete
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDownloadPDF(note)}
                          style={smallButtonStyle}
                        >
                          PDF
                        </button>
                      </div>
                    </div>

                    <div
                      style={{
                        display: "grid",
                        gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                        gap: 10,
                        marginBottom: 12,
                      }}
                    >
                      <InfoItem label="Country" value={note.country} />
                      <InfoItem label="Farm" value={note.farm} />
                      <InfoItem label="Roast Date" value={note.roastDate} />
                      <InfoItem label="Variety" value={note.variety} />
                      <InfoItem label="Dripper" value={note.dripper} />
                      <InfoItem label="Roaster" value={note.roaster} />
                    </div>

                    {note.memo ? (
                      <div style={{ marginBottom: 12 }}>
                        <div style={sectionBodyStyle}>{note.memo}</div>
                      </div>
                    ) : null}

                   {visibleOuterSelections.length > 0 ? (
  <div style={{ marginBottom: 10 }}>
    <div style={tagWrapStyle}>
      {visibleOuterSelections.map((item, i) => (
        <span key={`${item}-${i}`} style={tagStyle}>
          {item}
        </span>
      ))}
    </div>
  </div>
) : null}

                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      <style>{`
        .main-layout {
          display: grid;
          grid-template-columns: minmax(0, 1.35fr) minmax(320px, 420px);
          gap: 20px;
          align-items: start;
        }

        input, textarea, button {
          font: inherit;
        }

        @media (max-width: 900px) {
          .main-layout {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}

function InfoItem({ label, value }) {
  return (
    <div
      style={{
        background: "#fff",
        border: "1px solid #eee",
        borderRadius: 14,
        padding: "10px 12px",
      }}
    >
      <div style={{ fontSize: 12, color: "#777", marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 14, color: "#111", wordBreak: "break-word" }}>
        {value || "-"}
      </div>
    </div>
  );
}

const inputStyle = {
  width: "100%",
  boxSizing: "border-box",
  border: "1px solid #ddd",
  borderRadius: 12,
  padding: "11px 12px",
  fontSize: 14,
  background: "#fff",
  color: "#111",
  outline: "none",
};

const primaryButtonStyle = {
  border: "none",
  background: "#111",
  color: "#fff",
  borderRadius: 12,
  padding: "12px 16px",
  fontSize: 14,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  border: "1px solid #ddd",
  background: "#fff",
  color: "#111",
  borderRadius: 12,
  padding: "12px 16px",
  fontSize: 14,
  cursor: "pointer",
};

const smallButtonStyle = {
  border: "1px solid #ddd",
  background: "#fff",
  color: "#111",
  borderRadius: 10,
  padding: "8px 12px",
  fontSize: 13,
  cursor: "pointer",
};

const sectionLabelStyle = {
  fontSize: 12,
  color: "#777",
  marginBottom: 6,
};

const sectionBodyStyle = {
  fontSize: 14,
  lineHeight: 1.6,
  whiteSpace: "pre-wrap",
};

const tagWrapStyle = {
  display: "flex",
  flexWrap: "wrap",
  gap: 8,
};

const tagStyle = {
  display: "inline-flex",
  alignItems: "center",
  padding: "6px 10px",
  borderRadius: 999,
  background: "#f3f3f3",
  fontSize: 13,
};

export default App;