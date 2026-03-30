import { memo, useEffect, useState } from "react";
import FlavorWheel from "./FlavorWheel.jsx";
import CoffeeFlavorWheelPDF from "./CoffeeFlavorWheelPDF.jsx";
import { pdf } from "@react-pdf/renderer";

const buttonStyle = {
  height: 30,
  padding: "0 12px",
  borderRadius: 8,
  border: "1px solid #d8cec1",
  background: "#f3efe8",
  color: "#5a5148",
  fontSize: 13,
  cursor: "pointer",
  boxSizing: "border-box",
};

const languageButtonStyle = {
  ...buttonStyle,
  background: "#fff",
};

const sectionTitleStyle = {
  marginTop: 0,
  marginBottom: 14,
  fontSize: 18,
  color: "#3d342b",
  letterSpacing: "0.2px",
};

const isSameArray = (a = [], b = []) => {
  if (a === b) return true;
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  return a.every((item, index) => item === b[index]);
};

const SavedNoteCard = memo(function SavedNoteCard({
  item,
  handleEdit,
  handleDelete,
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

const handlePdfDownload = async () => {
  try {
    setIsGeneratingPdf(true);

    const savedFlavorNotes =
      item.secondarySelections && item.secondarySelections.length > 0
        ? item.secondarySelections
        : item.mainSelections && item.mainSelections.length > 0
        ? item.mainSelections
        : [];

    const savedCupProfile =
      item.cupProfileSelections && item.cupProfileSelections.length > 0
        ? item.cupProfileSelections
        : item.cupProfile && item.cupProfile.length > 0
        ? item.cupProfile
        : [];

    const blob = await pdf(
 <CoffeeFlavorWheelPDF
  country={item.country || ""}
  farm={item.farm || ""}
  roastDate={item.roastDate || ""}
  variety={item.variety || ""}
  dripper={item.dripper || ""}
  process={item.process || ""}
  roaster={item.roaster || ""}
  memo={item.memo || ""}
  flavors={savedFlavorNotes}
  cupProfile={savedCupProfile}
/>
    ).toBlob();

    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    const today = new Date().toISOString().split("T")[0];

const safeName = `${item.country || "coffee"}-${item.farm || "farm"}-${today}`
  .replace(/\s+/g, "_")
  .replace(/[^\w\-]/g, "");

link.download = `${safeName}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
} catch (error) {
  console.error("PDF generation failed:", error);
  alert(
    `PDF generation failed:\n${error?.message || error?.toString() || "Unknown error"}`
  );
} finally {
    setIsGeneratingPdf(false);
  }
};

  const labelStyle = {
    fontSize: 12,
    fontWeight: 600,
    color: "#5a5148",
    letterSpacing: "0.2px",
  };

  const valueStyle = {
    fontSize: 13,
    color: "#2f2a26",
    fontWeight: 500,
  };

  const flavorStyle = {
    fontSize: 13,
    color: "#2a2521",
    fontWeight: 600,
    letterSpacing: "0.1px",
  };

const savedFlavorNotes =
  item.secondarySelections && item.secondarySelections.length > 0
    ? item.secondarySelections
    : item.mainSelections && item.mainSelections.length > 0
    ? item.mainSelections
    : [];

  const savedCupProfile =
    item.cupProfileSelections && item.cupProfileSelections.length > 0
      ? item.cupProfileSelections
      : item.cupProfile && item.cupProfile.length > 0
      ? item.cupProfile
      : [];

  return (
    <div
      style={{
        border: "1px solid #e5ded3",
        borderRadius: 12,
        padding: 14,
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 12,
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div>
          <span style={labelStyle}>Country:</span>{" "}
          <span style={valueStyle}>{item.country || "-"}</span>
        </div>

        <div>
          <span style={labelStyle}>Farm:</span>{" "}
          <span style={valueStyle}>{item.farm || "-"}</span>
        </div>

        <div>
          <span style={labelStyle}>Roast Date:</span>{" "}
          <span style={valueStyle}>{item.roastDate || "-"}</span>
        </div>

        <div>
          <span style={labelStyle}>Variety:</span>{" "}
          <span style={valueStyle}>{item.variety || "-"}</span>
        </div>

        <div>
          <span style={labelStyle}>Dripper:</span>{" "}
          <span style={valueStyle}>{item.dripper || "-"}</span>
        </div>

        <div>
          <span style={labelStyle}>Process:</span>{" "}
          <span style={valueStyle}>{item.process || "-"}</span>
        </div>

        <div style={{ gridColumn: "1 / -1", marginTop: 2 }}>
          <span style={labelStyle}>Selected Flavors:</span>{" "}
          <span style={flavorStyle}>
            {savedFlavorNotes.length > 0 ? savedFlavorNotes.join(", ") : "-"}
          </span>
        </div>

        <div style={{ gridColumn: "1 / -1", marginTop: 2 }}>
          <span style={labelStyle}>Cup Profile:</span>{" "}
          <span style={flavorStyle}>
            {savedCupProfile.length > 0 ? savedCupProfile.join(", ") : "-"}
          </span>
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 4 }}>
        <button onClick={() => handleEdit(item)} style={buttonStyle}>
          Edit
        </button>

        <button onClick={() => handleDelete(item.id)} style={buttonStyle}>
          Delete
        </button>

        <button
          type="button"
          onClick={handlePdfDownload}
          style={buttonStyle}
          disabled={isGeneratingPdf}
        >
          {isGeneratingPdf ? "Loading..." : "PDF"}
        </button>
      </div>
    </div>
  );
});

function App() {
const [country, setCountry] = useState("");
const [farm, setFarm] = useState("");
const [roastDate, setRoastDate] = useState("");
const [variety, setVariety] = useState("");
const [dripper, setDripper] = useState("");
const [process, setProcess] = useState("");
const [roaster, setRoaster] = useState("");
const [memo, setMemo] = useState("");
const [lang, setLang] = useState("en");

  const [cupProfileSelections, setCupProfileSelections] = useState([]);
  const [mainSelections, setMainSelections] = useState([]);
  const [secondarySelections, setSecondarySelections] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [wheelResetKey, setWheelResetKey] = useState(0);

  const changeLang = (newLang) => {
    setLang(newLang);
  };

const resetForm = () => {
  setCountry("");
  setFarm("");
  setRoastDate("");
  setVariety("");
  setDripper("");
  setProcess("");
  setRoaster("");
  setMemo("");
  setLang("en");

    setCupProfileSelections([]);
    setMainSelections([]);
    setSecondarySelections([]);

    localStorage.removeItem("coffee-note-current");
    setWheelResetKey((prev) => prev + 1);
  };

  useEffect(() => {
    const savedCurrent = localStorage.getItem("coffee-note-current");
    if (savedCurrent) {
      const data = JSON.parse(savedCurrent);

 setCountry(data.country || "");
setFarm(data.farm || "");
setRoastDate(data.roastDate || "");
setVariety(data.variety || "");
setDripper(data.dripper || "");
setProcess(data.process || "");
setRoaster(data.roaster || "");
setMemo(data.memo || "");
setLang(data.lang || "en");

      setCupProfileSelections(
        data.cupProfileSelections || data.cupProfile || []
      );
      setMainSelections(data.mainSelections || []);
      setSecondarySelections(data.secondarySelections || []);
    }

    const savedList = localStorage.getItem("coffee-note-saved");
    if (savedList) {
      setSavedNotes(JSON.parse(savedList));
    }
  }, []);

  useEffect(() => {
const currentNote = {
  country,
  farm,
  roastDate,
  variety,
  dripper,
  process,
  roaster,
  memo,
  lang,
  cupProfileSelections,
  mainSelections,
  secondarySelections,
};

    localStorage.setItem("coffee-note-current", JSON.stringify(currentNote));
}, [
  country,
  farm,
  roastDate,
  variety,
  dripper,
  process,
  roaster,
  memo,
  lang,
  cupProfileSelections,
  mainSelections,
  secondarySelections,
]);

const handleSave = () => {
  const isAllEmpty =
    !country.trim() &&
    !farm.trim() &&
    !roastDate.trim() &&
    !variety.trim() &&
    !dripper.trim() &&
    !process.trim() &&
    !roaster.trim() &&
    !memo.trim() &&
    cupProfileSelections.length === 0 &&
    mainSelections.length === 0 &&
    secondarySelections.length === 0;

  if (isAllEmpty) return;

  const newNote = {
    id: Date.now(),
    country,
    farm,
    roastDate,
    variety,
    dripper,
    process,
    roaster,
    memo,
    lang,
    cupProfileSelections: [...cupProfileSelections],
    mainSelections: [...mainSelections],
    secondarySelections: [...secondarySelections],
  };

  const updated = [newNote, ...savedNotes];
  setSavedNotes(updated);
  localStorage.setItem("coffee-note-saved", JSON.stringify(updated));

  resetForm();
};

  const handleDelete = (id) => {
    const updated = savedNotes.filter((item) => item.id !== id);
    setSavedNotes(updated);
    localStorage.setItem("coffee-note-saved", JSON.stringify(updated));
  };

  const handleSecondaryChange = (payload = {}) => {
    const nextCupProfile = Array.isArray(payload.cupProfileSelections)
      ? payload.cupProfileSelections
      : Array.isArray(payload.cupProfile)
      ? payload.cupProfile
      : null;

    if (nextCupProfile) {
      setCupProfileSelections((prev) =>
        isSameArray(prev, nextCupProfile) ? prev : nextCupProfile
      );
    }

    if (Array.isArray(payload.mainSelections)) {
      setMainSelections((prev) =>
        isSameArray(prev, payload.mainSelections) ? prev : payload.mainSelections
      );
    }

    if (Array.isArray(payload.secondarySelections)) {
      setSecondarySelections((prev) =>
        isSameArray(prev, payload.secondarySelections)
          ? prev
          : payload.secondarySelections
      );
    }
  };

const handleEdit = (item) => {
  setCountry(item.country || "");
  setFarm(item.farm || "");
  setRoastDate(item.roastDate || "");
  setVariety(item.variety || "");
  setDripper(item.dripper || "");
  setProcess(item.process || "");
  setRoaster(item.roaster || "");
  setMemo(item.memo || "");
  setLang(item.lang || "en");

  setCupProfileSelections([
    ...((item.cupProfileSelections || item.cupProfile || []).filter(Boolean)),
  ]);
  setMainSelections([...(item.mainSelections || []).filter(Boolean)]);
  setSecondarySelections([...(item.secondarySelections || []).filter(Boolean)]);

  setWheelResetKey((prev) => prev + 1);
};

  const inputStyle = {
    width: "100%",
    padding: 10,
    borderRadius: 10,
    border: "1px solid #d8cec1",
    boxSizing: "border-box",
    fontSize: 14,
    background: "#fff",
  };

  const infoLabelStyle = {
    display: "block",
    marginBottom: 6,
    fontSize: 12,
    color: "#5f564d",
    fontWeight: 600,
    letterSpacing: "0.2px",
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        background: "#f6f1ea",
        padding: 24,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          gap: 24,
          alignItems: "flex-start",
          flexWrap: "wrap",
        }}
      >
        <div
          style={{
            flex: "1 1 620px",
            minWidth: 320,
            background: "#fff",
            borderRadius: 16,
            padding: 20,
            border: "1px solid #e5ded3",
            boxSizing: "border-box",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: 16,
              fontSize: 22,
              color: "#3d342b",
            }}
          >
            Flavor Wheel
          </h2>

          <div
            style={{
              width: "100%",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <FlavorWheel
              key={wheelResetKey}
              mainSelections={mainSelections}
              setMainSelections={setMainSelections}
              secondarySelections={secondarySelections}
              setSecondarySelections={setSecondarySelections}
              cupProfileSelections={cupProfileSelections}
              setCupProfileSelections={setCupProfileSelections}
              onSecondaryChange={handleSecondaryChange}
            />
          </div>
        </div>

        <div
          style={{
            flex: "0 1 420px",
            minWidth: 320,
            display: "flex",
            flexDirection: "column",
            gap: 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 14,
              gap: 12,
            }}
          >
  <h2
    style={{
      ...sectionTitleStyle,
      marginBottom: 0,
    }}
  >
    Tasting Info
  </h2>

  <div
    style={{
      display: "flex",
      gap: 6,
      flexWrap: "wrap",
      justifyContent: "flex-end",
    }}
  >
    <button
      onClick={() => changeLang("en")}
      style={{
        ...languageButtonStyle,
        height: 24,
        padding: "0 8px",
        fontSize: 11,
        borderRadius: 999,
      }}
    >
      EN
    </button>
    <button
      onClick={() => changeLang("ja")}
      style={{
        ...languageButtonStyle,
        height: 24,
        padding: "0 8px",
        fontSize: 11,
        borderRadius: 999,
      }}
    >
      JP
    </button>
    <button
      onClick={() => changeLang("es")}
      style={{
        ...languageButtonStyle,
        height: 24,
        padding: "0 8px",
        fontSize: 11,
        borderRadius: 999,
      }}
    >
      ES
    </button>
  </div>
</div>

          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              border: "1px solid #e5ded3",
            }}
          >

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 12,
              }}
            >
              <div>
                <label style={infoLabelStyle}>Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={infoLabelStyle}>Farm</label>
                <input
                  type="text"
                  value={farm}
                  onChange={(e) => setFarm(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={infoLabelStyle}>Roast Date</label>
                <input
                  type="date"
                  value={roastDate}
                  onChange={(e) => setRoastDate(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={infoLabelStyle}>Variety</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={infoLabelStyle}>Dripper</label>
                <input
                  type="text"
                  value={dripper}
                  onChange={(e) => setDripper(e.target.value)}
                  style={inputStyle}
                />
              </div>

             <div>
  <label style={infoLabelStyle}>Roaster</label>
  <input
    type="text"
    value={roaster}
    onChange={(e) => setRoaster(e.target.value)}
    style={inputStyle}
  />
</div>
<div style={{ gridColumn: "1 / -1" }}>
  <label style={infoLabelStyle}>Memo</label>
  <textarea
    value={memo}
    onChange={(e) => setMemo(e.target.value)}
    style={{
      ...inputStyle,
      minHeight: 96,
      resize: "vertical",
      fontFamily: "inherit",
    }}
  />
</div>
            </div>

            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                marginTop: 16,
              }}
            >
              <button onClick={handleSave} style={buttonStyle}>
                Save
              </button>
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              border: "1px solid #e5ded3",
            }}
          >
            <h2 style={sectionTitleStyle}>Saved Notes</h2>

            {savedNotes.length === 0 ? (
              <p style={{ margin: 0, color: "#8a7f70" }}>No saved notes yet.</p>
            ) : (
              <div style={{ display: "grid", gap: 12 }}>
                {savedNotes.map((item) => (
                  <SavedNoteCard
                    key={item.id}
                    item={item}
                    handleEdit={handleEdit}
                    handleDelete={handleDelete}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;