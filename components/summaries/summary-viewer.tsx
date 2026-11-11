'use client';

import { useState } from 'react';
import { Card } from '../ui/card';
import { NavigationControls } from '@/components/summaries/navigation-controls';
import ProgressBar from './progress-bar';
import { parseSection } from '@/app/utils/summary-helpers';
import ContentSection from '@/components/summaries/content-section';

const SectionTitle = ({ title }: { title: string }) => {
  return (
    <div className="flex flex-col gap-2 mb-4 pt-2 pb-2">
      <h2 className="text-3xl lg:text-4xl font-bold text-foreground text-center justify-center flex items-center gap-2">
        {title}
      </h2>
    </div>
  );
};

export function SummaryViewer({ summary }: { summary: string }) {
  const [currentSection, setCurrentSection] = useState(0);

  // Normalize line endings and split on H1 and H2 headings.
  const normalizedSummary = summary.replace(/\r\n/g, '\n').trim();

  const sectionBlocks = normalizedSummary
    .split(/(?=^#{1,2}\s+)/m)
    .map((section) => section.trim())
    .filter(Boolean);

  const sections = sectionBlocks
  .map(parseSection)
  .filter((s) => s.title && s.points.length > 0);

  const handleNext = () =>
    setCurrentSection((prev) =>
      Math.min(prev + 1, sections.length - 1)
    );

  const handlePrevious = () =>
    setCurrentSection((prev) => Math.max(prev - 1, 0));

  return (
   <Card
  className="
    relative flex flex-col px-2
    h-[min(80vh,680px)] min-h-[500px]
    w-full max-w-[760px]
    overflow-hidden
    bg-linear-to-br from-background via-background/95 to-rose-500/5
    shadow-2xl rounded-3xl
    border border-rose-500/10"
>
      <ProgressBar
        sections={sections}
        currentSection={currentSection}
      />

      <div className="min-h-0 flex-1 overflow-y-auto scrollbar-hide pt-10 sm:pt-12 pb-20">
        <div className="px-4 sm:px-6">

          <SectionTitle
            title={sections[currentSection]?.title || ''}
          />

          <ContentSection
            title={sections[currentSection]?.title || ''}
            points={sections[currentSection]?.points || []}
          />

        </div>
      </div>

      <NavigationControls
        currentSection={currentSection}
        totalSections={sections.length}
        onPrevious={handlePrevious}
        onNext={handleNext}
        onSectionSelect={setCurrentSection}
      />
    </Card>
  );
}
