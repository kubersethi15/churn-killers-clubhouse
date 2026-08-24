export interface PlaybookRecord {
  id: string;
  title: string;
  description: string;
  pdf_path: string | null;
  notion_link: string | null;
  newsletter_slug: string | null;
  newsletter_title: string | null;
  published_date: string | null;
}

const newestFirst = (left: PlaybookRecord, right: PlaybookRecord) => {
  if (!left.published_date) return 1;
  if (!right.published_date) return -1;
  return new Date(right.published_date).getTime() - new Date(left.published_date).getTime();
};

/**
 * Keep the hand-written card copy and Notion destinations, while treating the
 * generated manifest as the authority for an exact PDF-to-article route.
 *
 * The previous implementation discarded manifest rows whose PDF already had a
 * static card. That left three cards unlinked and two pointing at the wrong
 * article even though the manifest contained the recovered source route.
 */
export const mergePlaybookManifest = (
  current: PlaybookRecord[],
  archive: PlaybookRecord[],
): PlaybookRecord[] => {
  const archiveByPath = new Map(
    archive
      .filter((playbook) => playbook.pdf_path)
      .map((playbook) => [playbook.pdf_path, playbook]),
  );

  const enriched = current.map((playbook) => {
    if (!playbook.pdf_path) return playbook;
    const recovered = archiveByPath.get(playbook.pdf_path);
    if (!recovered) return playbook;
    return {
      ...playbook,
      newsletter_slug: recovered.newsletter_slug,
      newsletter_title: recovered.newsletter_title,
      published_date: recovered.published_date ?? playbook.published_date,
    };
  });

  const knownPaths = new Set(enriched.map((playbook) => playbook.pdf_path).filter(Boolean));
  const supplemental = archive.filter(
    (playbook) => playbook.pdf_path && !knownPaths.has(playbook.pdf_path),
  );
  return [...enriched, ...supplemental].sort(newestFirst);
};
