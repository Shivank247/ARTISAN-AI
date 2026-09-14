import prisma from "../utils/prisma.js";
import { httpError } from "../utils/httpError.js";
import { optionalNumber, optionalString } from "../utils/validation.js";

export async function getMyArtisan(userId) {
  const artisan = await prisma.artisan.findUnique({ where: { userId } });
  if (!artisan) throw httpError(404, "ARTISAN_NOT_FOUND", "Artisan profile not found.");
  return artisan;
}

export async function updateMyArtisan(userId, input) {
  const existing = await prisma.artisan.findUnique({ where: { userId } });
  if (!existing) {
    await prisma.artisan.create({ data: { userId } });
  }
  return prisma.artisan.update({
    where: { userId },
    data: {
      craftType: optionalString(input.craftType, "craftType"),
      city: optionalString(input.city, "city"),
      state: optionalString(input.state, "state"),
      story: optionalString(input.story, "story"),
      latitude: optionalNumber(input.latitude, "latitude"),
      longitude: optionalNumber(input.longitude, "longitude"),
    },
  });
}
