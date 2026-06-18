using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace LeeDonTen.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddOpenDonateToUser2 : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsReceivingDonations",
                table: "AspNetUsers",
                newName: "IsOpenDonations");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "IsOpenDonations",
                table: "AspNetUsers",
                newName: "IsReceivingDonations");
        }
    }
}
