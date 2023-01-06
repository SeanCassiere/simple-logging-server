import { prisma } from "../../config/prisma";

export async function findActiveService(data: { serviceId: string; isAdmin?: boolean }) {
  return await prisma.service.findFirst({
    where: {
      id: data.serviceId,
      isActive: true,
      ...(typeof data.isAdmin !== "undefined" && { isAdmin: data.isAdmin }),
    },
  });
}
