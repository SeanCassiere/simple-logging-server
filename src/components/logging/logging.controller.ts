import { FastifyRequest, FastifyReply } from "fastify";
import { z } from "zod";
import { prisma } from "../../config/prisma";

const createLogRecordInputSchema = z.object({
  serviceId: z.string(),
  action: z.string(),
  ip: z.string().optional(),
  environment: z.string().default("production"),
  data: z.any().optional(),
});

type CreateLogRecordSchema = z.infer<typeof createLogRecordInputSchema>;

export async function createLogRecord(request: FastifyRequest<{ Body: CreateLogRecordSchema }>, reply: FastifyReply) {
  const parse = await createLogRecordInputSchema.safeParseAsync(request.body);

  if (!parse.success) {
    return reply.code(400).send({
      message: "Invalid input",
      errors: parse.error.format(),
    });
  }

  const body = parse.data;

  try {
    await prisma.service.findFirstOrThrow({
      where: {
        id: body.serviceId,
        isActive: true,
      },
    });
  } catch (error) {
    reply.code(500).send({
      message: "Something went wrong. Either an invalid service ID or it has been marked as inactive.",
      errors: [],
    });
  }

  try {
    const log = await prisma.log.create({
      data: {
        serviceId: body.serviceId,
        action: body.action,
        environment: body.environment,
        ip: body.ip,
        data: body.data ? body.data : undefined,
      },
      include: {
        service: true,
      },
    });
    reply.code(201).send(log);
  } catch (error) {
    reply.code(500).send({ message: "something went wrong creating the log record", errors: [] });
  }
}
