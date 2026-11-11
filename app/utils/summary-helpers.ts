
export const parseSection = (
  section: string
): { title: string; points: string[] } => {
  const [title, ...content] = section.split('\n');

  const cleanTitle = title
  .replace(/^#{1,6}\s*/, '')
  .replace(/^\d+[.)]\s*/, '')
  .replace(/\*\*/g, '')
  .trim();

  const points: string[] = [];
  let currentPoint = '';

  content.forEach((line) => {
    const trimmedLine = line.trim();

    // Ignore empty lines and Markdown separators
    if (
      !trimmedLine ||
      /^[-*_]{3,}$/.test(trimmedLine)
    ) {
      if (currentPoint) {
        points.push(currentPoint.trim());
        currentPoint = '';
      }
      return;
    }

    // Recognise different Markdown list formats
    const isBullet = /^([-*•]|\d+[.)])\s+/.test(trimmedLine);

    if (isBullet) {
      if (currentPoint) {
        points.push(currentPoint.trim());
      }

      currentPoint = trimmedLine
     .replace(/^([-*•]|\d+[.)])\s+/, '')
     .replace(/\*\*/g, '');

    } else {
      currentPoint += (currentPoint ? ' ' : '') + trimmedLine.replace(/\*\*/g, '');
    }
  });

  if (currentPoint) {
    points.push(currentPoint.trim());
  }

  return {
    title: cleanTitle,
    points: points.filter(
      (point) =>
        point &&
        !/^#{1,6}\s/.test(point) &&
        !/^\[Choose/.test(point)
    ),
  };
};
