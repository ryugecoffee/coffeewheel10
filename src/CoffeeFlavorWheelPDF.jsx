import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font,
  Svg,
  G,
  Path,
  Circle,
} from "@react-pdf/renderer";
import NotoSansJP from "./fonts/NotoSansJP-VariableFont_wght.ttf";
import { translateFlavor } from "./flavorTranslations";
import { getPdfText } from "./pdfTranslations";
import { buildMainWheelSegments } from "./wheelGeometry";

Font.register({
  family: "NotoSansJP",
  src: NotoSansJP,
});

const styles = StyleSheet.create({
  page: {
    paddingTop: 18,
    paddingBottom: 24,
    paddingHorizontal: 24,
    fontSize: 9,
    fontFamily: "NotoSansJP",
    color: "#111111",
    lineHeight: 1.2,
    backgroundColor: "#ffffff",
  },

  topSection: {
    marginBottom: 8,
  },

  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    marginBottom: 8,
  },

  titleBlockLeft: {
    width: "48.5%",
  },

  titleBlockRight: {
    width: "48.5%",
  },

  titleLabel: {
    fontSize: 7,
    color: "#888888",
    marginBottom: 1,
  },

  titleValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#111111",
  },

  infoGridRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  marginBottom: 8,
  gap: 10,
},

infoGridBox: {
  width: "48.5%",
  paddingTop: 4,
  paddingBottom: 4,
},

  infoLabel: {
  fontSize: 7.5,
  color: "#777777",
  marginBottom: 3,
},

infoValue: {
  fontSize: 10,
  color: "#111111",
},

  memoRow: {
    marginBottom: 8,
  },

  memoBox: {
    borderWidth: 1,
    borderColor: "#e2e2e2",
    borderRadius: 8,
    paddingTop: 6,
    paddingBottom: 6,
    paddingHorizontal: 8,
    minHeight: 34,
  },

  section: {
    marginBottom: 8,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "bold",
    marginBottom: 6,
    paddingBottom: 3,
    borderBottomWidth: 1,
    borderBottomColor: "#e5e5e5",
  },

  wheelCard: {
    borderWidth: 1,
    borderColor: "#ddd8d0",
    borderRadius: 14,
    backgroundColor: "#f5f2ed",
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    alignItems: "center",
  },

  wheelEmptyText: {
    marginTop: 6,
    fontSize: 9,
    color: "#8a8a8a",
    textAlign: "center",
  },

  chipWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 6,
  },

  chip: {
    borderWidth: 1,
    borderColor: "#d0d0d0",
    borderRadius: 20,
    paddingTop: 3,
    paddingBottom: 3,
    paddingHorizontal: 7,
    marginRight: 5,
    marginBottom: 5,
    backgroundColor: "#fafafa",
  },

  chipText: {
    fontSize: 8,
  },

  emptyText: {
    fontSize: 9,
    color: "#777777",
  },

  footer: {
    position: "absolute",
    left: 24,
    right: 24,
    bottom: 12,
    alignItems: "center",
  },

  footerMain: {
    fontSize: 10,
    color: "#8c8c8c",
  },

  footerSub: {
    fontSize: 7,
    color: "#a0a0a0",
    marginTop: 1,
  },
});

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

function pickFirstArray(...candidates) {
  for (const candidate of candidates) {
    if (Array.isArray(candidate)) return candidate;
  }
  return [];
}

function mergeSelections(...arrays) {
  return uniqueArray(arrays.flatMap((arr) => safeArray(arr)));
}

function translateFlavorSafe(label, language) {
  if (!label) return "";
  try {
    const translated = translateFlavor(label, language);
    if (translated && typeof translated === "string") return translated;
    return String(label);
  } catch {
    return String(label);
  }
}

function renderTranslatedList(items, language) {
  return uniqueArray(items).map((item) => translateFlavorSafe(item, language));
}

function blendHex(hex, mixHex = "#ffffff", ratio = 0.7) {
  const clean = String(hex || "#cccccc").replace("#", "");
  const mix = String(mixHex || "#ffffff").replace("#", "");

  if (clean.length !== 6 || mix.length !== 6) return hex || "#cccccc";

  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);

  const mr = parseInt(mix.slice(0, 2), 16);
  const mg = parseInt(mix.slice(2, 4), 16);
  const mb = parseInt(mix.slice(4, 6), 16);

  const nr = Math.round(r * (1 - ratio) + mr * ratio);
  const ng = Math.round(g * (1 - ratio) + mg * ratio);
  const nb = Math.round(b * (1 - ratio) + mb * ratio);

  return `#${[nr, ng, nb]
    .map((v) => v.toString(16).padStart(2, "0"))
    .join("")}`;
}

