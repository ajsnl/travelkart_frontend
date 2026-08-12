export const SUPPORTED_WEBSITE_COLORS = [
  { name: "Navy", hex: "#0f2d70" },
  { name: "Blue", hex: "#2563eb" },
  { name: "Black", hex: "#111111" },
  { name: "Charcoal", hex: "#2f3542" },
  { name: "Grey", hex: "#8e9aaf" },
  { name: "Silver", hex: "#d3d3d3" },
  { name: "Olive", hex: "#556b2f" },
  { name: "Green", hex: "#2e7d32" },
  { name: "Red", hex: "#c62828" },
  { name: "Brown", hex: "#6d4c41" },
  { name: "Tan", hex: "#d7ccc8" },
  { name: "White", hex: "#f8f9fa" },
  { name: "Orange", hex: "#ea580c" },
  { name: "Yellow", hex: "#eab308" },
  { name: "Gold", hex: "#d4af37" },
  { name: "Pink", hex: "#ffb6c1" },
  { name: "Purple", hex: "#7c3aed" },
  { name: "Teal", hex: "#008080" },
  { name: "Burgundy", hex: "#800020" },
  { name: "Beige", hex: "#f5f5dc" },
  { name: "Bronze", hex: "#cd7f32" }
];

const COLOR_MAP = {

  navy: "#0f2d70",
  "navy blue": "#0f2d70",
  "dark blue": "#0f2d70",
  blue: "#2563eb",
  "royal blue": "#2563eb",
  "sky blue": "#38bdf8",
  "light blue": "#7dd3fc",
  cyan: "#06b6d4",
  teal: "#008080",
  "teal green": "#008080",

  black: "#111111",
  "jet black": "#111111",
  charcoal: "#2f3542",
  "charcoal gray": "#2f3542",
  "charcoal grey": "#2f3542",
  gray: "#8e9aaf",
  grey: "#8e9aaf",
  "light gray": "#cbd5e1",
  "light grey": "#cbd5e1",
  "dark gray": "#475569",
  "dark grey": "#475569",
  silver: "#d3d3d3",
  "silver gray": "#d3d3d3",
  "silver grey": "#d3d3d3",
  white: "#f8f9fa",
  "alpine white": "#f8f9fa",
  offwhite: "#fafaf9",
  "off white": "#fafaf9",

  brown: "#6d4c41",
  "dark brown": "#4e342e",
  tan: "#d7ccc8",
  "tan brown": "#d7ccc8",
  beige: "#f5f5dc",
  khaki: "#c3b091",
  bronze: "#cd7f32",
  coffee: "#6f4e37",

  olive: "#556b2f",
  "olive green": "#556b2f",
  green: "#2e7d32",
  "forest green": "#15803d",
  "emerald green": "#059669",
  mint: "#6ee7b7",

  red: "#c62828",
  "crimson red": "#c62828",
  maroon: "#800020",
  burgundy: "#800020",
  orange: "#ea580c",
  "sunset orange": "#ea580c",
  coral: "#f87171",
  pink: "#ffb6c1",
  "rose gold": "#e0a899",
  magenta: "#d946ef",
  purple: "#7c3aed",
  violet: "#8b5cf6",
  lavender: "#c4b5fd",

  yellow: "#eab308",
  gold: "#d4af37",
  mustard: "#ca8a04"
};

/**
 * Returns clean CSS styling for a circular color swatch.
 */
export const getColorStyle = (value) => {
  if (!value) return { backgroundColor: "#cbd5e1", border: "1px solid #cbd5e1" };

  const val = String(value).trim().toLowerCase();

  // Direct hex or rgb code
  if (val.startsWith("#") || val.startsWith("rgb")) {
    const isLight = val === "#ffffff" || val === "#fff" || val === "#f8f9fa";
    return {
      backgroundColor: val,
      border: isLight ? "1px solid #cbd5e1" : "none"
    };
  }

  // Exact match in dictionary
  if (COLOR_MAP[val]) {
    const hex = COLOR_MAP[val];
    const isLight = hex === "#f8f9fa" || hex === "#ffffff" || hex === "#fafaf9" || hex === "#f5f5dc" || hex === "#d3d3d3";
    return {
      backgroundColor: hex,
      border: isLight ? "1px solid #cbd5e1" : "none"
    };
  }

  //  Keyword / Substring match 
  const keywords = [
    { key: "navy", hex: "#0f2d70" },
    { key: "charcoal", hex: "#2f3542" },
    { key: "silver", hex: "#d3d3d3" },
    { key: "black", hex: "#111111" },
    { key: "white", hex: "#f8f9fa" },
    { key: "olive", hex: "#556b2f" },
    { key: "blue", hex: "#2563eb" },
    { key: "red", hex: "#c62828" },
    { key: "burgundy", hex: "#800020" },
    { key: "maroon", hex: "#800020" },
    { key: "orange", hex: "#ea580c" },
    { key: "green", hex: "#2e7d32" },
    { key: "brown", hex: "#6d4c41" },
    { key: "tan", hex: "#d7ccc8" },
    { key: "gold", hex: "#d4af37" },
    { key: "pink", hex: "#ffb6c1" },
    { key: "purple", hex: "#7c3aed" },
    { key: "yellow", hex: "#eab308" },
    { key: "teal", hex: "#008080" },
    { key: "grey", hex: "#8e9aaf" },
    { key: "gray", hex: "#8e9aaf" },
    { key: "beige", hex: "#f5f5dc" },
    { key: "bronze", hex: "#cd7f32" }
  ];

  for (const item of keywords) {
    if (val.includes(item.key)) {
      const isLight = item.hex === "#f8f9fa" || item.hex === "#d3d3d3" || item.hex === "#f5f5dc";
      return {
        backgroundColor: item.hex,
        border: isLight ? "1px solid #cbd5e1" : "none"
      };
    }
  }

  //  Default fallback
  return {
    backgroundColor: val,
    border: "1px solid #cbd5e1"
  };
};
