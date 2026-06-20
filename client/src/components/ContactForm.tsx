import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { insertContactSchema, type InsertContact } from "@shared/schema";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { trackEvent } from "@/lib/analytics";
import { useTranslation } from "react-i18next";
import infoIcon from "@assets/Asset 79_1763132541263.png";

export default function ContactForm() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: { name: "", email: "", projectType: undefined, message: "" },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContact) => apiRequest("POST", "/api/contact", data),
    onSuccess: (_, variables) => {
      trackEvent('contact_form_submit', 'conversion', variables.projectType);
      setIsSubmitted(true);
      form.reset();
      toast({ title: t('contact.successTitle'), description: t('contact.successDescription') });
      setTimeout(() => setIsSubmitted(false), 3000);
    },
    onError: () => {
      trackEvent('contact_form_error', 'error', 'form_submission_failed');
      toast({ title: t('contact.errorTitle'), description: t('contact.errorDescription'), variant: "destructive" });
    },
  });

  return (
    <section id="contact-form" className="py-16 px-4 sm:px-6 lg:px-8 bg-card border-t border-border">
      <div className="max-w-2xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          <img src={infoIcon} alt="Contact" className="w-14 h-14 object-contain flex-shrink-0" />
          <h2 className="text-2xl font-bold text-foreground">{t('contact.title')}</h2>
        </div>
        <p className="text-muted-foreground mb-8">{t('contact.subtitle')}</p>

        <Form {...form}>
          <form onSubmit={form.handleSubmit((data) => contactMutation.mutate(data))} className="space-y-4">
            <FormField control={form.control} name="name" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('contact.name')}</FormLabel>
                <FormControl><Input placeholder={t('contact.namePlaceholder')} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="email" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('contact.email')}</FormLabel>
                <FormControl><Input type="email" placeholder={t('contact.emailPlaceholder')} {...field} /></FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="projectType" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('contact.projectType')}</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger><SelectValue placeholder={t('contact.projectTypePlaceholder')} /></SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Freelance">{t('contact.projectTypes.freelance')}</SelectItem>
                    <SelectItem value="Business">{t('contact.projectTypes.business')}</SelectItem>
                    <SelectItem value="Affiliate">{t('contact.projectTypes.affiliate')}</SelectItem>
                    <SelectItem value="User">{t('contact.projectTypes.user')}</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )} />

            <FormField control={form.control} name="message" render={({ field }) => (
              <FormItem>
                <FormLabel>{t('contact.message')}</FormLabel>
                <FormControl>
                  <Textarea placeholder={t('contact.messagePlaceholder')} className="min-h-[100px] resize-none" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )} />

            <Button
              type="submit"
              className="w-full bg-cta hover:bg-cta text-cta-foreground border-cta-border"
              disabled={contactMutation.isPending || isSubmitted}
            >
              {contactMutation.isPending ? t('contact.sending') : isSubmitted ? t('contact.sent') : t('contact.sendButton')}
            </Button>
          </form>
        </Form>
      </div>
    </section>
  );
}
