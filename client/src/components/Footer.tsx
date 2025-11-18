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
import logoImage from "@assets/Asset 77_1762949956789.png";
import linkedinIcon from "@assets/Asset 100_1762948267335.png";
import twitterIcon from "@assets/Asset 96_1762948267334.png";
import instagramIcon from "@assets/Asset 94_1762948267333.png";
import infoIcon from "@assets/Asset 79_1763132541263.png";
import { trackEvent } from "@/lib/analytics";
import { useTranslation } from "react-i18next";

export default function Footer() {
  const { t } = useTranslation();
  const { toast } = useToast();
  const [isSubmitted, setIsSubmitted] = useState(false);

  const form = useForm<InsertContact>({
    resolver: zodResolver(insertContactSchema),
    defaultValues: {
      name: "",
      email: "",
      projectType: undefined,
      message: "",
    },
  });

  const contactMutation = useMutation({
    mutationFn: async (data: InsertContact) => {
      return await apiRequest("POST", "/api/contact", data);
    },
    onSuccess: (_, variables) => {
      trackEvent('contact_form_submit', 'conversion', variables.projectType);
      setIsSubmitted(true);
      form.reset();
      toast({
        title: t('contact.successTitle'),
        description: t('contact.successDescription'),
      });
      setTimeout(() => setIsSubmitted(false), 3000);
    },
    onError: () => {
      trackEvent('contact_form_error', 'error', 'form_submission_failed');
      toast({
        title: t('contact.errorTitle'),
        description: t('contact.errorDescription'),
        variant: "destructive",
      });
    },
  });

  const onSubmit = (data: InsertContact) => {
    contactMutation.mutate(data);
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      const offset = 80;
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;

      window.scrollTo({
        top: offsetPosition,
        behavior: "smooth",
      });
      
      trackEvent('scroll_to_section', 'navigation', sectionId);
    }
  };

  const quickLinks = [
    { label: t('navigation.howItWorks'), id: "how-it-works" },
    { label: t('navigation.indexes'), id: "environmental-metrics" },
    { label: t('navigation.forCompanies'), id: "for-companies" },
    { label: t('navigation.roadmap'), id: "roadmap" },
    { label: t('navigation.aboutUs'), id: "team" },
  ];

  const handleSocialClick = (platform: string, href: string) => {
    trackEvent('social_link_click', 'engagement', platform);
    window.open(href, "_blank", "noopener noreferrer");
  };

  const socialLinks = [
    { icon: linkedinIcon, label: "LinkedIn", href: "https://www.linkedin.com/company/virtusgreen" },
    { icon: twitterIcon, label: "Twitter", href: "https://x.com/virtusgreen" },
    { icon: instagramIcon, label: "Instagram", href: "https://www.instagram.com/virtusgreen/" },
  ];

  return (
    <footer id="footer" className="bg-card border-t border-card-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-12">
          <div className="space-y-6">
            <button
              onClick={() => scrollToSection("hero")}
              className="flex items-center gap-3 hover-elevate active-elevate-2 rounded-lg px-3 py-2 -ml-3"
              data-testid="button-logo-footer"
            >
              <img 
                src={logoImage} 
                alt="VirtusGreen Logo" 
                className="h-12 w-auto object-contain"
              />
            </button>

            <p className="text-base text-muted-foreground max-w-md">
              {t('footer.description')}
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {t('footer.quickLinks')}
              </h3>
              <div className="flex flex-wrap gap-4">
                {quickLinks.map((link) => (
                  <button
                    key={link.id}
                    onClick={() => scrollToSection(link.id)}
                    className="text-sm text-muted-foreground hover:text-foreground transition-colors hover-elevate active-elevate-2 px-2 py-1 rounded"
                    data-testid={`link-footer-${link.id}`}
                  >
                    {link.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                {t('footer.followUs')}
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <button
                    key={social.label}
                    onClick={() => handleSocialClick(social.label, social.href)}
                    className="w-10 h-10 rounded-lg flex items-center justify-center hover-elevate active-elevate-2 transition-colors"
                    data-testid={`link-social-${social.label.toLowerCase()}`}
                    aria-label={social.label}
                  >
                    <img 
                      src={social.icon} 
                      alt={social.label} 
                      className="w-6 h-6 object-contain" 
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <img 
                  src={infoIcon} 
                  alt="Contact Info" 
                  className="w-16 h-16 object-contain flex-shrink-0" 
                />
                <h3 className="text-2xl font-bold text-foreground">
                  {t('contact.title')}
                </h3>
              </div>
              <p className="text-base text-muted-foreground">
                {t('contact.subtitle')}
              </p>
            </div>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="space-y-4"
              >
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact.name')}</FormLabel>
                      <FormControl>
                        <Input
                          placeholder={t('contact.namePlaceholder')}
                          data-testid="input-name"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact.email')}</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder={t('contact.emailPlaceholder')}
                          data-testid="input-email"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="projectType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact.projectType')}</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-project-type">
                            <SelectValue placeholder={t('contact.projectTypePlaceholder')} />
                          </SelectTrigger>
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
                  )}
                />

                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>{t('contact.message')}</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder={t('contact.messagePlaceholder')}
                          className="min-h-[100px] resize-none"
                          data-testid="textarea-message"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button
                  type="submit"
                  className="w-full bg-cta hover:bg-cta text-cta-foreground border-cta-border"
                  disabled={contactMutation.isPending || isSubmitted}
                  data-testid="button-submit-contact"
                >
                  {contactMutation.isPending
                    ? t('contact.sending')
                    : isSubmitted
                      ? t('contact.sent')
                      : t('contact.sendButton')}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} {t('footer.copyright')}
          </p>
        </div>
      </div>
    </footer>
  );
}
