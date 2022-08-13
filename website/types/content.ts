export type Heading = {
  id: string;
  level: number;
  text: string;
};

export type Frontmatter = {
  title: string;
  description: string;
  slug: string;
  headings: Heading[];
  editUrl: string;
  lastEdited: string;
};
