import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { BarChart3, Eye, Files } from "lucide-react";
import { Button } from "@/components/ui/button";
import { disablePreviewMode, enablePreviewMode, isPreviewMode } from "@/utils/preview";

const AdminPanel = () => {
  const [preview, setPreview] = useState(false);

  useEffect(() => setPreview(isPreviewMode()), []);

  const togglePreview = () => {
    if (preview) disablePreviewMode();
    else enablePreviewMode(6);
    setPreview(!preview);
    setTimeout(() => window.location.reload(), 200);
  };

  return (
    <main className="min-h-screen bg-cream/30 px-4 py-24">
      <div className="max-w-xl mx-auto">
        <p className="text-[10px] uppercase tracking-[0.22em] text-red font-bold mb-3">Private workspace</p>
        <h1 className="text-3xl font-serif font-black text-navy-dark mb-3">Publication controls</h1>
        <p className="text-sm text-gray-500 mb-10">
          Website publishing remains approval-gated. Subscriber email sends and automatic external posting are disabled.
        </p>

        <div className="grid gap-4 sm:grid-cols-2">
          <Link to="/growth" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-red/40 transition-colors">
            <BarChart3 className="h-5 w-5 text-red mb-4" />
            <h2 className="font-serif font-bold text-navy-dark mb-1">Growth dashboard</h2>
            <p className="text-xs text-gray-500">Subscriber pace, sources, form funnel, and playbook use.</p>
          </Link>
          <Link to="/distribute" className="rounded-xl border border-gray-200 bg-white p-5 hover:border-red/40 transition-colors">
            <Files className="h-5 w-5 text-red mb-4" />
            <h2 className="font-serif font-bold text-navy-dark mb-1">Distribution drafts</h2>
            <p className="text-xs text-gray-500">Approval-gated LinkedIn drafts and Medium import checks.</p>
          </Link>
        </div>

        <div className="mt-4 rounded-xl border border-gray-200 bg-white p-5 flex items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Eye className="h-4 w-4 text-navy-dark" />
              <h2 className="font-semibold text-navy-dark">Future issue preview</h2>
            </div>
            <p className="text-xs text-gray-500">Visible in this browser for six hours when enabled.</p>
          </div>
          <Button variant="outline" size="sm" onClick={togglePreview}>{preview ? "Disable" : "Enable"}</Button>
        </div>
      </div>
    </main>
  );
};

export default AdminPanel;
