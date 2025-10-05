import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertContactSchema } from "@shared/schema";
import { z } from "zod";
import { sendContactFormEmail } from "./email";

export async function registerRoutes(app: Express): Promise<Server> {
  app.post("/api/contact", async (req, res) => {
    try {
      const validatedData = insertContactSchema.parse(req.body);
      const submission = await storage.createContactSubmission(validatedData);
      
      // Send email notification (don't block response on email sending)
      sendContactFormEmail({
        name: validatedData.name,
        email: validatedData.email,
        projectType: validatedData.projectType,
        message: validatedData.message,
      }).catch(error => {
        console.error('Email notification failed:', error);
      });
      
      res.status(201).json(submission);
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({
          error: "Validation failed",
          details: error.errors,
        });
      } else {
        res.status(500).json({ error: "Failed to submit contact form" });
      }
    }
  });

  app.get("/api/contact", async (_req, res) => {
    try {
      const submissions = await storage.getContactSubmissions();
      res.json(submissions);
    } catch (error) {
      res.status(500).json({ error: "Failed to retrieve submissions" });
    }
  });

  const httpServer = createServer(app);

  return httpServer;
}
