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
            rowCount: 25, // Initial row count
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
                  { name: "Person Name", type: "TEXT", order: 0 },
                  { name: "Account Balance", type: "NUMBER", order: 1 },
                ],
              },
            },
          },
          include: {
            columns: true,
          },
        })

        // Import faker dynamically for server-side seeding
        const { faker } = await import("@faker-js/faker")

        // Create 25 rows for the table with realistic data
        const rowsData = Array.from({ length: 25 }).map(() => ({
          tableId: table.id,
        }))
        await ctx.db.row.createMany({ data: rowsData })

        // Fetch rows to create cells
        const createdRows = await ctx.db.row.findMany({
          where: { tableId: table.id },
        })

        // Prepare cells data with realistic values
        const cellsData = []
        // const accountTypes = ["Checking", "Savings", "Credit", "Investment"]
        // const bankNames = ["Chase Bank", "Bank of America", "Wells Fargo", "Citibank", "Goldman Sachs", "JP Morgan"]

        for (const row of createdRows) {
          for (const column of table.columns) {
            let value = ""

            switch (column.name) {
              case "Person Name":
                value = faker.person.fullName()
                break
              case "Account Balance":
                value = faker.number.int({ min: 1000, max: 500000 }).toString()
                break
                break
              default:
                if (column.type === "TEXT") {
                  value = faker.company.name()
                } else if (column.type === "NUMBER") {
                  value = faker.number.int({ min: 0, max: 100000 }).toString()
                }
            }

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

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        name: z.string().min(1, "Table name is required").max(100, "Table name is too long").optional(),
      }),
    )
    .mutation(async ({ ctx, input }) => {
      try {
        // Verify the table belongs to the user
        const table = await ctx.db.table.findFirst({
          where: {
            id: input.id,
            createdById: ctx.session.user.id,
          },
        })

        if (!table) {
          throw new TRPCError({
            code: "NOT_FOUND",
            message: "Table not found or you do not have permission",
          })
        }

        const updatedTable = await ctx.db.table.update({
          where: { id: input.id },
          data: {
            ...(input.name && { name: input.name }),
          },
        })

        return updatedTable
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to update table",
          cause: error,
        })
      }
    }),

  delete: protectedProcedure.input(z.object({ id: z.string() })).mutation(async ({ ctx, input }) => {
    try {
      // First check if the table exists and belongs to the user
      const existingTable = await ctx.db.table.findFirst({
        where: {
          id: input.id,
          createdById: ctx.session.user.id,
        },
        include: {
          _count: {
            select: {
              rows: true,
              columns: true,
            },
          },
        },
      })

      if (!existingTable) {
        throw new TRPCError({
          code: "NOT_FOUND",
          message: "Table not found",
        })
      }

      // Delete the table - cascade will handle related records (columns, rows, cells)
      await ctx.db.table.delete({
        where: {
          id: input.id,
        },
      })

      return { success: true, message: "Table deleted successfully" }
    } catch (error) {
      console.error("Delete table error:", error)
      if (error instanceof TRPCError) {
        throw error
      }
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to delete table. Please try again.",
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
        include: {
          columns: {
            orderBy: { order: "asc" },
          },
        },
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

  // Add a new endpoint to get total row count
  getRowCount: protectedProcedure.input(z.object({ tableId: z.string() })).query(async ({ ctx, input }) => {
    try {
      // Verify table access
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

      const count = await ctx.db.row.count({
        where: { tableId: input.tableId },
      })

      return { count }
    } catch (error) {
      throw new TRPCError({
        code: "INTERNAL_SERVER_ERROR",
        message: "Failed to fetch table row count",
        cause: error,
      })
    }
  }),

  // New optimized getData endpoint that loads data by range
  getDataByRange: protectedProcedure
    .input(
      z.object({
        tableId: z.string(),
        startIndex: z.number().min(0),
        endIndex: z.number().min(0),
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

        // Calculate how many rows to fetch
        const limit = input.endIndex - input.startIndex + 1
        const skip = input.startIndex

        // Build where clause for search and filters
        const whereClause: any = {
          tableId: input.tableId,
        }

        // Build search condition - search across all cells
        if (input.search && input.search.trim()) {
          whereClause.cells = {
            some: {
              value: {
                contains: input.search.trim(),
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
              if (!column || !filter.value.trim()) return null

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
                    NOT: {
                      cells: {
                        some: {
                          columnId: filter.columnId,
                          value: {
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
                        value: {
                          equals: filter.value,
                          mode: "insensitive",
                        },
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
                            OR: [{ value: null }, { value: "" }],
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
                        NOT: {
                          value: "",
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
        let orderBy: any = { createdAt: "asc" } // Default ordering

        if (input.sorts && input.sorts.length > 0) {
          // For now, we'll use simple ordering by createdAt
          // Complex sorting by cell values would require more sophisticated queries
          orderBy = { createdAt: input.sorts[0]?.direction === "desc" ? "desc" : "asc" }
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
          skip,
          take: limit,
        })

        // Apply sorting in memory if needed (for cell-based sorting)
        let sortedRows = rows
        if (input.sorts && input.sorts.length > 0) {
          const firstSort = input.sorts[0]
          if (firstSort) {
            sortedRows = [...rows].sort((a, b) => {
              const cellA = a.cells.find((c) => c.columnId === firstSort.columnId)
              const cellB = b.cells.find((c) => c.columnId === firstSort.columnId)

              const valueA = cellA?.value || ""
              const valueB = cellB?.value || ""

              const column = table.columns.find((c) => c.id === firstSort.columnId)

              if (column?.type === "NUMBER") {
                const numA = Number.parseFloat(valueA) || 0
                const numB = Number.parseFloat(valueB) || 0
                return firstSort.direction === "asc" ? numA - numB : numB - numA
              } else {
                return firstSort.direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
              }
            })
          }
        }

        return {
          rows: sortedRows,
          totalCount: table.rowCount,
          startIndex: input.startIndex,
          endIndex: input.endIndex,
        }
      } catch (error) {
        throw new TRPCError({
          code: "INTERNAL_SERVER_ERROR",
          message: "Failed to fetch table data",
          cause: error,
        })
      }
    }),

  // Keep the old getData for backward compatibility but make it more efficient
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
        limit: z.number().min(1).max(5000).default(1000),
        cursor: z.string().optional(),
      }),
    )
    .query(async ({ ctx, input }) => {
      try {
        // Verify table access and get row count
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

        // Build search condition - search across all cells
        if (input.search && input.search.trim()) {
          whereClause.cells = {
            some: {
              value: {
                contains: input.search.trim(),
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
              if (!column || !filter.value.trim()) return null

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
                    NOT: {
                      cells: {
                        some: {
                          columnId: filter.columnId,
                          value: {
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
                        value: {
                          equals: filter.value,
                          mode: "insensitive",
                        },
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
                            OR: [{ value: null }, { value: "" }],
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
                        NOT: {
                          value: "",
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
        const orderBy: any = { createdAt: "asc" } // Default ordering for pagination

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
          take: input.limit + 1, // Take one extra to check if there are more
        })

        // Apply sorting in memory if needed
        let sortedRows = rows
        if (input.sorts && input.sorts.length > 0) {
          const firstSort = input.sorts[0]
          if (firstSort) {
            sortedRows = [...rows].sort((a, b) => {
              const cellA = a.cells.find((c) => c.columnId === firstSort.columnId)
              const cellB = b.cells.find((c) => c.columnId === firstSort.columnId)

              const valueA = cellA?.value || ""
              const valueB = cellB?.value || ""

              const column = table.columns.find((c) => c.id === firstSort.columnId)

              if (column?.type === "NUMBER") {
                const numA = Number.parseFloat(valueA) || 0
                const numB = Number.parseFloat(valueB) || 0
                return firstSort.direction === "asc" ? numA - numB : numB - numA
              } else {
                return firstSort.direction === "asc" ? valueA.localeCompare(valueB) : valueB.localeCompare(valueA)
              }
            })
          }
        }

        let nextCursor: string | undefined = undefined

        if (sortedRows.length > input.limit) {
          const nextItem = sortedRows.pop() // Remove the extra item
          nextCursor = nextItem!.id
        }

        return {
          rows: sortedRows,
          nextCursor,
          totalCount: table.rowCount,
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

        // Create cells for existing rows (only if there are rows)
        if (table.rowCount > 0) {
          const { faker } = await import("@faker-js/faker")

          // Get all rows for this table
          const rows = await ctx.db.row.findMany({
            where: { tableId: input.tableId },
          })

          const cellsData = rows.map((row) => ({
            rowId: row.id,
            columnId: column.id,
            value:
              input.type === "TEXT" ? faker.person.fullName() : faker.number.int({ min: 1000, max: 100000 }).toString(),
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

      // Optimized batch processing for better performance
      const batchSize = 2000
      const totalRows = 100000
      //  const accountTypes = ["Checking", "Savings", "Credit", "Investment"]
      //  const bankNames = ["Chase Bank", "Bank of America", "Wells Fargo", "Citibank", "Goldman Sachs", "JP Morgan"]

      console.log(`Starting to add ${totalRows} rows in batches of ${batchSize}`)

      for (let i = 0; i < totalRows; i += batchSize) {
        const currentBatchSize = Math.min(batchSize, totalRows - i)
        console.log(`Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(totalRows / batchSize)}`)

        // Create rows in batch
        const rowsData = Array.from({ length: currentBatchSize }).map(() => ({
          tableId: input.tableId,
        }))

        await ctx.db.row.createMany({
          data: rowsData,
        })

        // Get the created rows (get the most recent ones)
        const createdRows = await ctx.db.row.findMany({
          where: { tableId: input.tableId },
          orderBy: { createdAt: "desc" },
          take: currentBatchSize,
        })

        // Prepare cells data in bulk
        const cellsData = []
        for (const row of createdRows) {
          for (const column of table.columns) {
            let value = ""

            switch (column.name) {
              case "Person Name":
                value = faker.person.fullName()
                break
              case "Account Balance":
                value = faker.number.int({ min: 1000, max: 500000 }).toString()
                break
              // case "Bank Name":
              //   value = faker.helpers.arrayElement(bankNames)
              //   break
              // case "Account Type":
              //   value = faker.helpers.arrayElement(accountTypes)
              //   break
              default:
                if (column.type === "TEXT") {
                  value = faker.person.fullName()
                } else if (column.type === "NUMBER") {
                  value = faker.number.int({ min: 0, max: 100000 }).toString()
                }
            }

            cellsData.push({
              rowId: row.id,
              columnId: column.id,
              value,
            })
          }
        }

        // Insert cells in batch
        await ctx.db.cell.createMany({
          data: cellsData,
        })

        // Small delay to prevent overwhelming the database
        if (i + batchSize < totalRows) {
          await new Promise((resolve) => setTimeout(resolve, 50))
        }
      }

      // Update the row count in the table
      await ctx.db.table.update({
        where: { id: input.tableId },
        data: { rowCount: table.rowCount + totalRows },
      })

      console.log(`Successfully added ${totalRows} rows`)
      return { success: true, rowsAdded: totalRows }
    } catch (error) {
      console.error("Error adding 100k rows:", error)
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
