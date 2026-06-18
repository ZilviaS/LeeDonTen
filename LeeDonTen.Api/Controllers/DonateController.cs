using System.Xml;
using LeeDonTen.Api.Data;
using LeeDonTen.Api.Dtos;
using LeeDonTen.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Microsoft.AspNetCore.SignalR;
using LeeDonTen.Api.Hubs;
using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using Microsoft.OpenApi;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;

namespace LeeDonTen.Api.Controllers;

[ApiController]
[Route("api/[Controller]")]
public class DonateController : ControllerBase
{
    private readonly AppDbContext context;
    private readonly UserManager<User> userManager;
    private readonly IHubContext<DonationHub> hubContext;

    public DonateController(AppDbContext context, UserManager<User> userManager, IHubContext<DonationHub> hubContext)
    {
        this.context = context;
        this.userManager = userManager;
        this.hubContext = hubContext;
    }

    [HttpPost]
    public async Task<IActionResult> Donate(DonateDto dto)
    {

        var user =  await userManager.FindByIdAsync(dto.UserId);

        if (user is null)
        {
            return NotFound(new
            {
                message = "error, user not found"
            });
        }

        if (user.IsOpenDonations == false)
        {
            return Conflict(new
            {
                message = "Sorry, User is not open donation right now"
            });
        }

        if (string.IsNullOrEmpty(dto.DonorName) || string.IsNullOrEmpty(dto.SongName) || dto.Amount == 0 )
        {
            return BadRequest(new
            {
                message = "error, please fill all the information"
            });
        }

        var request = new Request{
            UserId = user.Id,
            DonorName = dto.DonorName,
            SongName = dto.SongName,
            Message = dto.Message,
            Amount = dto.Amount,
            Status = Status.Paid
        };
        Console.WriteLine("donate");
        context.Requests.Add(request);
        context.SaveChanges();

        Console.WriteLine($"SEND TO GROUP : {request.UserId}");

        await hubContext.Clients.Group(request.UserId)
            .SendAsync("NewDonation", new
            {
                id = request.Id,
                donor = dto.DonorName,
                song = dto.SongName,
                amount = dto.Amount,
                message = dto.Message
            });
        
        return Ok(new
        {
            Message = "donate finished"
        });
    }

    [HttpPut("update/{requestId}/cancel")]
    public IActionResult CancelRequest(int requestId)
    {
        var request = context.Requests.FirstOrDefault(r => r.Id == requestId);
        if (request == null)
        {
            return BadRequest(new
            {
                message = "request not found"
            });
        }
        if (request.Status == Status.Cancelled)
        {
            return Ok(new
            {
                message = "request already cancelled"
            });
        }
        request.Status = Status.Cancelled;

        context.SaveChanges();

        return Ok(new
        {
            messsage = "request cancelled"
        });
    }

    [HttpPut("update/{requestId}/play")]
    public IActionResult PlayRequest(int requestId)
    {
        var request = context.Requests.FirstOrDefault(r => r.Id == requestId);
        if (request == null)
        {
            return BadRequest(new
            {
                message = "request not found"
            });
        }
        if (request.Status == Status.Completed)
        {
            return Ok(new
            {
                message = "request already played"
            });
        }
        request.Status = Status.Completed;

        context.SaveChanges();

        return Ok(new
        {
            messsage = "request played"
        });
    } 

    [Authorize(AuthenticationSchemes = JwtBearerDefaults.AuthenticationScheme)]
    [HttpGet("info")]
    public IActionResult GetDonateInfo()
    {
        Console.WriteLine("You are here");
        var userId = User.FindFirst(ClaimTypes.NameIdentifier)?.Value;

        if (userId == null)
        {
            return Unauthorized();
        }

        var data = context.Requests
            .Where(data=> data.UserId == userId)
            .ToList();

        return Ok(data);
    }
    
}