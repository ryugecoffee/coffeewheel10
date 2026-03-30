import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Svg,
  Path,
} from "@react-pdf/renderer";
import {
  buildMainWheelSegments,
  arcPath,
} from "./wheelGeometry.js";

const styles = StyleSheet.create({
  page: {
    paddingTop: 28,
    paddingBottom: 24,
    paddingHorizontal: 28,
    backgroundColor: "#ffffff",
    color: "#111111",
    fontSize: 10,
    fontFamily: "Helvetica",
    position: "relative",
  },

  headerRow: {
    flexDirection: "row",
    alignItems: "baseline",
    marginBottom: 10,
  },

  headerCountry: {
    fontSize: 24,
    fontWeight: 700,
    color: "#1f1a17",
    letterSpacing: 0.3,
  },

  headerFarm: {
    fontSize: 12,
    color: "#6f675f",
    marginLeft: 10,
    letterSpacing: 0.2,
  },

  infoSection: {
    marginBottom: 14,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
  },

infoRow: {
  flexDirection: "row",
  alignItems: "flex-start",
  justifyContent: "space-between",
  marginBottom: 10,
},

  infoItem: {
    flex: 1,
    paddingRight: 8,
  },

  memoItem: {
    flex: 1.4,
    paddingRight: 0,
  },

  infoLabel: {
    fontSize: 8,
    color: "#777777",
    marginBottom: 3,
  },

 infoValue: {
  fontSize: 10,
  color: "#111111",
  lineHeight: 1.45,
},

  section: {
    marginBottom: 16,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    color: "#222222",
  },

  chartBlock: {
    borderWidth: 1,
    borderColor: "#d8d2ca",
    borderRadius: 14,
    paddingTop: 8,
    paddingBottom: 8,
    paddingHorizontal: 8,
    backgroundColor: "#f6f3ef",
  },

  chartColumn: {
    flexDirection: "column",
    alignItems: "center",
  },

  wheelWrap: {
    alignItems: "center",
    justifyContent: "center",
  },

  wordGrid: {
    marginTop: 8,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "flex-start",
    width: "100%",
  },

  wordChip: {
    fontSize: 8,
    borderWidth: 1,
    borderColor: "#cfc7bd",
    borderRadius: 999,
    paddingTop: 4,
    paddingBottom: 4,
    paddingHorizontal: 7,
    marginRight: 6,
    marginBottom: 6,
    color: "#222222",
  },

  emptyText: {
    fontSize: 10,
    color: "#999999",
    marginTop: 8,
  },

  footer: {
    position: "absolute",
    left: 28,
    right: 28,
    bottom: 6,
    alignItems: "center",
  },

  footerMain: {
    fontSize: 10,
    color: "#777777",
    letterSpacing: 0.8,
    fontStyle: "italic",
  },

  footerSub: {
    fontSize: 7,
    color: "#b7b7b7",
    marginTop: 4,
    letterSpacing: 1.1,
  },
});

const safeArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean);
};

const uniqueArray = (arr) => [...new Set(arr.filter(Boolean))];

function FlavorWheelChart({ selectedFlavors = [] }) {
  const selectedSet = new Set(safeArray(selectedFlavors));
  const { ring1Segments, ring2Segments, ring3Segments } = buildMainWheelSegments();

  const cx = 170;
  const cy = 170;

  const ring1Inner = 44;
  const ring1Outer = 82;
  const ring2Inner = 82;
  const ring2Outer = 136;
  const ring3Inner = 136;
  const ring3Outer = 154;

  const hasSelections = selectedSet.size > 0;

  const isRing3Active = (seg) => selectedSet.has(seg.label);

  const isRing2Active = (seg) => {
    if (selectedSet.has(seg.label)) return true;
    return ring3Segments.some(
      (leaf) => leaf.parentMid === seg.label && selectedSet.has(leaf.label)
    );
  };

  const isRing1Active = (seg) => {
    if (selectedSet.has(seg.label)) return true;

    const hasSelectedMid = ring2Segments.some(
      (mid) => mid.parentTop === seg.label && selectedSet.has(mid.label)
    );
    if (hasSelectedMid) return true;

    return ring3Segments.some(
      (leaf) => leaf.parentTop === seg.label && selectedSet.has(leaf.label)
    );
  };

  return (
    <Svg width={340} height={340}>
      {ring3Segments.map((seg, i) => {
        const d = arcPath(cx, cy, ring3Inner, ring3Outer, seg.start, seg.end);
        const active = isRing3Active(seg);

        return (
          <Path
            key={`r3-${i}`}
            d={d}
            fill={seg.color}
            stroke="#f6f3ef"
            strokeWidth={2.2}
            opacity={!hasSelections ? 0.82 : active ? 1 : 0.08}
          />
        );
      })}

      {ring2Segments.map((seg, i) => {
        const outerRadius = seg.hasOuterBlock ? ring2Outer : ring3Outer;
        const d = arcPath(cx, cy, ring2Inner, outerRadius, seg.start, seg.end);
        const active = isRing2Active(seg);

        return (
          <Path
            key={`r2-${i}`}
            d={d}
            fill={seg.color}
            stroke="#f6f3ef"
            strokeWidth={2.6}
            opacity={!hasSelections ? 0.88 : active ? 0.98 : 0.1}
          />
        );
      })}

      {ring1Segments.map((seg, i) => {
        const d = arcPath(cx, cy, ring1Inner, ring1Outer, seg.start, seg.end);
        const active = isRing1Active(seg);

        return (
          <Path
            key={`r1-${i}`}
            d={d}
            fill={seg.color}
            stroke="#f6f3ef"
            strokeWidth={2.6}
            opacity={!hasSelections ? 0.96 : active ? 1 : 0.18}
          />
        );
      })}

      <Path
        d={arcPath(cx, cy, 0, ring1Inner - 2, 0, 359.99)}
        fill="#ffffff"
      />
    </Svg>
  );
}

