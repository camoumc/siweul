import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Le nom doit contenir au moins 2 caractères"),
  email: z.string().email("Email invalide"),
  password: z.string().min(6, "Le mot de passe doit contenir au moins 6 caractères"),
  phone: z.string().optional(),
  city: z.string().optional(),
});

export const reportSchema = z.object({
  type: z.enum([
    "OBJET_PERDU",
    "OBJET_TROUVE",
    "PERSONNE_DISPARUE",
    "ANIMAL_PERDU",
    "VEHICULE_VOLE",
    "DOCUMENT_PERDU",
  ]),
  title: z.string().min(3, "Le titre est trop court"),
  description: z.string().min(10, "Merci de décrire plus en détail"),
  city: z.string().min(2, "La ville est requise"),
  district: z.string().optional(),
  latitude: z.number().optional(),
  longitude: z.number().optional(),
  eventDate: z.string(),
  eventTime: z.string().optional(),
  category: z.string().optional(),
  color: z.string().optional(),
  brand: z.string().optional(),
  serialOrVin: z.string().optional(),
  reward: z.number().optional(),
  personName: z.string().optional(),
  personAge: z.number().optional(),
  personGender: z.string().optional(),
  lastSeenDesc: z.string().optional(),
  clothingDesc: z.string().optional(),
  emergencyPhone: z.string().optional(),
  animalSpecies: z.string().optional(),
  microchip: z.string().optional(),
  hasTattoo: z.boolean().optional(),
  hiddenDetail: z.string().optional(),
  contactName: z.string().optional(),
  contactPhone: z.string().optional(),
  photos: z.array(z.string()).optional(),
  publishAsOrganization: z.boolean().optional(),
});

export type ReportInput = z.infer<typeof reportSchema>;
