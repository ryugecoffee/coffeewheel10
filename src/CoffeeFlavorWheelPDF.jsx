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
    paddingTop: 34,
    paddingBottom: 26,
    paddingHorizontal: 28,
    backgroundColor: "#ffffff",
    color: "#111111",
    fontSize: 10,
    fontFamily: "Helvetica",
    position: "relative",
  },

  header: {
    marginBottom: 18,
  },

  headerTitle: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.2,
  },

  section: {
    marginBottom: 18,
  },

  sectionTitle: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.8,
    marginBottom: 8,
    color: "#444444",
  },

  infoSection: {
    marginBottom: 18,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 10,
    padding: 14,
  },

  infoGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginHorizontal: -6,
  },

  infoItem: {
    width: "50%",
    paddingHorizontal: 6,
    marginBottom: 10,
  },

  memoItem: {
    width: "100%",
    paddingHorizontal: 6,
    marginTop: 2,
  },

  infoLabel: {
    fontSize: 9,
    color: "#777777",
    marginBottom: 3,
  },

  infoValue: {
    fontSize: 11,
    color: "#111111",
  },

  chartBlock: {
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 10,
    padding: 14,
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
    marginTop: 10,
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
  },

  wordChip: {
    fontSize: 9,
    borderWidth: 1,
    borderColor: "#d8d8d8",
    borderRadius: 999,
    paddingTop: 4,
    paddingBottom: 4,
    paddingHorizontal: 8,
    marginRight: 6,
    marginBottom: 6,
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
    bottom: 12,
    alignItems: "center",
  },

  footerLine: {
    fontSize: 10,
    color: "#111111",
    textAlign: "center",
  },
});

const safeArray = (value) => {
  if (!Array.isArray(value)) return [];
  return value.filter(Boolean);
};

const uniqueArray = (arr) => [...new Set(arr.filter(Boolean))];

function FlavorWheelChart({ selectedFlavors = [] }) {
  const flavorList = safeArray(selectedFlavors);
  const selectedSet = new Set(flavorList);

  const { ring1Segments, ring2Segments, ring3Segments } = buildMainWheelSegments();

  const cx = 150;
  const cy = 150;

  const ring1Inner = 30;
  const ring1Outer = 58;
  const ring2Inner = 58;
  const ring2Outer = 96;
  const ring3Inner = 96;
  const ring3Outer = 108;

  return (
    <Svg width={300} height={300}>
      {ring1Segments.map((seg, i) => {
        const d = arcPath(cx, cy, ring1Inner, ring1Outer, seg.start, seg.end);

        return (
          <Path
            key={`r1-${i}`}
            d={d}
            fill={seg.color}
            opacity={selectedSet.size === 0 ? 0.92 : 0.12}
          />
        );
      })}

      {ring2Segments.map((seg, i) => {
        const outerRadius = seg.hasOuterBlock ? ring2Outer : ring3Outer;

        const d = arcPath(cx, cy, ring2Inner, outerRadius, seg.start, seg.end);

        const isActiveParent = ring3Segments.some(
          (leaf) => leaf.parentMid === seg.label && selectedSet.has(leaf.label)
        );

        return (
          <Path
            key={`r2-${i}`}
            d={d}
            fill={seg.color}
            opacity={selectedSet.size === 0 ? 0.82 : isActiveParent ? 0.92 : 0.06}
          />
        );
      })}

      {ring3Segments.map((seg, i) => {
        const isSelected = selectedSet.has(seg.label);
        const d = arcPath(cx, cy, ring3Inner, ring3Outer, seg.start, seg.end);

        return (
          <Path
            key={`r3-${i}`}
            d={d}
            fill={seg.color}
            opacity={selectedSet.size === 0 ? 0.72 : isSelected ? 0.98 : 0.04}
          />
        );
      })}
    </Svg>
  );
}

function SecondaryWheelChart({ selectedCupProfile = [] }) {
  const cupList = safeArray(selectedCupProfile);

  return (
    <View style={{ marginTop: 10 }}>
      {cupList.length > 0 ? (
        <Text>{cupList.join(", ")}</Text>
      ) : (
        <Text style={{ color: "#999" }}>No cup profile selected</Text>
      )}
    </View>
  );
}

export default function CoffeeFlavorWheelPDF({
  country = "",
  farm = "",
  variety = "",
  roaster = "",
  memo = "",
  flavors = [],
  cupProfile = [],
}) {
  const flavorList = uniqueArray(safeArray(flavors));
  const cupProfileList = uniqueArray(safeArray(cupProfile));

  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Coffee Flavor Wheel</Text>
        </View>

        <View style={styles.infoSection}>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Country</Text>
              <Text style={styles.infoValue}>{country || "-"}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Farm</Text>
              <Text style={styles.infoValue}>{farm || "-"}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Variety</Text>
              <Text style={styles.infoValue}>{variety || "-"}</Text>
            </View>

            <View style={styles.infoItem}>
              <Text style={styles.infoLabel}>Roaster</Text>
              <Text style={styles.infoValue}>{roaster || "-"}</Text>
            </View>

            <View style={styles.memoItem}>
              <Text style={styles.infoLabel}>Memo</Text>
              <Text style={styles.infoValue}>{memo || "-"}</Text>
            </View>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>FLAVOR</Text>
          <View style={styles.chartBlock}>
            <View style={styles.chartColumn}>
              <View style={styles.wheelWrap}>
                <FlavorWheelChart selectedFlavors={flavorList} />
              </View>

              {flavorList.length > 0 ? (
                <View style={styles.wordGrid}>
                  {flavorList.map((item, index) => (
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
            <View style={styles.chartColumn}>
              <View style={styles.wheelWrap}>
                <SecondaryWheelChart selectedCupProfile={cupProfileList} />
              </View>

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
        </View>

        <View style={styles.footer}>
          <Text style={styles.footerLine}>Ryuge Coffee</Text>
        </View>
      </Page>
    </Document>
  );
}