export default function CoffeeFlavorWheelPDF({
  country = "",
  farm = "",
  roastDate = "",
  variety = "",
  dripper = "",
  roaster = "",
  memo = "",
  flavors = [],
  cupProfile = [],
  mainSelections = [],
  secondarySelections = [],
  cupProfileSelections = [],
}) {
  const { ring1Segments } = buildMainWheelSegments();
  const ring1LabelSet = new Set(ring1Segments.map((seg) => seg.label));

  const flavorListRaw = uniqueArray([
    ...safeArray(mainSelections),
    ...safeArray(secondarySelections),
    ...safeArray(flavors),
  ]);

  const cupProfileList = uniqueArray([
    ...safeArray(cupProfileSelections),
    ...safeArray(cupProfile),
  ]);

  const flavorWordList = flavorListRaw.filter(
    (label) => !ring1LabelSet.has(label)
  );

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerRow}>
          <Text style={styles.headerCountry}>{country || "-"}</Text>
          <Text style={styles.headerFarm}>{farm || "-"}</Text>
        </View>

<View style={styles.infoSection}>
  <View style={styles.infoRow}>
    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>Variety</Text>
      <Text style={styles.infoValue}>{variety || "-"}</Text>
    </View>

    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>Roast Date</Text>
      <Text style={styles.infoValue}>{roastDate || "-"}</Text>
    </View>

    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>Dripper</Text>
      <Text style={styles.infoValue}>{dripper || "-"}</Text>
    </View>

    <View style={styles.infoItem}>
      <Text style={styles.infoLabel}>Roaster</Text>
      <Text style={styles.infoValue}>{roaster || "-"}</Text>
    </View>
  </View>

  <View>
    <Text style={styles.infoLabel}>Memo</Text>
    <Text style={styles.infoValue}>{memo || "-"}</Text>
  </View>
</View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FLAVOR</Text>
          <View style={styles.chartBlock}>
            <View style={styles.chartColumn}>
              <View style={styles.wheelWrap}>
                <FlavorWheelChart selectedFlavors={flavorListRaw} />
              </View>

              {flavorWordList.length > 0 ? (
                <View style={styles.wordGrid}>
                  {flavorWordList.map((item, index) => (
                    <Text key={`flavor-word-${index}`} style={styles.wordChip}>
                      {item}
                    </Text>
                  ))}
                </View>
              ) : (
                <Text style={styles.emptyText}>No flavor selected</Text>
              )}
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>CUP PROFILE</Text>
          <View style={styles.chartBlock}>
            {cupProfileList.length > 0 ? (
              <View style={styles.wordGrid}>
                {cupProfileList.map((item, index) => (
                  <Text key={`cup-word-${index}`} style={styles.wordChip}>
                    {item}
                  </Text>
                ))}
              </View>
            ) : (
              <Text style={styles.emptyText}>No cup profile selected</Text>
            )}
          </View>
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerMain}>Another Day, Another Coffee</Text>
          <Text style={styles.footerSub}>Ryuge Coffee</Text>
        </View>
      </Page>
    </Document>
  );
}