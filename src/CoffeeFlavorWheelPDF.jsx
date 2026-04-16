import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  G,
  Path,
  Circle,
  Font,
} from "@react-pdf/renderer";
import { translateFlavor } from "./flavorTranslations";
import { getPdfText } from "./pdfTranslations";
import {
  buildMainWheelSegments,
  wheelConstants,
  arcPath,
} from "./wheelGeometry";

Font.register({
  family: "NotoSansJP",
  src: "https://flavorcoffeewheel.com/fonts/NotoSansJP-Regular.ttf",
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 26,
    paddingBottom: 24,
    paddingHorizontal: 24,
    fontSize: 10,
    color: "#222",
    backgroundColor: "#fff",
    fontFamily: "NotoSansJP",
  },
  topInfoRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "flex-start",
    columnGap: 48,
    marginBottom: 10,
  },
  topInfoBlock: {
    minWidth: 140,
    alignItems: "center",
  },
  topInfoValue: {
    fontFamily: "NotoSansJP",
    fontSize: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  infoCard: {
    borderWidth: 1,
    borderColor: "#d9d6d0",
    borderRadius: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    marginBottom: 14,
  },
  infoCardRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  boxedItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  boxedLabel: {
    fontFamily: "NotoSansJP",
    fontSize: 7,
    fontWeight: "bold",
    color: "#777",
    marginBottom: 2,
    textAlign: "center",
  },
  boxedValue: {
    fontFamily: "NotoSansJP",
    fontSize: 10,
    textAlign: "center",
  },
  memoDivider: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#e5e1da",
  },
  memoLabel: {
    fontFamily: "NotoSansJP",
    fontSize: 7,
    fontWeight: "bold",
    color: "#777",
    marginBottom: 4,
    textAlign: "center",
  },
  memoValue: {
    fontFamily: "NotoSansJP",
    fontSize: 9.5,
    lineHeight: 1.45,
    textAlign: "center",
  },
  section: {
    marginBottom: 12,
  },
  sectionTitle: {
    fontFamily: "NotoSansJP",
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
    color: "#444",
  },
  wheelCard: {
    borderWidth: 1,
    borderColor: "#e5e1da",
    borderRadius: 10,
    backgroundColor: "#f5f2ed",
    paddingVertical: 14,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  chipWrap: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 6,
  },
  chip: {
    borderWidth: 1,
    borderColor: "#d8d3cb",
    borderRadius: 999,
    paddingVertical: 3,
    paddingHorizontal: 8,
    backgroundColor: "#fff",
  },
  chipText: {
    fontFamily: "NotoSansJP",
    fontSize: 8,
    color: "#555",
    textAlign: "center",
  },
  savedAtLabel: {
    fontFamily: "NotoSansJP",
    fontSize: 7,
    fontWeight: "bold",
    color: "#777",
    marginBottom: 2,
  },
  savedAtValue: {
    fontFamily: "NotoSansJP",
    fontSize: 9,
    color: "#555",
  },
  footer: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 16,
    alignItems: "center",
  },
  footerMain: {
    fontFamily: "NotoSansJP",
    fontSize: 8.5,
    color: "#8e8e8e",
    textAlign: "center",
  },
});

/* =========================
   Utils
========================= */

function safeArray(value) {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean);
}

function safeText(value, fallback = "-") {
  if (value === null || value === undefined) return fallback;
  const text = String(value).trim();
  return text || fallback;
}

function uniqueArray(items = []) {
  return [...new Set(safeArray(items))];
}

