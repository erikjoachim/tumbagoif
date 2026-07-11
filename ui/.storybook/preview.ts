import type { Preview } from "@storybook/vue3";
import "../src/styles/tokens.css";

const preview: Preview = {
  parameters: {
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
  },
  initialGlobals: {
    backgrounds: { value: "dark" },
  },
};

export default preview;
