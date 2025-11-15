'use client';


export const getChartConfig = () => {
  if (typeof document === 'undefined') return {}; 

  const style = getComputedStyle(document.body);

  const background = `hsl(${style.getPropertyValue('--background')})`;
  const foreground = `hsl(${style.getPropertyValue('--foreground')})`;
  const mutedForeground = `hsl(${style.getPropertyValue('--muted-foreground')})`;
  const primary = `hsl(${style.getPropertyValue('--primary')})`;
  const card = `hsl(${style.getPropertyValue('--card')})`;

  return {
    background: background,
    config: {
      title: { color: foreground },
      style: { "text": { fill: foreground } },
      axis: {
        domainColor: mutedForeground,
        gridColor: `hsl(${style.getPropertyValue('--border')})`,
        labelColor: mutedForeground,
        titleColor: foreground,
      },
      legend: {
        labelColor: mutedForeground,
        titleColor: foreground,
      },
      mark: { color: primary },
      bar: { fill: primary },
      line: { stroke: primary },
    },
  };
};