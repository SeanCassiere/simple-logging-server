import { FastifyRequest, FastifyReply } from "fastify";
import { prisma } from "../../config/prisma";

export async function getLogsForService(
  request: FastifyRequest<{ Params: { serviceId: string }; Querystring: { lookup?: string; limit?: string } }>,
  reply: FastifyReply
) {
  const serviceId = request.params.serviceId;
  const lookupValue = request.query.lookup;
  const limit = parseInt(request.query.limit ?? "") ? parseInt(request.query.limit ?? "") : 500;

  try {
    const records = await prisma.log.findMany({
      where: {
        serviceId,
        ...(lookupValue ? { lookupFilterValue: { equals: lookupValue } } : {}),
      },
      take: limit,
      orderBy: {
        createdAt: "desc",
      },
    });

    reply.code(200).send([...records].reverse());
  } catch (error) {
    console.log(error);
    reply.code(500).send({ message: `something went wrong finding logs for ${serviceId}`, errors: [] });
  }
}
