import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../config/prisma";

export async function getLogsForService(
  request: FastifyRequest<{ Params: { serviceId: string } }>,
  reply: FastifyReply
) {
  const serviceId = request.params.serviceId;

  const records = await prisma.log.findMany({
    where: {
      serviceId,
    },
    take: 500,
    orderBy: {
      createdAt: "desc",
    },
  });

  reply.code(200).send([...records].reverse());
}
