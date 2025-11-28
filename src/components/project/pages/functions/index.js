export const lightenColor = (color, percent) => {
  // Convert HEX to RGB
  let num = parseInt(color.slice(1), 16);
  let r = (num >> 16) + percent;
  let g = ((num >> 8) & 0x00ff) + percent;
  let b = (num & 0x0000ff) + percent;

  // Ensure values are within 0-255 range
  r = Math.min(Math.max(0, r), 255);
  g = Math.min(Math.max(0, g), 255);
  b = Math.min(Math.max(0, b), 255);

  // Convert RGB back to HEX
  return `#${(g | (b << 8) | (r << 16)).toString(16).padStart(6, "0")}`;
};
