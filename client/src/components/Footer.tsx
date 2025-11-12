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
import { Linkedin, Twitter, Instagram } from "lucide-react";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import logoImage from "@assets/virtusgreen-logo-dark.svg";
import { trackEvent } from "@/lib/analytics";

export default function Footer() {
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
        title: "Message sent successfully!",
        description: "We'll get back to you as soon as possible.",
      });
      setTimeout(() => setIsSubmitted(false), 3000);
    },
    onError: () => {
      trackEvent('contact_form_error', 'error', 'form_submission_failed');
      toast({
        title: "Failed to send message",
        description: "Please try again later.",
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
    { label: "How it Works", id: "how-it-works" },
    { label: "Environmental Indexes", id: "environmental-metrics" },
    { label: "For Companies", id: "for-companies" },
    { label: "Roadmap", id: "roadmap" },
    { label: "About Us", id: "team" },
  ];

  const handleSocialClick = (platform: string, href: string) => {
    trackEvent('social_link_click', 'engagement', platform);
    window.open(href, "_blank", "noopener noreferrer");
  };

  const socialLinks = [
    { icon: Linkedin, label: "LinkedIn", href: "https://www.linkedin.com/company/virtusgreen" },
    { icon: Twitter, label: "Twitter", href: "https://x.com/virtusgreen" },
    { icon: Instagram, label: "Instagram", href: "https://www.instagram.com/virtusgreen/" },
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
              Transform sustainability into rewards with blockchain-powered
              transparency. Join thousands making eco-conscious choices.
            </p>

            <div className="space-y-4">
              <h3 className="text-lg font-semibold text-foreground">
                Quick Links
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
                Follow Us
              </h3>
              <div className="flex gap-3">
                {socialLinks.map((social) => (
                  <button
                    key={social.label}
                    onClick={() => handleSocialClick(social.label, social.href)}
                    className="w-10 h-10 rounded-lg bg-secondary flex items-center justify-center hover-elevate active-elevate-2 transition-colors"
                    data-testid={`link-social-${social.label.toLowerCase()}`}
                    aria-label={social.label}
                  >
                    <social.icon className="w-5 h-5 text-secondary-foreground" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <h3 className="text-2xl font-bold text-foreground">
                Get in Touch
              </h3>
              <p className="text-base text-muted-foreground">
                Have questions? We'd love to hear from you.
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
                      <FormLabel>Name</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Your name"
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
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
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
                      <FormLabel>Project Type</FormLabel>
                      <Select
                        onValueChange={field.onChange}
                        value={field.value}
                      >
                        <FormControl>
                          <SelectTrigger data-testid="select-project-type">
                            <SelectValue placeholder="Select project type" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Freelance">Freelance</SelectItem>
                          <SelectItem value="Business">Business</SelectItem>
                          <SelectItem value="Affiliate">Affiliate</SelectItem>
                          <SelectItem value="User">User</SelectItem>
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
                      <FormLabel>Message</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Tell us about your project..."
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
                    ? "Sending..."
                    : isSubmitted
                      ? "Message Sent!"
                      : "Send Message"}
                </Button>
              </form>
            </Form>
          </div>
        </div>

        <div className="pt-8 border-t border-border text-center">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} VirtusGreen. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
