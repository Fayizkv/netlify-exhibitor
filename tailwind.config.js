/** @type {import('tailwindcss').Config} */
const { appTheme } = require("./src/components/project/brand/project");
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Logo-based colors (Primary)
        primary: {
          darkest: appTheme.primary.darkest,
          dark: appTheme.primary.dark,
          base: appTheme.primary.base,
          light: appTheme.primary.light,
          lightest: appTheme.primary.lightest,
        },
        // Background Colors
        bg: {
          strong: appTheme.bg.strong,
          surface: appTheme.bg.surface,
          soft: appTheme.bg.soft,
          weak: appTheme.bg.weak,
          white: appTheme.bg.white,
        },
        // Text Colors
        text: {
          main: appTheme.text.main,
          sub: appTheme.text.sub,
          soft: appTheme.text.soft,
          disabled: appTheme.text.disabled,
          white: appTheme.text.white,
        },
        // Stroke Colors
        stroke: {
          strong: appTheme.stroke.strong,
          sub: appTheme.stroke.sub,
          soft: appTheme.stroke.soft,
          disabled: appTheme.stroke.disabled,
          white: appTheme.stroke.white,
        },
        // Icon Colors
        icon: {
          strong: appTheme.icon.strong,
          sub: appTheme.icon.sub,
          soft: appTheme.icon.soft,
          disabled: appTheme.icon.disabled,
          white: appTheme.icon.white,
        },
        // State Colors
        state: {
          success: appTheme.state.success,
          warning: appTheme.state.warning,
          error: appTheme.state.error,
          information: appTheme.state.information,
          away: appTheme.state.away,
          neutral: appTheme.state.neutral,
          verified: appTheme.state.verified,
        },
        // Event Website Builder flat colors (use unique keys to avoid collision)
        "builder-primary": "#4F46E5",
        "builder-primary-hover": "#4338CA",
        "builder-primary-light": "#EEF2FF",
        "builder-secondary": "#E5E7EB",
        "builder-text-main": "#1F2937",
        "builder-text-light": "#6B7280",
      },
    },
  },
  plugins: [],
};
