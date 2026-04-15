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
  },
});