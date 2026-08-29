import type { Meta, StoryObj } from "@storybook/vue3";
import TFooter from "./TFooter.vue";

const meta: Meta<typeof TFooter> = {
  title: "Components/TFooter",
  component: TFooter,
  tags: ["autodocs"],
  decorators: [
    (story) => ({
      components: { story },
      template: `
        <div style="background: var(--color-bg-primary); padding: 40px;">
          <story />
        </div>
      `,
    }),
  ],
};

export default meta;
type Story = StoryObj<typeof TFooter>;

export const Default: Story = {
  args: {
    brandName: "Tumba Gymnastik och Idrottsförening",
    tagline:
      "En ideell förening som skapar gemenskap och glädje genom idrott för alla – sedan 1908.",
    links: [
      {
        title: "Våra idrotter",
        items: [
          { name: "Basket", href: "#" },
          { name: "Gymnastik", href: "#" },
          { name: "Innebandy", href: "#" },
          { name: "Gymmix", href: "#" },
        ],
      },
      {
        title: "Föreningen",
        items: [
          { name: "Om oss", href: "#" },
          { name: "Kontakt", href: "#" },
          { name: "Bli medlem", href: "#" },
        ],
      },
      {
        title: "Information",
        items: [
          { name: "Integritetspolicy", href: "#" },
          { name: "Cookies", href: "#" },
        ],
      },
    ],
    socials: [
      { name: "Facebook", href: "#" },
      { name: "Instagram", href: "#" },
      { name: "X", href: "#" },
    ],
    contact: {
      email: "info@tumbagoif.se",
      phone: "010-123 45 67",
    },
  },
};

export const Minimal: Story = {
  args: {
    brandName: "Mitt varumärke",
    copyright: "© 2025 Mitt varumärke. Alla rättigheter förbehållna.",
  },
};

export const NoHighlight: Story = {
  args: {
    brandName: "Föreningens namn",
    tagline: "En kort beskrivning av föreningen.",
    brandHighlight: false,
    links: [
      {
        title: "Länkar",
        items: [
          { name: "Start", href: "/" },
          { name: "Om oss", href: "/om" },
        ],
      },
    ],
  },
};
