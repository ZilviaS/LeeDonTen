using LeeDonTen.Api.Data;
using LeeDonTen.Api.Dtos;
using LeeDonTen.Api.Entities;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.EntityFrameworkCore;

namespace LeeDonTen.Api.Controllers;

[ApiController]
[Route("api/[controller]")]
public class WebhookController : ControllerBase
{
    private readonly AppDbContext context;
    public WebhookController(AppDbContext context)
    {
        this.context = context;
    }
    [HttpPost("payment")]
    public async Task<IActionResult> Payment(PaymentDto dto)
    {
        Console.WriteLine("Webhook Received");
        
        Console.WriteLine(dto.PaymentReference);
        Console.WriteLine(dto.Status);

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

            if(payment.Status == PaymentStatus.Success || payment.Status == PaymentStatus.Fail)
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
                await EventsController.SendEvent(new
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
}