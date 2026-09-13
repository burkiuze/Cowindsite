import type { ReactNode } from "react";

/**
 * A small, dependency-free renderer for Navio's answers.
 *
 * Navio writes plain prose with light structure — headings, lists, bold, code,
 * the occasional table. Rendering that ourselves keeps the client bundle small
 * and, more importantly, keeps the output inert: nothing here can execute HTML
 * that arrived in a model response.
 */
export function Markdown({ text }: { text: string }) {
  return <div className="answer text-[14px] leading-[1.68] text-[var(--color-ink)]">{renderBlocks(text)}</div>;
}

function renderBlocks(source: string): ReactNode[] {
  const lines = source.replace(/\r\n/g, "\n").split("\n");
  const blocks: ReactNode[] = [];
  let index = 0;
  let key = 0;

  while (index < lines.length) {
    const line = lines[index];

    // Fenced code
    if (line.trimStart().startsWith("```")) {
      const language = line.trim().slice(3).trim();
      const body: string[] = [];
      index += 1;
      while (index < lines.length && !lines[index].trimStart().startsWith("```")) {
        body.push(lines[index]);
        index += 1;
      }
      index += 1;
      blocks.push(
        <pre key={key++}>
          <code data-language={language || undefined}>{body.join("\n")}</code>
        </pre>,
      );
      continue;
    }

    // Table
    if (line.includes("|") && lines[index + 1]?.match(/^\s*\|?[\s:-]+\|[\s:|-]*$/)) {
      const header = splitRow(line);
      index += 2;
      const rows: string[][] = [];
      while (index < lines.length && lines[index].includes("|") && lines[index].trim().length > 0) {
        rows.push(splitRow(lines[index]));
        index += 1;
      }
      blocks.push(
        <div key={key++} className="overflow-x-auto">
          <table>
            <thead>
              <tr>
                {header.map((cell, cellIndex) => (
                  <th key={cellIndex}>{inline(cell)}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr key={rowIndex}>
                  {row.map((cell, cellIndex) => (
                    <td key={cellIndex}>{inline(cell)}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>,
      );
      continue;
    }

    // Heading
    const heading = line.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      const content = inline(heading[2]);
      blocks.push(
        level <= 1 ? (
          <h1 key={key++}>{content}</h1>
        ) : level === 2 ? (
          <h2 key={key++}>{content}</h2>
        ) : (
          <h3 key={key++}>{content}</h3>
        ),
      );
      index += 1;
      continue;
    }

    // Horizontal rule
    if (/^\s*(---|\*\*\*|___)\s*$/.test(line)) {
      blocks.push(<hr key={key++} className="border-[var(--color-hairline)]" />);
      index += 1;
      continue;
    }

    // Blockquote
    if (line.trimStart().startsWith("> ")) {
      const body: string[] = [];
      while (index < lines.length && lines[index].trimStart().startsWith(">")) {
        body.push(lines[index].replace(/^\s*>\s?/, ""));
        index += 1;
      }
      blocks.push(<blockquote key={key++}>{inline(body.join(" "))}</blockquote>);
      continue;
    }

    // Lists
    const bullet = line.match(/^\s*([-*•])\s+(.*)$/);
    const ordered = line.match(/^\s*(\d+)[.)]\s+(.*)$/);
    if (bullet || ordered) {
      const isOrdered = Boolean(ordered);
      const items: string[] = [];
      while (index < lines.length) {
        const current = lines[index];
        const match = isOrdered ? current.match(/^\s*(\d+)[.)]\s+(.*)$/) : current.match(/^\s*([-*•])\s+(.*)$/);
        if (!match) break;
        items.push(match[2]);
        index += 1;
      }
      blocks.push(
        isOrdered ? (
          <ol key={key++}>
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>{inline(item)}</li>
            ))}
          </ol>
        ) : (
          <ul key={key++}>
            {items.map((item, itemIndex) => (
              <li key={itemIndex}>{inline(item)}</li>
            ))}
          </ul>
        ),
      );
      continue;
    }

    // Blank
    if (line.trim().length === 0) {
      index += 1;
      continue;
    }

    // Paragraph
    const paragraph: string[] = [];
    while (index < lines.length && lines[index].trim().length > 0 && !isBlockStart(lines[index])) {
      paragraph.push(lines[index]);
      index += 1;
    }
    blocks.push(<p key={key++}>{inline(paragraph.join(" "))}</p>);
  }

  return blocks;
}

function isBlockStart(line: string): boolean {
  return (
    line.trimStart().startsWith("```") ||
    /^#{1,4}\s/.test(line) ||
    /^\s*([-*•])\s+/.test(line) ||
    /^\s*\d+[.)]\s+/.test(line) ||
    line.trimStart().startsWith("> ") ||
    /^\s*(---|\*\*\*|___)\s*$/.test(line)
  );
}

function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

/** Inline formatting: code, bold, italic, links. Everything else is text. */
function inline(source: string): ReactNode[] {
  const nodes: ReactNode[] = [];
  const pattern = /(`[^`]+`)|(\*\*[^*]+\*\*)|(\*[^*]+\*)|(\[[^\]]+\]\([^)\s]+\))/g;
  let lastIndex = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  while ((match = pattern.exec(source)) !== null) {
    if (match.index > lastIndex) nodes.push(source.slice(lastIndex, match.index));
    const token = match[0];

    if (token.startsWith("`")) {
      nodes.push(<code key={key++}>{token.slice(1, -1)}</code>);
    } else if (token.startsWith("**")) {
      nodes.push(<strong key={key++}>{token.slice(2, -2)}</strong>);
    } else if (token.startsWith("*")) {
      nodes.push(<em key={key++}>{token.slice(1, -1)}</em>);
    } else {
      const linkMatch = token.match(/^\[([^\]]+)\]\(([^)\s]+)\)$/);
      if (linkMatch && /^(https?:\/\/|\/)/.test(linkMatch[2])) {
        nodes.push(
          <a key={key++} href={linkMatch[2]} target="_blank" rel="noopener noreferrer">
            {linkMatch[1]}
          </a>,
        );
      } else {
        nodes.push(token);
      }
    }
    lastIndex = match.index + token.length;
  }

  if (lastIndex < source.length) nodes.push(source.slice(lastIndex));
  return nodes;
}
