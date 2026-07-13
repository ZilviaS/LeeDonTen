using System.Xml;
using LeeDonTen.Api.Data;
using LeeDonTen.Api.Dtos;
using LeeDonTen.Api.Entities;
using Microsoft.AspNetCore.Identity;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Migrations.Operations;
using Microsoft.AspNetCore.SignalR;
using System.Runtime.CompilerServices;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Security.Claims;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using System.ComponentModel.Design.Serialization;
using System.Net.Http.Json;

namespace LeeDonTen.Api.Controllers;

[ApiController]
[Route("api/[Controller]")]
public class DonateController : ControllerBase
{
    private readonly AppDbContext context;
    private readonly UserManager<User> userManager;
    // private readonly IHubContext<DonationHub> hubContext;
    private readonly HttpClient _httpClient;
    private readonly IConfiguration configuration;

    public DonateController(AppDbContext context, UserManager<User> userManager, IHttpClientFactory factory, IConfiguration configuration)
    {
        this.context = context;
        this.userManager = userManager;
        // this.hubContext = hubContext;
        _httpClient = factory.CreateClient();
        this.configuration = configuration;
    }

    [HttpPost]
    public async Task<IActionResult> Donate(DonateDto dto)
    {
        var user =  await userManager.FindByIdAsync(dto.UserId);

        var paymentPath = configuration["Payment:Url"];

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

        using var transaction = await context.Database.BeginTransactionAsync();

        try
        {
            var request = new Request{
                UserId = user.Id,
                DonorName = dto.DonorName,
                SongName = dto.SongName,
                Message = dto.Message,
                Amount = dto.Amount,
                Status = Status.PendingPayment
            };

            context.Requests.Add(request);
            await context.SaveChangesAsync();

            var payment = new Payment
            {
                RequestId = request.Id,
                Amount = request.Amount,
                Status = PaymentStatus.Pending,
                PaymentReference = Guid.NewGuid().ToString()
            };

            context.Payments.Add(payment);

            await context.SaveChangesAsync();

            await transaction.CommitAsync();

            Console.WriteLine($"PaymentPath = {paymentPath}");

            return Ok(new
            {
                Reference = payment.PaymentReference,
                PaymentUrl = $"{paymentPath}/{payment.PaymentReference}"
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new {
                message = ex.Message});
        }
    }
    [HttpGet("status/{reference}")]
    public async Task<IActionResult> GetStatus(string reference)
    {
        var payment = await context.Payments
            .FirstOrDefaultAsync(x => x.PaymentReference == reference);

        if (payment == null)
            return NotFound();

        return Ok(new
        {
            status = payment.Status
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