function polarToCartesian(cx, cy, r, angle) {
  const rad = ((angle - 90) * Math.PI) / 180;
  return {
    x: cx + r * Math.cos(rad),
    y: cy + r * Math.sin(rad),
  };
}

function donutPath(cx, cy, innerR, outerR, startAngle, endAngle) {
  const startOuter = polarToCartesian(cx, cy, outerR, startAngle);
  const endOuter = polarToCartesian(cx, cy, outerR, endAngle);
  const startInner = polarToCartesian(cx, cy, innerR, startAngle);
  const endInner = polarToCartesian(cx, cy, innerR, endAngle);

  const largeArcFlag = endAngle - startAngle > 180 ? 1 : 0;

  return [
    `M ${startOuter.x} ${startOuter.y}`,
    `A ${outerR} ${outerR} 0 ${largeArcFlag} 1 ${endOuter.x} ${endOuter.y}`,
    `L ${endInner.x} ${endInner.y}`,
    `A ${innerR} ${innerR} 0 ${largeArcFlag} 0 ${startInner.x} ${startInner.y}`,
    "Z",
  ].join(" ");
}

function normalizeSegmentGeometry(seg, fallbackInnerR, fallbackOuterR) {
  return {
    ...seg,
    startAngle:
      typeof seg?.startAngle === "number"
        ? seg.startAngle
        : typeof seg?.start === "number"
        ? seg.start
        : null,
    endAngle:
      typeof seg?.endAngle === "number"
        ? seg.endAngle
        : typeof seg?.end === "number"
        ? seg.end
        : null,
    innerR:
      typeof seg?.innerR === "number" ? seg.innerR : fallbackInnerR,
    outerR:
      typeof seg?.outerR === "number" ? seg.outerR : fallbackOuterR,
  };
}

function normalizeWheelGeometry(rawWheel) {
  if (!rawWheel) return { ring1Segments: [], ring2Segments: [], ring3Segments: [] };

  const ring1Segments = safeArray(rawWheel.ring1Segments).map((seg) =>
    normalizeSegmentGeometry(seg, 62, 118)
  );

  const ring2Segments = safeArray(rawWheel.ring2Segments).map((seg) =>
    normalizeSegmentGeometry(seg, 119, 172)
  );

 const ring3Segments = safeArray(rawWheel.ring3Segments).map((seg) =>
  normalizeSegmentGeometry(
    seg,
    typeof seg?.innerR === "number" ? seg.innerR : 173,
    typeof seg?.outerR === "number" ? seg.outerR : 185
  )
);

  return {
    ring1Segments: ring1Segments.filter(
      (seg) =>
        typeof seg.startAngle === "number" &&
        typeof seg.endAngle === "number"
    ),
    ring2Segments: ring2Segments.filter(
      (seg) =>
        typeof seg.startAngle === "number" &&
        typeof seg.endAngle === "number"
    ),
    ring3Segments: ring3Segments.filter(
      (seg) =>
        typeof seg.startAngle === "number" &&
        typeof seg.endAngle === "number"
    ),
  };
}