function normalizeLabelPdf(label) {
  return String(label || "")
    .replace(/\n/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toUpperCase();
}

function formatDateValue(value, language = "en") {
  if (!value) return "-";
  try {
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return String(value);
    const locale =
      language === "ja" ? "ja-JP" : language === "es" ? "es-ES" : "en-US";
    return d.toLocaleString(locale);
  } catch {
    return String(value);
  }
}

/* =========================
   Wheel SVG
========================= */

function PdfFlavorWheel({ mainSelections = [], secondarySelections = [] }) {
  const { ring1Segments, ring2Segments, ring3Segments } = buildMainWheelSegments();
  const { cx, cy, ring1Inner, ring1Outer, ring2Inner, ring2Outer, ring3Inner, ring3Outer } = wheelConstants;

  const selectedSet = new Set([
    ...mainSelections.map(normalizeLabelPdf),
    ...secondarySelections.map(normalizeLabelPdf),
  ]);

  const isSelected = (label) => selectedSet.has(normalizeLabelPdf(label));

  const svgSize = 495;

  return (
    <Svg width={svgSize} height={svgSize} viewBox="0 0 900 900">
      <G>
        {ring1Segments.map((seg, i) => (
          <Path
            key={`r1-${i}`}
            d={arcPath(cx, cy, ring1Inner, ring1Outer, seg.start, seg.end)}
            fill={isSelected(seg.label) ? seg.color : seg.color + "55"}
            stroke="#fff"
            strokeWidth={1}
          />
        ))}
        {ring2Segments.map((seg, i) => (
          <Path
            key={`r2-${i}`}
            d={arcPath(cx, cy, ring2Inner, ring2Outer, seg.start, seg.end)}
            fill={isSelected(seg.label) ? seg.color : seg.color + "44"}
            stroke="#fff"
            strokeWidth={1}
          />
        ))}
        {ring3Segments.map((seg, i) => (
          <Path
            key={`r3-${i}`}
            d={arcPath(cx, cy, ring3Inner, ring3Outer, seg.start, seg.end)}
            fill={isSelected(seg.label) ? seg.color : seg.color + "33"}
            stroke="#fff"
            strokeWidth={0.5}
          />
        ))}
        <Circle cx={cx} cy={cy} r={ring1Inner} fill="#f5f2ed" />
      </G>
    </Svg>
  );
}

/* =========================
   Export
========================= */

export default function CoffeeFlavorWheelPDF(props) {
  const t = getPdfText(props.language || "en");
  const lang = props.language || "en";

  const selectedMainLabels = safeArray(props.selectedMainLabels);
  const selectedMiddleLabels = safeArray(props.selectedMiddleLabels);
  const selectedLeafLabels = safeArray(props.selectedLeafLabels);
  const cupProfile = safeArray(props.cupProfile);

  const allFlavors = uniqueArray([
    ...selectedMainLabels,
    ...selectedMiddleLabels,
    ...selectedLeafLabels,
  ]);

  const mainSelections = safeArray(props.note?.mainSelections ?? props.mainSelections);
  const secondarySelections = safeArray(props.note?.secondarySelections ?? props.secondarySelections);

  return (
    <Document>
      <Page size="A4" style={styles.page}>

        <View style={styles.topInfoRow}>
          <View style={styles.topInfoBlock}>
            <Text style={styles.topInfoValue}>{safeText(props.country)}</Text>
            <Text style={{ fontSize: 8, color: "#888", marginTop: 2 }}>{t.country || "Country"}</Text>
          </View>
          <View style={styles.topInfoBlock}>
            <Text style={styles.topInfoValue}>{safeText(props.farm)}</Text>
            <Text style={{ fontSize: 8, color: "#888", marginTop: 2 }}>{t.farm || "Farm"}</Text>
          </View>
        </View>

        <View style={styles.infoCard}>
          <View style={styles.infoCardRow}>
            <View style={styles.boxedItem}>
              <Text style={styles.boxedLabel}>{t.roastDate || "Roast Date"}</Text>
              <Text style={styles.boxedValue}>{safeText(props.roastDate)}</Text>
            </View>
            <View style={styles.boxedItem}>
              <Text style={styles.boxedLabel}>{t.variety || "Variety"}</Text>
              <Text style={styles.boxedValue}>{safeText(props.variety)}</Text>
            </View>
            <View style={styles.boxedItem}>
              <Text style={styles.boxedLabel}>{t.dripper || "Dripper"}</Text>
              <Text style={styles.boxedValue}>{safeText(props.dripper)}</Text>
            </View>
            <View style={styles.boxedItem}>
              <Text style={styles.boxedLabel}>{t.roaster || "Roaster"}</Text>
              <Text style={styles.boxedValue}>{safeText(props.roaster)}</Text>
            </View>
          </View>
          {props.memo ? (
            <View style={styles.memoDivider}>
              <Text style={styles.memoLabel}>{t.memo || "Memo"}</Text>
              <Text style={styles.memoValue}>{props.memo}</Text>
            </View>
          ) : null}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.flavorNotes || "Flavor Notes"}</Text>
          <View style={styles.wheelCard}>
            <PdfFlavorWheel
              mainSelections={mainSelections}
              secondarySelections={secondarySelections}
            />
          </View>
        </View>

        {allFlavors.length > 0 ? (
          <View style={styles.chipWrap}>
            {allFlavors.map((item, i) => (
              <View key={i} style={styles.chip}>
                <Text style={styles.chipText}>{translateFlavor(item, lang)}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {props.savedAt ? (
          <View style={{ marginTop: 10 }}>
            <Text style={styles.savedAtLabel}>{t.savedAt || "Saved at"}</Text>
            <Text style={styles.savedAtValue}>{formatDateValue(props.savedAt, lang)}</Text>
          </View>
        ) : null}

        <View style={styles.footer}>
          <Text style={styles.footerMain}>flavorcoffeewheel.com</Text>
        </View>

      </Page>
    </Document>
  );
}