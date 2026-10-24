import { useEffect, useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useI18n } from "@/lib/i18n";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { CircleHelp, ArrowLeft, ArrowRight } from "lucide-react";
import { getFirstUseTour, completeFirstUseTour } from "@/lib/first-use-tour.functions";

export function FirstUseTour({ area, userId }: { area: "studio" | "dashboard"; userId: string }) {
  const { t } = useI18n();
  const get = useServerFn(getFirstUseTour);
  const complete = useServerFn(completeFirstUseTour);
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const steps = area === "studio" ? ["pages", "content", "design", "publish"] : ["overview", "qrs", "links", "files"];
  useEffect(() => {
    let active = true;
    void get({ data: { area } }).then(result => { if (active && !result.seen) setOpen(true); }).catch(() => {});
    return () => { active = false; };
  }, [area, userId, get]);
  const finish = () => { setOpen(false); void complete({ data: { area } }).catch(() => {}); };
  return <>
    <Button variant="ghost" size="sm" onClick={() => { setStep(0); setOpen(true); }} className="mb-3 gap-2"><CircleHelp />{t("studio.tour.restart")}</Button>
    <Dialog open={open} onOpenChange={value => { if (!value) finish(); }}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <p className="text-xs text-muted-foreground" aria-live="polite">{step + 1} / {steps.length}</p>
          <DialogTitle>{t(`studio.tour.${area}.${steps[step]}.title`)}</DialogTitle>
          <DialogDescription>{t(`studio.tour.${area}.${steps[step]}.body`)}</DialogDescription>
        </DialogHeader>
        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Button variant="ghost" size="sm" className="mr-auto" onClick={finish}>{t("studio.tour.skip")}</Button>
          <Button variant="ghost" size="icon" disabled={step === 0} aria-label={t("studio.tour.back")} onClick={() => setStep(s => s - 1)}><ArrowLeft /></Button>
          <Button variant="secondary" onClick={() => step === steps.length - 1 ? finish() : setStep(s => s + 1)}>{t(step === steps.length - 1 ? "studio.tour.done" : "studio.tour.next")}<ArrowRight /></Button>
        </div>
      </DialogContent>
    </Dialog>
  </>;
}