function normalizePdfData(props = {}) {
  const note = props.note || {};

  const language =
    props.language ||
    props.lang ||
    note.language ||
    note.lang ||
    "en";

  const selectedMainLabels = pickFirstArray(
    props.selectedMainLabels,
    note.selectedMainLabels
  );

  const selectedMiddleLabels = pickFirstArray(
    props.selectedMiddleLabels,
    note.selectedMiddleLabels
  );

  const selectedLeafLabels = pickFirstArray(
    props.selectedLeafLabels,
    props.selectedFlavors,
    props.flavorNotes,
    note.selectedLeafLabels,
    note.selectedFlavors,
    note.flavorNotes
  );

  const fallbackMainSelections = pickFirstArray(
    props.mainSelections,
    note.mainSelections,
    props.rawMainSelections,
    note.rawMainSelections
  );

  const mergedMainSelections = mergeSelections(
    selectedMainLabels,
    selectedMiddleLabels,
    selectedLeafLabels,
    fallbackMainSelections
  );

  return {
    language,
    country: props.country ?? note.country ?? "",
    farm: props.farm ?? note.farm ?? "",
    roastDate: props.roastDate ?? note.roastDate ?? "",
    variety: props.variety ?? note.variety ?? "",
    dripper: props.dripper ?? note.dripper ?? "",
    roaster: props.roaster ?? note.roaster ?? "",
    memo: props.memo ?? note.memo ?? "",
    savedAt: props.savedAt ?? note.savedAt ?? note.createdAt ?? "",
    selectedMainLabels: uniqueArray(selectedMainLabels),
    selectedMiddleLabels: uniqueArray(selectedMiddleLabels),
    selectedLeafLabels: uniqueArray(selectedLeafLabels),
    mergedMainSelections: uniqueArray(mergedMainSelections),
    selectedFlavors: uniqueArray(selectedLeafLabels),
    cupProfile: uniqueArray(
      pickFirstArray(
        props.cupProfile,
        props.selectedCupProfile,
        props.cupProfileSelections,
        note.cupProfile,
        note.selectedCupProfile,
        note.cupProfileSelections
      )
    ),
  };
}

