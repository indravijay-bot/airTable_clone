import { z } from "zod";
import { TRPCError } from "@trpc/server";

import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc";

export const baseRouter = createTRPCRouter({
  // Create a new base (protected - requires authentication)
  create: protectedProcedure
    .input(
      z.object({
        name: z
          .string()
          .min(1, "Base name is required")
          .max(100, "Base name must be less than 100 characters"),
        description: z
          .string()
          .max(500, "Description must be less than 500 characters")
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        const base = await ctx.db.base.create({
          data: {
            name: input.name,
            description: input.description,
            createdBy: {
              connect: {
                id: ctx.session.user.id,
              },
            },
          },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
          },
        });

        return base;
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create base",
          cause: error,
        });
      }
    }),

  // Get all bases for the authenticated user
  getAll: protectedProcedure.query(async ({ ctx }) => {
    try {
      const bases = await ctx.db.base.findMany({
        where: {
          createdById: ctx.session.user.id,
        },
        include: {
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },

          //   _count: {
          //     select: {
          //       tables: true,
          //     },
          //   },
        },
        orderBy: {
          updatedAt: "desc",
        },
      });

      return bases;
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch bases",
        cause: error,
      });
    }
  }),

  // Get a specific base by ID
  getById: protectedProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ ctx, input }) => {
      try {
        const base = await ctx.db.base.findFirst({
          where: {
            id: input.id,
            createdById: ctx.session.user.id,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            tables: {
              orderBy: {
                createdAt: "asc",
              },
            },
            //   _count: {
            //     select: {
            //       tables: true,
            //     },
            //   },
          },
        });

        if (!base) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Base not found",
          });
        }

        return base;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch base",
          cause: error,
        });
      }
    }),

  // Update a base
  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z
          .string()
          .min(1, "Base name is required")
          .max(100, "Base name must be less than 100 characters")
          .optional(),
        description: z
          .string()
          .max(500, "Description must be less than 500 characters")
          .optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the base exists and belongs to the user
        const existingBase = await ctx.db.base.findFirst({
          where: {
            id: input.id,
            createdById: ctx.session.user.id,
          },
        });

        if (!existingBase) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Base not found",
          });
        }

        const updatedBase = await ctx.db.base.update({
          where: {
            id: input.id,
          },
          data: {
            ...(input.name && { name: input.name }),
            ...(input.description !== undefined && {
              description: input.description,
            }),
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
              },
            },
            //  _count: {
            //  select: {
            //     tables: true,
            //   },
            // },
          },
        });

        return updatedBase;
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update base",
          cause: error,
        });
      }
    }),

  // Delete a base
  delete: protectedProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ ctx, input }) => {
      try {
        // First check if the base exists and belongs to the user
        const existingBase = await ctx.db.base.findFirst({
          where: {
            id: input.id,
            createdById: ctx.session.user.id,
          },
        });

        if (!existingBase) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Base not found",
          });
        }

        await ctx.db.base.delete({
          where: {
            id: input.id,
          },
        });

        return { success: true, message: "Base deleted successfully" };
      } catch (error) {
        if (error instanceof TRPCError) {
          throw error;
        }
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to delete base",
          cause: error,
        });
      }
    }),
});
