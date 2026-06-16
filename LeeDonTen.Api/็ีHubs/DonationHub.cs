using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authentication.JwtBearer;


namespace LeeDonTen.Api.Hubs;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class DonationHub : Hub
{
    public override async Task OnConnectedAsync()
    {
        Console.WriteLine("Connected");

        Console.WriteLine($"User: {Context.User?.Identity?.Name}");

        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        Console.WriteLine($"UserId: {userId}");

        await base.OnConnectedAsync();
    }
    public async Task JoinGroup(string userId)
    {
        Console.WriteLine($"Join Group : {userId}");
        await Groups.AddToGroupAsync(
            Context.ConnectionId,
            userId
        );
    }
    
}