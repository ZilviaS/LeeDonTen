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
using System.ComponentModel.Design.Serialization;

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

            // request.Status = Status.Paid;

            // await context.SaveChangesAsync();

            await transaction.CommitAsync();

            return Ok(new
            {
                Reference = payment.PaymentReference,
            });
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, new {
                message = ex.Message});
        }
    }

    [HttpPost("webhook")]
    public async Task<IActionResult> DonateUpdate(PaymentDto dto)
    {
        if(dto.Status is not (0 or 1))
        {
            return BadRequest();
        }

        using var transaction = await context.Database.BeginTransactionAsync();
        try
        {
            var payment = await context.Payments
                .Include(p => p.Request)
                .FirstOrDefaultAsync(p => p.PaymentReference == dto.PaymentReference);

            if (payment is null)
                return NotFound();

            var request = payment.Request;

            if(payment.Status == PaymentStatus.Success)
            {
                await transaction.RollbackAsync();
                return Ok();
            }

            if(dto.Status == 0)
            {
                request.Status = Status.Unpaid;
                payment.Status = PaymentStatus.Fail;
            }
            else if(dto.Status == 1)
            {
                request.Status = Status.Paid;
                payment.Status = PaymentStatus.Success;
            }
            else
            {
                await transaction.RollbackAsync();
                return BadRequest();
            }
            
            await context.SaveChangesAsync();
            await transaction.CommitAsync();

            if(dto.Status == 1)
            {
                Console.WriteLine($"SEND TO GROUP : {request.UserId}");

                await hubContext.Clients.Group(request.UserId)
                    .SendAsync("NewDonation", new
                    {
                        id = request.Id,
                        donor = request.DonorName,
                        song = request.SongName,
                        amount = request.Amount,
                        message = request.Message
                    });
            }
            return Ok();
        }
        catch (Exception ex)
        {
            await transaction.RollbackAsync();
            return StatusCode(500, ex.Message);
        }
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