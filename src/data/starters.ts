export interface StarterSet {
  id: string;
  title: string;
  bookmarks: string[];
}

// Basic sample starter sets. In real application these would include more data.
export const starterSets: StarterSet[] = [
  {
    id: "general",
    title: "General",
    bookmarks: ["google", "github"],
  },
  {
    id: "student",
    title: "Student",
    bookmarks: ["wikipedia", "notion"],
  },
  {
    id: "architect",
    title: "Architect",
    bookmarks: ["sketchup", "autocad"],
  },
];
