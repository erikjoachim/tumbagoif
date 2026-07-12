import type { Preview } from "@storybook/vue3";
import { themes } from "storybook/theming";
import "../src/styles/tokens.css";

const preview: Preview = {
  parameters: {
    docs: {
      theme: themes.dark,
    },
    backgrounds: {
      options: {
        dark: { name: "Tumba GOIF - BG Dark", value: "var(--color-bg-primary)" },
      },
    },
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
    layout: "centered",
  },
  initialGlobals: {
    backgrounds: { value: "dark" },
  },
};

export default preview;
