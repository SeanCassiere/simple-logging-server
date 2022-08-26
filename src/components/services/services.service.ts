import { prisma } from "../../config/prisma";

export async function findActiveService(data: { serviceId: string }) {
  return await prisma.service.findFirst({
    where: {
      id: data.serviceId,
      isActive: true,
    },
  });
}
