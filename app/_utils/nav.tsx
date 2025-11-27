import { BiLogoTypescript } from "react-icons/bi";

export const editorTabs = [
    {
      id: "format",
      label: "Prettify",
      icon: "🎨",
      shortcut: ["alt", "⇧", "p"],
    },
    { id: "diff", label: "Compare", icon: "🔍", shortcut: ["alt", "⇧", "c"] },
    {
      id: "object-convert",
      label: "JSON to Type",
      icon: <BiLogoTypescript className="text-[#007acc] w-6 h-6" />,
      shortcut: ["alt", "⇧", "o"],
    },
  ];