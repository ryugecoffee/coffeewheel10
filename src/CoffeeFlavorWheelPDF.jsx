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
  marginBottom: 8,
},

headerCountry: {
  fontSize: 24,
  fontWeight: 700,
  color: "#1f1a17",
  marginBottom: 2,
  letterSpacing: 0.4,
},

headerFarm: {
  fontSize: 12,
  color: "#6f675f",
  letterSpacing: 0.3,
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
    marginBottom: 12,
    borderWidth: 1,
    borderColor: "#dddddd",
    borderRadius: 10,
    padding: 10,
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
  borderColor: "#d8d2ca",
  borderRadius: 14,
  padding: 8,
  backgroundColor: "#e7e3dd",
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
    bottom: 6,
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

  const cx = 170;
  const cy = 170;

  const ring1Inner = 44;
  const ring1Outer = 82;
  const ring2Inner = 82;
  const ring2Outer = 136;
  const ring3Inner = 136;
  const ring3Outer = 154;

  return (
    <Svg width={340} height={340}>
      {ring3Segments.map((seg, i) => {
        const isSelected = selectedSet.has(seg.label);
        const d = arcPath(cx, cy, ring3Inner, ring3Outer, seg.start, seg.end);

        return (
          <Path
            key={`r3-${i}`}
            d={d}
            fill={seg.color}
            stroke="#e7e3dd"
            strokeWidth={2.2}
            opacity={selectedSet.size === 0 ? 0.82 : isSelected ? 1 : 0.12}
          />
        );
      })}

      {ring2Segments.map((seg, i) => {
        const outerRadius = seg.hasOuterBlock ? ring2Outer : ring3Outer;
        const d = arcPath(cx, cy, ring2Inner, outerRadius, seg.start, seg.end);

        const isActiveParent = seg.hasOuterBlock
          ? ring3Segments.some(
              (leaf) => leaf.parentMid === seg.label && selectedSet.has(leaf.label)
            )
          : selectedSet.has(seg.label);

        return (
          <Path
            key={`r2-${i}`}
            d={d}
            fill={seg.color}
            stroke="#e7e3dd"
            strokeWidth={2.6}
            opacity={selectedSet.size === 0 ? 0.88 : isActiveParent ? 0.96 : 0.14}
          />
        );
      })}

      {ring1Segments.map((seg, i) => {
        const d = arcPath(cx, cy, ring1Inner, ring1Outer, seg.start, seg.end);

        const isActiveParent =
          ring3Segments.some(
            (leaf) => leaf.parentTop === seg.label && selectedSet.has(leaf.label)
          ) ||
          ring2Segments.some(
            (mid) =>
              mid.parentTop === seg.label &&
              !mid.hasOuterBlock &&
              selectedSet.has(mid.label)
          );

        return (
          <Path
            key={`r1-${i}`}
            d={d}
            fill={isActiveParent || selectedSet.size === 0 ? seg.color : "#ece7e0"}
            stroke="#e7e3dd"
            strokeWidth={2.6}
            opacity={selectedSet.size === 0 ? 0.95 : 1}
          />
        );
      })}

      <Path
        d={arcPath(cx, cy, 0, ring1Inner - 2, 0, 359.99)}
        fill="#f7f4ef"
      />
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
  roastDate = "",
  variety = "",
  dripper = "",
  process = "",
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
<View style={{ flexDirection: "row", alignItems: "center" }}>
  <Text style={styles.headerCountry}>{country || "-"}</Text>
  <Text style={{ marginLeft: 8, ...styles.headerFarm }}>
    {farm || "-"}
  </Text>
</View>
<View style={styles.infoSection}>

  {/* Country / Farm 横並び */}

  {/* ラベル行 */}
  <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
    <View style={{ width: "23%", alignItems: "center" }}>
      <Text style={styles.infoLabel}>Variety</Text>
    </View>
    <View style={{ width: "23%", alignItems: "center" }}>
      <Text style={styles.infoLabel}>Roast Date</Text>
    </View>
    <View style={{ width: "23%", alignItems: "center" }}>
      <Text style={styles.infoLabel}>Dripper</Text>
    </View>
    <View style={{ width: "23%", alignItems: "center" }}>
      <Text style={styles.infoLabel}>Roaster</Text>
    </View>
  </View>

  {/* 値行 */}
  <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 10 }}>
    <View style={{ width: "23%", alignItems: "center" }}>
      <Text style={styles.infoValue}>{variety || "-"}</Text>
    </View>
    <View style={{ width: "23%", alignItems: "center" }}>
      <Text style={styles.infoValue}>{roastDate || "-"}</Text>
    </View>
    <View style={{ width: "23%", alignItems: "center" }}>
      <Text style={styles.infoValue}>{dripper || "-"}</Text>
    </View>
    <View style={{ width: "23%", alignItems: "center" }}>
      <Text style={styles.infoValue}>{roaster || "-"}</Text>
    </View>
  </View>

  {/* Memo */}
  <View style={{ alignItems: "center", marginTop: 6 }}>
    <Text style={styles.infoLabel}>Memo</Text>
    <Text style={{ textAlign: "center" }}>{memo || "-"}</Text>
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
        <View style={{ alignItems: "center", marginTop: 14 }}>
  <Text
    style={{
      fontSize: 10,
      color: "#777",
      letterSpacing: 0.8,
      fontStyle: "italic",
    }}
  >
    Another Day, Another Coffee
  </Text>

  <Text
    style={{
      fontSize: 7,
      color: "#bbb",
      marginTop: 4,
      letterSpacing: 1.2,
    }}
  >
    Ryuge Coffee
  </Text>
</View>
      </View>
    </Page>
  </Document>
  );
}