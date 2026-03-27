import { memo, useEffect, useMemo, useState } from "react";
import { pdf } from "@react-pdf/renderer";
import FlavorNotePDF from "./FlavorNotePDF.jsx";
import FlavorWheel from "./FlavorWheel.jsx";

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

const SavedNoteCard = memo(function SavedNoteCard({
  item,
  handleEdit,
  handleDelete,
}) {
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const pdfDocument = useMemo(() => {
    return <FlavorNotePDF note={item} />;
  }, [item]);

  const handlePdfDownload = async () => {
    if (isGeneratingPdf) return;

    try {
      setIsGeneratingPdf(true);

      const blob = await pdf(pdfDocument).toBlob();
      const url = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = url;
      link.download = `coffee-note-${item.id}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("PDF generation failed:", error);
      alert("PDF generation failed.");
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
          <span style={labelStyle}>Flavor Note:</span>{" "}
          <span style={flavorStyle}>
            {item.secondarySelections?.length
              ? item.secondarySelections.join(", ")
              : "-"}
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
  const [lang, setLang] = useState("en");
  const [cupProfileSelections, setCupProfileSelections] = useState([]);
  const [mainSelections, setMainSelections] = useState([]);
  const [secondarySelections, setSecondarySelections] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);

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
    setLang("en");
    setCupProfileSelections([]);
    setMainSelections([]);
    setSecondarySelections([]);

    localStorage.removeItem("coffee-note-current");
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
      setLang(data.lang || "en");
      setCupProfileSelections(data.cupProfileSelections || []);
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

  const handleEdit = (item) => {
    setCountry(item.country || "");
    setFarm(item.farm || "");
    setRoastDate(item.roastDate || "");
    setVariety(item.variety || "");
    setDripper(item.dripper || "");
    setProcess(item.process || "");
    setLang(item.lang || "en");
    setCupProfileSelections(item.cupProfileSelections || []);
    setMainSelections(item.mainSelections || []);
    setSecondarySelections(item.secondarySelections || []);
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
              mainSelections={mainSelections}
              setMainSelections={setMainSelections}
              secondarySelections={secondarySelections}
              setSecondarySelections={setSecondarySelections}
              onSecondaryChange={({ cupProfile }) => {
                setCupProfileSelections(cupProfile || []);
              }}
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
              background: "#fff",
              borderRadius: 16,
              padding: 20,
              border: "1px solid #e5ded3",
            }}
          >
            <h2 style={sectionTitleStyle}>Language</h2>

            <div
              style={{
                display: "flex",
                gap: 8,
                flexWrap: "wrap",
                justifyContent: "center",
              }}
            >
              <button onClick={() => changeLang("en")} style={languageButtonStyle}>
                English
              </button>
              <button onClick={() => changeLang("ja")} style={languageButtonStyle}>
                日本語
              </button>
              <button onClick={() => changeLang("es")} style={languageButtonStyle}>
                Español
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
            <h2 style={sectionTitleStyle}>Tasting Info</h2>

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
                <label style={infoLabelStyle}>Process</label>
                <input
                  type="text"
                  value={process}
                  onChange={(e) => setProcess(e.target.value)}
                  style={inputStyle}
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