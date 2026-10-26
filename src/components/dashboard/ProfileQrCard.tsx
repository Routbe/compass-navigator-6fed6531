import { useEffect, useState } from "react";
import { Download, RotateCcw, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { DEFAULT_PROFILE_QR_STYLE, type ProfileQrStyle } from "@/lib/profile-qr";
import { renderProfileQr } from "@/lib/profile-qr-render";
import { styledProfileUrl, type UrlStyle } from "@/lib/profile-url";
import { useI18n } from "@/lib/i18n";

/** Draft-backed designer; previews and downloads use the public share renderer. */
export function ProfileQrCard({ handle, urlStyle, value, onChange }: {
  handle: string; urlStyle: UrlStyle; value?: ProfileQrStyle | null;
  onChange: (next: ProfileQrStyle) => void;
}) {
  const { t } = useI18n();
  const style = value ?? DEFAULT_PROFILE_QR_STYLE;
  const url = handle ? styledProfileUrl(handle, urlStyle) : "";
  const [rendered, setRendered] = useState<{ svg: string; png: string } | null>(null);
  const [failed, setFailed] = useState(false);
  const key = JSON.stringify(style);
  useEffect(() => {
    let active = true;
    setRendered(null); setFailed(false);
    if (url) void renderProfileQr(url, style).then(result => { if (active) setRendered(result); }).catch(() => { if (active) setFailed(true); });
    return () => { active = false; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, key]);
  const patch = (next: Partial<ProfileQrStyle>) => onChange({ ...style, ...next });
  const download = (format: "png" | "svg") => {
    if (!rendered) return;
    const anchor = document.createElement("a");
    anchor.href = rendered[format]; anchor.download = `rout-${handle}-qr.${format}`; anchor.click();
  };
  return <section className="space-y-4" data-tour="studio-qr">
    <h2 className="flex items-center gap-2 text-lg font-medium"><QrCode className="size-5" />{t("studio.editor.qr")}</h2>
    <div className="grid gap-4 sm:grid-cols-[160px_1fr]">
      <div className="flex aspect-square items-center justify-center rounded-md border border-border">
        {rendered ? <img src={rendered.svg} alt={t("studio.editor.qr")} className="h-full w-full" /> : <span role="status" className="p-3 text-xs text-muted-foreground">{t(failed ? "studio.qr.failed" : "studio.common.loading")}</span>}
      </div>
      <div className="min-w-0 space-y-3">
        <div className="flex flex-wrap gap-4">
          <label className="flex items-center gap-2 text-sm">{t("studio.qr.foreground")}<input type="color" aria-label={t("studio.qr.foreground")} value={style.fgColor} onChange={e => patch({ fgColor: e.target.value })} className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent" /></label>
          <label className="flex items-center gap-2 text-sm">{t("studio.qr.background")}<input type="color" aria-label={t("studio.qr.background")} value={style.bgColor === "transparent" ? DEFAULT_PROFILE_QR_STYLE.bgColor : style.bgColor} onChange={e => patch({ bgColor: e.target.value, bgGradient: null })} className="h-8 w-10 cursor-pointer rounded border border-border bg-transparent" /></label>
        </div>
        <label className="flex items-center justify-between gap-3 text-sm">{t("studio.qr.transparent")}<Switch checked={style.bgColor === "transparent" && !style.bgGradient} onCheckedChange={v => patch({ bgColor: v ? "transparent" : DEFAULT_PROFILE_QR_STYLE.bgColor, bgGradient: null })} /></label>
        <div className="grid gap-3 sm:grid-cols-3">
          {([{ field: "dotStyle", options: ["square", "dots", "rounded", "extra-rounded", "classy", "classy-rounded"] }, { field: "outerCornerStyle", options: ["square", "dot", "extra-rounded"] }, { field: "innerCornerStyle", options: ["square", "dot"] }] as const).map(({ field, options }) => <label key={field} className="min-w-0 space-y-1 text-xs">
            <span>{t(`studio.qr.${field}`)}</span>
            <Select value={style[field] ?? (field === "dotStyle" ? style.cornerStyle === "smooth" ? "rounded" : style.cornerStyle : "square")} onValueChange={v => patch({ [field]: v })}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent>{options.map(option => <SelectItem key={option} value={option}>{t(`studio.qr.shape.${option}`)}</SelectItem>)}</SelectContent></Select>
          </label>)}
        </div>
        <div className="flex flex-wrap gap-2">
          <Button size="sm" variant="outline" disabled={!rendered} onClick={() => download("png")}><Download className="size-4" />PNG</Button>
          <Button size="sm" variant="outline" disabled={!rendered} onClick={() => download("svg")}><Download className="size-4" />SVG</Button>
          <Button size="icon" variant="ghost" aria-label={t("studio.qr.reset")} title={t("studio.qr.reset")} onClick={() => onChange({ ...DEFAULT_PROFILE_QR_STYLE })}><RotateCcw className="size-4" /></Button>
        </div>
      </div>
    </div>
  </section>;
}
