import type { Meta, StoryObj } from "@storybook/vue3";
import TText from "./TText.vue";

const meta: Meta<typeof TText> = {
  title: "Components/TText",
  component: TText,
  tags: ["autodocs"],
  argTypes: {
    as: { control: "select", options: ["p", "span", "div", "label"] },
    size: { control: "select", options: ["sm", "base", "lg"] },
    muted: { control: "select", options: ["none", "secondary", "tertiary"] },
    align: { control: "select", options: ["left", "center", "right"] },
  },
};

export default meta;
type Story = StoryObj<typeof TText>;

export const Default: Story = {
  args: {
    as: "p",
    size: "base",
    muted: "secondary",
    text: "En idrottsförening för alla, med basket, gymnastik, innebandy och gymmix.",
  },
};

export const LargeDescription: Story = {
  args: {
    as: "p",
    size: "lg",
    muted: "secondary",
    text: "Utforska våra fyra idrottsgrenar, var och en med egna träningsmöjligheter.",
  },
};

export const SmallLabel: Story = {
  args: {
    as: "span",
    size: "sm",
    muted: "secondary",
    text: "Aktiviteter/Vecka",
  },
};

export const WithHighlight: Story = {
  args: {
    as: "p",
    size: "base",
    muted: "none",
    text: "Här är plats för <mark>alla</mark>, oavsett ålder eller nivå.",
  },
};

export const UsingSegments: Story = {
  args: {
    as: "p",
    segments: [
      { text: "Träning ska vara " },
      { text: "lustfylld", highlighted: true },
      { text: "." },
    ],
  },
};

export const Centered: Story = {
  args: {
    as: "p",
    size: "base",
    muted: "secondary",
    align: "center",
    text: "Text som är centrerad inom sin container.",
  },
};
