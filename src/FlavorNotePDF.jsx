import { Document, Page, Text, View, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: {
    padding: 40,
    backgroundColor: "#fff",
    fontSize: 12,
    color: "#222",
  },

  title: {
    fontSize: 26,
    marginBottom: 24,
    fontWeight: "700",
  },

  section: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 20,
  },

  row: {
    marginBottom: 14,
  },

  label: {
    fontSize: 10,
    color: "#888",
    marginBottom: 4,
    letterSpacing: 1,
  },

  value: {
    fontSize: 16,
    fontWeight: "600",
  },
});

export default function FlavorNotePDF({ note = {} }) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <Text style={styles.title}>Coffee Note</Text>

        <View style={styles.section}>
          <View style={styles.row}>
            <Text style={styles.label}>COUNTRY</Text>
            <Text style={styles.value}>{note.country || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>ROAST DATE</Text>
            <Text style={styles.value}>{note.roastDate || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>VARIETY</Text>
            <Text style={styles.value}>{note.variety || "-"}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.label}>DRIPPER</Text>
            <Text style={styles.value}>{note.dripper || "-"}</Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}