using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using System.Text.RegularExpressions;
using Microsoft.AspNetCore.SignalR;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using LeeDonTen.Api.Data;


namespace LeeDonTen.Api.Hubs;

[Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
public class DonationHub : Hub
{
    private readonly AppDbContext context;
    public DonationHub(AppDbContext context)
    {
        this.context = context;
    }
    public override async Task OnConnectedAsync()
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            Console.WriteLine("User " + userId + "connect to Group");
            await Groups.AddToGroupAsync(Context.ConnectionId, userId);
        }

        await base.OnConnectedAsync();
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        var userId = Context.User?.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (!string.IsNullOrEmpty(userId))
        {
            Console.WriteLine("User " + userId + "disconnect from Group");
        }

        await base.OnDisconnectedAsync(exception);

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