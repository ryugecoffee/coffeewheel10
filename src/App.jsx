import { memo, useEffect, useRef, useState } from "react";
import FlavorWheel from "./FlavorWheel.jsx";
import CoffeeFlavorWheelPDF from "./CoffeeFlavorWheelPDF.jsx";
import { pdf } from "@react-pdf/renderer";

const buttonStyle = {
  height: 36,
  padding: "0 14px",
  borderRadius: 10,
  border: "1px solid #d8cec1",
  background: "#f3efe8",
  color: "#5a5148",
  fontSize: 13,
  cursor: "pointer",
  boxSizing: "border-box",
  whiteSpace: "nowrap",
};

const languageButtonStyle = {
  ...buttonStyle,
  background: "#fff",
  height: 28,
  padding: "0 10px",
  fontSize: 11,
  borderRadius: 999,
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

const getViewportWidth = () => {
  if (typeof window === "undefined") return 1440;
  return window.innerWidth;
};

const getWheelScale = (width) => {
  if (width < 430) return 0.78;   // iPhone
  if (width < 768) return 0.88;   // 大きめスマホ
  if (width < 1100) return 0.98;  // iPad
  return 1;
};

const getWheelStageHeight = (width) => {
  if (width < 430) return 590;
  if (width < 768) return 670;
  if (width < 1100) return 760;
  return 780;
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
    wordBreak: "break-word",
  };

  const flavorStyle = {
    fontSize: 13,
    color: "#2a2521",
    fontWeight: 600,
    letterSpacing: "0.1px",
    wordBreak: "break-word",
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
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))",
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
          <span style={labelStyle}>Roaster:</span>{" "}
          <span style={valueStyle}>{item.roaster || "-"}</span>
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

        <div style={{ gridColumn: "1 / -1", marginTop: 2 }}>
          <span style={labelStyle}>Memo:</span>{" "}
          <span style={valueStyle}>{item.memo || "-"}</span>
        </div>
      </div>

      <div
        style={{
          display: "flex",
          gap: 8,
          flexWrap: "wrap",
          marginTop: 4,
        }}
      >
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
  const [roaster, setRoaster] = useState("");
  const [memo, setMemo] = useState("");
  const [lang, setLang] = useState("en");

  const [cupProfileSelections, setCupProfileSelections] = useState([]);
  const [mainSelections, setMainSelections] = useState([]);
  const [secondarySelections, setSecondarySelections] = useState([]);
  const [savedNotes, setSavedNotes] = useState([]);
  const [wheelResetKey, setWheelResetKey] = useState(0);
  const [windowWidth, setWindowWidth] = useState(getViewportWidth());

  const wheelSectionRef = useRef(null);

  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(getViewportWidth());
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const isMobile = windowWidth < 768;
  const isTablet = windowWidth >= 768 && windowWidth < 1100;
  const wheelScale = getWheelScale(windowWidth);
  const wheelStageHeight = getWheelStageHeight(windowWidth);

  const changeLang = (newLang) => {
    setLang(newLang);
  };

  const scrollToWheel = () => {
    if (wheelSectionRef.current) {
      wheelSectionRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
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
    roaster,
    memo,
    lang,
    cupProfileSelections,
    mainSelections,
    secondarySelections,
  ]);

  const handleResetWheel = () => {
    setCupProfileSelections([]);
    setMainSelections([]);
    setSecondarySelections([]);
    setWheelResetKey((prev) => prev + 1);
  };

  const handleSave = () => {
    const isAllEmpty =
      !country.trim() &&
      !farm.trim() &&
      !roastDate.trim() &&
      !variety.trim() &&
      !dripper.trim() &&
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
    scrollToWheel();
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
    setRoaster(item.roaster || "");
    setMemo(item.memo || "");
    setLang(item.lang || "en");

    setCupProfileSelections([
      ...((item.cupProfileSelections || item.cupProfile || []).filter(Boolean)),
    ]);
    setMainSelections([...(item.mainSelections || []).filter(Boolean)]);
    setSecondarySelections([...(item.secondarySelections || []).filter(Boolean)]);

    setWheelResetKey((prev) => prev + 1);

    setTimeout(() => {
      scrollToWheel();
    }, 80);
  };

  const inputStyle = {
    width: "100%",
    minWidth: 0,
    height: 42,
    padding: "10px 12px",
    borderRadius: 10,
    border: "1px solid #d8cec1",
    boxSizing: "border-box",
    fontSize: 14,
    background: "#fff",
    color: "#2f2a26",
    WebkitTextFillColor: "#2f2a26",
    appearance: "none",
    WebkitAppearance: "none",
  };

  const textareaStyle = {
    ...inputStyle,
    minHeight: 96,
    height: "auto",
    resize: "vertical",
    fontFamily: "inherit",
    lineHeight: 1.5,
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
        padding: isMobile ? 12 : 24,
        boxSizing: "border-box",
      }}
    >
      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "flex",
          flexDirection: isMobile || isTablet ? "column" : "row",
          gap: isMobile ? 16 : 24,
          alignItems: "stretch",
          flexWrap: "nowrap",
        }}
      >
        <div
          ref={wheelSectionRef}
          style={{
            flex: isMobile || isTablet ? "1 1 auto" : "1 1 620px",
            width: "100%",
            minWidth: 0,
            background: "#fff",
            borderRadius: 16,
            padding: isMobile ? 12 : 20,
            border: "1px solid #e5ded3",
            boxSizing: "border-box",
          }}
        >
          <h2
            style={{
              marginTop: 0,
              marginBottom: 16,
              fontSize: isMobile ? 20 : 22,
              color: "#3d342b",
            }}
          >
            Flavor Wheel
          </h2>

          <div
            style={{
              width: "100%",
              minHeight: wheelStageHeight,
              display: "flex",
              justifyContent: "center",
              alignItems: "flex-start",
              overflow: "hidden",
            }}
          >
            <div
              style={{
                transform: `scale(${wheelScale})`,
                transformOrigin: "top center",
                width: "fit-content",
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
        </div>

        <div
          style={{
            flex: isMobile || isTablet ? "1 1 auto" : "0 1 420px",
            width: isMobile || isTablet ? "100%" : "420px",
            minWidth: 0,
            display: "flex",
            flexDirection: "column",
            gap: isMobile ? 16 : 20,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: isMobile ? "flex-start" : "center",
              flexDirection: isMobile ? "column" : "row",
              marginBottom: 0,
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
                justifyContent: isMobile ? "flex-start" : "flex-end",
              }}
            >
              <button
                onClick={() => changeLang("en")}
                style={{
                  ...languageButtonStyle,
                  background: lang === "en" ? "#f3efe8" : "#fff",
                }}
              >
                EN
              </button>
              <button
                onClick={() => changeLang("ja")}
                style={{
                  ...languageButtonStyle,
                  background: lang === "ja" ? "#f3efe8" : "#fff",
                }}
              >
                JP
              </button>
              <button
                onClick={() => changeLang("es")}
                style={{
                  ...languageButtonStyle,
                  background: lang === "es" ? "#f3efe8" : "#fff",
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
              padding: isMobile ? 14 : 20,
              border: "1px solid #e5ded3",
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: isMobile ? "1fr" : "1fr 1fr",
                gap: 12,
                alignItems: "stretch",
              }}
            >
              <div style={{ minWidth: 0 }}>
                <label style={infoLabelStyle}>Country</label>
                <input
                  type="text"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={infoLabelStyle}>Farm</label>
                <input
                  type="text"
                  value={farm}
                  onChange={(e) => setFarm(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={infoLabelStyle}>Roast Date</label>
                <input
                  type="date"
                  value={roastDate}
                  onChange={(e) => setRoastDate(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={infoLabelStyle}>Variety</label>
                <input
                  type="text"
                  value={variety}
                  onChange={(e) => setVariety(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={infoLabelStyle}>Dripper</label>
                <input
                  type="text"
                  value={dripper}
                  onChange={(e) => setDripper(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ minWidth: 0 }}>
                <label style={infoLabelStyle}>Roaster</label>
                <input
                  type="text"
                  value={roaster}
                  onChange={(e) => setRoaster(e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div style={{ gridColumn: "1 / -1", minWidth: 0 }}>
                <label style={infoLabelStyle}>Memo</label>
                <textarea
                  value={memo}
                  onChange={(e) => setMemo(e.target.value)}
                  style={textareaStyle}
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

              <button onClick={handleResetWheel} style={buttonStyle}>
                Reset Wheel
              </button>
            </div>
          </div>

          <div
            style={{
              background: "#fff",
              borderRadius: 16,
              padding: isMobile ? 14 : 20,
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