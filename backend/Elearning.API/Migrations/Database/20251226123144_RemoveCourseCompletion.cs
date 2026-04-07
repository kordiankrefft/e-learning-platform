using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Elearning.API.Migrations.Database
{
    /// <inheritdoc />
    public partial class RemoveCourseCompletion : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {

            migrationBuilder.DropTable(
                name: "CourseCompletion");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
           

            migrationBuilder.CreateTable(
                name: "CourseCompletion",
                columns: table => new
                {
                    CourseCompletionId = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    CourseId = table.Column<int>(type: "int", nullable: false),
                    UserId = table.Column<int>(type: "int", nullable: false),
                    CompletedAt = table.Column<DateTime>(type: "datetime2", nullable: false, defaultValueSql: "(sysutcdatetime())"),
                    FinalScorePercent = table.Column<decimal>(type: "decimal(5,2)", nullable: true),
                    IsActive = table.Column<bool>(type: "bit", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK__CourseCo__6F6FBA712B2DF843", x => x.CourseCompletionId);
                    table.ForeignKey(
                        name: "FK_CourseCompletion_Course",
                        column: x => x.CourseId,
                        principalTable: "Course",
                        principalColumn: "CourseId");
                    table.ForeignKey(
                        name: "FK_CourseCompletion_User",
                        column: x => x.UserId,
                        principalTable: "User",
                        principalColumn: "UserId");
                });

            migrationBuilder.CreateIndex(
                name: "IX_CourseCompletion_CourseId",
                table: "CourseCompletion",
                column: "CourseId");

            migrationBuilder.CreateIndex(
                name: "IX_CourseCompletion_UserId",
                table: "CourseCompletion",
                column: "UserId");

        }
    }
}