function MainFlavorWheel({
  selectedMainLabels,
  selectedMiddleLabels,
  selectedLeafLabels,
  mergedMainSelections,
  displaySelections,
  language,
  emptyLabel,
}) {
  const selectedMainSet = new Set(
    safeArray(selectedMainLabels).map(normalizeLabel)
  );
  const selectedMiddleSet = new Set(
    safeArray(selectedMiddleLabels).map(normalizeLabel)
  );
  const selectedLeafSet = new Set(
    safeArray(selectedLeafLabels).map(normalizeLabel)
  );
  const mergedSet = new Set(
    safeArray(mergedMainSelections).map(normalizeLabel)
  );

  const rawWheel = buildMainWheelSegments();
  const { ring1Segments, ring2Segments, ring3Segments } =
    normalizeWheelGeometry(rawWheel);

  const hasGeometry =
    ring1Segments.length > 0 ||
    ring2Segments.length > 0 ||
    ring3Segments.length > 0;

    const selectedLeafParentMidSet = new Set(
  ring3Segments
    .filter((seg) => selectedLeafSet.has(normalizeLabel(seg.label)))
    .map((seg) => normalizeLabel(seg.parentMid))
);

const selectedLeafParentTopSet = new Set(
  ring3Segments
    .filter((seg) => selectedLeafSet.has(normalizeLabel(seg.label)))
    .map((seg) => normalizeLabel(seg.parentTop))
);

  const hasSelection =
    selectedMainSet.size > 0 ||
    selectedMiddleSet.size > 0 ||
    selectedLeafSet.size > 0 ||
    mergedSet.size > 0;

  if (!hasGeometry) {
    return (
      <View style={styles.wheelCard}>
        <Text style={styles.wheelEmptyText}>{emptyLabel}</Text>
      </View>
    );
  }

 const getFill = (seg, ringType) => {
  const normalized = normalizeLabel(seg.label);
  const baseColor = seg.color || "#cccccc";

  let isSelected = false;

  if (ringType === "ring1") {
    isSelected =
      selectedMainSet.has(normalized) ||
      mergedSet.has(normalized) ||
      selectedLeafParentTopSet.has(normalized);
  } else if (ringType === "ring2") {
    isSelected =
      selectedMiddleSet.has(normalized) ||
      mergedSet.has(normalized) ||
      selectedLeafParentMidSet.has(normalized);
  } else {
    isSelected = selectedLeafSet.has(normalized) || mergedSet.has(normalized);
  }

  if (!hasSelection) {
    return blendHex(baseColor, "#f5f2ed", 0.84);
  }

  return isSelected ? baseColor : blendHex(baseColor, "#f5f2ed", 0.84);
};

  return (
    <View style={styles.wheelCard}>
      <Svg width="350" height="350" viewBox="0 0 420 420">
        <G>
          {ring1Segments.map((seg, index) => (
            <Path
              key={`ring1-${seg.label || "segment"}-${index}`}
              d={donutPath(
                210,
                210,
                seg.innerR,
                seg.outerR,
                seg.startAngle,
                seg.endAngle
              )}
              fill={getFill(seg, "ring1")}
              stroke="#f5f2ed"
              strokeWidth={1.2}
            />
          ))}

          {ring2Segments.map((seg, index) => (
            <Path
              key={`ring2-${seg.label || "segment"}-${index}`}
              d={donutPath(
                210,
                210,
                seg.innerR,
                seg.outerR,
                seg.startAngle,
                seg.endAngle
              )}
              fill={getFill(seg, "ring2")}
              stroke="#f5f2ed"
              strokeWidth={1.2}
            />
          ))}

          {ring3Segments
  .filter((seg) => seg.drawBlock)
  .map((seg, index) => (
    <Path
      key={`ring3-${seg.label || "segment"}-${index}`}
      d={donutPath(
        210,
        210,
        seg.innerR,
        seg.outerR,
        seg.startAngle,
        seg.endAngle
      )}
      fill={getFill(seg, "ring3")}
      stroke="#f5f2ed"
      strokeWidth={0.9}
    />
  ))}

          <Circle cx="210" cy="210" r="44" fill="#f5f2ed" />
        </G>
      </Svg>

      {!displaySelections.length ? (
        <Text style={styles.wheelEmptyText}>{emptyLabel}</Text>
      ) : (
        <View style={styles.chipWrap}>
          {renderTranslatedList(displaySelections, language).map((item, index) => (
            <View key={`${item}-${index}`} style={styles.chip}>
              <Text style={styles.chipText}>{item}</Text>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

function InfoGridRow({ items }) {
  return (
    <View style={styles.infoGridRow}>
      {items.map((item, index) => (
        <View key={`${item.label}-${index}`} style={styles.infoGridBox}>
          <Text style={styles.infoLabel}>{item.label}</Text>
          <Text style={styles.infoValue}>{safeText(item.value)}</Text>
        </View>
      ))}
    </View>
  );
}

function ChipList({ items, emptyLabel, language }) {
  const translatedItems = renderTranslatedList(items, language);

  if (!translatedItems.length) {
    return <Text style={styles.emptyText}>{emptyLabel}</Text>;
  }

  return (
    <View style={styles.chipWrap}>
      {translatedItems.map((item, index) => (
        <View key={`${item}-${index}`} style={styles.chip}>
          <Text style={styles.chipText}>{item}</Text>
        </View>
      ))}
    </View>
  );
}

export default function CoffeeFlavorWheelPDF(props) {
  const data = normalizePdfData(props);
  const t = getPdfText(data.language);

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.topSection}>
          <View style={styles.titleRow}>
            <View style={styles.titleBlockLeft}>
              <Text style={styles.titleLabel}>{t.country}</Text>
              <Text style={styles.titleValue}>{safeText(data.country, t.noData)}</Text>
            </View>

            <View style={styles.titleBlockRight}>
              <Text style={styles.titleLabel}>{t.farm}</Text>
              <Text style={styles.titleValue}>{safeText(data.farm, t.noData)}</Text>
            </View>
          </View>

          <InfoGridRow
  items={[
    { label: t.roastDate, value: data.roastDate || t.noData },
    { label: t.variety, value: data.variety || t.noData },
  ]}
/>

<InfoGridRow
  items={[
    { label: t.dripper, value: data.dripper || t.noData },
    { label: t.roaster, value: data.roaster || t.noData },
  ]}
/>

          <View style={styles.memoRow}>
            <Text style={styles.infoLabel}>{t.memo}</Text>
            <View style={styles.memoBox}>
              <Text>{safeText(data.memo, t.noMemo)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.flavorNotes}</Text>
          <MainFlavorWheel
            selectedMainLabels={data.selectedMainLabels}
            selectedMiddleLabels={data.selectedMiddleLabels}
            selectedLeafLabels={data.selectedLeafLabels}
            mergedMainSelections={data.mergedMainSelections}
            displaySelections={data.selectedFlavors}
            language={data.language}
            emptyLabel={t.noFlavorNotes}
          />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>{t.cupProfile}</Text>
          <ChipList
            items={data.cupProfile}
            emptyLabel={t.noCupProfile}
            language={data.language}
          />
        </View>

        {data.savedAt ? (
          <View style={styles.section}>
            <Text style={styles.infoLabel}>{t.savedAt}</Text>
            <Text style={styles.infoValue}>
              {formatDateValue(data.savedAt, data.language)}
            </Text>
          </View>
        ) : null}

        <View style={styles.footer} fixed>
          <Text style={styles.footerMain}>{t.footerMain}</Text>
          <Text style={styles.footerSub}>{t.footerSub}</Text>
        </View>
      </Page>
    </Document>
  );
}