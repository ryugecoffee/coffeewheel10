Font.register({
  family: "NotoSansJP",
  src: "/fonts/NotoSansJP-Regular.ttf",
});

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
import { buildMainWheelSegments } from "./wheelGeometry";

Font.register({
  family: "NotoSansJP",
  src: NotoSansJPRegular,
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

  infoSection: {
    marginBottom: 14,
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

  wheelEmptyText: {
    fontFamily: "NotoSansJP",
    fontSize: 9,
    color: "#777",
    textAlign: "center",
    marginTop: 8,
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

  emptyText: {
    fontFamily: "NotoSansJP",
    fontSize: 9,
    color: "#777",
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

  footerSub: {
    fontFamily: "NotoSansJP",
    fontSize: 6,
    color: "#b0b0b0",
    textAlign: "center",
    marginTop: 1,
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

function normalizeLabel(label) {
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

function renderTranslatedList(items, language) {
  return [...new Set(items || [])].map((item) =>
    translateFlavor(item, language)
  );
}

/* =========================
   Export
========================= */

export default function CoffeeFlavorWheelPDF(props) {
  const t = getPdfText(props.language || "en");

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.sectionTitle}>{t.flavorNotes}</Text>
        <Text>{props.note?.country}</Text>
      </Page>
    </Document>
  );
}