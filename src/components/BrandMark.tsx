import { cn } from "@/lib/utils";

const BrandMark = ({ className }: { className?: string }) => (
  <span
    aria-hidden="true"
    className={cn(
      "relative inline-flex h-9 w-9 items-center justify-center overflow-hidden rounded-md bg-navy-dark font-sans text-[11px] font-black tracking-[-0.08em] text-white shadow-sm",
      className,
    )}
  >
    CID
    <span className="absolute bottom-[7px] left-[5px] h-[3px] w-7 -rotate-6 bg-red-600" />
  </span>
);

export default BrandMark;
