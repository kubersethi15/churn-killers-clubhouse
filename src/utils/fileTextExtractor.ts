/**
 * File text extraction for the CS Analyzer.
 *
 * Reads uploaded files (.txt, .csv, .docx, .pdf) and returns plain text
 * suitable for the analysis pipeline. PDF parsing uses pdfjs-dist; DOCX
 * uses mammoth. Both libraries are lazy-imported to keep the initial
 * bundle lean.
 */

const MAX_FILE_BYTES = 10 * 1024 * 1024; // 10 MB
const MAX_TEXT_CHARS = 250_000; // generous cap so the pipeline doesn't get a 5MB blob

export class FileExtractionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FileExtractionError";
  }
}

interface ExtractionResult {
  text: string;
  charCount: number;
  truncated: boolean;
  fileName: string;
}

const getExtension = (name: string): string => {
  const i = name.lastIndexOf(".");
  return i === -1 ? "" : name.slice(i + 1).toLowerCase();
};

const truncate = (text: string): { text: string; truncated: boolean } => {
  if (text.length <= MAX_TEXT_CHARS) return { text, truncated: false };
  return { text: text.slice(0, MAX_TEXT_CHARS), truncated: true };
};

const readAsText = (file: File): Promise<string> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new FileExtractionError("Could not read the file."));
    reader.readAsText(file);
  });

const readAsArrayBuffer = (file: File): Promise<ArrayBuffer> =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as ArrayBuffer);
    reader.onerror = () => reject(new FileExtractionError("Could not read the file."));
    reader.readAsArrayBuffer(file);
  });

const extractDocx = async (file: File): Promise<string> => {
  const arrayBuffer = await readAsArrayBuffer(file);
  // Lazy import keeps mammoth out of the initial JS bundle
  const mammoth = await import("mammoth");
  const result = await mammoth.extractRawText({ arrayBuffer });
  return result.value || "";
};

const extractPdf = async (file: File): Promise<string> => {
  const arrayBuffer = await readAsArrayBuffer(file);
  // Lazy import the pdf.js library. The worker is set up to point at the
  // CDN-hosted module so we don't need to bundle a worker file ourselves.
  const pdfjs = await import("pdfjs-dist");
  // pdfjs requires a worker; use the bundled worker via the build output URL
  pdfjs.GlobalWorkerOptions.workerSrc = new URL(
    "pdfjs-dist/build/pdf.worker.min.mjs",
    import.meta.url
  ).toString();

  const loadingTask = pdfjs.getDocument({ data: arrayBuffer });
  const pdf = await loadingTask.promise;

  const pageTexts: string[] = [];
  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const content = await page.getTextContent();
    const pageText = content.items
      .map((item) => ("str" in item ? item.str : ""))
      .join(" ");
    pageTexts.push(pageText);
  }

  return pageTexts.join("\n\n");
};

export const extractTextFromFile = async (file: File): Promise<ExtractionResult> => {
  if (file.size > MAX_FILE_BYTES) {
    throw new FileExtractionError(
      `File is too large (${(file.size / 1024 / 1024).toFixed(1)} MB). Max is 10 MB.`
    );
  }

  const ext = getExtension(file.name);
  let rawText = "";

  try {
    switch (ext) {
      case "txt":
      case "csv":
      case "md":
        rawText = await readAsText(file);
        break;
      case "docx":
        rawText = await extractDocx(file);
        break;
      case "pdf":
        rawText = await extractPdf(file);
        break;
      default:
        throw new FileExtractionError(
          `Unsupported file type (.${ext || "unknown"}). Use .txt, .csv, .md, .docx, or .pdf.`
        );
    }
  } catch (err) {
    if (err instanceof FileExtractionError) throw err;
    throw new FileExtractionError(
      err instanceof Error ? `Could not parse this file: ${err.message}` : "Could not parse this file."
    );
  }

  const cleaned = rawText.replace(/\r\n/g, "\n").trim();

  if (!cleaned) {
    throw new FileExtractionError(
      "No readable text found in this file. If it's a scanned PDF, paste the text manually instead."
    );
  }

  const { text, truncated } = truncate(cleaned);

  return {
    text,
    charCount: text.length,
    truncated,
    fileName: file.name,
  };
};

export const ACCEPTED_FILE_TYPES = ".txt,.csv,.md,.docx,.pdf";
