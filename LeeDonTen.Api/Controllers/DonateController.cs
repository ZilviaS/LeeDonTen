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
    private readonly ILogger<DonateController> logger;

    public DonateController(AppDbContext context, UserManager<User> userManager, IHttpClientFactory factory, IConfiguration configuration, ILogger<DonateController> logger)
    {
        this.context = context;
        this.userManager = userManager;
        _httpClient = factory.CreateClient();
        this.configuration = configuration;
        this.logger = logger;
    }

    [HttpPost]
    public async Task<IActionResult> Donate(DonateDto dto)
    {
        var user =  await userManager.FindByIdAsync(dto.UserId);

        var paymentPath = configuration["Payment:Url"];

        if (user is null)
        {
            logger.LogWarning("Donation failed. User {UserId} not found.", dto.UserId);
            return NotFound(new
            {
                message = "error, user not found"
            });
        }

        if (user.IsOpenDonations == false)
        {
            logger.LogWarning("Conflict User {userId} not open donation right now", dto.UserId);
            return Conflict(new
            {
                message = "Sorry, User is not open donation right now"
            });
        }

        if (string.IsNullOrEmpty(dto.DonorName) || string.IsNullOrEmpty(dto.SongName) || dto.Amount == 0 )
        {
            logger.LogWarning(
                "Invalid donation request. UserId={UserId}, Donor={DonorName}, Amount={Amount}",
                dto.UserId,
                dto.DonorName,
                dto.Amount);
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

            var paymentURL = $"{paymentPath}/{payment.PaymentReference}";

            logger.LogInformation("Donation created. RequestId={RequestId}, UserId={UserId}, PaymentReference={PaymentURL}",
                request.Id, user.Id, paymentURL);


            return Ok(new
            {
                Reference = payment.PaymentReference,
                PaymentUrl = paymentURL
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            logger.LogError(
                ex,
                "Failed to create donation. UserId={UserId}, Donor={DonorName}, Amount={Amount}, Song={SongName}",
                dto.UserId,
                dto.DonorName,
                dto.Amount,
                dto.SongName);
            return StatusCode(500, new {
                message = "Internal Server Error"});
        }
    }
    [HttpGet("status/{reference}")]
    public async Task<IActionResult> GetStatus(string reference)
    {
        var payment = await context.Payments
            .FirstOrDefaultAsync(x => x.PaymentReference == reference);

        if (payment == null){
            logger.LogWarning("Reference : {reference}, not found", reference);
            return NotFound();
        }

        logger.LogDebug(
            "Looking up payment {PaymentReference}",
            reference);
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
            logger.LogWarning("request {reqeustId} cancellation failed.", requestId);
            return BadRequest(new
            {
                message = "request not found"
            });
        }
        if (request.Status == Status.Cancelled)
        {
            logger.LogWarning("request {requestId} already cancelled", requestId);
            return Ok(new
            {
                message = "request already cancelled"
            });
        }
        
        request.Status = Status.Cancelled;

        context.SaveChanges();
        logger.LogInformation("request {requestId} cancelled successfully", requestId);

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
            logger.LogWarning("Donation failed. Request {requestId} not found.", requestId);
            return NotFound(new
            {
                message = "request not found"
            });
        }
        if (request.Status == Status.Completed)
        {
            logger.LogWarning("request {requestId} already completed", requestId);
            return Ok(new
            {
                message = "request already played"
            });
        }
        request.Status = Status.Completed;

        context.SaveChanges();

        logger.LogInformation("request {requestId} completed", requestId);

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
            logger.LogWarning("Donation failed. User {UserId} not found.", userId);
            return Unauthorized();
        }

        var data = context.Requests
            .Where(data=> data.UserId == userId)
            .ToList();
        
        logger.LogInformation("User {userId} requested donation information", userId);

        return Ok(data);
    }

    
    
}