using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeeDonTen.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddPaymentRelationship2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Statis",
                table: "Payments",
                newName: "Status");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "Status",
                table: "Payments",
                newName: "Statis");
        }
    }
}
