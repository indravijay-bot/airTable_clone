import { z } from "zod"
import { TRPCError } from "@trpc/server"
import { createTRPCRouter, protectedProcedure } from "~/server/api/trpc"

export const tableRouter = createTRPCRouter({
  create: protectedProcedure
    .input(
      z.object({
        baseId: z.string(),
        name: z.string().min(1, "Table name is required").max(100, "Table name is too long"),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify the base belongs to the user
        const base = await ctx.db.base.findFirst({
          where: {
            id: input.baseId,
            createdById: ctx.session.user.id,
          },
        })

        if (!base) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Base not found or you do not have permission",
          })
        }

        // Create table with default columns
        const table = await ctx.db.table.create({
          data: {
            name: input.name,
            base: {
              connect: {
                id: input.baseId,
              },
            },
            createdBy: {
              connect: { id: ctx.session.user.id },
            },
            columns: {
              createMany: {
                data: [
                  { name: "Name", type: "TEXT", order: 0 },
                  { name: "Amount", type: "NUMBER", order: 1 },
                ],
              },
            },
          },
        })

        // Import faker dynamically for server-side seeding
        const { faker } = await import("@faker-js/faker")

        // Create 10 rows for the table
        const rowsData = Array.from({ length: 10 }).map(() => ({
          tableId: table.id,
        }))
        await ctx.db.row.createMany({ data: rowsData })

        // Fetch rows and columns to create cells
        const createdRows = await ctx.db.row.findMany({
          where: { tableId: table.id },
        })
        const columns = await ctx.db.column.findMany({
          where: { tableId: table.id },
        })

        // Prepare cells data with faker values
        const cellsData = []
        for (const row of createdRows) {
          for (const column of columns) {
            let value = ""
            if (column.type === "TEXT") value = faker.person.fullName()
            else if (column.type === "NUMBER") value = faker.number.int({ min: 0, max: 1000 }).toString()

            cellsData.push({
              rowId: row.id,
              columnId: column.id,
              value,
            })
          }
        }

        await ctx.db.cell.createMany({ data: cellsData })

        return table
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create table",
          cause: error,
        })
      }
    }),

  getByBaseId: protectedProcedure.input(z.object({ baseId: z.string() })).query(async ({ ctx, input }) => {
    try {
      // Verify the base belongs to the user
      const base = await ctx.db.base.findFirst({
        where: {
          id: input.baseId,
          createdById: ctx.session.user.id,
        },
      })

      if (!base) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Base not found or you do not have permission",
        })
      }

      // Fetch tables of that base ordered by creation date
      const tables = await ctx.db.table.findMany({
        where: { baseId: input.baseId },
        orderBy: { createdAt: "desc" },
      })

      return tables
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch tables",
        cause: error,
      })
    }
  }),

  getById: protectedProcedure.input(z.object({ id: z.string() })).query(async ({ ctx, input }) => {
    try {
      console.log("Getting table by ID:", input.id) // Debug log

      const table = await ctx.db.table.findFirst({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        include: {
          columns: {
            orderBy: { order: "asc" },
          },
        },
      })

      if (!table) {
        console.log("Table not found for ID:", input.id) // Debug log
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Table not found",
        })
      }

      console.log("Found table:", table.name) // Debug log
      return table
    } catch (error) {
      console.error("Error fetching table:", error) // Debug log
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch table",
        cause: error,
      })
    }
  }),

  getData: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        search: z.string().optional(),
        filters: z
          .array(
            z.object({
              id: z.string(),
              columnId: z.string(),
              operator: z.string(),
              value: z.string(),
            }),
          )
          .optional(),
        sorts: z
          .array(
            z.object({
              id: z.string(),
              columnId: z.string(),
              direction: z.enum(["asc", "desc"]),
            }),
          )
          .optional(),
        limit: z.number().min(1).max(100).default(50),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        // Verify table access
        const table = await ctx.db.table.findFirst({
          where: {
            id: input.tableId,
            createdById: ctx.session.user.id,
          },
          include: {
            columns: true,
          },
        })

        if (!table) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Table not found",
          })
        }

        // Build where clause for search and filters
        const whereClause: any = {
          tableId: input.tableId,
        }

        // Add cursor for pagination
        if (input.cursor) {
          whereClause.id = {
            gt: input.cursor,
          }
        }

        // Build search condition
        if (input.search) {
          whereClause.cells = {
            some: {
              value: {
                contains: input.search,
                mode: "insensitive",
              },
            },
          }
        }

        // Build filter conditions
        if (input.filters && input.filters.length > 0) {
          const filterConditions = input.filters
            .map((filter) => {
              const column = table.columns.find((c) => c.id === filter.columnId)
              if (!column) return null

              switch (filter.operator) {
                case "contains":
                  return {
                    cells: {
                      some: {
                        columnId: filter.columnId,
                        value: {
                          contains: filter.value,
                          mode: "insensitive",
                        },
                      },
                    },
                  }
                case "not_contains":
                  return {
                    cells: {
                      some: {
                        columnId: filter.columnId,
                        value: {
                          not: {
                            contains: filter.value,
                            mode: "insensitive",
                          },
                        },
                      },
                    },
                  }
                case "equals":
                  return {
                    cells: {
                      some: {
                        columnId: filter.columnId,
                        value: filter.value,
                      },
                    },
                  }
                case "is_empty":
                  return {
                    OR: [
                      {
                        cells: {
                          none: {
                            columnId: filter.columnId,
                          },
                        },
                      },
                      {
                        cells: {
                          some: {
                            columnId: filter.columnId,
                            value: null,
                          },
                        },
                      },
                    ],
                  }
                case "is_not_empty":
                  return {
                    cells: {
                      some: {
                        columnId: filter.columnId,
                        value: {
                          not: null,
                        },
                      },
                    },
                  }
                case "greater_than":
                  return {
                    cells: {
                      some: {
                        columnId: filter.columnId,
                        value: {
                          gt: filter.value,
                        },
                      },
                    },
                  }
                case "less_than":
                  return {
                    cells: {
                      some: {
                        columnId: filter.columnId,
                        value: {
                          lt: filter.value,
                        },
                      },
                    },
                  }
                default:
                  return null
              }
            })
            .filter(Boolean)

          if (filterConditions.length > 0) {
            whereClause.AND = filterConditions
          }
        }

        // Build order by clause
        let orderBy: any = { id: "asc" } // Default ordering for pagination

        if (input.sorts && input.sorts.length > 0) {
          // For now, we'll use a simple approach - sort by the first sort only
          // In a production app, you'd want more sophisticated sorting
          const firstSort = input.sorts[0]
          if (firstSort) {
            orderBy = [
              {
                cells: {
                  _count: firstSort.direction,
                },
              },
              { id: "asc" }, // Always include id for consistent pagination
            ]
          }
        }

        const rows = await ctx.db.row.findMany({
          where: whereClause,
          include: {
            cells: {
              include: {
                column: true,
              },
            },
          },
          orderBy,
          take: input.limit + 1, // Take one extra to check if there's a next page
        })

        let nextCursor: string | undefined = undefined
        if (rows.length > input.limit) {
          const nextItem = rows.pop() // Remove the extra item
          nextCursor = nextItem!.id
        }

        return {
          rows,
          nextCursor,
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch table data",
          cause: error,
        })
      }
    }),

  updateCell: protectedProcedure
    .input(
      z.object({
        rowId: z.string(),
        columnId: z.string(),
        value: z.string().nullable(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify the row belongs to a table the user owns
        const row = await ctx.db.row.findFirst({
          where: {
            id: input.rowId,
            table: {
              createdById: ctx.session.user.id,
            },
          },
        })

        if (!row) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Row not found",
          })
        }

        // Upsert the cell
        const cell = await ctx.db.cell.upsert({
          where: {
            rowId_columnId: {
              rowId: input.rowId,
              columnId: input.columnId,
            },
          },
          update: {
            value: input.value,
          },
          create: {
            rowId: input.rowId,
            columnId: input.columnId,
            value: input.value,
          },
        })

        return cell
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update cell",
          cause: error,
        })
      }
    }),

  addColumn: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        name: z.string().min(1).max(100),
        type: z.enum(["TEXT", "NUMBER"]),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify table ownership
        const table = await ctx.db.table.findFirst({
          where: {
            id: input.tableId,
            createdById: ctx.session.user.id,
          },
          include: {
            columns: true,
          },
        })

        if (!table) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Table not found",
          })
        }

        // Get the next order number
        const maxOrder = Math.max(...table.columns.map((c) => c.order), -1)

        // Create the column
        const column = await ctx.db.column.create({
          data: {
            name: input.name,
            type: input.type,
            tableId: input.tableId,
            order: maxOrder + 1,
          },
        })

        // Create cells for existing rows
        const rows = await ctx.db.row.findMany({
          where: { tableId: input.tableId },
        })

        if (rows.length > 0) {
          const { faker } = await import("@faker-js/faker")

          const cellsData = rows.map((row) => ({
            rowId: row.id,
            columnId: column.id,
            value: input.type === "TEXT" ? faker.person.fullName() : faker.number.int({ min: 0, max: 1000 }).toString(),
          }))

          await ctx.db.cell.createMany({
            data: cellsData,
          })
        }

        return column
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to add column",
          cause: error,
        })
      }
    }),

  add100kRows: protectedProcedure.input(z.object({ tableId: z.string() })).mutation(async ({ ctx, input }) => {
    try {
      // Verify table ownership
      const table = await ctx.db.table.findFirst({
        where: {
          id: input.tableId,
          createdById: ctx.session.user.id,
        },
        include: {
          columns: true,
        },
      })

      if (!table) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Table not found",
        })
      }

      const { faker } = await import("@faker-js/faker")

      // Create rows in batches to avoid memory issues
      const batchSize = 1000
      const totalRows = 100000

      for (let i = 0; i < totalRows; i += batchSize) {
        const currentBatchSize = Math.min(batchSize, totalRows - i)

        // Create rows
        const rowsData = Array.from({ length: currentBatchSize }).map(() => ({
          tableId: input.tableId,
        }))

        await ctx.db.row.createMany({
          data: rowsData,
        })

        // Get the created rows
        const createdRows = await ctx.db.row.findMany({
          where: { tableId: input.tableId },
          orderBy: { createdAt: "desc" },
          take: currentBatchSize,
        })

        // Create cells for these rows
        const cellsData = []
        for (const row of createdRows) {
          for (const column of table.columns) {
            let value = ""
            if (column.type === "TEXT") {
              value = faker.person.fullName()
            } else if (column.type === "NUMBER") {
              value = faker.number.int({ min: 0, max: 1000 }).toString()
            }

            cellsData.push({
              rowId: row.id,
              columnId: column.id,
              value,
            })
          }
        }

        await ctx.db.cell.createMany({
          data: cellsData,
        })
      }

      return { success: true, rowsAdded: totalRows }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to add 100k rows",
        cause: error,
      })
    }
  }),

  // View management
  createView: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        name: z.string().min(1).max(100),
        filters: z.array(
          z.object({
            id: z.string(),
            columnId: z.string(),
            operator: z.string(),
            value: z.string(),
          }),
        ),
        sorts: z.array(
          z.object({
            id: z.string(),
            columnId: z.string(),
            direction: z.enum(["asc", "desc"]),
          }),
        ),
        hiddenColumns: z.array(z.string()),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify table ownership
        const table = await ctx.db.table.findFirst({
          where: {
            id: input.tableId,
            createdById: ctx.session.user.id,
          },
        })

        if (!table) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Table not found",
          })
        }

        // For now, we'll store view configuration as JSON
        // In a production app, you might want separate tables for filters, sorts, etc.
        const view = await ctx.db.$executeRaw`
          INSERT INTO "TableView" (id, name, "tableId", configuration, "createdAt", "updatedAt")
          VALUES (${crypto.randomUUID()}, ${input.name}, ${input.tableId}, ${JSON.stringify({
            filters: input.filters,
            sorts: input.sorts,
            hiddenColumns: input.hiddenColumns,
          })}, NOW(), NOW())
        `

        return { success: true }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to create view",
          cause: error,
        })
      }
    }),

  getViews: protectedProcedure.input(z.object({ tableId: z.string() })).query(async ({ ctx, input }) => {
    try {
      // For now, return empty array since we need to add TableView model to schema
      return []
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch views",
        cause: error,
      })
    }
  }),

  deleteView: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    try {
      return { success: true }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete view",
        cause: error,
      })
    }
  }),
})
