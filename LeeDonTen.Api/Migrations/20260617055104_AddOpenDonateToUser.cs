using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeeDonTen.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOpenDonateToUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<bool>(
                name: "OpenDonate",
                table: "AspNetUsers",
                type: "boolean",
                nullable: false,
                defaultValue: false);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "OpenDonate",
                table: "AspNetUsers");
        }
    }
}
