using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeeDonTen.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddDonationStatus : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "OpenDonate",
                table: "AspNetUsers",
                newName: "IsReceivingDonations");

            migrationBuilder.AddColumn<int>(
                name: "ActiveConnection",
                table: "AspNetUsers",
                type: "integer",
                nullable: false,
                defaultValue: 0);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ActiveConnection",
                table: "AspNetUsers");

            migrationBuilder.RenameColumn(
                name: "IsReceivingDonations",
                table: "AspNetUsers",
                newName: "OpenDonate");
        }
    }
}
