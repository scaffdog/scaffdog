import stripAnsi from 'strip-ansi';
import chalk from 'chalk';

const length = (s: string) => stripAnsi(s).length;

export type UsageSectionContent = {
  name: string;
  summary: string;
};

export type UsageSection = {
  header?: string;
  content: string | UsageSectionContent[];
  raw?: boolean;
};

export const buildUsage = (sections: UsageSection[]): string => {
  const maxContentSize = sections.reduce((max, section) => {
    if (!Array.isArray(section.content)) {
      return max;
    }

    return section.content.reduce((acc, cur) => {
      return Math.max(acc, length(cur.name));
    }, max);
  }, 0);

  return sections
    .map((section) => {
      const wrapContent = (s: string) => (section.raw === true ? s : `  ${s}`);
      const line: string[] = [];

      if (section.header != null) {
        line.push(chalk.bold(section.header));
      }

      if (typeof section.content === 'string') {
        line.push(wrapContent(section.content));
      } else {
        section.content.forEach((content) => {
          const padding = ' '.repeat(maxContentSize - length(content.name));

          line.push(
            wrapContent(`${content.name}${padding}  ${content.summary}`),
          );
        });
      }

      return line.join('\n');
    })
    .join('\n\n');
};
